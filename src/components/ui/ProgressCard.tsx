/**
 * ProgressCard Component
 * Displays progress metrics: reduction rate, achievement stats, and habit score
 * Replaces the old StreakIndicator
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../stores/useAppStore';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { getSelectedPackages } from '../../native/ScreenTimeModule';

interface ProgressCardProps {
  onPress?: () => void;
}

// Badge based on achievement rate
function getAchievementBadge(rate: number): { icon: string; label: string } {
  if (rate >= 90) return { icon: '🥇', label: 'ゴールド' };
  if (rate >= 70) return { icon: '🥈', label: 'シルバー' };
  if (rate >= 50) return { icon: '🥉', label: 'ブロンズ' };
  return { icon: '🌱', label: '成長中' };
}

// Level based on habit score
function getHabitLevel(score: number): { icon: string; label: string } {
  if (score >= 80) return { icon: '🏆', label: '上級サーファー' };
  if (score >= 50) return { icon: '🏄', label: '中級サーファー' };
  return { icon: '🌊', label: '初級サーファー' };
}

export function ProgressCard({ onPress }: ProgressCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const baselineMonthlyMinutes = useAppStore((state) => state.baselineMonthlyMinutes);
  const dailyGoalMinutes = useAppStore((state) => state.dailyGoalMinutes);
  const selectedApps = useAppStore((state) => state.selectedApps);
  const customApps = useAppStore((state) => state.customApps);

  const getReductionRate = useStatisticsStore((state) => state.getReductionRate);
  const getMonthlyAchievementStats = useStatisticsStore((state) => state.getMonthlyAchievementStats);
  const getHabitScore = useStatisticsStore((state) => state.getHabitScore);

  // Get metrics
  const selectedPackages = [
    ...new Set([
      ...getSelectedPackages(selectedApps),
      ...customApps.filter((app) => app.isSelected !== false).map((app) => app.packageName),
    ]),
  ];

  const reductionRate = getReductionRate(baselineMonthlyMinutes, selectedPackages);
  const achievementStats = getMonthlyAchievementStats(dailyGoalMinutes, selectedPackages);
  const habitScore = getHabitScore();

  const achievementBadge = getAchievementBadge(achievementStats.achievementRate);
  const habitLevel = getHabitLevel(habitScore);

  // Format reduction rate display
  const reductionDisplay = reductionRate !== null
    ? reductionRate >= 0
      ? `${Math.round(reductionRate)}% 減少`
      : `${Math.abs(Math.round(reductionRate))}% 増加`
    : 'データ収集中';

  const isImproving = reductionRate !== null && reductionRate > 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.xl,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>📉</Text>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            今月の進捗
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      {/* Main Metric - Reduction Rate */}
      <View style={styles.mainMetric}>
        <Text
          style={[
            typography.h1,
            {
              color: isImproving ? colors.success : colors.textSecondary,
              fontSize: 32,
            },
          ]}
        >
          {reductionDisplay}
        </Text>
        {isImproving && (
          <Ionicons
            name="trending-down"
            size={24}
            color={colors.success}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>

      {/* Progress Bar */}
      {reductionRate !== null && (
        <View style={[styles.progressBarContainer, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(Math.max(reductionRate, 0), 100)}%`,
                backgroundColor: isImproving ? colors.success : colors.error,
              },
            ]}
          />
        </View>
      )}

      {/* Secondary Metrics */}
      <View style={styles.metricsRow}>
        {/* Achievement Stats */}
        <View style={[styles.metricItem, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
          <View style={styles.metricHeader}>
            <Text style={{ fontSize: 16 }}>{achievementBadge.icon}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              達成日数
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
            {achievementStats.achievedDays} / {achievementStats.totalDaysWithData} 日
          </Text>
          <Text style={[typography.caption, { color: colors.accent }]}>
            {achievementStats.totalDaysWithData > 0
              ? `${Math.round(achievementStats.achievementRate)}%`
              : '-'}
          </Text>
        </View>

        {/* Habit Score */}
        <View style={[styles.metricItem, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
          <View style={styles.metricHeader}>
            <Text style={{ fontSize: 16 }}>{habitLevel.icon}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              スコア
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
            {habitScore} / 100
          </Text>
          <Text style={[typography.caption, { color: colors.accent }]}>
            {habitLevel.label}
          </Text>
        </View>
      </View>

      {/* Hint */}
      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
          タップして詳細を見る
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
