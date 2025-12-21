/**
 * WaveAnimation Component
 * Animated wave visualization for urge surfing
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, G, Circle, Ellipse } from 'react-native-svg';
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

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * Meditating person SVG component
 * A peaceful silhouette sitting in lotus position
 */
interface MeditatingPersonProps {
  color: string;
  size?: number;
}

function MeditatingPersonSvg({ color, size = 60 }: MeditatingPersonProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Head */}
      <Circle cx="50" cy="22" r="12" fill={color} />

      {/* Body - torso */}
      <Path
        d="M50 34 Q50 50 50 55 Q45 60 35 65 L35 70 Q50 68 50 68 Q50 68 65 70 L65 65 Q55 60 50 55"
        fill={color}
      />

      {/* Arms in meditation pose */}
      <Path
        d="M35 50 Q25 55 22 60 Q20 65 25 68 Q30 70 35 65 Q40 60 42 55"
        fill={color}
      />
      <Path
        d="M65 50 Q75 55 78 60 Q80 65 75 68 Q70 70 65 65 Q60 60 58 55"
        fill={color}
      />

      {/* Hands resting on knees */}
      <Circle cx="28" cy="68" r="5" fill={color} />
      <Circle cx="72" cy="68" r="5" fill={color} />

      {/* Crossed legs in lotus */}
      <Ellipse cx="50" cy="82" rx="25" ry="10" fill={color} />

      {/* Subtle glow/aura behind */}
      <Circle cx="50" cy="50" r="45" fill={color} opacity={0.1} />
    </Svg>
  );
}

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

  // Meditator position - gentle floating on the wave
  const meditatorX = useDerivedValue(() => {
    // Center horizontally with very subtle sway
    const baseX = SCREEN_WIDTH / 2 - 30; // Center the 60px wide icon
    const gentleSway = Math.sin(wavePhase.value * 0.5) * 5;
    return baseX + gentleSway;
  });

  const meditatorY = useDerivedValue(() => {
    // Calculate wave height at meditator's position
    const waveFrequency = 0.015;
    const posInWave = meditatorX.value + 30 + (waveOffset.value * SCREEN_WIDTH);

    // Base wave position
    const baseWaveY = 0.35 + (1 - progress) * 0.1;
    const waveAmplitude = 25 - progress * 15;

    // Calculate actual wave Y at position
    const waveY = baseWaveY * height +
      Math.sin(posInWave * waveFrequency + wavePhase.value) * waveAmplitude;

    // Offset to float above the wave
    return waveY - 55;
  });

  // Breathing scale - gentle expansion/contraction synced with breath
  const breathScale = useDerivedValue(() => {
    // Slower breathing rhythm (4 seconds per cycle)
    const breathCycle = Math.sin(wavePhase.value * 0.5);
    // Very subtle scale change (0.95 to 1.05)
    return 1 + breathCycle * 0.05;
  });

  // Subtle vertical float independent of wave
  const breathFloat = useDerivedValue(() => {
    const breathCycle = Math.sin(wavePhase.value * 0.5);
    return breathCycle * 3;
  });

  // Aura glow opacity - pulses with breathing
  const auraOpacity = useDerivedValue(() => {
    const breathCycle = Math.sin(wavePhase.value * 0.5);
    return 0.3 + breathCycle * 0.2;
  });

  const animatedMeditatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: meditatorX.value },
      { translateY: meditatorY.value + breathFloat.value },
      { scale: breathScale.value },
    ],
    opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]),
  }));

  const animatedAuraStyle = useAnimatedStyle(() => ({
    opacity: auraOpacity.value,
    transform: [{ scale: 1 + Math.sin(wavePhase.value * 0.5) * 0.1 }],
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

      {/* Meditating person */}
      {showSurfer && (
        <>
          {/* Aura glow behind meditator */}
          <Animated.View style={[styles.aura, animatedMeditatorStyle, animatedAuraStyle]}>
            <View style={[styles.auraInner, { backgroundColor: finalWaveColor }]} />
          </Animated.View>

          {/* Meditator */}
          <Animated.View style={[styles.meditator, animatedMeditatorStyle]}>
            <MeditatingPersonSvg color={finalWaveColor} size={60} />
          </Animated.View>
        </>
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
  meditator: {
    position: 'absolute',
  },
  aura: {
    position: 'absolute',
  },
  auraInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: -10,
    marginTop: -10,
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
