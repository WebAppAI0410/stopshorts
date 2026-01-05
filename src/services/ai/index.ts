/**
 * AI Services
 * Exports LLM service implementations and utilities
 */

// Types
export * from './types';

// Mock LLM (for development/testing)
export { MockLLMService, getMockLLM } from './mockLLM';

// Prompt Builder
export {
  buildSystemPrompt,
  buildUserContext,
  buildLongTermSummary,
  formatConversationHistory,
  buildFullPrompt,
  estimateTokens,
  wouldExceedContext,
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
  TrainingProgress,
  FullPromptResult,
} from './promptBuilder';

// Re-export LLM service type for consumers
import type { LLMService } from './types';
import { getMockLLM } from './mockLLM';

/**
 * Get the active LLM service
 * Currently returns mock LLM, will be replaced with actual implementation
 */
export function getLLMService(): LLMService {
  // TODO: Switch to actual LLM implementation when available
  // - Check device capabilities
  // - Load ExecuTorch model if available
  // - Fall back to mock for development
  return getMockLLM();
}
