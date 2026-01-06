import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { t } from '../../i18n';
import type { IntentionId } from '../../types';

export interface IntentionPatternChartProps {
  maxItems?: number;
}

export function IntentionPatternChart({ maxItems = 5 }: IntentionPatternChartProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { getIntentionPatternStats } = useStatisticsStore();

  const stats = getIntentionPatternStats();

  // Return null if no data
  if (stats.length === 0) {
    return null;
  }

  // Calculate max count for bar width scaling
  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  // Get label for intention ID
  const getIntentionLabel = (intentionId: IntentionId): string => {
    return t(`intervention.friction.intention.options.${intentionId}`);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
        },
      ]}
    >
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, marginBottom: spacing.md },
        ]}
      >
        {t('statistics.details.intentionPattern')}
      </Text>

      {stats.slice(0, maxItems).map((item, index) => {
        const barWidth = (item.count / maxCount) * 100;
        const proceedRate = item.count > 0 ? (item.proceeded / item.count) * 100 : 0;

        return (
          <View key={item.intentionId} style={[styles.row, { marginBottom: index < stats.length - 1 ? spacing.sm : 0 }]}>
            {/* Label */}
            <View style={styles.labelContainer}>
              <Text
                style={[typography.bodySmall, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {getIntentionLabel(item.intentionId)}
              </Text>
            </View>

            {/* Bar */}
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barBackground,
                  {
                    backgroundColor: colors.border,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${barWidth}%`,
                      backgroundColor: colors.accent,
                      borderRadius: borderRadius.xs,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Count & proceed rate */}
            <View style={styles.statsContainer}>
              <Text style={[typography.label, { color: colors.textPrimary }]}>
                {item.count}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                ({Math.round(proceedRate)}%)
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    width: 80,
    marginRight: 8,
  },
  barContainer: {
    flex: 1,
    marginRight: 8,
  },
  barBackground: {
    height: 16,
    width: '100%',
  },
  bar: {
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    width: 60,
    justifyContent: 'flex-end',
  },
});
