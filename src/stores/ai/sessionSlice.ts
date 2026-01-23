/**
 * Session Slice for AI Store
 * Handles session management and messaging
 */

import type { Message, CurrentSession, ConversationModeId, SessionEndTrigger } from '../../types/ai';
import { LONG_TERM_LIMITS } from '../../types/ai';
import type { AIStore, SessionState, SessionActions } from './types';
import {
  generateId,
  estimateTokens,
  generateAIResponse,
  generateSessionSummary,
  getDefaultErrorResponse,
  extractInsights,
} from './helpers';

/**
 * Create initial session state
 */
export function createInitialSessionState(): SessionState {
  return {
    currentSession: null,
    isGenerating: false,
  };
}

/**
 * Create session slice actions
 */
export function createSessionSlice(
  set: (partial: Partial<AIStore>) => void,
  get: () => AIStore
): SessionActions {
  return {
    startSession: (modeId: ConversationModeId = 'free') => {
      const sessionId = generateId();
      const now = Date.now();

      const newSession: CurrentSession = {
        id: sessionId,
        messages: [],
        startedAt: now,
        lastActivityAt: now,
        modeId,
      };

      set({ currentSession: newSession });
    },

    endSession: async (_trigger: SessionEndTrigger = 'user_explicit') => {
      const { currentSession, sessionSummaries } = get();

      if (!currentSession || currentSession.messages.length === 0) {
        set({ currentSession: null });
        return;
      }

      const summary = {
        sessionId: currentSession.id,
        date: new Date().toISOString(),
        summary: await generateSessionSummary(currentSession.messages),
        insights: extractInsights(currentSession.messages),
        messageCount: currentSession.messages.length,
        durationMinutes: Math.round(
          (Date.now() - currentSession.startedAt) / 60000
        ),
      };

      const updatedSummaries = [
        ...sessionSummaries,
        summary,
      ].slice(-LONG_TERM_LIMITS.maxSessionSummaries);

      set({
        currentSession: null,
        sessionSummaries: updatedSummaries,
      });

      await get().saveMemory();
    },

    addAIGreeting: (greeting: string) => {
      const { currentSession } = get();

      if (!currentSession) {
        get().startSession();
      }

      const session = get().currentSession;
      if (!session) return;

      const greetingMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
        tokenEstimate: estimateTokens(greeting),
      };

      set({
        currentSession: {
          ...session,
          messages: [...session.messages, greetingMessage],
          lastActivityAt: Date.now(),
        },
      });
    },

    sendMessage: async (content: string) => {
      const { currentSession } = get();

      if (!currentSession) {
        get().startSession();
      }

      const session = get().currentSession;
      if (!session) return;

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        tokenEstimate: estimateTokens(content),
      };

      set({
        currentSession: {
          ...session,
          messages: [...session.messages, userMessage],
          lastActivityAt: Date.now(),
        },
        isGenerating: true,
      });

      try {
        const response = await generateAIResponse(
          [...session.messages, userMessage],
          get().personaId,
          get().longTermMemory,
          get().sessionSummaries
        );

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
          tokenEstimate: estimateTokens(response),
        };

        const updatedSession = get().currentSession;
        if (updatedSession) {
          set({
            currentSession: {
              ...updatedSession,
              messages: [...updatedSession.messages, assistantMessage],
              lastActivityAt: Date.now(),
            },
            isGenerating: false,
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[AIStore] Error generating response:', error);
        }
        set({ isGenerating: false });

        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: getDefaultErrorResponse(),
          timestamp: Date.now(),
          tokenEstimate: 50,
        };

        const updatedSession = get().currentSession;
        if (updatedSession) {
          set({
            currentSession: {
              ...updatedSession,
              messages: [...updatedSession.messages, errorMessage],
              lastActivityAt: Date.now(),
            },
          });
        }
      }
    },
  };
}
