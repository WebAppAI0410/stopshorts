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
  modeId: ConversationModeId;
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

/**
 * Conversation mode IDs for quick actions
 */
export type ConversationModeId = 'explore' | 'plan' | 'training' | 'reflect' | 'free';

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
  startSession: (modeId?: ConversationModeId) => void;
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

// ============================================
// Type Guards
// ============================================

const MODEL_STATUS_VALUES: readonly ModelStatus[] = [
  'not_downloaded',
  'downloading',
  'ready',
  'loading',
  'error',
  'unavailable',
] as const;

const PERSONA_ID_VALUES: readonly PersonaId[] = ['supportive', 'direct'] as const;

/**
 * Type guard for ModelStatus
 */
export function isValidModelStatus(value: unknown): value is ModelStatus {
  return typeof value === 'string' && MODEL_STATUS_VALUES.includes(value as ModelStatus);
}

/**
 * Type guard for PersonaId
 */
export function isValidPersonaId(value: unknown): value is PersonaId {
  return typeof value === 'string' && PERSONA_ID_VALUES.includes(value as PersonaId);
}

/**
 * Type guard for Message
 */
export function isValidMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as Record<string, unknown>;
  return (
    typeof msg.id === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string' &&
    typeof msg.timestamp === 'number' &&
    typeof msg.tokenEstimate === 'number'
  );
}

// ============================================
// Conversation Starter Types
// ============================================

export type ConversationStarterCategory =
  | 'concern'
  | 'emotional'
  | 'positive'
  | 'question'
  | 'training';

export interface ConversationStarter {
  id: string;
  textKey: string;
  category: ConversationStarterCategory;
  relatedTopic?: string;
}

// ============================================
// Contextual Suggestion Types
// ============================================

export type SuggestionCategory = 'progress' | 'concern' | 'learning' | 'routine';

export type SuggestionAction =
  | { type: 'start_mode'; modeId: ConversationModeId }
  | { type: 'start_guided'; templateId: string }
  | { type: 'navigate'; route: string }
  | { type: 'free_chat' };

export interface ContextualSuggestion {
  id: string;
  titleKey: string;
  descriptionKey: string;
  action: SuggestionAction;
  priority: number;
  category: SuggestionCategory;
}

export interface SuggestionContext {
  todayStats: {
    interventionCount: number;
    blockedCount: number;
    totalMinutes: number;
    goalMinutes: number;
  };
  weeklyStats: {
    totalMinutes: number;
    previousWeekMinutes: number;
  };
  trainingProgress: Record<string, { isCompleted: boolean; completedContents: string[] }>;
  ifThenPlan: string | null;
  lastSessionDate: string | null;
  onboardingCompletedAt: string | null;
  currentHour: number;
  streakDays: number;
}

// ============================================
// Guided Conversation Types
// ============================================

export interface GuidedOption {
  textKey: string;
  value: string;
}

export interface GuidedStep {
  id: string;
  promptKey: string;
  options?: GuidedOption[];
  allowFreeInput: boolean;
  saveToStore?: {
    store: 'appStore' | 'aiStore';
    field: string;
  };
}

export interface GuidedConversationTemplate {
  id: string;
  titleKey: string;
  descriptionKey: string;
  steps: GuidedStep[];
}

export interface GuidedConversationState {
  templateId: string;
  currentStepIndex: number;
  responses: Record<string, string>;
  isActive: boolean;
  startedAt: number;
}

// ============================================
// Training Recommendation Types
// ============================================

export interface TrainingRecommendation {
  topicId: string;
  topicTitle: string;
  reason: string;
  isCompleted: boolean;
  route: string;
}

// ============================================
// Extended AI State & Actions
// ============================================

export interface AIStateExtended extends AIState {
  guidedConversation: GuidedConversationState | null;
  recentRecommendations: Array<{
    topicId: string;
    recommendedAt: number;
  }>;
}

export interface AIActionsExtended extends AIActions {
  startGuidedConversation: (templateId: string) => void;
  advanceGuidedStep: (response: string) => void;
  completeGuidedConversation: () => Promise<void>;
  cancelGuidedConversation: () => void;
  addRecommendation: (topicId: string) => void;
}
