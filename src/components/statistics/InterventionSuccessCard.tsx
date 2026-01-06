import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';

export interface InterventionSuccessCardProps {
  onPress?: () => void;
}

export function InterventionSuccessCard({ onPress }: InterventionSuccessCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { getOverallInterventionSuccessRate } = useStatisticsStore();
  const stats = getOverallInterventionSuccessRate();

  const cardContent = (
    <Animated.View
      entering={FadeInDown.duration(400).delay(100).springify()}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          minHeight: 180,
        },
      ]}
    >
      {/* Label */}
      <Text
        style={[
          typography.label,
          { color: colors.textSecondary, marginBottom: spacing.sm },
        ]}
      >
        {t('statistics.interventionSuccess')}
      </Text>

      {/* Large percentage display */}
      <View style={styles.percentageContainer}>
        <Text
          style={[
            styles.percentageText,
            { color: colors.accent },
          ]}
          accessibilityLabel={`${stats.successRate}%`}
        >
          {stats.successRate}
          <Text style={styles.percentSymbol}>%</Text>
        </Text>
      </View>

      {/* Detail text */}
      <Text
        style={[
          typography.bodySmall,
          { color: colors.textMuted, marginTop: spacing.sm },
        ]}
      >
        {t('statistics.interventionSuccessDetail', {
          success: stats.dismissed,
          total: stats.triggered,
        })}
      </Text>

      {/* Tap hint */}
      {onPress && (
        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, marginTop: spacing.xs },
          ]}
        >
          {t('statistics.tapForDetails')}
        </Text>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('statistics.interventionSuccess')}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressable: {
    flex: 0.5,
  },
  percentageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  percentSymbol: {
    fontSize: 24,
    fontWeight: '600',
  },
});
