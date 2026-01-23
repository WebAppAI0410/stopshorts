/**
 * Badge System for StopShorts
 * Based on Statistics v2 specification
 */

import type { Badge, BadgeCondition, LifetimeStatistics, DailyStatistics } from '../types/statistics';
import { t } from '../i18n';

// Additional context for badge evaluation
export interface BadgeEvaluationContext {
  habitScore: number;
  interventionSuccessCount: number;  // Total dismissed interventions
  reductionPercent: number | null;   // Reduction from baseline (null if no baseline)
}

// High-rank badges that should show confetti
export const CONFETTI_BADGES = ['reduction_75', 'intervention_success_100', 'habit_score_90'];

/**
 * Check if a badge should show confetti when earned
 */
export function shouldShowConfetti(badgeId: string): boolean {
  return CONFETTI_BADGES.includes(badgeId);
}

/**
 * Get badge definitions with localized name and description
 * This function is called to get the current localized badge definitions
 */
export function getBadgeDefinitions(): Omit<Badge, 'earnedAt'>[] {
  return [
    // First surf badge
    {
      id: 'first_wave',
      name: t('badges.first_wave.name'),
      description: t('badges.first_wave.description'),
      icon: '🌊',
      condition: { type: 'first_surf' },
    },
    // Total surfs badge
    {
      id: 'surfs_100',
      name: t('badges.surfs_100.name'),
      description: t('badges.surfs_100.description'),
      icon: '🏄',
      condition: { type: 'total_surfs', count: 100 },
    },
    // Saved hours badge
    {
      id: 'saved_10h',
      name: t('badges.saved_10h.name'),
      description: t('badges.saved_10h.description'),
      icon: '⏰',
      condition: { type: 'saved_hours', hours: 10 },
    },
    // Reduction badges (requires baseline)
    {
      id: 'reduction_25',
      name: t('badges.reduction_25.name'),
      description: t('badges.reduction_25.description'),
      icon: '📉',
      condition: { type: 'reduction', percent: 25 },
    },
    {
      id: 'reduction_50',
      name: t('badges.reduction_50.name'),
      description: t('badges.reduction_50.description'),
      icon: '📊',
      condition: { type: 'reduction', percent: 50 },
    },
    {
      id: 'reduction_75',
      name: t('badges.reduction_75.name'),
      description: t('badges.reduction_75.description'),
      icon: '🎯',
      condition: { type: 'reduction', percent: 75 },
    },
    // Intervention success badges
    {
      id: 'intervention_success_50',
      name: t('badges.intervention_success_50.name'),
      description: t('badges.intervention_success_50.description'),
      icon: '💪',
      condition: { type: 'intervention_success', count: 50 },
    },
    {
      id: 'intervention_success_100',
      name: t('badges.intervention_success_100.name'),
      description: t('badges.intervention_success_100.description'),
      icon: '🏆',
      condition: { type: 'intervention_success', count: 100 },
    },
    // Habit score badges
    {
      id: 'habit_score_70',
      name: t('badges.habit_score_70.name'),
      description: t('badges.habit_score_70.description'),
      icon: '⭐',
      condition: { type: 'habit_score', score: 70 },
    },
    {
      id: 'habit_score_90',
      name: t('badges.habit_score_90.name'),
      description: t('badges.habit_score_90.description'),
      icon: '👑',
      condition: { type: 'habit_score', score: 90 },
    },
  ];
}

// Badge Definitions (without earnedAt) - for backward compatibility
// Note: This is now a getter that returns localized badge definitions
export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = getBadgeDefinitions();

/**
 * Check if a badge condition is met
 */
function checkCondition(
  condition: BadgeCondition,
  lifetime: LifetimeStatistics,
  _dailyStats: Record<string, DailyStatistics>,
  context?: BadgeEvaluationContext
): boolean {
  switch (condition.type) {
    case 'first_surf':
      return lifetime.totalUrgeSurfingCompleted >= 1;

    case 'total_surfs':
      return lifetime.totalUrgeSurfingCompleted >= condition.count;

    case 'saved_hours':
      return lifetime.totalSavedHours >= condition.hours;

    case 'reduction':
      // Requires baseline to be set
      if (!context || context.reductionPercent === null) {
        return false;
      }
      return context.reductionPercent >= condition.percent;

    case 'intervention_success':
      if (!context) {
        return false;
      }
      return context.interventionSuccessCount >= condition.count;

    case 'habit_score':
      if (!context) {
        return false;
      }
      return context.habitScore >= condition.score;

    default:
      return false;
  }
}

