/**
 * AI Services
 * Exports LLM service implementations and utilities
 */

// Types
export * from './types';

// Mock LLM (for development/testing)
export { MockLLMService, getMockLLM } from './mockLLM';

// ExecuTorch LLM (production)
export {
  ExecutorchLLMService,
  getExecutorchLLM,
  QWEN_3_CONFIG,
  MODEL_INFO,
} from './executorchLLM';

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

export type {
  UserStats,
  UserGoals,
  TrainingProgress,
  FullPromptResult,
} from './promptBuilder';

// Re-export LLM service type for consumers
import type { LLMService, LLMProvider } from './types';
import { getMockLLM } from './mockLLM';
import { getExecutorchLLM } from './executorchLLM';

/**
 * LLM Service configuration
 */
interface LLMServiceConfig {
  /** Force a specific provider (useful for development) */
  forceProvider?: LLMProvider;
  /** Enable debug logging */
  debug?: boolean;
}

// Default configuration
let globalConfig: LLMServiceConfig = {
  forceProvider: undefined,
  debug: __DEV__,
};

/**
 * Configure the LLM service
 */
export function configureLLMService(config: Partial<LLMServiceConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the appropriate LLM service based on configuration and device capabilities
 *
 * Priority:
 * 1. If forceProvider is set, use that provider
 * 2. In development (__DEV__), use mock by default
 * 3. In production, try ExecuTorch, fall back to mock if unavailable
 */
export function getLLMService(): LLMService {
  // If a specific provider is forced
  if (globalConfig.forceProvider) {
    if (globalConfig.debug) {
      console.log(`[LLM] Using forced provider: ${globalConfig.forceProvider}`);
    }
    return globalConfig.forceProvider === 'executorch'
      ? getExecutorchLLM()
      : getMockLLM();
  }

  // In development, use mock by default for faster iteration
  if (__DEV__) {
    if (globalConfig.debug) {
      console.log('[LLM] Development mode: using Mock LLM');
    }
    return getMockLLM();
  }

  // In production, use ExecuTorch
  // Note: The actual availability check should be done by the consumer
  // using checkAvailability() before heavy operations
  if (globalConfig.debug) {
    console.log('[LLM] Production mode: using ExecuTorch LLM');
  }
  return getExecutorchLLM();
}

/**
 * Check if ExecuTorch LLM is available on this device
 * Use this before attempting to use the production LLM
 */
export async function isExecutorchAvailable(): Promise<boolean> {
  try {
    const executorchLLM = getExecutorchLLM();
    const availability = await executorchLLM.checkAvailability();
    return availability.available;
  } catch {
    return false;
  }
}

/**
 * Get the current LLM provider type
 */
export function getCurrentProvider(): LLMProvider {
  if (globalConfig.forceProvider) {
    return globalConfig.forceProvider;
  }
  return __DEV__ ? 'mock' : 'executorch';
}
