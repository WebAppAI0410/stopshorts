/**
 * Badge System for StopShorts
 * Based on HABIT_COACHING_FEATURE.md v3.0
 */

import type { Badge, BadgeCondition, LifetimeStatistics, DailyStatistics } from '../types/statistics';

/**
 * Badges that trigger confetti celebration when earned
 */
export const CONFETTI_BADGES: readonly string[] = [
  'reduction_75',
  'intervention_success_100',
  'habit_score_90',
  'streak_21', // 21-day streak is also a major achievement
  'streak_66', // 66-day streak is legendary
];

/**
 * Check if a badge should show confetti animation
 */
export function shouldShowConfetti(badgeId: string): boolean {
  return CONFETTI_BADGES.includes(badgeId);
}

// Badge Definitions (without earnedAt)
export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  {
    id: 'first_wave',
    name: '初めての波',
    description: '第一歩を踏み出しました',
    icon: '🌊',
    condition: { type: 'first_surf' },
  },
  {
    id: 'streak_3',
    name: '3日連続',
    description: '習慣の芽が出てきました',
    icon: '🔥',
    condition: { type: 'streak', days: 3 },
  },
  {
    id: 'streak_7',
    name: '1週間サーファー',
    description: '波乗りが上手になってきました',
    icon: '💪',
    condition: { type: 'streak', days: 7 },
  },
  {
    id: 'streak_14',
    name: '2週間マスター',
    description: '衝動をコントロールできています',
    icon: '⭐',
    condition: { type: 'streak', days: 14 },
  },
  {
    id: 'streak_21',
    name: '21日チャンピオン',
    description: '新しい習慣が形成されました！',
    icon: '🏆',
    condition: { type: 'streak', days: 21 },
  },
  {
    id: 'streak_66',
    name: '66日レジェンド',
    description: '科学的に習慣が定着',
    icon: '👑',
    condition: { type: 'streak', days: 66 },
  },
  {
    id: 'surfs_100',
    name: '100回サーファー',
    description: '波乗りの達人',
    icon: '🏄',
    condition: { type: 'total_surfs', count: 100 },
  },
  {
    id: 'saved_10h',
    name: '10時間救済者',
    description: '貴重な時間を取り戻しました',
    icon: '⏰',
    condition: { type: 'saved_hours', hours: 10 },
  },
];

/**
 * Check if a badge condition is met
 */
function checkCondition(
  condition: BadgeCondition,
  lifetime: LifetimeStatistics,
  _dailyStats: Record<string, DailyStatistics>
): boolean {
  switch (condition.type) {
    case 'first_surf':
      return lifetime.totalUrgeSurfingCompleted >= 1;

    case 'streak':
      return lifetime.currentStreak >= condition.days;

    case 'total_surfs':
      return lifetime.totalUrgeSurfingCompleted >= condition.count;

    case 'saved_hours':
      return lifetime.totalSavedHours >= condition.hours;

    default:
      return false;
  }
}

/**
 * Check all badges and return updated badge array
 */
export function checkBadges(
  lifetime: LifetimeStatistics,
  dailyStats: Record<string, DailyStatistics>
): Badge[] {
  const now = new Date().toISOString();

  return lifetime.badges.map((badge) => {
    // Already earned
    if (badge.earnedAt) {
      return badge;
    }

    const earned = checkCondition(badge.condition, lifetime, dailyStats);

    if (earned) {
      return { ...badge, earnedAt: now };
    }

    return badge;
  });
}

/**
 * Calculate current streak from daily statistics
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
  lifetime: LifetimeStatistics
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

    case 'streak': {
      const target = badge.condition.days;
      const current = Math.min(lifetime.currentStreak, target);
      return {
        current,
        target,
        percentage: Math.round((current / target) * 100),
      };
    }

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

    default:
      return { current: 0, target: 1, percentage: 0 };
  }
}
