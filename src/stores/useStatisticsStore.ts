/**
 * Statistics Store for StopShorts
 * Manages urge surfing statistics, badges, and usage data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  DailyStatistics,
  WeeklyStatistics,
  LifetimeStatistics,
  Badge,
} from '../types/statistics';
import { getDateKey, getTimeOfDay } from '../types/statistics';
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
  appPackage?: string;  // Package name of the app that triggered intervention
  timestamp?: number;   // When the intervention occurred
}

// Individual intervention record for analytics
export interface InterventionRecord {
  proceeded: boolean;
  appPackage: string;
  timestamp: number;
  timeOfDay: 'morning' | 'daytime' | 'evening' | 'night';
}

interface StatisticsState {
  // Data
  dailyStats: Record<string, DailyStatistics>; // key: YYYY-MM-DD
  lifetime: LifetimeStatistics;
  interventionHistory: InterventionRecord[]; // Detailed intervention records

  // Actions
  recordUrgeSurfing: (record: UrgeSurfingRecordInput) => void;
  recordIntervention: (input: InterventionInput) => void;
  recordUsageTime: (appId: string, minutes: number) => void;
  recordTrainingSession: (minutes: number) => void;
  updateStreak: () => void;

  // Getters
  getTodayStats: () => DailyStatistics;
  getWeeklyStats: () => WeeklyStatistics;
  getStreak: () => number;
  getNewBadges: () => Badge[];
  getEarnedBadges: () => Badge[];
  getTotalSavedMinutes: () => number;

  // Utilities
  resetDailyStats: () => void;
  resetAllStats: () => void;
}

// Create empty daily stats
function createEmptyDailyStats(date: string): DailyStatistics {
  return {
    date,
    totalUsageMinutes: 0,
    appBreakdown: {
      tiktok: 0,
      youtubeShorts: 0,
      instagramReels: 0,
    },
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

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set, get) => ({
      dailyStats: {},
      lifetime: createEmptyLifetime(),
      interventionHistory: [],

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
        const { proceeded, appPackage = '', timestamp = Date.now() } = input;
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        // Get time of day for analytics
        const hour = new Date(timestamp).getHours();
        const timeOfDay = getTimeOfDay(hour);

        // Create intervention record for history
        const interventionRecord: InterventionRecord = {
          proceeded,
          appPackage,
          timestamp,
          timeOfDay,
        };

        const newInterventions = { ...todayStats.interventions };
        newInterventions.triggered += 1;

        if (proceeded) {
          newInterventions.proceeded += 1;
        } else {
          newInterventions.dismissed += 1;
        }

        // Keep last 100 intervention records to limit storage
        const newHistory = [...state.interventionHistory, interventionRecord].slice(-100);

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

      recordUsageTime: (appId, minutes) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const newBreakdown = { ...todayStats.appBreakdown };
        const appKey = appId as keyof typeof newBreakdown;
        if (appKey in newBreakdown) {
          newBreakdown[appKey] += minutes;
        }

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
              totalUsageMinutes: todayStats.totalUsageMinutes + minutes,
              appBreakdown: newBreakdown,
              timeOfDayBreakdown: newTimeBreakdown,
            },
          },
        });
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

      resetDailyStats: () => {
        set({ dailyStats: {} });
      },

      resetAllStats: () => {
        set({
          dailyStats: {},
          lifetime: createEmptyLifetime(),
        });
      },
    }),
    {
      name: 'stopshorts-statistics',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
