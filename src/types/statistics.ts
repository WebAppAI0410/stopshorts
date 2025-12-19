/**
 * Statistics Types for StopShorts Habit Coaching
 * Based on HABIT_COACHING_FEATURE.md v3.0
 */

import type { ManagedApp } from './index';

// Daily Statistics
export interface DailyStatistics {
  date: string; // ISO date (YYYY-MM-DD)
  totalUsageMinutes: number;
  appBreakdown: {
    tiktok: number;
    youtubeShorts: number;
    instagramReels: number;
  };
  urgeSurfing: {
    completed: number;
    skipped: number;
    totalDurationSeconds: number;
    averageIntensityBefore: number; // 1-10
    averageIntensityAfter: number; // 1-10
  };
  interventions: {
    triggered: number;
    dismissed: number;
    proceeded: number;
  };
  training: {
    sessionsCompleted: number;
    totalMinutes: number;
  };
  timeOfDayBreakdown: {
    morning: number; // 6-9
    daytime: number; // 9-17
    evening: number; // 17-21
    night: number; // 21-6
  };
}

// Weekly Statistics
export interface WeeklyStatistics {
  weekStart: string; // ISO date
  weekEnd: string;
  dailyStats: DailyStatistics[];
  averageDailyUsage: number;
  totalUrgeSurfing: number;
  successRate: number; // completed / (completed + skipped)
  savedMinutes: number; // Estimated saved time
  comparedToPreviousWeek: {
    usageChange: number; // Percentage change
    successRateChange: number;
  };
}

// Lifetime Statistics
export interface LifetimeStatistics {
  startDate: string;
  totalSavedHours: number;
  totalUrgeSurfingCompleted: number;
  totalInterventions: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
}

// Badge Types
export type BadgeCondition =
  | { type: 'first_surf' }
  | { type: 'streak'; days: number }
  | { type: 'total_surfs'; count: number }
  | { type: 'saved_hours'; hours: number };

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  condition: BadgeCondition;
}

// Urge Surfing Record
export interface UrgeSurfingRecord {
  intensityBefore: number; // 1-10
  intensityAfter: number; // 1-10
  durationSeconds: number;
  completed: boolean;
  timestamp: string; // ISO string
}

// App Usage Entry
export interface AppUsageEntry {
  app: ManagedApp;
  minutes: number;
  timestamp: string;
}

// Time of Day
export type TimeOfDay = 'morning' | 'daytime' | 'evening' | 'night';

// Helper function to get time of day
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'daytime';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Helper function to get date key
export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
