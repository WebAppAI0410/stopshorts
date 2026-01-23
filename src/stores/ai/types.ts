/**
 * AI Store Types
 * Type definitions for the AI store slices
 */

import type {
  AIState,
  AIActions,
  AIActionsExtended,
  Message,
  CurrentSession,
  PersonaId,
  SessionEndTrigger,
  LongTermMemory,
  SessionSummary,
  ConversationModeId,
  GuidedConversationState,
  UrgeRecord,
  SuccessRecord,
  ModelStatus,
} from '../../types/ai';

// ============================================
// Extended State Interface
// ============================================

/**
 * Extended AI state with guided conversation support
 */
export interface AIStateExtended extends AIState {
  guidedConversation: GuidedConversationState | null;
  recentRecommendations: Array<{
    topicId: string;
    recommendedAt: number;
  }>;
  urgeRecords: UrgeRecord[];
  successRecords: SuccessRecord[];
}

// ============================================
// Slice State Types
// ============================================

/**
 * Session state
 */
export interface SessionState {
  currentSession: CurrentSession | null;
  isGenerating: boolean;
}

/**
 * Session actions
 */
export interface SessionActions {
  startSession: (modeId?: ConversationModeId) => void;
  endSession: (trigger?: SessionEndTrigger) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addAIGreeting: (greeting: string) => void;
}

/**
 * Model state
 */
export interface ModelState {
  modelStatus: ModelStatus;
  downloadProgress: number;
  modelError: string | null;
}

/**
 * Model actions
 */
export interface ModelActions {
  downloadModel: () => Promise<void>;
  checkModelStatus: () => Promise<void>;
}

/**
 * Memory state
 */
export interface MemoryState {
  longTermMemory: LongTermMemory | null;
  sessionSummaries: SessionSummary[];
}

/**
 * Memory actions
 */
export interface MemoryActions {
  loadMemory: () => Promise<void>;
  saveMemory: () => Promise<void>;
  clearMemory: () => Promise<void>;
  confirmInsight: (insightId: string) => void;
}

/**
 * Settings state
 */
export interface SettingsState {
  personaId: PersonaId;
}

/**
 * Settings actions
 */
export interface SettingsActions {
  setPersona: (id: PersonaId) => void;
}

/**
 * Guided conversation state
 */
export interface GuidedState {
  guidedConversation: GuidedConversationState | null;
  recentRecommendations: Array<{
    topicId: string;
    recommendedAt: number;
  }>;
}

/**
 * Guided conversation actions
 */
export interface GuidedActions {
  startGuidedConversation: (templateId: string) => void;
  advanceGuidedStep: (response: string) => void;
  completeGuidedConversation: () => Promise<void>;
  cancelGuidedConversation: () => void;
  addRecommendation: (topicId: string) => void;
}

/**
 * Records state (iOS value enhancement)
 */
export interface RecordsState {
  urgeRecords: UrgeRecord[];
  successRecords: SuccessRecord[];
}

/**
 * Records actions
 */
export interface RecordsActions {
  addUrgeRecord: (record: Omit<UrgeRecord, 'id' | 'timestamp'>) => void;
  addSuccessRecord: (record: Omit<SuccessRecord, 'id' | 'timestamp'>) => void;
}

// ============================================
// Combined Store Type
// ============================================

/**
 * Complete AI store interface
 */
export interface AIStore extends AIStateExtended, AIActions, AIActionsExtended {}

// ============================================
// Slice Creator Type
// ============================================

export type StateCreator<T> = (
  set: (partial: Partial<AIStore>) => void,
  get: () => AIStore
) => T;

// ============================================
// Re-exports
// ============================================

export type {
  Message,
  CurrentSession,
  PersonaId,
  SessionEndTrigger,
  LongTermMemory,
  SessionSummary,
  ConversationModeId,
  GuidedConversationState,
  UrgeRecord,
  SuccessRecord,
  ModelStatus,
};
