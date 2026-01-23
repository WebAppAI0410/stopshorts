/**
 * AI Store
 * Manages AI chatbot state, sessions, and memory
 *
 * Architecture: Zustand Slice Pattern
 * - types.ts: Type definitions
 * - helpers.ts: Utility functions
 * - sessionSlice.ts: Session management
 * - modelSlice.ts: Model download/status
 * - memorySlice.ts: Long-term memory persistence
 * - guidedSlice.ts: Guided conversation flows
 * - recordsSlice.ts: Urge/success records
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AIState } from '../../types/ai';
import type { AIStore, AIStateExtended, Message, GuidedConversationState } from './types';
import { createInitialSessionState, createSessionSlice } from './sessionSlice';
import { createInitialModelState, createModelSlice } from './modelSlice';
import { createInitialMemoryState, createMemorySlice } from './memorySlice';
import { createInitialGuidedState, createGuidedSlice } from './guidedSlice';
import { createInitialRecordsState, createRecordsSlice } from './recordsSlice';

// ============================================
// Initial State
// ============================================

function createInitialState(): AIStateExtended {
  return {
    ...createInitialSessionState(),
    ...createInitialModelState(),
    ...createInitialMemoryState(),
    ...createInitialGuidedState(),
    ...createInitialRecordsState(),
    personaId: 'supportive',
  };
}

// ============================================
// Store Creation
// ============================================

export const useAIStore = create<AIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...createInitialState(),

        // Session slice
        ...createSessionSlice(set, get),

        // Model slice
        ...createModelSlice(set, get),

        // Memory slice
        ...createMemorySlice(set, get),

        // Guided conversation slice
        ...createGuidedSlice(set, get),

        // Records slice
        ...createRecordsSlice(set, get),

        // Settings actions
        setPersona: (id) => {
          set({ personaId: id });
        },
      }),
      {
        name: 'stopshorts-ai-store',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          personaId: state.personaId,
          modelStatus: state.modelStatus,
          urgeRecords: state.urgeRecords,
          successRecords: state.successRecords,
        }),
      }
    ),
    { name: 'AIStore', enabled: __DEV__ }
  )
);

// ============================================
// Selectors
// ============================================

export const selectIsSessionActive = (state: AIState): boolean =>
  state.currentSession !== null;

// Stable empty array reference to prevent infinite re-renders
const EMPTY_MESSAGES: Message[] = [];

export const selectMessages = (state: AIState): Message[] =>
  state.currentSession?.messages ?? EMPTY_MESSAGES;

export const selectModelReady = (state: AIState): boolean =>
  state.modelStatus === 'ready';

export const selectCanChat = (state: AIState): boolean =>
  state.modelStatus === 'ready' && !state.isGenerating;

export const selectIsGuidedConversationActive = (state: AIStateExtended): boolean =>
  state.guidedConversation?.isActive ?? false;

export const selectGuidedConversation = (state: AIStateExtended): GuidedConversationState | null =>
  state.guidedConversation;

export const selectRecentRecommendations = (state: AIStateExtended): string[] =>
  state.recentRecommendations.map((r) => r.topicId);
