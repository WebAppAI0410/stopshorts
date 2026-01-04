/**
 * LLM Service Types
 * Abstraction layer for local LLM providers
 */

import type { GenerationConfig, Message } from '../../types/ai';

/**
 * LLM Provider identifiers
 */
export type LLMProvider = 'executorch' | 'mock';

/**
 * LLM generation request
 */
export interface GenerateRequest {
  /** Conversation messages for context */
  messages: Message[];
  /** System prompt to use */
  systemPrompt: string;
  /** User context (stats, goals, etc.) */
  userContext: string;
  /** Generation configuration */
  config?: Partial<GenerationConfig>;
}

/**
 * LLM generation response
 */
export interface GenerateResponse {
  /** Generated text */
  content: string;
  /** Token count used */
  tokensUsed: number;
  /** Generation time in ms */
  generationTimeMs: number;
}

/**
 * Streaming generation callback
 */
export type StreamCallback = (chunk: string, done: boolean) => void;

/**
 * Model availability check result
 */
export interface ModelAvailability {
  available: boolean;
  reason?: 'not_downloaded' | 'insufficient_memory' | 'unsupported_device';
  requiredMemoryMB?: number;
  availableMemoryMB?: number;
}

/**
 * Model download progress callback
 */
export type DownloadProgressCallback = (progress: number) => void;

/**
 * LLM Service interface - to be implemented by providers
 */
export interface LLMService {
  /** Provider identifier */
  provider: LLMProvider;

  /** Check if model is available and ready */
  checkAvailability(): Promise<ModelAvailability>;

  /** Download the model */
  downloadModel(onProgress?: DownloadProgressCallback): Promise<void>;

  /** Load model into memory */
  loadModel(): Promise<void>;

  /** Unload model from memory */
  unloadModel(): Promise<void>;

  /** Generate response */
  generate(request: GenerateRequest): Promise<GenerateResponse>;

  /** Generate response with streaming */
  generateStream(
    request: GenerateRequest,
    onChunk: StreamCallback
  ): Promise<void>;

  /** Abort current generation */
  abort(): void;
}
