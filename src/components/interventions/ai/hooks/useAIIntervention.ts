/**
 * useAIIntervention Hook
 * Manages AI intervention state and logic
 */

import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { FlatList, Keyboard } from 'react-native';
import { useAIStore, selectMessages } from '../../../../stores/useAIStore';
import { useStatisticsStore } from '../../../../stores/useStatisticsStore';
import { performanceMonitor } from '../../../../utils/performanceMonitor';
import { useNetworkStatus } from '../../../../hooks/useNetworkStatus';
import { useExecutorchLLM } from '../../../../hooks/useExecutorchLLM';
import { handleCrisisIfDetected } from '../../../../services/ai';
import { t } from '../../../../i18n';
import type { Message, ConversationModeId } from '../../../../types/ai';
import type { UseAIInterventionReturn } from '../types';

interface UseAIInterventionParams {
  onProceed: () => void;
  onDismiss: () => void;
  minMessages: number;
}

export function useAIIntervention({
  onProceed,
  onDismiss,
  minMessages,
}: UseAIInterventionParams): UseAIInterventionReturn {
  const flatListRef = useRef<FlatList>(null);
  const mountMeasuredRef = useRef(false);
  const llmResponsePendingRef = useRef<boolean>(false);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isOffline } = useNetworkStatus();

  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ConversationModeId | null>(null);
  const [showDownloadCard, setShowDownloadCard] = useState(true);

  // AI Store
  const startSession = useAIStore((state) => state.startSession);
  const endSession = useAIStore((state) => state.endSession);
  const sendMessage = useAIStore((state) => state.sendMessage);
  const addAIGreeting = useAIStore((state) => state.addAIGreeting);
  const isGenerating = useAIStore((state) => state.isGenerating);
  const messages = useAIStore(selectMessages);
  const personaId = useAIStore((state) => state.personaId);

  // LLM Hook - integrates with local Qwen 3 0.6B model
  const llm = useExecutorchLLM({
    personaId,
    modeId: selectedMode || 'free',
  });

  // Statistics
  const { recordIntervention } = useStatisticsStore();

  // Start mount time measurement (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    performanceMonitor.start('ai_intervention_mount');
  }, []);

  // End mount time measurement
  useEffect(() => {
    if (!mountMeasuredRef.current) {
      mountMeasuredRef.current = true;
      performanceMonitor.end('ai_intervention_mount');
    }
  }, []);

  // Track LLM response time
  useEffect(() => {
    if (!isGenerating && llmResponsePendingRef.current) {
      llmResponsePendingRef.current = false;
      performanceMonitor.end('llm_response');
    }
  }, [isGenerating]);

  // Cleanup session and timer on unmount
  useEffect(() => {
    return () => {
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
      if (selectedMode) {
        endSession('navigation_away');
      }
    };
  }, [selectedMode, endSession]);

  // Derive showButtons from messages length (minMessages * 2 for exchanges + 1 for greeting)
  const showButtons = useMemo(
    () => messages.length >= minMessages * 2 + 1,
    [messages.length, minMessages]
  );

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle quick action selection
  const handleQuickActionSelect = useCallback(
    (modeId: ConversationModeId) => {
      setSelectedMode(modeId);
      startSession(modeId);

      greetingTimerRef.current = setTimeout(() => {
        const greetingKey = `intervention.ai.modeGreetings.${modeId}` as const;
        const greeting = t(greetingKey);
        addAIGreeting(greeting);
      }, 300);
    },
    [startSession, addAIGreeting]
  );

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isGenerating || llm.isGenerating) return;

    const userInput = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    performanceMonitor.start('llm_response');
    llmResponsePendingRef.current = true;

    // Check for crisis keywords FIRST
    const crisisResponse = handleCrisisIfDetected(userInput);
    if (crisisResponse) {
      const session = useAIStore.getState().currentSession;
      if (session) {
        const userMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
          tokenEstimate: Math.ceil(userInput.length / 2.5),
        };
        const aiMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: crisisResponse,
          timestamp: Date.now(),
          tokenEstimate: Math.ceil(crisisResponse.length / 2.5),
        };
        useAIStore.setState({
          currentSession: {
            ...session,
            messages: [...session.messages, userMessage, aiMessage],
            lastActivityAt: Date.now(),
          },
        });
      }
      performanceMonitor.end('llm_response');
      llmResponsePendingRef.current = false;
      return;
    }

    // If LLM is ready, use it for generation
    if (llm.isReady) {
      try {
        const session = useAIStore.getState().currentSession;
        if (session) {
          const userMessage: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            role: 'user',
            content: userInput,
            timestamp: Date.now(),
            tokenEstimate: Math.ceil(userInput.length / 2.5),
          };
          useAIStore.setState({
            currentSession: {
              ...session,
              messages: [...session.messages, userMessage],
              lastActivityAt: Date.now(),
            },
            isGenerating: true,
          });
        }

        const response = await llm.generate(userInput, messages);

        const updatedSession = useAIStore.getState().currentSession;
        if (updatedSession) {
          if (response) {
            const aiMessage: Message = {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              role: 'assistant',
              content: response,
              timestamp: Date.now(),
              tokenEstimate: Math.ceil(response.length / 2.5),
            };
            useAIStore.setState({
              currentSession: {
                ...updatedSession,
                messages: [...updatedSession.messages, aiMessage],
                lastActivityAt: Date.now(),
              },
              isGenerating: false,
            });
          } else {
            useAIStore.setState({ isGenerating: false });
            sendMessage(userInput);
          }
        } else {
          useAIStore.setState({ isGenerating: false });
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[AIIntervention] LLM generation error:', error);
        }
        useAIStore.setState({ isGenerating: false });
        sendMessage(userInput);
      }
    } else {
      sendMessage(userInput);
    }
  }, [inputText, isGenerating, llm, messages, sendMessage]);

  // Handle proceed action
  const handleProceed = useCallback(() => {
    recordIntervention({ proceeded: true, type: 'ai' });
    endSession('user_explicit');
    onProceed();
  }, [recordIntervention, endSession, onProceed]);

  // Handle dismiss action
  const handleDismiss = useCallback(() => {
    recordIntervention({ proceeded: false, type: 'ai' });
    endSession('user_explicit');
    onDismiss();
  }, [recordIntervention, endSession, onDismiss]);

  // Handle model download
  const handleDownloadModel = useCallback(() => {
    llm.startDownload();
  }, [llm]);

  // Handle skip download
  const handleSkipDownload = useCallback(() => {
    setShowDownloadCard(false);
  }, []);

  return {
    // State
    messages,
    isGenerating,
    selectedMode,
    inputText,
    showButtons,
    showDownloadCard,
    isOffline,

    // LLM state
    llmStatus: llm.status,
    llmIsReady: llm.isReady,
    downloadProgress: llm.downloadProgress,
    llmError: llm.error?.message,

    // Refs
    flatListRef,

    // Actions
    setInputText,
    handleQuickActionSelect,
    handleSend,
    handleProceed,
    handleDismiss,
    handleDownloadModel,
    handleSkipDownload,
  };
}
