/**
 * CircularGauge - Apple Watch style circular progress gauge
 *
 * Displays a value (0-100) as a circular progress indicator
 * with smooth Reanimated animation.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularGaugeProps {
  /** Value to display (0-100) */
  value: number;
  /** Diameter of the gauge in dp (default: 100) */
  size?: number;
  /** Width of the stroke in dp (default: 10) */
  strokeWidth?: number;
  /** Whether to animate the progress (default: true) */
  animated?: boolean;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  size = 100,
  strokeWidth = 10,
  animated = true,
}) => {
  const { isDark, typography } = useTheme();

  // Clamp value to 0-100
  const clampedValue = Math.max(0, Math.min(100, value));

  // SVG calculations
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Colors based on theme
  const accentColor = isDark ? palette.emerald[500] : palette.emerald[600];
  const trackColor = isDark ? palette.dark[500] : '#E5E5E5';

  // Animation
  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(clampedValue / 100, {
        duration: 1200,
        easing: Easing.out(Easing.exp),
      });
    } else {
      progress.value = clampedValue / 100;
    }
  }, [clampedValue, animated, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      {/* Center value */}
      <View style={styles.valueContainer}>
        <Animated.Text
          style={[
            styles.valueText,
            {
              color: isDark ? palette.text.primary : palette.textLight.primary,
              fontSize: 32,
              fontWeight: typography.hero.fontWeight,
            },
          ]}
        >
          {Math.round(clampedValue)}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    textAlign: 'center',
  },
});
