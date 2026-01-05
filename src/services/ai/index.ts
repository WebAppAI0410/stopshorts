/**
 * AI Services
 * Exports LLM service implementations and utilities
 */

// Types
export * from './types';

// Mock LLM (for development/testing and fallback)
export { MockLLMService, getMockLLM } from './mockLLM';

// ExecuTorch LLM (real local inference)
export {
  ExecutorchLLMService,
  getExecutorchLLM,
  resetExecutorchLLM,
  checkDeviceCompatibility,
  QWEN3_CONFIG,
  LLMError,
} from './executorchLLM';
export type { ModelStatus, LLMErrorType } from './executorchLLM';

// Prompt Builder
export {
  buildSystemPrompt,
  buildUserContext,
  buildLongTermSummary,
  formatConversationHistory,
  buildFullPrompt,
  estimateTokens,
  wouldExceedContext,
  buildTrainingContext,
  MODE_PROMPTS,
} from './promptBuilder';

// Mental Health Crisis Handler
export {
  detectCrisisKeywords,
  getCrisisResponse,
  handleCrisisIfDetected,
} from './mentalHealthHandler';

export type { CrisisDetectionResult } from './mentalHealthHandler';

export type {
  UserStats,
  UserGoals,
  TrainingProgressContext,
  FullPromptResult,
  TrainingContextInput,
} from './promptBuilder';

// Re-export LLM service type for consumers
import type { LLMService } from './types';
import { getMockLLM } from './mockLLM';
import { getExecutorchLLM } from './executorchLLM';

/**
 * Get the active LLM service
 *
 * Note: For actual inference, use the useExecutorchLLM hook in your component.
 * The service returned here is primarily for status checking and configuration.
 *
 * @param preferReal - If true, return ExecuTorch service; otherwise return mock
 */
export function getLLMService(preferReal: boolean = false): LLMService {
  if (preferReal) {
    return getExecutorchLLM();
  }
  // Mock LLM is used as fallback for:
  // - Development/testing
  // - Offline mode
  // - Devices that don't support local LLM
  // - When model is not downloaded
  return getMockLLM();
}
