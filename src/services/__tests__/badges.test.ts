import {
  BADGE_DEFINITIONS,
  calculateStreak,
  checkBadges,
  getBadgeProgress,
  getNewlyEarnedBadges,
} from '../badges';
import type { DailyStatistics, LifetimeStatistics } from '../../types/statistics';

const createDailyStats = (
  date: string,
  overrides: Partial<DailyStatistics> = {}
): DailyStatistics => ({
  date,
  hasData: true,
  totalUsageMinutes: 10,
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
  ...overrides,
});

describe('badges', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-22T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calculates streak based on consecutive successful days', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const dailyStats: Record<string, DailyStatistics> = {
      [today]: createDailyStats(today, { totalUsageMinutes: 20 }),
      [yesterday]: createDailyStats(yesterday, { totalUsageMinutes: 15 }),
    };

    expect(calculateStreak(dailyStats)).toBe(2);
  });

  it('marks badge as earned when condition is met', () => {
    const lifetime: LifetimeStatistics = {
      startDate: '2025-01-01',
      totalSavedHours: 0,
      totalUrgeSurfingCompleted: 1,
      totalInterventions: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: BADGE_DEFINITIONS.map((badge) => ({
        ...badge,
        earnedAt: null,
      })),
    };

    const updated = checkBadges(lifetime, {});
    const firstBadge = updated.find((badge) => badge.id === 'first_wave');

    expect(firstBadge?.earnedAt).toBe(new Date().toISOString());
  });

  it('calculates badge progress for streak conditions', () => {
    const badge = {
      ...BADGE_DEFINITIONS.find((item) => item.id === 'streak_7')!,
      earnedAt: null,
    };

    const lifetime: LifetimeStatistics = {
      startDate: '2025-01-01',
      totalSavedHours: 0,
      totalUrgeSurfingCompleted: 0,
      totalInterventions: 0,
      currentStreak: 3,
      longestStreak: 3,
      badges: [badge],
    };

    const progress = getBadgeProgress(badge, lifetime);

    expect(progress.current).toBe(3);
    expect(progress.target).toBe(7);
    expect(progress.percentage).toBe(43);
  });

  it('filters newly earned badges within the last 24 hours', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const older = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const badges = [
      { ...BADGE_DEFINITIONS[0], earnedAt: recent },
      { ...BADGE_DEFINITIONS[1], earnedAt: older },
    ];

    const recentBadges = getNewlyEarnedBadges(badges);

    expect(recentBadges).toHaveLength(1);
    expect(recentBadges[0].earnedAt).toBe(recent);
  });
});
