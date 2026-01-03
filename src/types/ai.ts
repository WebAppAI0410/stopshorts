/**
 * AI Chatbot Types
 * Based on context-engineering.md design specification
 */

// ============================================
// Core Message Types
// ============================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokenEstimate: number;
}

// ============================================
// Memory System Types
// ============================================

/**
 * Working Memory - React State (session-scoped)
 */
export interface WorkingMemory {
  currentSessionId: string;
  messages: Message[];
  tokenCount: number;
}

/**
 * Session Summary - Persisted after session ends
 */
export interface SessionSummary {
  sessionId: string;
  date: string; // ISO date string
  summary: string;
  insights: string[];
  createdPlans?: AIIfThenPlan[];
  messageCount: number;
  durationMinutes: number;
}

/**
 * Long-term Memory - Persistent storage
 */
export interface LongTermMemory {
  version: number;
  confirmedInsights: Insight[];
  plans: AIIfThenPlan[];
  identifiedTriggers: Trigger[];
  effectiveStrategies: Strategy[];
}

export interface Insight {
  id: string;
  content: string;
  confidence: number; // 0-1
  confirmedByUser: boolean;
  createdAt: string;
  lastReferencedAt: string;
}

export interface Trigger {
  id: string;
  trigger: string;
  frequency: number;
  discoveredAt: string;
}

export interface Strategy {
  id: string;
  description: string;
  effectiveness: number; // 0-1
  usageCount: number;
  lastUsedAt: string;
}

export interface AIIfThenPlan {
  id: string;
  trigger: string;
  action: string;
  status: 'active' | 'completed' | 'inactive';
  createdAt: string;
  successCount: number;
}

// ============================================
// Session Types
// ============================================

export type SessionEndTrigger =
  | 'user_explicit'
  | 'app_background'
  | 'inactivity'
  | 'navigation_away'
  | 'token_overflow';

export interface CurrentSession {
  id: string;
  messages: Message[];
  startedAt: number;
  lastActivityAt: number;
}

// ============================================
// Model Status Types
// ============================================

export type ModelStatus =
  | 'not_downloaded'
  | 'downloading'
  | 'ready'
  | 'loading'
  | 'error'
  | 'unavailable';

export interface ModelInfo {
  id: string;
  name: string;
  sizeBytes: number;
  downloaded: boolean;
  version: string;
}

// ============================================
// Persona Types
// ============================================

export type PersonaId = 'supportive' | 'direct';

export interface Persona {
  id: PersonaId;
  name: string;
  description: string;
  systemPromptAddition: string;
}

// ============================================
// Generation Config
// ============================================

export interface GenerationConfig {
  maxNewTokens: number;
  temperature: number;
  topP: number;
  repetitionPenalty: number;
}

// ============================================
// AI Store State
// ============================================

export interface AIState {
  // Model status
  modelStatus: ModelStatus;
  downloadProgress: number;
  modelError: string | null;

  // Current session
  currentSession: CurrentSession | null;

  // Settings
  personaId: PersonaId;

  // Memory (loaded from storage)
  longTermMemory: LongTermMemory | null;
  sessionSummaries: SessionSummary[];

  // UI state
  isGenerating: boolean;
}

// ============================================
// AI Store Actions
// ============================================

export interface AIActions {
  // Session management
  startSession: () => void;
  endSession: (trigger?: SessionEndTrigger) => Promise<void>;

  // Messaging
  sendMessage: (content: string) => Promise<void>;
  addAIGreeting: (greeting: string) => void;

  // Settings
  setPersona: (id: PersonaId) => void;

  // Model management
  downloadModel: () => Promise<void>;
  checkModelStatus: () => Promise<void>;

  // Memory management
  loadMemory: () => Promise<void>;
  saveMemory: () => Promise<void>;
  clearMemory: () => Promise<void>;

  // Insights
  confirmInsight: (insightId: string) => void;
}

// ============================================
// Constants
// ============================================

export const TOKEN_BUDGET = {
  systemPrompt: 500,
  userContext: 300,
  longTermSummary: 200,
  conversationHistory: 2500,
  currentInput: 100,
  responseBuffer: 400,
} as const;

export const MAX_CONTEXT_TOKENS = 4096;

export const LONG_TERM_LIMITS = {
  maxInsights: 50,
  maxPlans: 30,
  maxTriggers: 20,
  maxStrategies: 20,
  maxSessionSummaries: 10,
} as const;

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  maxNewTokens: 256,
  temperature: 0.7,
  topP: 0.9,
  repetitionPenalty: 1.1,
};

export const DEFAULT_LONG_TERM_MEMORY: LongTermMemory = {
  version: 1,
  confirmedInsights: [],
  plans: [],
  identifiedTriggers: [],
  effectiveStrategies: [],
};

// ============================================
// Utility Types
// ============================================

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  fallback?: T;
  error?: string;
}

export interface StorageCheckResult {
  available: boolean;
  reason?: 'quota_exceeded' | 'storage_error';
}
