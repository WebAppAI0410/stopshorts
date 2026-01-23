/**
 * useUrgeSurfingDemo - State and animation logic for urge surfing demo screen
 * Manages phase transitions and breathing animation
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter, Href } from 'expo-router';
import { useSharedValue, withTiming, Easing, SharedValue } from 'react-native-reanimated';
import { useAppStore } from '../stores/useAppStore';
import { t } from '../i18n';
import type { TargetAppId, InterventionType } from '../types';

export type DemoPhase = 'select' | 'simulate' | 'intervention' | 'experience' | 'complete';

// Total breathing duration: 3 cycles x (4s inhale + 2s hold + 4s exhale) = 30s
const BREATHING_DURATION_MS = 30000;

export interface UseUrgeSurfingDemoResult {
  phase: DemoPhase;
  selectedApp: TargetAppId;
  swipeCount: number;
  displayName: string;
  selectedInterventionType: InterventionType;
  goal: string | null;
  breathingProgress: SharedValue<number>;
  setPhase: (phase: DemoPhase) => void;
  setSelectedApp: (app: TargetAppId) => void;
  handleStartSimulation: () => void;
  handleIntervention: () => void;
  handleSwipe: (count: number) => void;
  handleStartExperience: () => void;
  handleExperienceComplete: () => void;
  handleTryAnother: () => void;
  handleContinueOnboarding: () => void;
  getExperienceButtonText: () => string;
}

export function useUrgeSurfingDemo(): UseUrgeSurfingDemoResult {
  const router = useRouter();
  const { userName, selectedInterventionType, goal } = useAppStore();

  const [phase, setPhase] = useState<DemoPhase>('select');
  const [selectedApp, setSelectedApp] = useState<TargetAppId>('tiktok');
  const [swipeCount, setSwipeCount] = useState(0);

  const displayName = userName && userName.trim().length > 0 ? userName.trim() : 'ユーザー';
  const breathingProgress = useSharedValue(0);

  // Continuous progress animation for wave calming effect (breathing intervention only)
  useEffect(() => {
    if (phase === 'experience' && selectedInterventionType === 'breathing') {
      breathingProgress.value = 0;
      breathingProgress.value = withTiming(1, {
        duration: BREATHING_DURATION_MS,
        easing: Easing.linear,
      });

      return () => {
        breathingProgress.value = 0;
      };
    }
  }, [phase, selectedInterventionType, breathingProgress]);

  const handleStartSimulation = useCallback(() => {
    setPhase('simulate');
    setSwipeCount(0);
  }, []);

  const handleIntervention = useCallback(() => {
    setPhase('intervention');
  }, []);

  const handleSwipe = useCallback((count: number) => {
    setSwipeCount(count);
  }, []);

  const handleStartExperience = useCallback(() => {
    setPhase('experience');
  }, []);

  const handleExperienceComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleTryAnother = useCallback(() => {
    router.push('/(onboarding)/intervention-select' as Href);
  }, [router]);

  const handleContinueOnboarding = useCallback(() => {
    router.push('/(onboarding)/ai-preview' as Href);
  }, [router]);

  const getExperienceButtonText = useCallback((): string => {
    switch (selectedInterventionType) {
      case 'breathing':
        return t('onboarding.urgeSurfingDemo.buttons.breathing');
      case 'friction':
        return t('onboarding.urgeSurfingDemo.buttons.friction');
      case 'mirror':
        return t('onboarding.urgeSurfingDemo.buttons.mirror');
      case 'ai':
        return t('onboarding.urgeSurfingDemo.buttons.ai');
      default:
        return t('onboarding.urgeSurfingDemo.buttons.breathing');
    }
  }, [selectedInterventionType]);

  return {
    phase,
    selectedApp,
    swipeCount,
    displayName,
    selectedInterventionType,
    goal,
    breathingProgress,
    setPhase,
    setSelectedApp,
    handleStartSimulation,
    handleIntervention,
    handleSwipe,
    handleStartExperience,
    handleExperienceComplete,
    handleTryAnother,
    handleContinueOnboarding,
    getExperienceButtonText,
  };
}
