/**
 * useExecutorchLLM Hook
 *
 * Custom hook that wraps react-native-executorch's useLLM hook
 * with app-specific integration:
 * - Crisis detection (mental health keywords)
 * - Training context injection
 * - Conversation mode support
 * - Error handling and fallback
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
} from '../services/ai';
import type { Message, PersonaId, ConversationModeId } from '../types/ai';

// ============================================
// Types
// ============================================

export interface UseExecutorchLLMOptions {
  /** Persona to use for system prompt */
  personaId?: PersonaId;
  /** Conversation mode for system prompt */
  modeId?: ConversationModeId;
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
  /** Download the model (triggers automatic loading) */
  downloadModel: () => Promise<void>;
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
// Hook Implementation
// ============================================

export function useExecutorchLLM(
  options: UseExecutorchLLMOptions = {}
): UseExecutorchLLMResult {
  const {
    personaId = 'supportive',
    modeId = 'free',
    onStatusChange,
    onError,
  } = options;

  // Local state
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef(false);

  // Get the service instance for status syncing
  const service = useMemo(() => getExecutorchLLM(), []);

  // Use the LLM hook from react-native-executorch
  const llm = useLLM({
    model: QWEN3_0_6B,
  });

  // Build system prompt with training context
  const systemPrompt = useMemo(() => {
    const basePrompt = buildSystemPrompt(personaId, modeId);
    const trainingContext = buildTrainingContext();
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

  // Map LLM status to our ModelStatus type
  const status = useMemo((): ModelStatus => {
    if (llm.error) return 'error';
    if (llm.isReady) return 'ready';
    if (llm.isGenerating) return 'loading';
    if (llm.downloadProgress > 0 && llm.downloadProgress < 100)
      return 'downloading';
    return 'not_downloaded';
  }, [llm.error, llm.isReady, llm.isGenerating, llm.downloadProgress]);

  // Sync status to service
  useEffect(() => {
    service.updateStatus(
      status,
      llm.error ?? undefined
    );
    service.updateDownloadProgress(llm.downloadProgress);
    onStatusChange?.(status);
  }, [status, llm.error, llm.downloadProgress, service, onStatusChange]);

  // Convert llm.error (string) to Error object
  useEffect(() => {
    if (llm.error) {
      const err = new Error(llm.error);
      setError(err);
      onError?.(err);
    } else {
      setError(null);
    }
  }, [llm.error, onError]);

  /**
   * Generate a response with crisis detection
   */
  const generate = useCallback(
    async (
      userMessage: string,
      conversationHistory: Message[]
    ): Promise<string> => {
      abortRef.current = false;
      setError(null);

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
        setError(err);
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

        return llm.response || '';
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
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
   * Download the model
   * The useLLM hook handles download automatically when model is provided.
   * This function just waits for it to complete.
   */
  const downloadModel = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      // The useLLM hook handles download automatically when modelSource is provided
      // Just wait for it to complete
      await new Promise<void>((resolve, reject) => {
        const checkReady = setInterval(() => {
          if (llm.error) {
            clearInterval(checkReady);
            reject(new Error(llm.error));
          }
          if (llm.isReady || llm.downloadProgress === 100) {
            clearInterval(checkReady);
            resolve();
          }
        }, 500);

        // Timeout after 10 minutes
        setTimeout(() => {
          clearInterval(checkReady);
          reject(new Error('Model download timed out'));
        }, 10 * 60 * 1000);
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
      throw errorObj;
    }
  }, [llm, onError]);

  return {
    generate,
    stop,
    downloadModel,
    status,
    downloadProgress: llm.downloadProgress,
    isReady: llm.isReady,
    isGenerating: llm.isGenerating,
    error,
  };
}
