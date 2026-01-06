import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import type { InterventionTypeStats } from '../../types/statistics';

// Type-specific colors
const TYPE_COLORS: Record<InterventionTypeStats['type'], string> = {
  breathing: '#10B981', // Emerald
  friction: '#14B8A6', // Teal
  mirror: '#8B5CF6', // Violet
  ai: '#F97316', // Orange
};

export interface InterventionBreakdownProps {
  animationDelay?: number;
}

function InterventionTypeRow({
  stats,
  index,
}: {
  stats: InterventionTypeStats;
  index: number;
}) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const barColor = TYPE_COLORS[stats.type];
  const labelKey = `statistics.details.${stats.type}` as const;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(100 * (index + 1)).springify()}
      style={[styles.typeRow, { marginBottom: spacing.md }]}
    >
      {/* Label and percentage */}
      <View style={styles.labelRow}>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
          {t(labelKey)}
        </Text>
        <Text style={[typography.body, { color: barColor, fontWeight: '700' }]}>
          {stats.triggered > 0 ? `${stats.successRate}%` : '-'}
        </Text>
      </View>

      {/* Bar graph */}
      <View
        style={[
          styles.barBackground,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.sm,
            height: 24,
            marginTop: spacing.xs,
          },
        ]}
      >
        {stats.triggered > 0 && (
          <View
            style={[
              styles.barFill,
              {
                backgroundColor: barColor,
                borderRadius: borderRadius.sm,
                width: `${stats.successRate}%`,
              },
            ]}
          />
        )}
      </View>

      {/* Detail text */}
      <Text
        style={[
          typography.bodySmall,
          { color: colors.textMuted, marginTop: spacing.xs },
        ]}
      >
        {stats.triggered > 0
          ? t('statistics.details.typeStats', {
              dismissed: stats.dismissed,
              triggered: stats.triggered,
            })
          : t('statistics.details.notUsed')}
      </Text>
    </Animated.View>
  );
}

export function InterventionBreakdown({ animationDelay = 0 }: InterventionBreakdownProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { getInterventionStatsByType } = useStatisticsStore();
  const statsByType = getInterventionStatsByType();

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(animationDelay).springify()}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
        },
      ]}
    >
      {/* Section title */}
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, marginBottom: spacing.lg },
        ]}
      >
        {t('statistics.details.byType')}
      </Text>

      {/* Type rows */}
      {statsByType.map((stats, index) => (
        <InterventionTypeRow key={stats.type} stats={stats} index={index} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  typeRow: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barBackground: {
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