/**
 * Check all badges and return updated badge array
 */
export function checkBadges(
  lifetime: LifetimeStatistics,
  dailyStats: Record<string, DailyStatistics>,
  context?: BadgeEvaluationContext
): Badge[] {
  const now = new Date().toISOString();

  return lifetime.badges.map((badge) => {
    // Already earned
    if (badge.earnedAt) {
      return badge;
    }

    const earned = checkCondition(badge.condition, lifetime, dailyStats, context);

    if (earned) {
      return { ...badge, earnedAt: now };
    }

    return badge;
  });
}

/**
 * Calculate current streak from daily statistics
 * Note: Streak is still calculated but not displayed in v2 UI
 */
export function calculateStreak(
  dailyStats: Record<string, DailyStatistics>,
  dailyGoalMinutes: number = 30
): number {
  const today = new Date();
  let streak = 0;
  const currentDate = new Date(today);
  const MAX_STREAK_DAYS = 1000; // Safety limit to prevent infinite loop

  while (streak < MAX_STREAK_DAYS) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const stats = dailyStats[dateKey];

    // Check if day was successful:
    // - Completed urge surfing at least once, OR
    // - Usage time was within daily goal
    const achieved =
      stats &&
      (stats.urgeSurfing.completed > 0 || stats.totalUsageMinutes <= dailyGoalMinutes);

    if (achieved) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get newly earned badges (within last 24 hours)
 */
export function getNewlyEarnedBadges(badges: Badge[]): Badge[] {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  return badges.filter((b) => b.earnedAt && b.earnedAt > oneDayAgo);
}

/**
 * Get badge by ID
 */
export function getBadgeById(badges: Badge[], id: string): Badge | undefined {
  return badges.find((b) => b.id === id);
}

/**
 * Get earned badges count
 */
export function getEarnedBadgesCount(badges: Badge[]): number {
  return badges.filter((b) => b.earnedAt !== null).length;
}

/**
 * Calculate progress towards a badge
 */
export function getBadgeProgress(
  badge: Badge,
  lifetime: LifetimeStatistics,
  context?: BadgeEvaluationContext
): { current: number; target: number; percentage: number } {
  if (badge.earnedAt) {
    return { current: 1, target: 1, percentage: 100 };
  }

  switch (badge.condition.type) {
    case 'first_surf':
      return {
        current: Math.min(lifetime.totalUrgeSurfingCompleted, 1),
        target: 1,
        percentage: lifetime.totalUrgeSurfingCompleted >= 1 ? 100 : 0,
      };

    case 'total_surfs': {
      const target = badge.condition.count;
      const current = Math.min(lifetime.totalUrgeSurfingCompleted, target);
      return {
        current,
        target,
        percentage: Math.round((current / target) * 100),
      };
    }

    case 'saved_hours': {
      const target = badge.condition.hours;
      const current = Math.min(lifetime.totalSavedHours, target);
      return {
        current,
        target,
        percentage: Math.round((current / target) * 100),
      };
    }

    case 'reduction': {
      const target = badge.condition.percent;
      if (!context || context.reductionPercent === null) {
        return { current: 0, target, percentage: 0 };
      }
      const current = Math.min(Math.max(context.reductionPercent, 0), target);
      return {
        current,
        target,
        percentage: Math.round((current / target) * 100),
      };
    }

    case 'intervention_success': {
      const target = badge.condition.count;
      const current = context ? Math.min(context.interventionSuccessCount, target) : 0;
      return {
        current,
        target,
        percentage: Math.round((current / target) * 100),
      };
    }

    case 'habit_score': {
      const target = badge.condition.score;
      const current = context ? Math.min(context.habitScore, target) : 0;
      return {
        current,
        target,
        percentage: Math.round((current / target) * 100),
      };
    }

    default:
      return { current: 0, target: 1, percentage: 0 };
  }
}
