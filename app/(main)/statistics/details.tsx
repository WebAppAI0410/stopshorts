import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useStatisticsStore } from '../../../src/stores/useStatisticsStore';
import {
  IntentionPatternChart,
  TimeOfDayBreakdown,
} from '../../../src/components/statistics';
import { t } from '../../../src/i18n';

// Placeholder for CircularGauge (Task 2) - replace with actual import when available
// import { CircularGauge } from '../../../src/components/statistics';
function CircularGaugePlaceholder({ score, size }: { score: number; size: number }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accentMuted,
        borderWidth: 8,
        borderColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={[typography.hero, { color: colors.accent }]}>{score}</Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>
        Habit Score
      </Text>
    </View>
  );
}

// Placeholder for InterventionBreakdown (Task 3) - replace with actual import when available
// import { InterventionBreakdown } from '../../../src/components/statistics';
function InterventionBreakdownPlaceholder() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { getTodayStats } = useStatisticsStore();
  const todayStats = getTodayStats();

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
      <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        {t('statistics.interventions')}
      </Text>
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={[typography.statLarge, { color: colors.accent }]}>
            {todayStats.interventions.dismissed}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Dismissed
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={[typography.statLarge, { color: colors.warning }]}>
            {todayStats.interventions.proceeded}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Proceeded
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function StatisticsDetailsScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const {
    getHabitScore,
    getWeeklyComparison,
    getIntentionPatternStats,
  } = useStatisticsStore();

  const habitScore = getHabitScore();
  const weeklyComparison = getWeeklyComparison();
  const intentionStats = getIntentionPatternStats();

  // Calculate week change for habit score display
  const weekChange = useMemo(() => {
    // This is a simplified calculation - in a real implementation,
    // you would track habit score history
    const change = weeklyComparison.changePercent;
    const sign = change >= 0 ? '+' : '';
    const points = Math.abs(Math.round(change / 10)); // Convert percent to points (simplified)
    return { sign, points };
  }, [weeklyComparison.changePercent]);

  const hasIntentionData = Object.keys(intentionStats).length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.lg,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>
            {t('statistics.details.title')}
          </Text>
        </Animated.View>

        {/* Large Circular Gauge (200dp) */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={[styles.gaugeContainer, { marginBottom: spacing.xl }]}
        >
          {/* TODO: Replace with CircularGauge from Task 2 */}
          <CircularGaugePlaceholder score={habitScore} size={200} />
        </Animated.View>

        {/* Week Change */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(150)}
          style={[styles.weekChangeContainer, { marginBottom: spacing.xl }]}
        >
          <View
            style={[
              styles.weekChangeBadge,
              {
                backgroundColor: colors.accentMuted,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text style={[typography.body, { color: colors.accent }]}>
              {t('statistics.details.thisWeekChange', {
                sign: weekChange.sign,
                points: weekChange.points,
              })}
            </Text>
          </View>
        </Animated.View>

        {/* Intervention Breakdown (Task 3) */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={{ marginBottom: spacing.xl }}
        >
          {/* TODO: Replace with InterventionBreakdown from Task 3 */}
          <InterventionBreakdownPlaceholder />
        </Animated.View>

        {/* Intention Pattern Chart (only show if data exists) */}
        {hasIntentionData && (
          <Animated.View
            entering={FadeInDown.duration(600).delay(250)}
            style={{ marginBottom: spacing.xl }}
          >
            <IntentionPatternChart />
          </Animated.View>
        )}

        {/* Time of Day Breakdown */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={{ marginBottom: spacing.xl }}
        >
          <TimeOfDayBreakdown />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  weekChangeContainer: {
    alignItems: 'center',
  },
  weekChangeBadge: {
    alignItems: 'center',
  },
  card: {},
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
});
