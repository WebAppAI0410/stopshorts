/**
 * useExecutorchLLM Hook
 *
 * Custom hook that wraps react-native-executorch's useLLM hook
 * with app-specific integration:
 * - Crisis detection (mental health keywords)
 * - Training context injection
 * - Conversation mode support
 * - Error handling and fallback
 *
 * IMPORTANT: useLLM's downloadProgress is 0..1 scale, we convert to 0..100 for UI
 */

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useLLM, QWEN3_0_6B } from 'react-native-executorch';
import {
  QWEN3_CONFIG,
  getExecutorchLLM,
  type ModelStatus,
} from '../services/ai/executorchLLM';
import {
  buildSystemPrompt,
  buildTrainingContext,
  handleCrisisIfDetected,
  type TrainingContextInput,
} from '../services/ai';
import type { Message, PersonaId, ConversationModeId } from '../types/ai';
import { useAppStore } from '../stores/useAppStore';
import { useAIStore } from '../stores/useAIStore';

// ============================================
// Types
// ============================================

export interface UseExecutorchLLMOptions {
  /** Persona to use for system prompt */
  personaId?: PersonaId;
  /** Conversation mode for system prompt */
  modeId?: ConversationModeId;
  /** Prevent automatic model loading on mount (default: true) */
  preventLoad?: boolean;
  /** Callback when model status changes */
  onStatusChange?: (status: ModelStatus) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface UseExecutorchLLMResult {
  /** Generate a response (handles crisis detection automatically) */
  generate: (
    userMessage: string,
    conversationHistory: Message[]
  ) => Promise<string>;
  /** Stop current generation */
  stop: () => void;
  /** Start model download (changes preventLoad to false internally) */
  startDownload: () => void;
  /** Current model status */
  status: ModelStatus;
  /** Download progress (0-100) */
  downloadProgress: number;
  /** Whether the model is ready for inference */
  isReady: boolean;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Current error if any */
  error: Error | null;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Remove <think>...</think> tags from LLM response
 * Qwen3 may output thinking process in these tags when thinking mode is enabled.
 * This serves as a fallback filter even when /no_think is in the system prompt.
 */
function removeThinkTags(text: string): string {
  // Remove <think>...</think> blocks (may be multiline, may contain nested content)
  return text.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
}

// ============================================
// Hook Implementation
// ============================================

export function useExecutorchLLM(
  options: UseExecutorchLLMOptions = {}
): UseExecutorchLLMResult {
  const {
    personaId = 'supportive',
    modeId = 'free',
    preventLoad: initialPreventLoad = true, // Default: prevent auto-download
    onStatusChange,
    onError,
  } = options;

  // Local state
  const [internalError, setInternalError] = useState<Error | null>(null);
  const [shouldPreventLoad, setShouldPreventLoad] = useState(initialPreventLoad);
  const abortRef = useRef(false);

  // Get the service instance for status syncing
  const service = useMemo(() => getExecutorchLLM(), []);

  // Use the LLM hook from react-native-executorch
  // preventLoad controls whether to auto-download on mount
  const llm = useLLM({
    model: QWEN3_0_6B,
    preventLoad: shouldPreventLoad,
  });

  // Build system prompt with training context
  const systemPrompt = useMemo(() => {
    const basePrompt = buildSystemPrompt(personaId, modeId);
    // Get data from stores and pass as arguments to avoid circular dependency
    const { trainingProgress, getCompletedTopicIds } = useAppStore.getState();
    const { sessionSummaries } = useAIStore.getState();
    const trainingContextInput: TrainingContextInput = {
      trainingProgress,
      completedTopicIds: getCompletedTopicIds(),
      sessionSummaries,
    };
    const trainingContext = buildTrainingContext(trainingContextInput);
    return basePrompt + '\n' + trainingContext;
  }, [personaId, modeId]);

  // Configure LLM with system prompt when ready
  useEffect(() => {
    if (llm.isReady) {
      llm.configure({
        chatConfig: {
          systemPrompt,
          contextWindowLength: QWEN3_CONFIG.contextLength,
        },
        generationConfig: {
          temperature: QWEN3_CONFIG.defaultConfig.temperature,
          topp: QWEN3_CONFIG.defaultConfig.topP,
        },
      });
    }
  }, [llm.isReady, systemPrompt, llm]);

  // Convert progress from 0..1 to 0..100 for UI
  const downloadProgressPercent = useMemo(
    () => Math.round(llm.downloadProgress * 100),
    [llm.downloadProgress]
  );

  // Map LLM status to our ModelStatus type
  // Note: llm.downloadProgress is 0..1 scale
  const status = useMemo((): ModelStatus => {
    if (llm.error) return 'error';
    if (llm.isReady) return 'ready';
    if (llm.isGenerating) return 'loading';
    // downloadProgress is 0..1, so check > 0 and < 1
    if (llm.downloadProgress > 0 && llm.downloadProgress < 1)
      return 'downloading';
    // If preventLoad is true and not downloading, model is not downloaded yet
    if (shouldPreventLoad && llm.downloadProgress === 0) return 'not_downloaded';
    // If downloadProgress is 1 but not ready yet, it's still loading
    if (llm.downloadProgress === 1 && !llm.isReady) return 'loading';
    return 'not_downloaded';
  }, [llm.error, llm.isReady, llm.isGenerating, llm.downloadProgress, shouldPreventLoad]);

  // Sync status to service
  useEffect(() => {
    service.updateStatus(
      status,
      llm.error ?? undefined
    );
    // Use percentage (0-100) for service
    service.updateDownloadProgress(downloadProgressPercent);
    onStatusChange?.(status);
  }, [status, llm.error, downloadProgressPercent, service, onStatusChange]);

  // Derive error from llm.error (string) or internal error
  // Using useMemo to avoid cascading renders from setState in effect
  const error = useMemo((): Error | null => {
    if (llm.error) {
      return new Error(llm.error);
    }
    return internalError;
  }, [llm.error, internalError]);

  // Call onError callback when error changes (side effect only, no setState)
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  /**
   * Generate a response with crisis detection
   */
  const generate = useCallback(
    async (
      userMessage: string,
      conversationHistory: Message[]
    ): Promise<string> => {
      abortRef.current = false;
      setInternalError(null);

      // Check for crisis keywords FIRST - before any LLM processing
      const crisisResponse = handleCrisisIfDetected(userMessage);
      if (crisisResponse) {
        return crisisResponse;
      }

      // Check if model is ready
      if (!llm.isReady) {
        const err = new Error(
          'Model is not ready. Please download the model first.'
        );
        setInternalError(err);
        onError?.(err);
        throw err;
      }

      try {
        // Build messages array for LLM
        const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

        // Add conversation history (last 10 messages for context)
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }

        // Add current user message
        messages.push({
          role: 'user',
          content: userMessage,
        });

        // Generate response - this returns void, response is in llm.response
        await llm.generate(messages);

        if (abortRef.current) {
          return '';
        }

        // Filter out any <think> tags that may appear if thinking mode wasn't disabled
        return removeThinkTags(llm.response || '');
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setInternalError(errorObj);
        onError?.(errorObj);
        throw errorObj;
      }
    },
    [llm, onError]
  );

  /**
   * Stop current generation
   */
  const stop = useCallback(() => {
    abortRef.current = true;
    llm.interrupt();
  }, [llm]);

  /**
   * Start model download
   * This sets preventLoad to false, triggering the useLLM hook to start downloading.
   * The hook's useEffect will automatically begin the download process.
   */
  const startDownload = useCallback(() => {
    setInternalError(null);
    setShouldPreventLoad(false);
  }, []);

  return {
    generate,
    stop,
    startDownload,
    status,
    downloadProgress: downloadProgressPercent,
    isReady: llm.isReady,
    isGenerating: llm.isGenerating,
    error,
  };
}
