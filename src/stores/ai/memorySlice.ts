/**
 * Memory Slice for AI Store
 * Handles long-term memory and session summaries persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LongTermMemory, SessionSummary } from '../../types/ai';
import { DEFAULT_LONG_TERM_MEMORY } from '../../types/ai';
import { secureStorage, migrateToSecureStorage } from '../../utils/secureStorage';
import type { AIStore, MemoryState, MemoryActions } from './types';
import { AI_MEMORY_KEY, AI_SESSIONS_KEY } from './helpers';

/**
 * Create initial memory state
 */
export function createInitialMemoryState(): MemoryState {
  return {
    longTermMemory: null,
    sessionSummaries: [],
  };
}

/**
 * Create memory slice actions
 */
export function createMemorySlice(
  set: (partial: Partial<AIStore>) => void,
  get: () => AIStore
): MemoryActions {
  return {
    loadMemory: async () => {
      try {
        // Migrate from AsyncStorage to SecureStorage if needed
        const memoryMigrated = await migrateToSecureStorage(AI_MEMORY_KEY);
        const sessionsMigrated = await migrateToSecureStorage(AI_SESSIONS_KEY);

        // Load long-term memory
        let memoryJson: string | null = null;
        if (memoryMigrated) {
          memoryJson = await secureStorage.getItem(AI_MEMORY_KEY);
        }
        // Fallback to AsyncStorage if SecureStorage failed or returned null
        if (!memoryJson) {
          memoryJson = await AsyncStorage.getItem(AI_MEMORY_KEY);
        }

        if (memoryJson) {
          const memory: LongTermMemory = JSON.parse(memoryJson);
          set({ longTermMemory: memory });
        } else {
          set({ longTermMemory: DEFAULT_LONG_TERM_MEMORY });
        }

        // Load session summaries
        let sessionsJson: string | null = null;
        if (sessionsMigrated) {
          sessionsJson = await secureStorage.getItem(AI_SESSIONS_KEY);
        }
        // Fallback to AsyncStorage if SecureStorage failed or returned null
        if (!sessionsJson) {
          sessionsJson = await AsyncStorage.getItem(AI_SESSIONS_KEY);
        }

        if (sessionsJson) {
          const summaries: SessionSummary[] = JSON.parse(sessionsJson);
          set({ sessionSummaries: summaries });
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[AIStore] Error loading memory:', error);
        }
        set({ longTermMemory: DEFAULT_LONG_TERM_MEMORY });
      }
    },

    saveMemory: async () => {
      const { longTermMemory, sessionSummaries } = get();

      try {
        if (longTermMemory) {
          await secureStorage.setItem(
            AI_MEMORY_KEY,
            JSON.stringify(longTermMemory)
          );
        }

        await secureStorage.setItem(
          AI_SESSIONS_KEY,
          JSON.stringify(sessionSummaries)
        );
      } catch (error) {
        if (__DEV__) {
          console.error('[AIStore] Error saving memory:', error);
        }
      }
    },

    clearMemory: async () => {
      try {
        // Remove from both secure storage and AsyncStorage (for migration cleanup)
        await secureStorage.removeItem(AI_MEMORY_KEY);
        await secureStorage.removeItem(AI_SESSIONS_KEY);
        // Also clean up any remaining AsyncStorage data from before migration
        await AsyncStorage.removeItem(AI_MEMORY_KEY);
        await AsyncStorage.removeItem(AI_SESSIONS_KEY);
        set({
          longTermMemory: DEFAULT_LONG_TERM_MEMORY,
          sessionSummaries: [],
          currentSession: null,
        });
      } catch (error) {
        if (__DEV__) {
          console.error('[AIStore] Error clearing memory:', error);
        }
      }
    },

    confirmInsight: (insightId: string) => {
      const { longTermMemory } = get();
      if (!longTermMemory) return;

      const updatedInsights = longTermMemory.confirmedInsights.map(
        (insight) =>
          insight.id === insightId
            ? { ...insight, confirmedByUser: true }
            : insight
      );

      set({
        longTermMemory: {
          ...longTermMemory,
          confirmedInsights: updatedInsights,
        },
      });
    },
  };
}
