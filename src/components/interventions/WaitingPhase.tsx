/**
 * WaitingPhase Component
 * Displays countdown timer for friction intervention
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';

interface WaitingPhaseProps {
  /** Total wait time in seconds */
  waitSeconds: number;
  /** Callback when countdown completes */
  onComplete: () => void;
}

export function WaitingPhase({ waitSeconds, onComplete }: WaitingPhaseProps) {
  const { colors, typography, spacing } = useTheme();
  const [remaining, setRemaining] = useState(waitSeconds);

  useEffect(() => {
    // Guard: Only complete if waitSeconds was actually positive
    // This prevents immediate completion on initial render with 0
    if (remaining <= 0 && waitSeconds > 0) {
      onComplete();
      return;
    }

    // Don't start timer if nothing to count down
    if (remaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, waitSeconds, onComplete]);

  // Reset remaining when waitSeconds changes
  useEffect(() => {
    setRemaining(waitSeconds);
  }, [waitSeconds]);

  const progressRatio = 1 - remaining / waitSeconds;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={[styles.container, { paddingHorizontal: spacing.lg }]}
    >
      <View style={[styles.header, { marginBottom: spacing['2xl'] }]}>
        <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
          {t('intervention.friction.waiting.title')}
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
          ]}
        >
          {t('intervention.friction.waiting.subtitle')}
        </Text>
      </View>

      {/* Countdown Circle */}
      <View style={styles.countdownContainer}>
        <View
          style={[
            styles.countdownCircle,
            {
              borderColor: colors.border,
              backgroundColor: colors.backgroundCard,
            },
          ]}
          accessible={true}
          accessibilityRole="timer"
          accessibilityLabel={t('intervention.friction.waiting.countdownLabel', { seconds: remaining })}
        >
          {/* Progress ring effect using border */}
          <View
            style={[
              styles.progressRing,
              {
                borderColor: colors.accent,
                borderTopColor: progressRatio < 0.25 ? colors.accent : 'transparent',
                borderRightColor: progressRatio < 0.5 ? colors.accent : 'transparent',
                borderBottomColor: progressRatio < 0.75 ? colors.accent : 'transparent',
                borderLeftColor: colors.accent,
                transform: [{ rotate: `${progressRatio * 360}deg` }],
              },
            ]}
          />
          <Text style={[styles.countdownText, { color: colors.textPrimary }]} importantForAccessibility="no">
            {remaining}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]} importantForAccessibility="no">
            {t('intervention.friction.waiting.seconds', { seconds: remaining })}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: spacing.lg (24) - applied via inline style
  },
  header: {
    // marginBottom: spacing['2xl'] (48) - applied via inline style
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
