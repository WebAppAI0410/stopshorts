/**
 * ExecuTorch LLM Service
 *
 * Configuration and utilities for local LLM inference using react-native-executorch.
 *
 * IMPORTANT: Actual inference MUST be performed via the useLLM hook from
 * react-native-executorch at the component level. This service provides:
 * - Model configuration (URLs, requirements)
 * - Device compatibility checking
 * - Status management
 *
 * The useLLM hook is designed to be used in React components, not in services.
 */

import { Platform } from 'react-native';
import { QWEN3_0_6B } from 'react-native-executorch';
import type {
  LLMService,
  LLMProvider,
  GenerateRequest,
  GenerateResponse,
  ModelAvailability,
  DownloadProgressCallback,
  StreamCallback,
} from './types';

// ============================================
// Model Configuration
// ============================================

/**
 * Re-export QWEN3_0_6B from react-native-executorch
 * This is the official Qwen 3 0.6B model configuration.
 *
 * Qwen 3 0.6B is chosen because:
 * 1. Official .pte files provided by software-mansion
 * 2. Compact size (~600MB) suitable for mobile
 * 3. Good balance of quality and performance
 * 4. Active support from react-native-executorch maintainers
 *
 * Note: Gemma 3n E2B uses .task/.litertlm format (Google LiteRT),
 * which is NOT compatible with react-native-executorch (.pte format).
 */
export { QWEN3_0_6B };

/**
 * Extended configuration with app-specific settings
 */
export const QWEN3_CONFIG = {
  name: 'Qwen3-0.6B',
  // Model URLs from library
  ...QWEN3_0_6B,
  contextLength: 4096,
  // Device requirements
  requirements: {
    minRamMB: 2048, // 2GB minimum RAM
    minStorageMB: 500, // 500MB for model files
    supportedPlatforms: ['android', 'ios'] as const,
  },
  // Generation defaults
  defaultConfig: {
    maxTokens: 512,
    temperature: 0.7,
    topP: 0.9,
    stopTokens: ['<|endoftext|>', '<|im_end|>'],
  },
} as const;

/**
 * Model status enum
 */
export type ModelStatus =
  | 'not_downloaded'
  | 'downloading'
  | 'downloaded'
  | 'loading'
  | 'ready'
  | 'error'
  | 'unavailable';

/**
 * Error types for LLM operations
 */
export type LLMErrorType =
  | 'insufficient_memory'
  | 'unsupported_device'
  | 'download_failed'
  | 'load_failed'
  | 'inference_failed'
  | 'aborted';

export class LLMError extends Error {
  constructor(
    public type: LLMErrorType,
    message: string
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// ============================================
// Device Compatibility
// ============================================

/**
 * Check if the current device supports local LLM
 * This is a placeholder - actual implementation requires native module
 */
export async function checkDeviceCompatibility(): Promise<{
  compatible: boolean;
  reason?: string;
  availableRamMB?: number;
  availableStorageMB?: number;
}> {
  // Platform check
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return {
      compatible: false,
      reason: 'Local LLM is only supported on Android and iOS',
    };
  }

  // TODO: Actual RAM and storage checks require native module access
  // For now, return compatible = true and let the actual loading fail gracefully
  return {
    compatible: true,
    availableRamMB: undefined,
    availableStorageMB: undefined,
  };
}

// ============================================
// Service Implementation
// ============================================

/**
 * ExecuTorch LLM Service
 *
 * This service is primarily for status management and configuration.
 * Actual inference should be done via useExecutorchLLM hook.
 */
export class ExecutorchLLMService implements LLMService {
  provider: LLMProvider = 'executorch';
  private status: ModelStatus = 'not_downloaded';
  private downloadProgress = 0;
  private errorMessage: string | null = null;

  async checkAvailability(): Promise<ModelAvailability> {
    const compat = await checkDeviceCompatibility();

    if (!compat.compatible) {
      return {
        available: false,
        reason: 'unsupported_device',
      };
    }

    // Check RAM if available
    if (compat.availableRamMB !== undefined) {
      if (compat.availableRamMB < QWEN3_CONFIG.requirements.minRamMB) {
        return {
          available: false,
          reason: 'insufficient_memory',
          requiredMemoryMB: QWEN3_CONFIG.requirements.minRamMB,
          availableMemoryMB: compat.availableRamMB,
        };
      }
    }

    // Model not downloaded yet
    if (this.status === 'not_downloaded') {
      return {
        available: false,
        reason: 'not_downloaded',
      };
    }

    return { available: this.status === 'ready' };
  }

  async downloadModel(_onProgress?: DownloadProgressCallback): Promise<void> {
    // Download is handled by useLLM hook internally
    // This is just for status tracking
    throw new LLMError(
      'download_failed',
      'Model download should be initiated via useLLM hook. ' +
        'Use the useExecutorchLLM hook in your component instead.'
    );
  }

  async loadModel(): Promise<void> {
    // Loading is handled by useLLM hook internally
    throw new LLMError(
      'load_failed',
      'Model loading is handled by useLLM hook automatically. ' +
        'Use the useExecutorchLLM hook in your component instead.'
    );
  }

  async unloadModel(): Promise<void> {
    // Unloading is handled by useLLM hook when component unmounts
    this.status = 'downloaded';
  }

  async generate(_request: GenerateRequest): Promise<GenerateResponse> {
    // IMPORTANT: Inference MUST be done via useLLM hook
    throw new LLMError(
      'inference_failed',
      'Direct inference is not supported. ' +
        'Use the useExecutorchLLM hook in your component for LLM inference. ' +
        'The useLLM hook from react-native-executorch must be used at the component level.'
    );
  }

  async generateStream(
    _request: GenerateRequest,
    _onChunk: StreamCallback
  ): Promise<void> {
    // IMPORTANT: Streaming inference MUST be done via useLLM hook
    throw new LLMError(
      'inference_failed',
      'Direct streaming is not supported. ' +
        'Use the useExecutorchLLM hook in your component for streaming inference.'
    );
  }

  abort(): void {
    // Abort is handled by useLLM hook
    // This is a no-op for status tracking purposes
  }

  // ============================================
  // Status Management (for UI)
  // ============================================

  getStatus(): ModelStatus {
    return this.status;
  }

  getDownloadProgress(): number {
    return this.downloadProgress;
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }

  /**
   * Update status from useLLM hook state
   * Called by useExecutorchLLM to sync status
   */
  updateStatus(newStatus: ModelStatus, error?: string): void {
    this.status = newStatus;
    this.errorMessage = error ?? null;
  }

  /**
   * Update download progress from useLLM hook
   */
  updateDownloadProgress(progress: number): void {
    this.downloadProgress = progress;
    if (progress >= 100) {
      this.status = 'downloaded';
    } else if (progress > 0) {
      this.status = 'downloading';
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let executorchService: ExecutorchLLMService | null = null;

/**
 * Get the ExecuTorch LLM service instance
 */
export function getExecutorchLLM(): ExecutorchLLMService {
  if (!executorchService) {
    executorchService = new ExecutorchLLMService();
  }
  return executorchService;
}

/**
 * Reset the service instance (for testing)
 */
export function resetExecutorchLLM(): void {
  executorchService = null;
}
