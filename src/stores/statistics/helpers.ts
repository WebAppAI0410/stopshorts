/**
 * Statistics Store Helpers
 * Utility functions used across slices
 */

import type { DailyStatistics, LifetimeStatistics } from '../../types/statistics';
import { getDateKey } from '../../types/statistics';
import { BADGE_DEFINITIONS } from '../../services/badges';

// ============================================
// Constants
// ============================================

/** Estimated minutes saved per completed urge surfing session */
export const MINUTES_SAVED_PER_SURF = 5;

// ============================================
// Factory Functions
// ============================================

/**
 * Create empty daily stats for a given date
 */
export function createEmptyDailyStats(date: string): DailyStatistics {
  return {
    date,
    hasData: false,
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

/**
 * Create empty lifetime stats
 */
export function createEmptyLifetime(): LifetimeStatistics {
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

// ============================================
// Date Helpers
// ============================================

/**
 * Get yesterday's date key
 */
export function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
}

/**
 * Check if a date is in current month
 */
export function isCurrentMonth(dateKey: string): boolean {
  const now = new Date();
  const [year, month] = dateKey.split('-').map(Number);
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

/**
 * Get Monday-based week start
 */
export function getMondayWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================
// Calculation Helpers
// ============================================

/**
 * Sum app breakdown minutes, optionally filtering by selected packages
 */
export function sumBreakdown(
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
