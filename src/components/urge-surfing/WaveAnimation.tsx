/**
 * WaveAnimation Component
 * Animated wave visualization for urge surfing
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

interface WaveAnimationProps {
  /** Current progress (0-1) */
  progress: number;
  /** Show surfer emoji */
  showSurfer?: boolean;
  /** Wave color (uses theme primary if not specified) */
  waveColor?: string;
  /** Height of the wave container */
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVE_WIDTH = SCREEN_WIDTH * 2;

/**
 * Generate SVG path for a wave
 */
function generateWavePath(
  width: number,
  height: number,
  yPosition: number,
  amplitude: number = 20,
  frequency: number = 0.015,
  phase: number = 0
): string {
  const y = height * yPosition;
  let path = `M 0 ${y}`;

  for (let x = 0; x <= width; x += 5) {
    const waveY = y + Math.sin(x * frequency + phase) * amplitude;
    path += ` L ${x} ${waveY}`;
  }

  path += ` L ${width} ${height} L 0 ${height} Z`;
  return path;
}

export function WaveAnimation({
  progress,
  showSurfer = true,
  waveColor,
  height = 200,
}: WaveAnimationProps) {
  const { colors } = useTheme();
  const finalWaveColor = waveColor || colors.primary;

  // Animation values
  const waveOffset = useSharedValue(0);
  const wavePhase = useSharedValue(0);

  // Start wave animation
  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, [waveOffset, wavePhase]);

  // Animated wave container style (horizontal movement)
  const animatedWaveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset.value * -SCREEN_WIDTH }],
  }));

  // Surfer position - follows the peak of the wave
  const surferY = useDerivedValue(() => {
    // Surfer stays on top of wave, with slight bobbing
    const baseY = interpolate(progress, [0, 0.5, 1], [0.25, 0.1, 0.65]);
    const bob = Math.sin(wavePhase.value * 2) * 0.02;
    return (baseY + bob) * height;
  });

  const surferX = useDerivedValue(() => {
    // Slight horizontal sway
    const sway = Math.sin(wavePhase.value) * 10;
    return SCREEN_WIDTH / 2 - 20 + sway;
  });

  const animatedSurferStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: surferX.value },
      { translateY: surferY.value },
      { rotate: `${Math.sin(wavePhase.value) * 5}deg` },
    ],
  }));

  // Generate wave paths with different phases for layered effect
  const wavePath1 = useMemo(() => {
    return generateWavePath(
      WAVE_WIDTH,
      height,
      0.35 + (1 - progress) * 0.1,
      25 - progress * 15,
      0.015,
      0
    );
  }, [height, progress]);

  const wavePath2 = useMemo(() => {
    return generateWavePath(
      WAVE_WIDTH,
      height,
      0.4 + (1 - progress) * 0.1,
      20 - progress * 10,
      0.018,
      Math.PI / 3
    );
  }, [height, progress]);

  const wavePath3 = useMemo(() => {
    return generateWavePath(
      WAVE_WIDTH,
      height,
      0.45 + (1 - progress) * 0.1,
      15 - progress * 5,
      0.02,
      Math.PI / 2
    );
  }, [height, progress]);

  return (
    <View style={[styles.container, { height }]}>
      {/* Background gradient */}
      <View style={[styles.background, { backgroundColor: colors.backgroundCard }]} />

      {/* Wave layers */}
      <Animated.View style={[styles.waveContainer, animatedWaveStyle]}>
        <Svg width={WAVE_WIDTH} height={height} viewBox={`0 0 ${WAVE_WIDTH} ${height}`}>
          <Defs>
            <LinearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={finalWaveColor} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={finalWaveColor} stopOpacity={0.6} />
            </LinearGradient>
            <LinearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={finalWaveColor} stopOpacity={0.4} />
              <Stop offset="100%" stopColor={finalWaveColor} stopOpacity={0.7} />
            </LinearGradient>
            <LinearGradient id="waveGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={finalWaveColor} stopOpacity={0.5} />
              <Stop offset="100%" stopColor={finalWaveColor} stopOpacity={0.9} />
            </LinearGradient>
          </Defs>

          {/* Back wave (lightest) */}
          <Path d={wavePath1} fill="url(#waveGradient1)" />

          {/* Middle wave */}
          <Path d={wavePath2} fill="url(#waveGradient2)" />

          {/* Front wave (darkest) */}
          <Path d={wavePath3} fill="url(#waveGradient3)" />
        </Svg>
      </Animated.View>

      {/* Surfer emoji */}
      {showSurfer && (
        <Animated.View style={[styles.surfer, animatedSurferStyle]}>
          <Text style={styles.surferEmoji}>🏄</Text>
        </Animated.View>
      )}

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.borderSubtle }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: finalWaveColor,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  surfer: {
    position: 'absolute',
  },
  surferEmoji: {
    fontSize: 40,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default WaveAnimation;
