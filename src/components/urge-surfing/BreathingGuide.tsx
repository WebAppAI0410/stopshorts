/**
 * BreathingGuide Component
 * Guided breathing animation for urge surfing
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface BreathingGuideProps {
  /** Number of breathing cycles */
  cycles: number;
  /** Callback when all cycles are complete */
  onComplete: () => void;
  /** Callback for each cycle completion */
  onCycleComplete?: (cycleNumber: number) => void;
  /** Inhale duration in ms */
  inhaleMs?: number;
  /** Hold duration in ms */
  holdMs?: number;
  /** Exhale duration in ms */
  exhaleMs?: number;
  /** Whether to auto-start */
  autoStart?: boolean;
}

type BreathPhase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'rest' | 'complete';

const PHASE_LABELS: Record<BreathPhase, string> = {
  ready: '準備...',
  inhale: '吸って...',
  hold: '止めて...',
  exhale: '吐いて...',
  rest: '',
  complete: '完了！',
};

export function BreathingGuide({
  cycles,
  onComplete,
  onCycleComplete,
  inhaleMs = 4000,
  holdMs = 2000,
  exhaleMs = 4000,
  autoStart = true,
}: BreathingGuideProps) {
  const { colors, typography, spacing } = useTheme();
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<BreathPhase>('ready');
  const [isRunning, setIsRunning] = useState(autoStart);

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  // Track timeouts for cleanup
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const handleCycleComplete = useCallback(
    (cycle: number) => {
      onCycleComplete?.(cycle);
    },
    [onCycleComplete]
  );

  const handleAllComplete = useCallback(() => {
    setPhase('complete');
    setIsRunning(false);
    onComplete();
  }, [onComplete]);

  // Helper to add timeout and track it
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  // Clear all tracked timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Run breathing animation
  useEffect(() => {
    if (!isRunning) return;

    const runCycle = (cycleNum: number) => {
      // Inhale phase
      setPhase('inhale');
      scale.value = withTiming(1.6, {
        duration: inhaleMs,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: inhaleMs });

      // Ring pulse on inhale
      ringScale.value = 1;
      ringOpacity.value = withSequence(
        withTiming(0.4, { duration: inhaleMs / 2 }),
        withTiming(0, { duration: inhaleMs / 2 })
      );

      // Hold phase
      addTimeout(() => {
        setPhase('hold');
        // Subtle pulse during hold
        scale.value = withSequence(
          withTiming(1.55, { duration: holdMs / 2 }),
          withTiming(1.6, { duration: holdMs / 2 })
        );
      }, inhaleMs);

      // Exhale phase
      addTimeout(() => {
        setPhase('exhale');
        scale.value = withTiming(1, {
          duration: exhaleMs,
          easing: Easing.inOut(Easing.ease),
        });
        opacity.value = withTiming(0.6, { duration: exhaleMs });
      }, inhaleMs + holdMs);

      // Rest and next cycle
      addTimeout(() => {
        setPhase('rest');
        runOnJS(handleCycleComplete)(cycleNum + 1);

        if (cycleNum + 1 < cycles) {
          setCurrentCycle(cycleNum + 1);
          // Short pause before next cycle
          addTimeout(() => {
            runCycle(cycleNum + 1);
          }, 500);
        } else {
          runOnJS(handleAllComplete)();
        }
      }, inhaleMs + holdMs + exhaleMs);
    };

    // Start first cycle after brief delay
    addTimeout(() => {
      setCurrentCycle(0);
      runCycle(0);
    }, 500);

    // Cleanup all timeouts on unmount or when dependencies change
    return () => {
      clearAllTimeouts();
    };
  }, [
    isRunning,
    cycles,
    inhaleMs,
    holdMs,
    exhaleMs,
    scale,
    opacity,
    ringScale,
    ringOpacity,
    handleCycleComplete,
    handleAllComplete,
    addTimeout,
    clearAllTimeouts,
  ]);

  // Animated styles
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value * 1.5 }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Outer ring animation */}
      <Animated.View
        style={[
          styles.ring,
          animatedRingStyle,
          { borderColor: colors.primary },
        ]}
      />

      {/* Main breathing circle */}
      <Animated.View
        style={[
          styles.circle,
          animatedCircleStyle,
          { backgroundColor: colors.primary + '30' },
        ]}
      >
        <View style={[styles.innerCircle, { backgroundColor: colors.primary }]} />
      </Animated.View>

      {/* Phase label */}
      <Text
        style={[
          typography.h2,
          {
            color: colors.textPrimary,
            marginTop: spacing.xl,
            textAlign: 'center',
          },
        ]}
      >
        {PHASE_LABELS[phase]}
      </Text>

      {/* Cycle indicators */}
      <View style={[styles.cycleIndicator, { marginTop: spacing.lg }]}>
        {Array.from({ length: cycles }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.cycleDot,
              {
                backgroundColor:
                  i < currentCycle + (phase !== 'ready' && phase !== 'complete' ? 1 : 0)
                    ? colors.primary
                    : colors.borderSubtle,
                transform: [{ scale: i === currentCycle && phase !== 'complete' ? 1.2 : 1 }],
              },
            ]}
          />
        ))}
      </View>

      {/* Cycle counter */}
      <Text
        style={[
          typography.caption,
          {
            color: colors.textMuted,
            marginTop: spacing.sm,
          },
        ]}
      >
        {phase === 'complete'
          ? `${cycles}回完了！`
          : `${currentCycle + 1} / ${cycles} 回目`}
      </Text>

      {/* Breathing tip */}
      {phase !== 'ready' && phase !== 'complete' && (
        <View
          style={[
            styles.tipContainer,
            {
              backgroundColor: colors.backgroundCard,
              marginTop: spacing.lg,
              padding: spacing.md,
              borderRadius: 12,
            },
          ]}
        >
          <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
            {phase === 'inhale' && '鼻からゆっくり息を吸いましょう'}
            {phase === 'hold' && 'そのまま優しく止めて...'}
            {phase === 'exhale' && '口からゆっくり吐き出しましょう'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  cycleIndicator: {
    flexDirection: 'row',
    gap: 12,
  },
  cycleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tipContainer: {
    maxWidth: 280,
  },
});

export default BreathingGuide;
