/**
 * FrictionIntervention Component
 * Main friction intervention experience with 3 phases:
 * 1. Waiting (countdown)
 * 2. Intention (why are you here?)
 * 3. Confirm (final decision)
 */

import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../stores/useAppStore';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { calculateWaitTime } from '../../services/friction';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { WaitingPhase } from './WaitingPhase';
import { IntentionPhase } from './IntentionPhase';
import { ConfirmPhase } from './ConfirmPhase';
import type { FrictionPhase, IntentionId } from '../../types/intervention';

interface FrictionInterventionProps {
  /** Name of the blocked app */
  blockedAppName?: string;
  /** Package name of the app that triggered intervention */
  appPackage?: string;
  /** Callback when user chooses to proceed */
  onProceed: () => void;
  /** Callback when user dismisses (goes home) */
  onDismiss: () => void;
}

export function FrictionIntervention({
  blockedAppName = 'TikTok',
  appPackage,
  onProceed,
  onDismiss,
}: FrictionInterventionProps) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<FrictionPhase>('waiting');
  const [selectedIntention, setSelectedIntention] = useState<IntentionId | null>(null);
  const [customText, setCustomText] = useState<string | undefined>();
  const mountMeasuredRef = useRef(false);

  const {
    dailyOpenCount,
    incrementOpenCount,
    resetOpenCountIfNeeded,
  } = useAppStore();

  const { recordIntervention, recordIntention } = useStatisticsStore();

  // Calculate wait time based on daily open count
  const waitSeconds = calculateWaitTime(dailyOpenCount);

  // Reset daily count if new day and increment on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only on mount
  useEffect(() => {
    resetOpenCountIfNeeded();
    incrementOpenCount();
  }, []);

  // Start mount time measurement (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    performanceMonitor.start('friction_intervention_mount');
  }, []);

  // End mount time measurement
  useEffect(() => {
    if (!mountMeasuredRef.current) {
      mountMeasuredRef.current = true;
      performanceMonitor.end('friction_intervention_mount');
    }
  }, []);

  // Reset intervention state when screen comes into focus
  // This ensures a fresh start if user navigates away and back
  useFocusEffect(
    useCallback(() => {
      setPhase('waiting');
      setSelectedIntention(null);
      setCustomText(undefined);
    }, [])
  );

  // Phase transition handlers
  const handleWaitingComplete = useCallback(() => {
    setPhase('intention');
  }, []);

  const handleIntentionSelect = useCallback((intentionId: IntentionId, custom?: string) => {
    setSelectedIntention(intentionId);
    setCustomText(custom);
    setPhase('confirm');
  }, []);

  const handleProceed = useCallback(() => {
    // Record intention and intervention
    if (selectedIntention) {
      recordIntention(selectedIntention, true, customText, appPackage);
    }
    recordIntervention({ proceeded: true, appPackage });
    onProceed();
  }, [selectedIntention, customText, appPackage, recordIntention, recordIntervention, onProceed]);

  const handleDismiss = useCallback(() => {
    // Record intention and intervention (dismissed)
    if (selectedIntention) {
      recordIntention(selectedIntention, false, customText, appPackage);
    }
    recordIntervention({ proceeded: false, appPackage });
    onDismiss();
  }, [selectedIntention, customText, appPackage, recordIntention, recordIntervention, onDismiss]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {phase === 'waiting' && (
        <WaitingPhase
          waitSeconds={waitSeconds}
          onComplete={handleWaitingComplete}
        />
      )}

      {phase === 'intention' && (
        <IntentionPhase onSelect={handleIntentionSelect} />
      )}

      {phase === 'confirm' && selectedIntention && (
        <ConfirmPhase
          intentionId={selectedIntention}
          customText={customText}
          dailyOpenCount={dailyOpenCount}
          onProceed={handleProceed}
          onDismiss={handleDismiss}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
