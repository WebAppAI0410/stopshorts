/**
 * ExecuTorch LLM Service
 * Production LLM implementation using react-native-executorch with Qwen 3 0.6B
 *
 * ARCHITECTURE:
 * - Actual inference is handled by useLLM hook in React components
 * - This service provides device compatibility checks and model configuration
 * - See src/hooks/useExecutorchLLM.ts for the hook wrapper used in AIIntervention
 *
 * Note: The generate() and generateStream() methods are not usable from service
 * level because react-native-executorch only exposes the useLLM React hook.
 * Use useExecutorchLLM hook in React components for actual LLM inference.
 */

import type {
  LLMService,
  GenerateRequest,
  GenerateResponse,
  StreamCallback,
  ModelAvailability,
  DownloadProgressCallback,
} from './types';

/**
 * Minimum device requirements for Qwen 3 0.6B
 */
export const DEVICE_REQUIREMENTS = {
  minRAMMB: 2048, // 2GB RAM minimum
  minStorageMB: 500, // 500MB for model file
  modelSizeMB: 400, // Approximate Q4 quantized model size
} as const;

/**
 * Model configuration for Qwen 3 0.6B
 */
const MODEL_CONFIG = {
  modelId: 'qwen-3-0.6B',
  modelUrl:
    'https://huggingface.co/software-mansion/react-native-executorch-qwen-3/resolve/main/qwen-3-0.6B/qwen-3-0.6B-Q4.pte',
  tokenizerUrl:
    'https://huggingface.co/software-mansion/react-native-executorch-qwen-3/resolve/main/tokenizer.json',
  tokenizerConfigUrl:
    'https://huggingface.co/software-mansion/react-native-executorch-qwen-3/resolve/main/tokenizer_config.json',
} as const;

/**
 * ExecutorchLLMService implementation
 *
 * Note: This service is designed to work with react-native-executorch's useLLM hook.
 * For direct usage outside React components, additional native module bridging may be required.
 */
export class ExecutorchLLMService implements LLMService {
  provider = 'executorch' as const;

  private isModelLoaded = false;
  private isDownloaded = false;
  private abortController: AbortController | null = null;

  /**
   * Check if the model is available and device meets requirements
   */
  async checkAvailability(): Promise<ModelAvailability> {
    // Check device capabilities
    const deviceInfo = await this.getDeviceInfo();

    // Check RAM
    if (deviceInfo.availableRAMMB < DEVICE_REQUIREMENTS.minRAMMB) {
      return {
        available: false,
        reason: 'insufficient_memory',
        requiredMemoryMB: DEVICE_REQUIREMENTS.minRAMMB,
        availableMemoryMB: deviceInfo.availableRAMMB,
      };
    }

    // Check storage
    if (deviceInfo.availableStorageMB < DEVICE_REQUIREMENTS.minStorageMB) {
      return {
        available: false,
        reason: 'unsupported_device',
        requiredMemoryMB: DEVICE_REQUIREMENTS.minStorageMB,
        availableMemoryMB: deviceInfo.availableStorageMB,
      };
    }

    // Check if model is downloaded
    if (!this.isDownloaded) {
      return {
        available: false,
        reason: 'not_downloaded',
      };
    }

    return { available: true };
  }

  /**
   * Download the Qwen 3 0.6B model
   */
  async downloadModel(onProgress?: DownloadProgressCallback): Promise<void> {
    // Note: In production, this would use expo-file-system or react-native-executorch's
    // built-in download mechanism. The useLLM hook handles this automatically.
    //
    // For now, we simulate the download process.
    // Actual implementation will be handled by useLLM hook in React components.

    const totalSteps = 20;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress?.(Math.round((i / totalSteps) * 100));
    }

