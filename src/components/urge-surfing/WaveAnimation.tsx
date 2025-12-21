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

  // Surfer position - follows the wave movement realistically
  const surferX = useDerivedValue(() => {
    // Surfer position centers on screen with wave-riding sway
    const baseX = SCREEN_WIDTH / 2 - 20;
    // Forward/backward movement as if riding down the wave face
    const waveSway = Math.sin(wavePhase.value * 1.5) * 15;
    return baseX + waveSway;
  });

  const surferY = useDerivedValue(() => {
    // Calculate wave height at surfer's position
    const waveFrequency = 0.015;
    const surferPosInWave = surferX.value + (waveOffset.value * SCREEN_WIDTH);

    // Base wave position that moves with progress
    const baseWaveY = 0.35 + (1 - progress) * 0.1;
    const waveAmplitude = 25 - progress * 15;

    // Calculate actual wave Y at surfer position
    const waveY = baseWaveY * height +
      Math.sin(surferPosInWave * waveFrequency + wavePhase.value) * waveAmplitude;

    // Offset to place surfer on top of wave
    return waveY - 35;
  });

  // Calculate wave slope for realistic tilt
  const surferRotation = useDerivedValue(() => {
    const waveFrequency = 0.015;
    const surferPosInWave = surferX.value + (waveOffset.value * SCREEN_WIDTH);
    const waveAmplitude = 25 - progress * 15;

    // Calculate derivative (slope) of wave at surfer position
    const slope = Math.cos(surferPosInWave * waveFrequency + wavePhase.value) *
      waveAmplitude * waveFrequency;

    // Convert slope to rotation angle (atan gives radians, convert to degrees)
    // Scale down for more natural look
    const rotationDeg = Math.atan(slope) * (180 / Math.PI) * 2;

    // Clamp rotation to reasonable range
    return Math.max(-20, Math.min(20, rotationDeg));
  });

  // Scale effect - slightly larger when on wave peak
  const surferScale = useDerivedValue(() => {
    const waveFrequency = 0.015;
    const surferPosInWave = surferX.value + (waveOffset.value * SCREEN_WIDTH);
    const sineValue = Math.sin(surferPosInWave * waveFrequency + wavePhase.value);

    // Scale up slightly at peaks, down at troughs
    return 1 + sineValue * 0.1;
  });

  const animatedSurferStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: surferX.value },
      { translateY: surferY.value },
      { rotate: `${surferRotation.value}deg` },
      { scale: surferScale.value },
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
