/**
 * Computed Slice for Statistics Store
 * Handles derived data calculations and getters
 */

import type {
  DailyStatistics,
  WeeklyStatistics,
  Badge,
  TimeOfDayBreakdown,
  DayData,
  DailyComparisonResult,
  WeeklyComparisonResult,
  InterventionType,
} from '../../types/statistics';
import { getDateKey } from '../../types/statistics';
import { useAppStore } from '../useAppStore';
import type { ComputedGetters, StatisticsState } from './types';
import {
  createEmptyDailyStats,
  getYesterdayKey,
  isCurrentMonth,
  getMondayWeekStart,
  sumBreakdown,
  MINUTES_SAVED_PER_SURF,
} from './helpers';

/**
 * Create computed getters slice
 */
export function createComputedSlice(
  _set: (partial: Partial<StatisticsState>) => void,
  get: () => StatisticsState
): ComputedGetters {
  return {
    getTodayStats: (): DailyStatistics => {
      const dateKey = getDateKey();
      return get().dailyStats[dateKey] || createEmptyDailyStats(dateKey);
    },

    getWeeklyStats: (): WeeklyStatistics => {
      const state = get();
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const dailyStatsArray: DailyStatistics[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateKey = getDateKey(date);
        dailyStatsArray.push(
          state.dailyStats[dateKey] || createEmptyDailyStats(dateKey)
        );
      }

      const totalUsage = dailyStatsArray.reduce(
        (sum, d) => sum + d.totalUsageMinutes,
        0
      );
      const totalSurfing = dailyStatsArray.reduce(
        (sum, d) => sum + d.urgeSurfing.completed,
        0
      );
      const totalSkipped = dailyStatsArray.reduce(
        (sum, d) => sum + d.urgeSurfing.skipped,
        0
      );

      // Calculate previous week stats for comparison
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      let prevWeekUsage = 0;
      let prevWeekSurfing = 0;
      let prevWeekSkipped = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(prevWeekStart);
        date.setDate(prevWeekStart.getDate() + i);
        const dateKey = getDateKey(date);
        const stats = state.dailyStats[dateKey];
        if (stats) {
          prevWeekUsage += stats.totalUsageMinutes;
          prevWeekSurfing += stats.urgeSurfing.completed;
          prevWeekSkipped += stats.urgeSurfing.skipped;
        }
      }

      const currentSuccessRate =
        totalSurfing + totalSkipped > 0
          ? totalSurfing / (totalSurfing + totalSkipped)
          : 0;
      const prevSuccessRate =
        prevWeekSurfing + prevWeekSkipped > 0
          ? prevWeekSurfing / (prevWeekSurfing + prevWeekSkipped)
          : 0;

      return {
        weekStart: getDateKey(weekStart),
        weekEnd: getDateKey(today),
        dailyStats: dailyStatsArray,
        averageDailyUsage: totalUsage / 7,
        totalUrgeSurfing: totalSurfing,
        successRate: currentSuccessRate,
        savedMinutes: totalSurfing * MINUTES_SAVED_PER_SURF,
        comparedToPreviousWeek: {
          usageChange:
            prevWeekUsage > 0
              ? ((totalUsage - prevWeekUsage) / prevWeekUsage) * 100
              : 0,
          successRateChange:
            prevSuccessRate > 0
              ? ((currentSuccessRate - prevSuccessRate) / prevSuccessRate) * 100
              : 0,
        },
      };
    },

    getStreak: (): number => {
      return get().lifetime.currentStreak;
    },

    getNewBadges: (): Badge[] => {
      const badges = get().lifetime.badges;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      return badges.filter((b) => b.earnedAt && b.earnedAt > oneDayAgo);
    },

    getEarnedBadges: (): Badge[] => {
      return get().lifetime.badges.filter((b) => b.earnedAt !== null);
    },

    getTotalSavedMinutes: (): number => {
      return get().lifetime.totalSavedHours * 60;
    },

    getHabitScore: (): number => {
      return get().habitScore;
    },

    getRecentInterventionCount: (windowMs = 60 * 60 * 1000): number => {
      const state = get();
      const now = Date.now();
      const windowStart = now - windowMs;

      return state.interventionHistory.filter(
        (record) => record.timestamp > windowStart
      ).length;
    },

    isHighFrequencyAttempts: (windowMs = 60 * 60 * 1000, threshold = 3): boolean => {
      const count = get().getRecentInterventionCount(windowMs);
      return count >= threshold;
    },

    getMonthlyAchievementStats: (
      dailyGoalMinutes: number,
      selectedPackages?: string[]
    ) => {
      const state = get();
      const daysWithData = Object.entries(state.dailyStats).filter(
        ([dateKey, stats]) => isCurrentMonth(dateKey) && stats.hasData
      );

      if (daysWithData.length === 0) {
        return { achievedDays: 0, totalDaysWithData: 0, achievementRate: 0 };
      }

      const achievedDays = daysWithData.filter(([_, stats]) => {
        const total = sumBreakdown(stats.appBreakdown, selectedPackages);
        return total <= dailyGoalMinutes;
      }).length;

      return {
        achievedDays,
        totalDaysWithData: daysWithData.length,
        achievementRate: (achievedDays / daysWithData.length) * 100,
      };
    },

    getReductionRate: (
      baselineMonthlyMinutes: number | null,
      selectedPackages?: string[]
    ): number | null => {
      if (!baselineMonthlyMinutes || baselineMonthlyMinutes <= 0) {
        return null;
      }

      const state = get();
      const currentMonthUsage = Object.entries(state.dailyStats)
        .filter(([dateKey, stats]) => isCurrentMonth(dateKey) && stats.hasData)
        .reduce((sum, [_, stats]) => {
          return sum + sumBreakdown(stats.appBreakdown, selectedPackages);
        }, 0);

      const reductionRate =
        ((baselineMonthlyMinutes - currentMonthUsage) / baselineMonthlyMinutes) * 100;
      return Math.round(reductionRate * 10) / 10;
    },

    getWeeklyTrend: (selectedPackages?: string[]): number[] => {
      const state = get();
      const weeklyTotals: number[] = [];

      for (let weekOffset = 3; weekOffset >= 0; weekOffset--) {
        const weekStart = getMondayWeekStart(new Date());
        weekStart.setDate(weekStart.getDate() - weekOffset * 7);

        let weekTotal = 0;
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + dayOffset);
          const dateKey = getDateKey(date);
          const stats = state.dailyStats[dateKey];
          if (stats && stats.hasData) {
            weekTotal += sumBreakdown(stats.appBreakdown, selectedPackages);
          }
        }
        weeklyTotals.push(weekTotal);
      }

      return weeklyTotals;
    },

    getDailyComparison: (): DailyComparisonResult => {
      const state = get();
      const todayKey = getDateKey();
      const yesterdayKey = getYesterdayKey();

      const todayStats = state.dailyStats[todayKey] || createEmptyDailyStats(todayKey);
      const yesterdayStats =
        state.dailyStats[yesterdayKey] || createEmptyDailyStats(yesterdayKey);

      const todayTotal = todayStats.totalUsageMinutes;
      const yesterdayTotal = yesterdayStats.totalUsageMinutes;

      const changePercent =
        yesterdayTotal > 0
          ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
          : 0;

      return {
        today: {
          total: todayTotal,
          byTimeOfDay: { ...todayStats.timeOfDayBreakdown },
        },
        yesterday: {
          total: yesterdayTotal,
          byTimeOfDay: { ...yesterdayStats.timeOfDayBreakdown },
        },
        changePercent: Math.round(changePercent * 10) / 10,
      };
    },

    getWeeklyComparison: (): WeeklyComparisonResult => {
      const state = get();
      const today = new Date();

      const currentWeekStart = getMondayWeekStart(today);
      const currentWeekData: DayData[] = [];
      let currentWeekTotal = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        const dateKey = getDateKey(date);
        const stats = state.dailyStats[dateKey];
        const minutes = stats?.totalUsageMinutes || 0;
        currentWeekTotal += minutes;
        currentWeekData.push({ date: dateKey, minutes });
      }

      const prevWeekStart = new Date(currentWeekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevWeekData: DayData[] = [];
      let prevWeekTotal = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(prevWeekStart);
        date.setDate(prevWeekStart.getDate() + i);
        const dateKey = getDateKey(date);
        const stats = state.dailyStats[dateKey];
        const minutes = stats?.totalUsageMinutes || 0;
        prevWeekTotal += minutes;
        prevWeekData.push({ date: dateKey, minutes });
      }

      const changePercent =
        prevWeekTotal > 0
          ? ((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100
          : 0;

      return {
        currentWeek: {
          total: currentWeekTotal,
          dailyAvg: Math.round((currentWeekTotal / 7) * 10) / 10,
          data: currentWeekData,
        },
        previousWeek: {
          total: prevWeekTotal,
          dailyAvg: Math.round((prevWeekTotal / 7) * 10) / 10,
          data: prevWeekData,
        },
        changePercent: Math.round(changePercent * 10) / 10,
      };
    },

    getBaselineDailyMinutes: (): number | null => {
      const baselineMonthlyMinutes = useAppStore.getState().baselineMonthlyMinutes;
      if (baselineMonthlyMinutes === null || baselineMonthlyMinutes <= 0) {
        return null;
      }
      return Math.round((baselineMonthlyMinutes / 30) * 10) / 10;
    },

    getPreviousWeekData: (): DayData[] => {
      const state = get();
      const today = new Date();
      const result: DayData[] = [];

      for (let i = 14; i > 7; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = getDateKey(date);
        const stats = state.dailyStats[dateKey];
        const minutes = stats?.totalUsageMinutes || 0;
        result.push({ date: dateKey, minutes });
      }

      return result;
    },

    getHabitScoreHistory: () => {
      return get().habitScoreHistory;
    },

    getHabitScoreWeeklyChange: (): number => {
      const state = get();
      const history = state.habitScoreHistory;

      if (history.length < 2) {
        return 0;
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoKey = getDateKey(weekAgo);

      const weekAgoEntry = history.find((h) => h.date <= weekAgoKey);
      const latestEntry = history[history.length - 1];

      if (!weekAgoEntry) {
        const oldestEntry = history[0];
        return latestEntry.score - oldestEntry.score;
      }

      return latestEntry.score - weekAgoEntry.score;
    },

    getOverallInterventionSuccessRate: () => {
      const state = get();
      const history = state.interventionHistory;

      const triggered = history.length;
      const proceeded = history.filter((r) => r.proceeded).length;
      const dismissed = history.filter((r) => !r.proceeded).length;

      return {
        triggered,
        dismissed,
        proceeded,
        successRate: triggered > 0 ? dismissed / triggered : 0,
      };
    },

    getInterventionStatsByType: () => {
      const state = get();
      const history = state.interventionHistory;

      const types: InterventionType[] = ['breathing', 'friction', 'mirror', 'ai'];
      const result: Record<
        InterventionType,
        { triggered: number; dismissed: number; successRate: number }
      > = {
        breathing: { triggered: 0, dismissed: 0, successRate: 0 },
        friction: { triggered: 0, dismissed: 0, successRate: 0 },
        mirror: { triggered: 0, dismissed: 0, successRate: 0 },
        ai: { triggered: 0, dismissed: 0, successRate: 0 },
      };

      for (const record of history) {
        if (record.type && types.includes(record.type)) {
          result[record.type].triggered += 1;
          if (!record.proceeded) {
            result[record.type].dismissed += 1;
          }
        }
      }

      for (const type of types) {
        if (result[type].triggered > 0) {
          result[type].successRate = result[type].dismissed / result[type].triggered;
        }
      }

      return result;
    },

    getIntentionPatternStats: () => {
      const state = get();
      const history = state.intentionHistory;
      const total = history.length;

      if (total === 0) {
        return {};
      }

      const counts: Record<string, number> = {};
      for (const log of history) {
        const id = log.intentionId;
        counts[id] = (counts[id] || 0) + 1;
      }

      const result: Record<string, { count: number; percentage: number }> = {};
      for (const [id, count] of Object.entries(counts)) {
        result[id] = {
          count,
          percentage: Math.round((count / total) * 1000) / 10,
        };
      }

      return result;
    },

    getTimeOfDayPatterns: () => {
      const state = get();

      const interventionBreakdown: TimeOfDayBreakdown = {
        morning: 0,
        daytime: 0,
        evening: 0,
        night: 0,
      };

      for (const record of state.interventionHistory) {
        interventionBreakdown[record.timeOfDay] += 1;
      }

      const usageBreakdown: TimeOfDayBreakdown = {
        morning: 0,
        daytime: 0,
        evening: 0,
        night: 0,
      };

      for (const stats of Object.values(state.dailyStats)) {
        usageBreakdown.morning += stats.timeOfDayBreakdown.morning;
        usageBreakdown.daytime += stats.timeOfDayBreakdown.daytime;
        usageBreakdown.evening += stats.timeOfDayBreakdown.evening;
        usageBreakdown.night += stats.timeOfDayBreakdown.night;
      }

      return {
        intervention: interventionBreakdown,
        usage: usageBreakdown,
      };
    },
  };
}
