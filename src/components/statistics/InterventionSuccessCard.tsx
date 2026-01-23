/**
 * InterventionSuccessCard - Displays intervention success rate
 *
 * Shows the overall success rate of interventions (dismissed / triggered)
 * with success count and total triggered count.
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';

export interface InterventionSuccessCardProps {
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Test ID for testing */
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const InterventionSuccessCard: React.FC<InterventionSuccessCardProps> = ({
  onPress,
  testID,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const getOverallInterventionSuccessRate = useStatisticsStore(
    (state) => state.getOverallInterventionSuccessRate
  );

  const stats = getOverallInterventionSuccessRate();
  const successPercent = Math.round(stats.successRate * 100);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <AnimatedPressable
      testID={testID}
      style={[
        animatedStyle,
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.lg,
          borderColor: colors.border,
        },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
            fontSize: typography.caption.fontSize,
            fontWeight: typography.caption.fontWeight,
          },
        ]}
      >
        {t('statistics.interventionSuccess')}
      </Text>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.percentValue,
            {
              color: colors.accent,
              fontWeight: 'bold',
            },
          ]}
        >
          {successPercent}%
        </Text>

        <View style={[styles.detailRow, { marginTop: spacing.xs }]}>
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary },
            ]}
          >
            {t('statistics.interventionSuccessDetail', {
              success: stats.dismissed,
              total: stats.triggered,
            })}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.tapHint,
          {
            color: colors.textMuted,
            fontSize: typography.caption.fontSize,
          },
        ]}
      >
        {t('statistics.tapForDetails')}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    width: 165,
    height: 180,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentValue: {
    fontSize: 36,
    lineHeight: 42,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tapHint: {
    textAlign: 'center',
  },
});