    this.isDownloaded = true;
  }

  /**
   * Load model into memory
   */
  async loadModel(): Promise<void> {
    if (!this.isDownloaded) {
      throw new Error('Model not downloaded. Call downloadModel() first.');
    }

    // Note: In production with useLLM hook, model loading is automatic.
    // This is a placeholder for direct service usage.
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.isModelLoaded = true;
  }

  /**
   * Unload model from memory
   */
  async unloadModel(): Promise<void> {
    this.isModelLoaded = false;
  }

  /**
   * Generate a response (non-streaming)
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startTime = Date.now();

    if (!this.isModelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    // Build the full prompt
    const prompt = this.buildPrompt(request);

    // Note: In production, this would call the actual ExecuTorch inference
    // For now, return a placeholder response
    // The actual implementation will use the useLLM hook's generate function

    const content = await this.runInference(prompt);

    return {
      content,
      tokensUsed: Math.ceil(content.length / 2.5),
      generationTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Generate a response with streaming
   */
  async generateStream(
    request: GenerateRequest,
    onChunk: StreamCallback
  ): Promise<void> {
    this.abortController = new AbortController();

    if (!this.isModelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const prompt = this.buildPrompt(request);

    try {
      // Note: In production, this would use ExecuTorch's streaming API
      // For now, simulate streaming with the generated response
      const response = await this.runInference(prompt);
      const words = response.split(' ');

      for (let i = 0; i < words.length; i++) {
        if (this.abortController?.signal.aborted) {
          onChunk('', true);
          return;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 30 + Math.random() * 50)
        );
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''), false);
      }

      onChunk('', true);
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        onChunk('', true);
        return;
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Abort current generation
   */
  abort(): void {
    this.abortController?.abort();
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * Build the prompt from the request
   */
  private buildPrompt(request: GenerateRequest): string {
    const { messages, systemPrompt, userContext } = request;

    // Build conversation history
    const history = messages
      .map((m) => `${m.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${m.content}`)
      .join('\n');

    return `${systemPrompt}\n\n${userContext}\n\n${history}\nアシスタント:`;
  }

  /**
   * Run inference with the model
   *
   * NOT SUPPORTED: react-native-executorch only provides useLLM React hook.
   * Use useExecutorchLLM hook in React components for actual LLM inference.
   *
   * @throws Error always - service-level inference not supported
   */
  private async runInference(_prompt: string): Promise<string> {
    throw new Error(
      'Service-level LLM inference is not supported. ' +
        'Use useExecutorchLLM hook in React components instead. ' +
        'See src/hooks/useExecutorchLLM.ts for usage.'
    );
  }

  /**
   * Get device information for compatibility check
   */
  private async getDeviceInfo(): Promise<{
    availableRAMMB: number;
    availableStorageMB: number;
  }> {
    // Note: In production, use Platform-specific APIs:
    // - Android: ActivityManager.MemoryInfo
    // - iOS: ProcessInfo.physicalMemory
    //
    // For now, return optimistic values for development
    return {
      availableRAMMB: 4096, // Assume 4GB RAM
      availableStorageMB: 10000, // Assume 10GB available
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

let executorchLLMInstance: ExecutorchLLMService | null = null;

/**
 * Get the ExecutorchLLMService singleton instance
 */
export function getExecutorchLLM(): ExecutorchLLMService {
  if (!executorchLLMInstance) {
    executorchLLMInstance = new ExecutorchLLMService();
  }
  return executorchLLMInstance;
}

// ============================================
// React Hook Integration Helper
// ============================================

/**
 * Configuration for useLLM hook
 * Use this with react-native-executorch's useLLM hook in React components
 *
 * @example
 * ```tsx
 * import { useLLM } from 'react-native-executorch';
 * import { QWEN_3_CONFIG } from '@/services/ai/executorchLLM';
 *
 * function AIChat() {
 *   const { generate, isReady, downloadProgress } = useLLM(QWEN_3_CONFIG);
 *   // ...
 * }
 * ```
 */
export const QWEN_3_CONFIG = {
  modelSource: MODEL_CONFIG.modelUrl,
  tokenizerSource: MODEL_CONFIG.tokenizerUrl,
  tokenizerConfigSource: MODEL_CONFIG.tokenizerConfigUrl,
} as const;

/**
 * Model information
 */
export const MODEL_INFO = {
  id: MODEL_CONFIG.modelId,
  name: 'Qwen 3 0.6B',
  description: '119言語対応の軽量LLM（日本語サポート）',
  sizeBytes: DEVICE_REQUIREMENTS.modelSizeMB * 1024 * 1024,
  minRAMMB: DEVICE_REQUIREMENTS.minRAMMB,
  minStorageMB: DEVICE_REQUIREMENTS.minStorageMB,
} as const;
