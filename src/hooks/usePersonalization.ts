import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { getPersonalizedMessage, getCoachingContext } from '../services/personalization';
import type { CoachingContext, WarningLevel } from '../types';

interface PersonalizedMessage {
  message: string;
  warningLevel: WarningLevel;
  implementationIntentText: string | null;
}

/**
 * Hook to get personalized coaching message
 * Encapsulates service layer access for layer architecture compliance
 */
export function usePersonalizedMessage(): PersonalizedMessage {
  const purpose = useAppStore((state) => state.purpose);
  const sleepProfile = useAppStore((state) => state.sleepProfile);
  const addictionAssessment = useAppStore((state) => state.addictionAssessment);
  const implementationIntent = useAppStore((state) => state.implementationIntent);

  return useMemo(() => {
    return getPersonalizedMessage(
      purpose,
      sleepProfile,
      addictionAssessment,
      implementationIntent
    );
  }, [purpose, sleepProfile, addictionAssessment, implementationIntent]);
}

/**
 * Hook to get coaching context for Shield UI customization
 * Encapsulates service layer access for layer architecture compliance
 */
export function useCoachingContext(): CoachingContext {
  const purpose = useAppStore((state) => state.purpose);
  const sleepProfile = useAppStore((state) => state.sleepProfile);

  return useMemo(() => {
    return getCoachingContext(purpose, sleepProfile);
  }, [purpose, sleepProfile]);
}

/**
 * Combined hook for both personalized message and coaching context
 * Useful when both are needed in the same component
 */
export function usePersonalization(): {
  personalizedMessage: PersonalizedMessage;
  coachingContext: CoachingContext;
} {
  const personalizedMessage = usePersonalizedMessage();
  const coachingContext = useCoachingContext();

  return {
    personalizedMessage,
    coachingContext,
  };
}
