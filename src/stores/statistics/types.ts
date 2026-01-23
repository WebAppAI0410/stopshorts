/**
 * Statistics Store Types
 * Type definitions for the statistics store slices
 */

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
} from '../../types/statistics';
import type { IntentionLog, IntentionId } from '../../types';

// ============================================
// Input Types
// ============================================

/**
 * Input for recording urge surfing (excludes timestamp which is auto-generated)
 */
export interface UrgeSurfingRecordInput {
  intensityBefore: number;
  intensityAfter: number;
  durationSeconds: number;
  completed: boolean;
}

/**
 * Input for recording an intervention event
 */
export interface InterventionInput {
  proceeded: boolean;
  type: InterventionType;
  appPackage?: string;
  timestamp?: number;
  // For breathing interventions
  intensityBefore?: number;
  intensityAfter?: number;
  // For friction interventions
  intention?: IntentionId;
}

/**
 * Individual intervention record for analytics
 */
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

// ============================================
// State Slice Types
// ============================================

/**
 * Data state - raw data storage
 */
export interface DataState {
  dailyStats: Record<string, DailyStatistics>;
  lifetime: LifetimeStatistics;
  interventionHistory: InterventionRecord[];
  intentionHistory: IntentionLog[];
  habitScore: number;
  habitScoreLastUpdatedDate: string | null;
  habitScoreHistory: Array<{ date: string; score: number }>;
}

/**
 * Data actions - data recording operations
 */
export interface DataActions {
  recordUrgeSurfing: (record: UrgeSurfingRecordInput) => void;
  recordIntervention: (input: InterventionInput) => void;
  recordIntention: (
    intentionId: IntentionId,
    proceeded: boolean,
    customText?: string,
    appPackage?: string
  ) => void;
  recordUsageTime: (appId: string, minutes: number) => void;
  setDailyUsageBreakdown: (dateKey: string, breakdown: Record<string, number>) => void;
  recordTrainingSession: (minutes: number) => void;
  updateStreak: () => void;
  updateHabitScore: (dailyGoalMinutes: number, selectedPackages?: string[]) => void;
  resetDailyStats: () => void;
  resetAllStats: () => void;
}

/**
 * Computed getters - derived data calculations
 */
export interface ComputedGetters {
  getTodayStats: () => DailyStatistics;
  getWeeklyStats: () => WeeklyStatistics;
  getStreak: () => number;
  getNewBadges: () => Badge[];
  getEarnedBadges: () => Badge[];
  getTotalSavedMinutes: () => number;
  getHabitScore: () => number;
  getRecentInterventionCount: (windowMs?: number) => number;
  isHighFrequencyAttempts: (windowMs?: number, threshold?: number) => boolean;
  getMonthlyAchievementStats: (
    dailyGoalMinutes: number,
    selectedPackages?: string[]
  ) => {
    achievedDays: number;
    totalDaysWithData: number;
    achievementRate: number;
  };
  getReductionRate: (
    baselineMonthlyMinutes: number | null,
    selectedPackages?: string[]
  ) => number | null;
  getWeeklyTrend: (selectedPackages?: string[]) => number[];
  getDailyComparison: () => DailyComparisonResult;
  getWeeklyComparison: () => WeeklyComparisonResult;
  getBaselineDailyMinutes: () => number | null;
  getPreviousWeekData: () => DayData[];
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
}

/**
 * Complete statistics store state
 */
export interface StatisticsState extends DataState, DataActions, ComputedGetters {}

// ============================================
// Slice Creator Type
// ============================================

export type StateCreator<T> = (
  set: (partial: Partial<StatisticsState>) => void,
  get: () => StatisticsState
) => T;
