/**
 * IntensitySlider Component
 * Slider to measure urge intensity (1-10)
 * Uses PanResponder for compatibility with Expo Go
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  GestureResponderEvent,
} from 'react-native';
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
  /** Called when user starts sliding */
  onSlidingStart?: () => void;
  /** Called when user stops sliding */
  onSlidingEnd?: () => void;
}

const SLIDER_HEIGHT = 8;
const THUMB_SIZE = 32;
const MIN_VALUE = 1;
const MAX_VALUE = 10;

export function IntensitySlider({
  value,
  onChange,
  disabled = false,
  label,
  onSlidingStart,
  onSlidingEnd,
}: IntensitySliderProps) {
  const { colors, typography, spacing } = useTheme();

  // Track slider dimensions and position
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef<View>(null);
  const sliderPageX = useRef(0);

  // Animation values
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const isPressedAnim = useRef(new Animated.Value(1)).current;

  // Convert value (1-10) to position (0-1)
  const valueToPosition = useCallback((val: number): number => {
    return (val - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
  }, []);

  // Convert position (0-1) to value (1-10)
  const positionToValue = useCallback((pos: number): number => {
    const clampedPos = Math.max(0, Math.min(1, pos));
    return Math.round(clampedPos * (MAX_VALUE - MIN_VALUE)) + MIN_VALUE;
  }, []);

  // Update thumb position when value changes externally
  useEffect(() => {
    const targetPosition = valueToPosition(value);
    Animated.spring(thumbPosition, {
      toValue: targetPosition,
      useNativeDriver: false,
      friction: 10,
      tension: 120,
    }).start();
  }, [value, thumbPosition, valueToPosition]);

  // Handle layout to get slider dimensions
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);

    // Measure absolute position on screen
    sliderRef.current?.measureInWindow((x) => {
      sliderPageX.current = x;
    });
  }, []);

  // Calculate position from touch/gesture coordinates
  const getPositionFromX = useCallback(
    (pageX: number): number => {
      if (sliderWidth === 0) return valueToPosition(value);
      const relativeX = pageX - sliderPageX.current;
      return Math.max(0, Math.min(1, relativeX / sliderWidth));
    },
    [sliderWidth, value, valueToPosition]
  );

  // Update value from position
  const updateFromPosition = useCallback(
    (position: number) => {
      const newValue = positionToValue(position);
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [positionToValue, value, onChange]
  );

  // Refs for callbacks to avoid stale closures in PanResponder
  const getPositionFromXRef = useRef(getPositionFromX);
  const updateFromPositionRef = useRef(updateFromPosition);
  const disabledRef = useRef(disabled);
  const onSlidingStartRef = useRef(onSlidingStart);
  const onSlidingEndRef = useRef(onSlidingEnd);

  useEffect(() => {
    getPositionFromXRef.current = getPositionFromX;
    updateFromPositionRef.current = updateFromPosition;
    disabledRef.current = disabled;
    onSlidingStartRef.current = onSlidingStart;
    onSlidingEndRef.current = onSlidingEnd;
  }, [getPositionFromX, updateFromPosition, disabled, onSlidingStart, onSlidingEnd]);

  // Create PanResponder
  const panResponder = useRef(
    PanResponder.create({
      // Capture touch events to prevent parent ScrollView from scrolling
      onStartShouldSetPanResponderCapture: () => !disabledRef.current,
      onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      // Prevent other responders from taking over
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (event: GestureResponderEvent) => {
        if (disabledRef.current) return;

        // Notify parent that sliding started
        onSlidingStartRef.current?.();

        // Scale up thumb
        Animated.spring(isPressedAnim, {
          toValue: 1.2,
          useNativeDriver: false,
          friction: 8,
        }).start();

        // Update position from touch
        const position = getPositionFromXRef.current(event.nativeEvent.pageX);
        thumbPosition.setValue(position);
        updateFromPositionRef.current(position);
      },

      onPanResponderMove: (event: GestureResponderEvent) => {
        if (disabledRef.current) return;

        const position = getPositionFromXRef.current(event.nativeEvent.pageX);
        thumbPosition.setValue(position);
        updateFromPositionRef.current(position);
      },

      onPanResponderRelease: () => {
        // Notify parent that sliding ended
        onSlidingEndRef.current?.();

        Animated.spring(isPressedAnim, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
        }).start();
      },

      onPanResponderTerminate: () => {
        // Notify parent that sliding ended
        onSlidingEndRef.current?.();

        Animated.spring(isPressedAnim, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
        }).start();
      },
    })
  ).current;

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

  // Calculate thumb position in pixels
  const thumbTranslateX = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, sliderWidth - THUMB_SIZE)],
  });

  // Calculate progress width as percentage
  const progressWidth = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
      <View
        ref={sliderRef}
        style={[styles.track, { backgroundColor: colors.borderSubtle }]}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Progress fill */}
        <Animated.View
          style={[
            styles.progress,
            {
              backgroundColor: currentColor,
              width: progressWidth,
            },
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
                  backgroundColor: i < value ? currentColor : colors.borderSubtle,
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
            {
              backgroundColor: currentColor,
              shadowColor: currentColor,
              transform: [{ translateX: thumbTranslateX }, { scale: isPressedAnim }],
            },
          ]}
        >
          <Text style={styles.thumbText}>{value}</Text>
        </Animated.View>
      </View>

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
