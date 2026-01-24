/**
 * useDailyUsageSync Hook
 * Syncs daily usage data from native module to statistics store on app startup
 *
 * This hook:
 * - Runs once per day when app opens (after onboarding complete)
 * - Fetches yesterday's usage from native module
 * - Records it in the statistics store
 * - Updates the habit score
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { screenTimeService } from '../native/ScreenTimeModule';
import { getSelectedPackages } from '../native/ScreenTimeModule.utils';
import { useAppStore } from '../stores/useAppStore';
import { useStatisticsStore } from '../stores/useStatisticsStore';

// Get date key for a date (YYYY-MM-DD)
function getDateKey(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().split('T')[0];
}

// Get yesterday's date
function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

export function useDailyUsageSync() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const selectedApps = useAppStore((state) => state.selectedApps);
  const customApps = useAppStore((state) => state.customApps);
  const dailyGoalMinutes = useAppStore((state) => state.dailyGoalMinutes);

  const updateHabitScore = useStatisticsStore((state) => state.updateHabitScore);
  const setDailyUsageBreakdown = useStatisticsStore((state) => state.setDailyUsageBreakdown);
  const dailyStatsRef = useRef(useStatisticsStore.getState().dailyStats);

  const lastSyncDateRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  // Memoize custom app packages to prevent infinite loops
  const customAppPackages = useMemo(
    () => customApps.filter((app) => app.isSelected !== false).map((app) => app.packageName),
    [customApps]
  );

  const selectedPackages = useMemo(() => {
    const base = getSelectedPackages(selectedApps);
    return [...new Set([...base, ...customAppPackages])];
  }, [selectedApps, customAppPackages]);

  // Keep dailyStats ref updated
  useEffect(() => {
    const unsubscribe = useStatisticsStore.subscribe(
      (state) => { dailyStatsRef.current = state.dailyStats; }
    );
    return unsubscribe;
  }, []);

  /**
   * Sync yesterday's usage data to the statistics store
   */
  const syncYesterdayUsage = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (isSyncingRef.current) return;

    const today = getDateKey();
    const yesterday = getYesterday();
    const yesterdayKey = getDateKey(yesterday);

    // Skip if already synced today
    if (lastSyncDateRef.current === today) {
      if (__DEV__) console.log('[DailyUsageSync] Already synced today, skipping');
      return;
    }

    // Skip if we already have data for yesterday (use hasData flag)
    const dailyStats = dailyStatsRef.current;
    if (dailyStats[yesterdayKey]?.hasData) {
      if (__DEV__) console.log('[DailyUsageSync] Already have data for yesterday, updating habit score only');
      lastSyncDateRef.current = today;
      updateHabitScore(dailyGoalMinutes, selectedPackages);
      return;
    }

    isSyncingRef.current = true;

    try {
      if (__DEV__) console.log('[DailyUsageSync] Syncing yesterday usage...');

      // Check permissions
      const permissionStatus = await screenTimeService.getPermissionStatus();
      if (!permissionStatus.usageStats) {
        if (__DEV__) console.log('[DailyUsageSync] No usage stats permission');
        isSyncingRef.current = false;
        return;
      }

      const startOfDay = new Date(yesterday);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(yesterday);
      endOfDay.setHours(23, 59, 59, 999);

      // Get per-app usage stats for yesterday
      const stats = await screenTimeService.getUsageStatsForRange(
        startOfDay,
        endOfDay,
        selectedApps,
        customAppPackages
      );

      const breakdown: Record<string, number> = {};
      for (const stat of stats) {
        const minutes = Math.round((stat.totalTimeMs || 0) / 60000);
        if (minutes > 0) {
          breakdown[stat.packageName] = minutes;
        }
      }

      setDailyUsageBreakdown(yesterdayKey, breakdown);

      // Update habit score (evaluates yesterday's performance)
      updateHabitScore(dailyGoalMinutes, selectedPackages);

      lastSyncDateRef.current = today;
      if (__DEV__) console.log('[DailyUsageSync] Sync completed');
    } catch (error) {
      console.error('[DailyUsageSync] Error syncing:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [selectedApps, customAppPackages, dailyGoalMinutes, updateHabitScore, setDailyUsageBreakdown, selectedPackages]);

  // Sync on app coming to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && hasCompletedOnboarding) {
        await syncYesterdayUsage();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [hasCompletedOnboarding, syncYesterdayUsage]);

  // Initial sync when onboarding is complete
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    if (hasCompletedOnboarding) {
      syncYesterdayUsage();
    }
  }, [hasCompletedOnboarding, syncYesterdayUsage]);

  return {
    syncYesterdayUsage,
  };
}
