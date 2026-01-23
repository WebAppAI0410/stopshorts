import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { t } from '../../i18n';
import type { TimeOfDayBreakdown as TimeOfDayBreakdownType } from '../../types/statistics';

const TIME_PERIODS = ['morning', 'daytime', 'evening', 'night'] as const;

interface HistogramRowProps {
  label: string;
  data: TimeOfDayBreakdownType;
  color: string;
  maxValue: number;
}

function HistogramRow({ label, data, color, maxValue }: HistogramRowProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={styles.rowContainer}>
      <Text
        style={[
          typography.caption,
          { color: colors.textSecondary, width: 70, marginRight: spacing.sm },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={styles.barsContainer}>
        {TIME_PERIODS.map((period) => {
          const value = data[period];
          const barHeight = maxValue > 0 ? (value / maxValue) * 40 : 0;

          return (
            <View key={period} style={styles.barColumn}>
              <View
                style={[
                  styles.barWrapper,
                  { backgroundColor: colors.border, borderRadius: borderRadius.xs },
                ]}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2),
                      backgroundColor: color,
                      borderRadius: borderRadius.xs,
                    },
                  ]}
                />
              </View>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function TimeOfDayBreakdown() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { getTimeOfDayPatterns } = useStatisticsStore();

  const patterns = getTimeOfDayPatterns();

  // Calculate max values for scaling
  const maxIntervention = Math.max(
    patterns.intervention.morning,
    patterns.intervention.daytime,
    patterns.intervention.evening,
    patterns.intervention.night,
    1
  );
  const maxUsage = Math.max(
    patterns.usage.morning,
    patterns.usage.daytime,
    patterns.usage.evening,
    patterns.usage.night,
    1
  );

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
        {t('statistics.details.timeOfDayBreakdown')}
      </Text>

      {/* Time period labels */}
      <View style={[styles.headerRow, { marginBottom: spacing.sm }]}>
        <View style={{ width: 70, marginRight: spacing.sm }} />
        <View style={styles.barsContainer}>
          {TIME_PERIODS.map((period) => (
            <View key={period} style={styles.barColumn}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {t(`statistics.${period}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Intervention row */}
      <HistogramRow
        label={t('statistics.details.interventionTime')}
        data={patterns.intervention}
        color={colors.warning}
        maxValue={maxIntervention}
      />

      <View style={{ height: spacing.md }} />

      {/* Usage row */}
      <HistogramRow
        label={t('statistics.details.usageTime')}
        data={patterns.usage}
        color={colors.accent}
        maxValue={maxUsage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  barColumn: {
    alignItems: 'center',
    width: 50,
  },
  barWrapper: {
    width: 24,
    height: 40,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
  },
});
