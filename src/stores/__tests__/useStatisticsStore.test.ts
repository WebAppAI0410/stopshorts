/**
 * Tests for useStatisticsStore - intervention recording and statistics
 */

import { useStatisticsStore } from '../useStatisticsStore';
import type { InterventionType } from '../../types/statistics';

// Helper to reset store state before each test
const resetStore = () => {
  useStatisticsStore.setState({
    dailyStats: {},
    lifetime: {
      startDate: new Date().toISOString().split('T')[0],
      totalSavedHours: 0,
      totalUrgeSurfingCompleted: 0,
      totalInterventions: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
    },
    interventionHistory: [],
    intentionHistory: [],
    habitScore: 50,
  });
};

describe('useStatisticsStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-22T12:00:00Z'));
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordIntervention', () => {
    it('records a friction intervention correctly', () => {
      const { recordIntervention, getTodayStats } = useStatisticsStore.getState();

      recordIntervention({
        proceeded: false,
        type: 'friction',
        appPackage: 'com.tiktok.app',
      });

      const todayStats = getTodayStats();
      expect(todayStats.interventions.triggered).toBe(1);
      expect(todayStats.interventions.dismissed).toBe(1);
      expect(todayStats.interventions.proceeded).toBe(0);
    });

    it('records proceeded intervention correctly', () => {
      const { recordIntervention, getTodayStats } = useStatisticsStore.getState();

      recordIntervention({
        proceeded: true,
        type: 'friction',
        appPackage: 'com.tiktok.app',
      });

      const todayStats = getTodayStats();
      expect(todayStats.interventions.triggered).toBe(1);
      expect(todayStats.interventions.dismissed).toBe(0);
      expect(todayStats.interventions.proceeded).toBe(1);
    });

    it('records different intervention types', () => {
      const { recordIntervention } = useStatisticsStore.getState();

      const types: InterventionType[] = ['breathing', 'friction', 'mirror', 'ai'];

      types.forEach((type) => {
        recordIntervention({
          proceeded: false,
          type,
        });
      });

      const state = useStatisticsStore.getState();
      expect(state.interventionHistory).toHaveLength(4);

      // Verify each type was recorded
      types.forEach((type) => {
        const found = state.interventionHistory.find((r) => r.type === type);
        expect(found).toBeDefined();
        expect(found?.proceeded).toBe(false);
      });
    });

    it('stores intervention history with correct fields', () => {
      const { recordIntervention } = useStatisticsStore.getState();

      recordIntervention({
        proceeded: false,
        type: 'friction',
        appPackage: 'com.instagram.android',
        intention: 'bored',
      });

      const state = useStatisticsStore.getState();
      const record = state.interventionHistory[0];

      expect(record).toMatchObject({
        proceeded: false,
        type: 'friction',
        appPackage: 'com.instagram.android',
        intention: 'bored',
      });
      expect(record.timestamp).toBeDefined();
      expect(record.timeOfDay).toBeDefined();
    });
  });

  describe('getOverallInterventionSuccessRate', () => {
    it('returns zero stats when no interventions', () => {
      const { getOverallInterventionSuccessRate } = useStatisticsStore.getState();

      const stats = getOverallInterventionSuccessRate();

      expect(stats.triggered).toBe(0);
      expect(stats.dismissed).toBe(0);
      expect(stats.proceeded).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('calculates success rate correctly', () => {
      const { recordIntervention, getOverallInterventionSuccessRate } =
        useStatisticsStore.getState();

      // 3 dismissed, 2 proceeded = 60% success rate
      recordIntervention({ proceeded: false, type: 'friction' });
      recordIntervention({ proceeded: false, type: 'friction' });
      recordIntervention({ proceeded: false, type: 'friction' });
      recordIntervention({ proceeded: true, type: 'friction' });
      recordIntervention({ proceeded: true, type: 'friction' });

      const stats = getOverallInterventionSuccessRate();

      expect(stats.triggered).toBe(5);
      expect(stats.dismissed).toBe(3);
      expect(stats.proceeded).toBe(2);
      expect(stats.successRate).toBe(0.6);
    });

    it('handles 100% success rate', () => {
      const { recordIntervention, getOverallInterventionSuccessRate } =
        useStatisticsStore.getState();

      recordIntervention({ proceeded: false, type: 'breathing' });
      recordIntervention({ proceeded: false, type: 'mirror' });

      const stats = getOverallInterventionSuccessRate();

      expect(stats.successRate).toBe(1);
    });

    it('handles 0% success rate', () => {
      const { recordIntervention, getOverallInterventionSuccessRate } =
        useStatisticsStore.getState();

      recordIntervention({ proceeded: true, type: 'ai' });
      recordIntervention({ proceeded: true, type: 'friction' });

      const stats = getOverallInterventionSuccessRate();

      expect(stats.successRate).toBe(0);
    });
  });

  describe('getInterventionStatsByType', () => {
    it('returns stats for each intervention type', () => {
      const { recordIntervention, getInterventionStatsByType } =
        useStatisticsStore.getState();

      // Breathing: 2 dismissed, 1 proceeded
      recordIntervention({ proceeded: false, type: 'breathing' });
      recordIntervention({ proceeded: false, type: 'breathing' });
      recordIntervention({ proceeded: true, type: 'breathing' });

      // Friction: 1 dismissed, 0 proceeded
      recordIntervention({ proceeded: false, type: 'friction' });

      const stats = getInterventionStatsByType();

      expect(stats.breathing.triggered).toBe(3);
      expect(stats.breathing.dismissed).toBe(2);
      expect(stats.breathing.successRate).toBeCloseTo(2 / 3);

      expect(stats.friction.triggered).toBe(1);
      expect(stats.friction.dismissed).toBe(1);
      expect(stats.friction.successRate).toBe(1);

      expect(stats.mirror.triggered).toBe(0);
      expect(stats.ai.triggered).toBe(0);
    });
  });

  describe('getIntentionPatternStats', () => {
    it('counts intention patterns from recordIntention calls', () => {
      // getIntentionPatternStats uses intentionHistory which is populated by recordIntention
      const { recordIntention, getIntentionPatternStats } =
        useStatisticsStore.getState();

      // recordIntention is called by FrictionIntervention component
      // Valid IntentionId values: 'dm', 'specific', 'bored', 'random', 'other'
      recordIntention('bored', false, undefined, 'com.tiktok.app');
      recordIntention('bored', true, undefined, 'com.tiktok.app');
      recordIntention('dm', false, undefined, 'com.tiktok.app');

      const stats = getIntentionPatternStats();

      expect(stats['bored']).toBeDefined();
      expect(stats['bored'].count).toBe(2);
      expect(stats['dm']).toBeDefined();
      expect(stats['dm'].count).toBe(1);
    });
  });

  describe('getTimeOfDayPatterns', () => {
    it('tracks intervention time patterns', () => {
      // Pass timestamp explicitly to avoid timezone issues with Date.now()
      const { recordIntervention, getTimeOfDayPatterns } = useStatisticsStore.getState();

      // Time of day mapping (from types/statistics.ts):
      // morning: 6-9 (hour >= 6 && hour < 9)
      // daytime: 9-17 (hour >= 9 && hour < 17)
      // evening: 17-21 (hour >= 17 && hour < 21)
      // night: 21-6 (all others)

      // Use explicit timestamps to avoid timezone issues
      recordIntervention({
        proceeded: false,
        type: 'friction',
        timestamp: new Date('2025-12-22T07:00:00').getTime(), // 7am local = morning
      });

      recordIntervention({
        proceeded: false,
        type: 'friction',
        timestamp: new Date('2025-12-22T12:00:00').getTime(), // 12pm local = daytime
      });

      recordIntervention({
        proceeded: false,
        type: 'friction',
        timestamp: new Date('2025-12-22T19:00:00').getTime(), // 7pm local = evening
      });

      recordIntervention({
        proceeded: false,
        type: 'friction',
        timestamp: new Date('2025-12-22T23:00:00').getTime(), // 11pm local = night
      });

      const patterns = getTimeOfDayPatterns();

      expect(patterns.intervention.morning).toBe(1);
      expect(patterns.intervention.daytime).toBe(1);
      expect(patterns.intervention.evening).toBe(1);
      expect(patterns.intervention.night).toBe(1);
    });
  });
});
