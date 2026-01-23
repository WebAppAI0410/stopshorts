/**
 * Statistics Store for StopShorts
 * Manages urge surfing statistics, badges, and usage data
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  DailyStatistics,
  WeeklyStatistics,
  LifetimeStatistics,
  Badge,
  TimeOfDayBreakdown,
  DayData,
  DailyComparisonResult,
  WeeklyComparisonResult,
  InterventionType,
} from '../types/statistics';
import type { IntentionLog, IntentionId } from '../types';
import { getDateKey, getTimeOfDay } from '../types/statistics';
import { useAppStore } from './useAppStore';
import { BADGE_DEFINITIONS, checkBadges, calculateStreak } from '../services/badges';

// Record type for store actions (excludes timestamp which is auto-generated)
interface UrgeSurfingRecordInput {
  intensityBefore: number;
  intensityAfter: number;
  durationSeconds: number;
  completed: boolean;
}

// Input for recording an intervention event
interface InterventionInput {
  proceeded: boolean;
  type: InterventionType;  // Type of intervention (breathing, friction, mirror, ai)
  appPackage?: string;  // Package name of the app that triggered intervention
  timestamp?: number;   // When the intervention occurred
  // For breathing interventions
  intensityBefore?: number;
  intensityAfter?: number;
  // For friction interventions
  intention?: IntentionId;
}

// Individual intervention record for analytics
export interface InterventionRecord {
  proceeded: boolean;
  type: InterventionType;
  appPackage: string;
  timestamp: number;
  timeOfDay: 'morning' | 'daytime' | 'evening' | 'night';
  // For breathing interventions
  intensityBefore?: number;
  intensityAfter?: number;
  // For friction interventions
  intention?: IntentionId;
}

interface StatisticsState {
  // Data
  dailyStats: Record<string, DailyStatistics>; // key: YYYY-MM-DD
  lifetime: LifetimeStatistics;
  interventionHistory: InterventionRecord[]; // Detailed intervention records
  intentionHistory: IntentionLog[]; // Friction intervention intention logs

  // Habit Score (replacement for streak - gradual increase/decrease)
  habitScore: number; // 0-100
  habitScoreLastUpdatedDate: string | null; // YYYY-MM-DD (prevents duplicate daily evaluation)
  habitScoreHistory: Array<{ date: string; score: number }>; // Daily score history for weekly change calculation

  // Actions
  recordUrgeSurfing: (record: UrgeSurfingRecordInput) => void;
  recordIntervention: (input: InterventionInput) => void;
  recordIntention: (intentionId: IntentionId, proceeded: boolean, customText?: string, appPackage?: string) => void;
  recordUsageTime: (appId: string, minutes: number) => void;
  setDailyUsageBreakdown: (dateKey: string, breakdown: Record<string, number>) => void; // For historical data sync
  recordTrainingSession: (minutes: number) => void;
  updateStreak: () => void;
  updateHabitScore: (dailyGoalMinutes: number, selectedPackages?: string[]) => void;

  // Getters
  getTodayStats: () => DailyStatistics;
  getWeeklyStats: () => WeeklyStatistics;
  getStreak: () => number;
  getNewBadges: () => Badge[];
  getEarnedBadges: () => Badge[];
  getTotalSavedMinutes: () => number;
  getHabitScore: () => number;
  getRecentInterventionCount: (windowMs?: number) => number;
  isHighFrequencyAttempts: (windowMs?: number, threshold?: number) => boolean;
  getMonthlyAchievementStats: (dailyGoalMinutes: number, selectedPackages?: string[]) => {
    achievedDays: number;
    totalDaysWithData: number;
    achievementRate: number;
  };
  getReductionRate: (baselineMonthlyMinutes: number | null, selectedPackages?: string[]) => number | null;
  getWeeklyTrend: (selectedPackages?: string[]) => number[]; // Last 4 weeks usage in minutes

  // New data layer methods for statistics UI
  getDailyComparison: () => DailyComparisonResult;
  getWeeklyComparison: () => WeeklyComparisonResult;
  getBaselineDailyMinutes: () => number | null;
  getPreviousWeekData: () => DayData[];

  // Statistics v2 methods
  getHabitScoreHistory: () => Array<{ date: string; score: number }>;
  getHabitScoreWeeklyChange: () => number;
  getOverallInterventionSuccessRate: () => {
    triggered: number;
    dismissed: number;
    proceeded: number;
    successRate: number;
  };
  getInterventionStatsByType: () => {
    breathing: { triggered: number; dismissed: number; successRate: number };
    friction: { triggered: number; dismissed: number; successRate: number };
    mirror: { triggered: number; dismissed: number; successRate: number };
    ai: { triggered: number; dismissed: number; successRate: number };
  };
  getIntentionPatternStats: () => Record<string, { count: number; percentage: number }>;
  getTimeOfDayPatterns: () => {
    intervention: TimeOfDayBreakdown;
    usage: TimeOfDayBreakdown;
  };

  // Utilities
  resetDailyStats: () => void;
  resetAllStats: () => void;
}

// Create empty daily stats
function createEmptyDailyStats(date: string): DailyStatistics {
  return {
    date,
    hasData: false, // No data recorded yet
    totalUsageMinutes: 0,
    appBreakdown: {},
    urgeSurfing: {
      completed: 0,
      skipped: 0,
      totalDurationSeconds: 0,
      averageIntensityBefore: 0,
      averageIntensityAfter: 0,
    },
    interventions: {
      triggered: 0,
      dismissed: 0,
      proceeded: 0,
    },
    training: {
      sessionsCompleted: 0,
      totalMinutes: 0,
    },
    timeOfDayBreakdown: {
      morning: 0,
      daytime: 0,
      evening: 0,
      night: 0,
    },
  };
}

function sumBreakdown(
  breakdown: Record<string, number>,
  selectedPackages?: string[]
): number {
  if (!selectedPackages || selectedPackages.length === 0) {
    return Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  }
  let total = 0;
  for (const pkg of selectedPackages) {
    total += breakdown[pkg] || 0;
  }
  return total;
}

// Create empty lifetime stats
function createEmptyLifetime(): LifetimeStatistics {
  return {
    startDate: new Date().toISOString(),
    totalSavedHours: 0,
    totalUrgeSurfingCompleted: 0,
    totalInterventions: 0,
    currentStreak: 0,
    longestStreak: 0,
    badges: BADGE_DEFINITIONS.map((def) => ({
      ...def,
      earnedAt: null,
    })),
  };
}

// Estimated minutes saved per completed urge surfing session
const MINUTES_SAVED_PER_SURF = 5;

// Helper to get yesterday's date key
function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
}

// Helper to check if a date is in current month
function isCurrentMonth(dateKey: string): boolean {
  const now = new Date();
  const [year, month] = dateKey.split('-').map(Number);
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

// Helper to get Monday-based week start
function getMondayWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const useStatisticsStore = create<StatisticsState>()(
  devtools(
    persist(
      (set, get) => ({
      dailyStats: {},
      lifetime: createEmptyLifetime(),
      interventionHistory: [],
      intentionHistory: [],
      habitScore: 50, // Start at 50 (middle)
      habitScoreLastUpdatedDate: null,
      habitScoreHistory: [],

      recordUrgeSurfing: (record) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const newUrgeSurfing = { ...todayStats.urgeSurfing };

        if (record.completed) {
          newUrgeSurfing.completed += 1;
          newUrgeSurfing.totalDurationSeconds += record.durationSeconds;

          // Recalculate average intensities
          const totalCompleted = newUrgeSurfing.completed;
          newUrgeSurfing.averageIntensityBefore =
            (newUrgeSurfing.averageIntensityBefore * (totalCompleted - 1) +
              record.intensityBefore) /
            totalCompleted;
          newUrgeSurfing.averageIntensityAfter =
            (newUrgeSurfing.averageIntensityAfter * (totalCompleted - 1) +
              record.intensityAfter) /
            totalCompleted;
        } else {
          newUrgeSurfing.skipped += 1;
        }

        const newLifetime = { ...state.lifetime };
        if (record.completed) {
          newLifetime.totalUrgeSurfingCompleted += 1;
          newLifetime.totalSavedHours += MINUTES_SAVED_PER_SURF / 60;
        }

        // Update streak
        const newDailyStats = {
          ...state.dailyStats,
          [dateKey]: { ...todayStats, urgeSurfing: newUrgeSurfing },
        };

        const newStreak = calculateStreak(newDailyStats);
        newLifetime.currentStreak = newStreak;
        if (newStreak > newLifetime.longestStreak) {
          newLifetime.longestStreak = newStreak;
        }

        // Check badges
        const updatedBadges = checkBadges(newLifetime, newDailyStats);

        set({
          dailyStats: newDailyStats,
          lifetime: {
            ...newLifetime,
            badges: updatedBadges,
          },
        });
      },

      recordIntervention: (input) => {
        const {
          proceeded,
          type,
          appPackage = '',
          timestamp = Date.now(),
          intensityBefore,
          intensityAfter,
          intention,
        } = input;
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        // Get time of day for analytics
        const hour = new Date(timestamp).getHours();
        const timeOfDay = getTimeOfDay(hour);

        // Create intervention record for history
        const interventionRecord: InterventionRecord = {
          proceeded,
          type,
          appPackage,
          timestamp,
          timeOfDay,
          ...(intensityBefore !== undefined && { intensityBefore }),
          ...(intensityAfter !== undefined && { intensityAfter }),
          ...(intention !== undefined && { intention }),
        };

        const newInterventions = { ...todayStats.interventions };
        newInterventions.triggered += 1;

        if (proceeded) {
          newInterventions.proceeded += 1;
        } else {
          newInterventions.dismissed += 1;
        }

        // Keep last 200 intervention records to limit storage (increased for v2 analytics)
        const newHistory = [...state.interventionHistory, interventionRecord].slice(-200);

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              interventions: newInterventions,
            },
          },
          lifetime: {
            ...state.lifetime,
            totalInterventions: state.lifetime.totalInterventions + 1,
          },
          interventionHistory: newHistory,
        });
      },

      recordIntention: (intentionId, proceeded, customText, appPackage) => {
        const state = get();
        const now = new Date();
        const log: IntentionLog = {
          id: `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
          intentionId,
          customText,
          timestamp: now.toISOString(),
          proceeded,
          appPackage,
        };

        // Keep last 100 intention logs to limit storage
        const newIntentionHistory = [...state.intentionHistory, log].slice(-100);
        set({ intentionHistory: newIntentionHistory });
      },

      recordUsageTime: (appId, minutes) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const newBreakdown = { ...todayStats.appBreakdown };
        newBreakdown[appId] = (newBreakdown[appId] || 0) + minutes;

        // Determine time of day
        const hour = new Date().getHours();
        const timeOfDay = getTimeOfDay(hour);
        const newTimeBreakdown = { ...todayStats.timeOfDayBreakdown };
        newTimeBreakdown[timeOfDay] += minutes;

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              hasData: true, // Mark that we have data for this day
              totalUsageMinutes: todayStats.totalUsageMinutes + minutes,
              appBreakdown: newBreakdown,
              timeOfDayBreakdown: newTimeBreakdown,
            },
          },
        });
      },

      setDailyUsageBreakdown: (dateKey, breakdown) => {
        const state = get();
        const existingStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const mergedBreakdown: Record<string, number> = {
          ...existingStats.appBreakdown,
          ...breakdown,
        };
        const totalMinutes = sumBreakdown(mergedBreakdown);

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...existingStats,
              hasData: true,
              totalUsageMinutes: totalMinutes,
              appBreakdown: mergedBreakdown,
            },
          },
        });
        if (__DEV__) {
          console.log(`[StatisticsStore] Recorded ${totalMinutes} minutes for ${dateKey}`);
        }
      },

      recordTrainingSession: (minutes) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              training: {
                sessionsCompleted: todayStats.training.sessionsCompleted + 1,
                totalMinutes: todayStats.training.totalMinutes + minutes,
              },
            },
          },
        });
      },

      updateStreak: () => {
        const state = get();
        const newStreak = calculateStreak(state.dailyStats);
        const newLifetime = { ...state.lifetime };

        newLifetime.currentStreak = newStreak;
        if (newStreak > newLifetime.longestStreak) {
          newLifetime.longestStreak = newStreak;
        }

        // Check badges after streak update
        const updatedBadges = checkBadges(newLifetime, state.dailyStats);

        set({
          lifetime: {
            ...newLifetime,
            badges: updatedBadges,
          },
        });
      },

      updateHabitScore: (dailyGoalMinutes, selectedPackages) => {
        const state = get();
        const today = getDateKey();

        // Date guard: only evaluate once per day
        if (state.habitScoreLastUpdatedDate === today) {
          return;
        }

        const yesterdayKey = getYesterdayKey();
        const yesterdayStats = state.dailyStats[yesterdayKey];

        // If no data recorded for yesterday, don't update score
        // (Use hasData flag to distinguish "no data" from "0 minutes used")
        if (!yesterdayStats || !yesterdayStats.hasData) {
          // Still mark as evaluated to prevent re-checking
          set({ habitScoreLastUpdatedDate: today });
          return;
        }

        const yesterdayTotal = sumBreakdown(
          yesterdayStats.appBreakdown,
          selectedPackages
        );

        // 0 minutes is a success (perfect day - no usage)
        const achieved = yesterdayTotal <= dailyGoalMinutes;
        let newScore = state.habitScore;

        if (achieved) {
          // Goal achieved: +10 points (max 100)
          newScore = Math.min(100, newScore + 10);
        } else {
          // Goal not achieved: -3 points (min 0)
          newScore = Math.max(0, newScore - 3);
        }

        // Record score in history (keep last 30 days)
        const newHistory = [
          ...state.habitScoreHistory,
          { date: today, score: newScore },
        ].slice(-30);

        set({
          habitScore: newScore,
          habitScoreLastUpdatedDate: today,
          habitScoreHistory: newHistory,
        });
      },

      getTodayStats: () => {
        const dateKey = getDateKey();
        return get().dailyStats[dateKey] || createEmptyDailyStats(dateKey);
      },

      getWeeklyStats: () => {
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

      getStreak: () => {
        return get().lifetime.currentStreak;
      },

      getNewBadges: () => {
        const badges = get().lifetime.badges;
        // Badges earned within last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        return badges.filter((b) => b.earnedAt && b.earnedAt > oneDayAgo);
      },

      getEarnedBadges: () => {
        return get().lifetime.badges.filter((b) => b.earnedAt !== null);
      },

      getTotalSavedMinutes: () => {
        return get().lifetime.totalSavedHours * 60;
      },

      getHabitScore: () => {
        return get().habitScore;
      },

      getRecentInterventionCount: (windowMs = 60 * 60 * 1000) => {
        const state = get();
        const now = Date.now();
        const windowStart = now - windowMs;

        return state.interventionHistory.filter(
          (record) => record.timestamp > windowStart
        ).length;
      },

      isHighFrequencyAttempts: (windowMs = 60 * 60 * 1000, threshold = 3) => {
        const count = get().getRecentInterventionCount(windowMs);
        return count >= threshold;
      },

      getMonthlyAchievementStats: (dailyGoalMinutes, selectedPackages) => {
        const state = get();
        // Use hasData flag to include days with 0 minutes (which is a perfect achievement!)
        const daysWithData = Object.entries(state.dailyStats)
          .filter(([dateKey, stats]) =>
            isCurrentMonth(dateKey) && stats.hasData
          );

        if (daysWithData.length === 0) {
          return { achievedDays: 0, totalDaysWithData: 0, achievementRate: 0 };
        }

        // 0 minutes is a perfect achievement!
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

      getReductionRate: (baselineMonthlyMinutes, selectedPackages) => {
        if (!baselineMonthlyMinutes || baselineMonthlyMinutes <= 0) {
          return null;
        }

        const state = get();
        // Calculate current month's total usage
        const currentMonthUsage = Object.entries(state.dailyStats)
          .filter(([dateKey, stats]) => isCurrentMonth(dateKey) && stats.hasData)
          .reduce((sum, [_, stats]) => {
            return sum + sumBreakdown(stats.appBreakdown, selectedPackages);
          }, 0);

        const reductionRate =
          ((baselineMonthlyMinutes - currentMonthUsage) / baselineMonthlyMinutes) * 100;
        return Math.round(reductionRate * 10) / 10; // Round to 1 decimal
      },

      getWeeklyTrend: (selectedPackages) => {
        const state = get();
        const weeklyTotals: number[] = [];

        // Get last 4 weeks (Monday start)
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
        const yesterdayStats = state.dailyStats[yesterdayKey] || createEmptyDailyStats(yesterdayKey);

        const todayTotal = todayStats.totalUsageMinutes;
        const yesterdayTotal = yesterdayStats.totalUsageMinutes;

        // Calculate change percent (positive = increase, negative = decrease)
        const changePercent = yesterdayTotal > 0
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
          changePercent: Math.round(changePercent * 10) / 10, // Round to 1 decimal
        };
      },

      getWeeklyComparison: (): WeeklyComparisonResult => {
        const state = get();
        const today = new Date();

        // Get current week data (Monday start)
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

        // Get previous week data
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

        // Calculate change percent
        const changePercent = prevWeekTotal > 0
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
        return Math.round((baselineMonthlyMinutes / 30) * 10) / 10; // Round to 1 decimal
      },

      getPreviousWeekData: (): DayData[] => {
        const state = get();
        const today = new Date();
        const result: DayData[] = [];

        // Get data from 7-14 days ago (previous week)
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

      // Statistics v2 getters
      getHabitScoreHistory: () => {
        return get().habitScoreHistory;
      },

      getHabitScoreWeeklyChange: () => {
        const state = get();
        const history = state.habitScoreHistory;

        if (history.length < 2) {
          return 0;
        }

        // Get score from 7 days ago (or oldest available)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoKey = getDateKey(weekAgo);

        // Find score closest to a week ago
        const weekAgoEntry = history.find((h) => h.date <= weekAgoKey);
        const latestEntry = history[history.length - 1];

        if (!weekAgoEntry) {
          // Use oldest entry if no week-old data
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
        const result: Record<InterventionType, { triggered: number; dismissed: number; successRate: number }> = {
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

        // Calculate success rates
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

        // Count by intention ID
        const counts: Record<string, number> = {};
        for (const log of history) {
          const id = log.intentionId;
          counts[id] = (counts[id] || 0) + 1;
        }

        // Convert to percentage
        const result: Record<string, { count: number; percentage: number }> = {};
        for (const [id, count] of Object.entries(counts)) {
          result[id] = {
            count,
            percentage: Math.round((count / total) * 1000) / 10, // Round to 1 decimal
          };
        }

        return result;
      },

      getTimeOfDayPatterns: () => {
        const state = get();

        // Intervention time of day
        const interventionBreakdown: TimeOfDayBreakdown = {
          morning: 0,
          daytime: 0,
          evening: 0,
          night: 0,
        };

        for (const record of state.interventionHistory) {
          interventionBreakdown[record.timeOfDay] += 1;
        }

        // Usage time of day (aggregate from daily stats)
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

      resetDailyStats: () => {
        set({ dailyStats: {} });
      },

      resetAllStats: () => {
        set({
          dailyStats: {},
          lifetime: createEmptyLifetime(),
          habitScore: 50,
          habitScoreLastUpdatedDate: null,
          habitScoreHistory: [],
          interventionHistory: [],
          intentionHistory: [],
        });
      },
      }),
      {
        name: 'stopshorts-statistics',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'StatisticsStore', enabled: __DEV__ }
  )
);
