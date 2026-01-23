/**
 * Data Slice for Statistics Store
 * Handles data recording and state mutations
 */

import type { IntentionLog, IntentionId } from '../../types';
import { getDateKey, getTimeOfDay } from '../../types/statistics';
import { checkBadges, calculateStreak } from '../../services/badges';
import type {
  DataState,
  DataActions,
  StatisticsState,
  UrgeSurfingRecordInput,
  InterventionInput,
  InterventionRecord,
} from './types';
import {
  createEmptyDailyStats,
  createEmptyLifetime,
  getYesterdayKey,
  sumBreakdown,
  MINUTES_SAVED_PER_SURF,
} from './helpers';

/**
 * Create initial data state
 */
export function createInitialDataState(): DataState {
  return {
    dailyStats: {},
    lifetime: createEmptyLifetime(),
    interventionHistory: [],
    intentionHistory: [],
    habitScore: 50,
    habitScoreLastUpdatedDate: null,
    habitScoreHistory: [],
  };
}

/**
 * Create data slice actions
 */
export function createDataSlice(
  set: (partial: Partial<StatisticsState>) => void,
  get: () => StatisticsState
): DataActions {
  return {
    recordUrgeSurfing: (record: UrgeSurfingRecordInput) => {
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

    recordIntervention: (input: InterventionInput) => {
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

      // Keep last 200 intervention records to limit storage
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

    recordIntention: (
      intentionId: IntentionId,
      proceeded: boolean,
      customText?: string,
      appPackage?: string
    ) => {
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

    recordUsageTime: (appId: string, minutes: number) => {
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
            hasData: true,
            totalUsageMinutes: todayStats.totalUsageMinutes + minutes,
            appBreakdown: newBreakdown,
            timeOfDayBreakdown: newTimeBreakdown,
          },
        },
      });
    },

    setDailyUsageBreakdown: (dateKey: string, breakdown: Record<string, number>) => {
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

    recordTrainingSession: (minutes: number) => {
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

    updateHabitScore: (dailyGoalMinutes: number, selectedPackages?: string[]) => {
      const state = get();
      const today = getDateKey();

      // Date guard: only evaluate once per day
      if (state.habitScoreLastUpdatedDate === today) {
        return;
      }

      const yesterdayKey = getYesterdayKey();
      const yesterdayStats = state.dailyStats[yesterdayKey];

      // If no data recorded for yesterday, don't update score
      if (!yesterdayStats || !yesterdayStats.hasData) {
        set({ habitScoreLastUpdatedDate: today });
        return;
      }

      const yesterdayTotal = sumBreakdown(
        yesterdayStats.appBreakdown,
        selectedPackages
      );

      const achieved = yesterdayTotal <= dailyGoalMinutes;
      let newScore = state.habitScore;

      if (achieved) {
        newScore = Math.min(100, newScore + 10);
      } else {
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
  };
}
