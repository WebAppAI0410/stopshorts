import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonBoxProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonBox({ width, height, borderRadius = 8, style }: SkeletonBoxProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repeats
      true // Reverse
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: colors.border,
  };

  return (
    <Animated.View
      style={[baseStyle, animatedStyle, style]}
    />
  );
}

export interface StatisticsLoadingSkeletonProps {
  variant?: 'details' | 'card' | 'chart';
}

export function StatisticsLoadingSkeleton({ variant = 'details' }: StatisticsLoadingSkeletonProps) {
  const { colors, spacing, borderRadius } = useTheme();

  if (variant === 'card') {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <SkeletonBox width={80} height={16} style={{ marginBottom: spacing.sm }} />
        <SkeletonBox width={120} height={32} />
      </View>
    );
  }

  if (variant === 'chart') {
    return (
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <SkeletonBox width={120} height={20} style={{ marginBottom: spacing.md }} />
        <View style={styles.chartBars}>
          <SkeletonBox width={40} height={100} borderRadius={4} />
          <SkeletonBox width={40} height={80} borderRadius={4} />
          <SkeletonBox width={40} height={120} borderRadius={4} />
          <SkeletonBox width={40} height={60} borderRadius={4} />
        </View>
      </View>
    );
  }

  // Default: details variant
  return (
    <View style={styles.container}>
      {/* Circular gauge skeleton */}
      <View style={[styles.gaugeContainer, { marginBottom: spacing.xl }]}>
        <SkeletonBox width={200} height={200} borderRadius={100} />
      </View>

      {/* Week change skeleton */}
      <SkeletonBox
        width={180}
        height={24}
        style={{ alignSelf: 'center', marginBottom: spacing.xl }}
      />

      {/* Intervention breakdown skeleton */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: spacing.xl,
          },
        ]}
      >
        <SkeletonBox width={140} height={20} style={{ marginBottom: spacing.md }} />
        <View style={styles.row}>
          <SkeletonBox width="45%" height={60} borderRadius={12} />
          <SkeletonBox width="45%" height={60} borderRadius={12} />
        </View>
      </View>

      {/* Time of day breakdown skeleton */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <SkeletonBox width={120} height={20} style={{ marginBottom: spacing.md }} />
        <SkeletonBox width="100%" height={100} borderRadius={8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  sectionCard: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
  },
  chartCard: {
    width: '100%',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
});
