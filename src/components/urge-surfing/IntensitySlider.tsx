/**
 * IntensitySlider Component
 * Slider to measure urge intensity (1-10)
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface IntensitySliderProps {
  /** Current value (1-10) */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Label shown above the slider */
  label?: string;
}

const SLIDER_HEIGHT = 8;
const THUMB_SIZE = 32;

export function IntensitySlider({
  value,
  onChange,
  disabled = false,
  label,
}: IntensitySliderProps) {
  const { colors, typography, spacing } = useTheme();

  const sliderWidth = useSharedValue(0);
  const thumbPosition = useSharedValue((value - 1) / 9);
  const isPressed = useSharedValue(false);

  // Sync thumbPosition when value changes externally
  useEffect(() => {
    thumbPosition.value = withSpring((value - 1) / 9, {
      damping: 15,
      stiffness: 150,
    });
  }, [value, thumbPosition]);

  const updateValue = useCallback(
    (newValue: number) => {
      onChange(newValue);
    },
    [onChange]
  );

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(1, event.x / sliderWidth.value));
      thumbPosition.value = newPosition;
      const intensity = Math.round(newPosition * 9) + 1;
      runOnJS(updateValue)(intensity);
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onEnd((event) => {
      const newPosition = Math.max(0, Math.min(1, event.x / sliderWidth.value));
      thumbPosition.value = withSpring(newPosition, {
        damping: 15,
        stiffness: 150,
      });
      const intensity = Math.round(newPosition * 9) + 1;
      runOnJS(updateValue)(intensity);
    });

  const composedGestures = Gesture.Exclusive(panGesture, tapGesture);

  const thumbStyle = useAnimatedStyle(() => {
    const scale = isPressed.value ? 1.2 : 1;
    return {
      transform: [
        { translateX: thumbPosition.value * sliderWidth.value - THUMB_SIZE / 2 },
        { scale: withSpring(scale, { damping: 15, stiffness: 150 }) },
      ],
    };
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${thumbPosition.value * 100}%`,
  }));

  // Get color based on intensity value
  const getIntensityColor = (val: number): string => {
    if (val <= 3) return colors.success;
    if (val <= 6) return colors.warning;
    return colors.error;
  };

  // Get label based on intensity value
  const getIntensityLabel = (val: number): string => {
    if (val <= 3) return '弱い';
    if (val <= 6) return '中くらい';
    return '強い';
  };

  const currentColor = getIntensityColor(value);

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {label && (
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          {label}
        </Text>
      )}

      {/* Min/Max labels */}
      <View style={styles.labelsRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>弱い</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>強い</Text>
      </View>

      {/* Slider track */}
      <GestureDetector gesture={composedGestures}>
        <View
          style={[styles.track, { backgroundColor: colors.borderSubtle }]}
          onLayout={(e) => {
            sliderWidth.value = e.nativeEvent.layout.width;
          }}
        >
          {/* Progress fill */}
          <Animated.View
            style={[
              styles.progress,
              progressStyle,
              { backgroundColor: currentColor },
            ]}
          />

          {/* Tick marks */}
          <View style={styles.tickContainer}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tick,
                  {
                    backgroundColor:
                      i < value ? currentColor : colors.borderSubtle,
                    opacity: i < value ? 0.8 : 0.4,
                  },
                ]}
              />
            ))}
          </View>

          {/* Thumb */}
          <Animated.View
            style={[
              styles.thumb,
              thumbStyle,
              {
                backgroundColor: currentColor,
                shadowColor: currentColor,
              },
            ]}
          >
            <Text style={styles.thumbText}>{value}</Text>
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Current value display */}
      <View style={[styles.valueDisplay, { marginTop: spacing.md }]}>
        <View style={[styles.valueBadge, { backgroundColor: currentColor + '20' }]}>
          <Text style={[typography.bodyLarge, { color: currentColor, fontWeight: '700' }]}>
            {value}
          </Text>
          <Text style={[typography.caption, { color: currentColor, marginLeft: spacing.xs }]}>
            - {getIntensityLabel(value)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    overflow: 'visible',
    justifyContent: 'center',
  },
  progress: {
    height: '100%',
    borderRadius: SLIDER_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  tickContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tick: {
    width: 2,
    height: SLIDER_HEIGHT,
    borderRadius: 1,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    top: (SLIDER_HEIGHT - THUMB_SIZE) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  valueDisplay: {
    alignItems: 'center',
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default IntensitySlider;
