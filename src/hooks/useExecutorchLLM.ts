/**
 * useExecutorchLLM Hook
 * Wrapper around react-native-executorch's useLLM for StopShorts AI integration
 *
 * This hook provides:
 * - Proper integration with the app's system prompts
 * - User context building from app state
 * - Managed conversation with sendMessage
 */

import { useMemo, useCallback, useEffect } from 'react';
import { useLLM } from 'react-native-executorch';
import { QWEN_3_CONFIG, DEVICE_REQUIREMENTS } from '../services/ai/executorchLLM';
import { buildSystemPrompt } from '../services/ai/promptBuilder';
import type { PersonaId } from '../types/ai';

// Re-export device requirements for compatibility checks
export { DEVICE_REQUIREMENTS };

/**
 * Configuration for useExecutorchLLM hook
 */
export interface ExecutorchLLMConfig {
  /** Persona ID for system prompt */
  personaId: PersonaId;
  /** User context string to include */
  userContext?: string;
  /** Prevent automatic model loading */
  preventLoad?: boolean;
}

/**
 * Return type for useExecutorchLLM hook
 */
export interface ExecutorchLLMResult {
  /** Whether the model is ready for inference */
  isReady: boolean;
  /** Whether the model is currently generating */
  isGenerating: boolean;
  /** Download progress (0-1) */
  downloadProgress: number;
  /** Error message if any */
  error: string | null;
  /** Current response being generated */
  response: string;
  /** Full conversation history */
  messageHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  /** Send a message and get AI response */
  sendMessage: (message: string) => Promise<void>;
  /** Interrupt current generation */
  interrupt: () => void;
  /** Delete messages starting from index */
  deleteMessage: (index: number) => void;
  /** Get token count from last response */
  getGeneratedTokenCount: () => number;
}

/**
 * Custom hook wrapping react-native-executorch's useLLM
 * Provides StopShorts-specific integration
 */
export function useExecutorchLLM(config: ExecutorchLLMConfig): ExecutorchLLMResult {
  const { personaId, userContext, preventLoad } = config;

  // Build system prompt from persona
  const systemPrompt = useMemo(
    () => buildSystemPrompt(personaId),
    [personaId]
  );

  // Initialize useLLM with Qwen 3 model
  const llm = useLLM({
    model: QWEN_3_CONFIG,
    preventLoad,
  });

  // Configure the LLM with system prompt and context
  useEffect(() => {
    if (llm.isReady && llm.configure) {
      // Build full system context
      const fullSystemPrompt = userContext
        ? `${systemPrompt}\n\n${userContext}`
        : systemPrompt;

      llm.configure({
        chatConfig: {
          systemPrompt: fullSystemPrompt,
        },
      });
    }
  }, [llm.isReady, llm.configure, systemPrompt, userContext]);

  // Wrapped sendMessage that handles errors
  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!llm.isReady) {
        throw new Error('Model is not ready');
      }
      await llm.sendMessage(message);
    },
    [llm.isReady, llm.sendMessage]
  );

  return {
    isReady: llm.isReady,
    isGenerating: llm.isGenerating,
    downloadProgress: llm.downloadProgress,
    error: llm.error,
    response: llm.response,
    messageHistory: llm.messageHistory || [],
    sendMessage,
    interrupt: llm.interrupt,
    deleteMessage: llm.deleteMessage,
    getGeneratedTokenCount: llm.getGeneratedTokenCount,
  };
}
