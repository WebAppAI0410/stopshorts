/**
 * Guided Conversation Slice for AI Store
 * Handles guided conversation flows and recommendations
 */

import type { GuidedConversationState } from '../../types/ai';
import { LONG_TERM_LIMITS } from '../../types/ai';
import {
  getGuidedTemplate,
  getCurrentStep,
  isLastStep,
  buildTriggerSummary,
} from '../../data/guidedConversations';
import { useAppStore } from '../useAppStore';
import type { AIStore, GuidedState, GuidedActions } from './types';
import { generateId, mapAlternativeToIfThenPlan } from './helpers';

/**
 * Create initial guided state
 */
export function createInitialGuidedState(): GuidedState {
  return {
    guidedConversation: null,
    recentRecommendations: [],
  };
}

/**
 * Create guided slice actions
 */
export function createGuidedSlice(
  set: (partial: Partial<AIStore>) => void,
  get: () => AIStore
): GuidedActions {
  return {
    startGuidedConversation: (templateId: string) => {
      const template = getGuidedTemplate(templateId);
      if (!template) {
        if (__DEV__) {
          console.warn('[AIStore] Unknown guided template:', templateId);
        }
        return;
      }

      const guidedState: GuidedConversationState = {
        templateId,
        currentStepIndex: 0,
        responses: {},
        isActive: true,
        startedAt: Date.now(),
      };

      set({ guidedConversation: guidedState });
    },

    advanceGuidedStep: (response: string) => {
      const { guidedConversation } = get();
      if (!guidedConversation || !guidedConversation.isActive) return;

      const currentStep = getCurrentStep(
        guidedConversation.templateId,
        guidedConversation.currentStepIndex
      );

      if (!currentStep) return;

      const updatedResponses = {
        ...guidedConversation.responses,
        [currentStep.id]: response,
      };

      if (isLastStep(guidedConversation.templateId, guidedConversation.currentStepIndex)) {
        set({
          guidedConversation: {
            ...guidedConversation,
            responses: updatedResponses,
          },
        });
        get().completeGuidedConversation();
      } else {
        set({
          guidedConversation: {
            ...guidedConversation,
            currentStepIndex: guidedConversation.currentStepIndex + 1,
            responses: updatedResponses,
          },
        });
      }
    },

    completeGuidedConversation: async () => {
      const { guidedConversation } = get();
      if (!guidedConversation) return;

      const { templateId, responses } = guidedConversation;

      try {
        if (templateId === 'if-then') {
          const alternative = responses['alternative'] || '';
          const ifThenPlan = mapAlternativeToIfThenPlan(alternative);
          if (ifThenPlan) {
            useAppStore.getState().setIfThenPlan(ifThenPlan);
          }
        } else if (templateId === 'trigger-analysis') {
          const { longTermMemory } = get();
          if (longTermMemory) {
            const summary = buildTriggerSummary(responses);
            const newTrigger = {
              id: generateId(),
              trigger: `${summary.situation} (${summary.emotion})`,
              frequency: 1,
              discoveredAt: new Date().toISOString(),
            };

            const updatedTriggers = [
              ...longTermMemory.identifiedTriggers,
              newTrigger,
            ].slice(-LONG_TERM_LIMITS.maxTriggers);

            set({
              longTermMemory: {
                ...longTermMemory,
                identifiedTriggers: updatedTriggers,
              },
            });

            await get().saveMemory();
          }
        } else if (templateId === 'urge-record') {
          const intensity = parseInt(responses['intensity'] || '5', 10);
          const trigger = responses['trigger'] || '';
          const feeling = responses['feeling'] || '';

          get().addUrgeRecord({
            intensity: isNaN(intensity) ? 5 : Math.min(10, Math.max(1, intensity)),
            trigger,
            feeling,
          });
        } else if (templateId === 'success-record') {
          const method = responses['method'] || '';
          const feeling = responses['feeling'] || '';
          const tip = responses['tip'] || '';

          get().addSuccessRecord({
            method,
            feeling,
            tip,
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[AIStore] Error completing guided conversation:', error);
        }
      }

      set({ guidedConversation: null });
    },

    cancelGuidedConversation: () => {
      set({ guidedConversation: null });
    },

    addRecommendation: (topicId: string) => {
      const { recentRecommendations } = get();

      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const filtered = recentRecommendations.filter(
        (r) => r.recommendedAt > dayAgo
      );

      const updated = [
        ...filtered,
        { topicId, recommendedAt: Date.now() },
      ];

      set({ recentRecommendations: updated });
    },
  };
}
