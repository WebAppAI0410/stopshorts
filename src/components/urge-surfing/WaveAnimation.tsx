/**
 * WaveAnimation Component
 * Animated wave visualization for urge surfing
 * Matches the mockup behavior with horizontal flowing waves that calm over time
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  interpolateColor,
  type SharedValue,
  useFrameCallback,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';

interface WaveAnimationProps {
  /** Current progress (0-1) */
  progress: SharedValue<number>;
  /** Height of the wave container */
  height?: number;
  /** Test ID for testing */
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Generate SVG path for a wave
 * This function will be called on the UI thread for smooth morphing
 */
const getWavePath = (
  width: number,
  height: number,
  progress: number,
  phaseOffset: number,
  time: number,
  amplitudeMultiplier: number,
  frequencyMultiplier: number,
  baseHeightOffset: number
) => {
  'worklet';
  // Intensity factor: 1 at start (intense), 0 at end (calm)
  const intensityFactor = 1 - progress;

  // Amplitude: starts intense (70) and goes to calm (5)
  const baseAmp = 5 + intensityFactor * 65;
  const totalAmp = baseAmp * amplitudeMultiplier;

  // Base Y position: moves lower as it calms down (110 -> 160 for wave1)
  const baseY = height * (0.44 + baseHeightOffset) + progress * (height * 0.2);

  // Wave frequency: gets slightly smoother as it calms
  const freq = (0.015 + (1 - intensityFactor) * 0.005) * frequencyMultiplier;

  // Horizontal movement speed: faster when intense, slower when calm
  // This creates the flowing wave effect
  const speedFactor = 0.003 + intensityFactor * 0.005;
  const dynamicPhase = phaseOffset + time * speedFactor;

  let path = `M 0 ${baseY}`;

  // Create path points
  for (let x = 0; x <= width; x += 8) {
    const y = baseY + Math.sin(x * freq + dynamicPhase) * totalAmp;
    path += ` L ${x} ${y}`;
  }

  path += ` L ${width} ${height} L 0 ${height} Z`;
  return path;
};

export function WaveAnimation({
  progress,
  height = 250,
  testID,
}: WaveAnimationProps) {
  const { colors, isDark } = useTheme();

  // Continuously incrementing time value for wave movement
  const time = useSharedValue(0);
  // Date.now() in useRef is valid for animation timing - disable React Compiler purity check
  // eslint-disable-next-line react-hooks/purity
  const startTime = useRef(Date.now());

  // Use frame callback for smooth 60fps animation
  useFrameCallback(() => {
    // Increment time based on elapsed milliseconds for consistent speed
    time.value = Date.now() - startTime.current;
  });

  // Calculate shared color for all paths (Emerald -> Teal transition)
  const waveColorValue = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 1],
      [colors.primary, palette.teal[500]]
    );
  });

  // Wave 1 (back) - slowest, largest amplitude, lowest frequency
  const wave1Props = useAnimatedProps(() => ({
    d: getWavePath(
      SCREEN_WIDTH,
      height,
      progress.value,
      0,                    // phaseOffset
      time.value,           // time
      1.0,                  // amplitudeMultiplier
      1.0,                  // frequencyMultiplier
      0                     // baseHeightOffset
    ),
    fill: waveColorValue.value,
  }));

  // Wave 2 (middle) - medium speed
  const wave2Props = useAnimatedProps(() => ({
    d: getWavePath(
      SCREEN_WIDTH,
      height,
      progress.value,
      Math.PI / 2,          // phaseOffset
      time.value * 1.2,     // slightly faster
      0.85,                 // smaller amplitude
      1.2,                  // higher frequency
      0.06                  // slightly lower base
    ),
    fill: waveColorValue.value,
  }));

  // Wave 3 (front) - fastest, smallest amplitude, highest frequency
  const wave3Props = useAnimatedProps(() => ({
    d: getWavePath(
      SCREEN_WIDTH,
      height,
      progress.value,
      Math.PI,              // phaseOffset
      time.value * 1.5,     // fastest
      0.7,                  // smallest amplitude
      1.5,                  // highest frequency
      0.12                  // lowest base
    ),
    fill: waveColorValue.value,
  }));

  // Progress bar width animation - must be at component top level (React Hooks rule)
  const progressWidthStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%` as `${number}%`,
  }));

  return (
    <View
      testID={testID}
      style={[styles.container, { height, borderColor: colors.borderSubtle }]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {/* Background with slight glassmorphism */}
      <View style={[styles.background, { backgroundColor: colors.backgroundCardGlass }]} />

      <Svg width={SCREEN_WIDTH} height={height} viewBox={`0 0 ${SCREEN_WIDTH} ${height}`}>
        <AnimatedPath animatedProps={wave1Props} fillOpacity={0.3} />
        <AnimatedPath animatedProps={wave2Props} fillOpacity={0.5} />
        <AnimatedPath animatedProps={wave3Props} fillOpacity={0.7} />
      </Svg>

      {/* Progress shadow bar at the bottom */}
      <View style={[
        styles.progressShadow,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
      ]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary },
            progressWidthStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 24,
    position: 'relative',
    borderWidth: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  progressShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
});

export default WaveAnimation;
