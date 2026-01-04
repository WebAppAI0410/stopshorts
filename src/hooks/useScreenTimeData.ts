/**
 * useScreenTimeData Hook
 * Fetches real screen time usage data from Android native module
 * Respects user's app selection from onboarding and includes custom apps
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { screenTimeService, UsageData } from '../native/ScreenTimeModule';
import { useAppStore } from '../stores/useAppStore';
import type { TargetAppId } from '../types';
import { debugLog } from '../utils/logger';

interface ScreenTimeDataState {
  todayData: UsageData | null;
  weeklyData: {
    weeklyTotal: number;
    dailyAverage: number;
    dailyBreakdown: { date: string; minutes: number }[];
  } | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isMockData: boolean; // Flag to indicate if data is mock (iOS)
}

interface UseScreenTimeDataReturn extends ScreenTimeDataState {
  refresh: () => Promise<void>;
  refreshToday: () => Promise<void>;
  refreshWeekly: () => Promise<void>;
}

export function useScreenTimeData(): UseScreenTimeDataReturn {
  const [state, setState] = useState<ScreenTimeDataState>({
    todayData: null,
    weeklyData: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isMockData: Platform.OS !== 'android', // iOS uses mock data
  });

  // Get selectedApps and customApps from store
  const selectedApps = useAppStore((s) => s.selectedApps);
  const customApps = useAppStore((s) => s.customApps);

  // Memoize to prevent infinite loops
  const memoizedSelectedApps = useMemo<TargetAppId[]>(
    () => [...selectedApps],
    [selectedApps]
  );

  const customPackages = useMemo(
    () => customApps.filter((app) => app.isSelected !== false).map((app) => app.packageName),
    [customApps]
  );

  /**
   * Fetch today's usage data
   */
  const refreshToday = useCallback(async () => {
    if (Platform.OS !== 'android') {
      // iOS: Use mock data for now
      const mockData = await screenTimeService.getTodayUsage();
      setState((prev) => ({
        ...prev,
        todayData: mockData,
        lastUpdated: new Date(),
        isMockData: true,
      }));
      return;
    }

    try {
      debugLog(
        '[useScreenTimeData] Fetching today usage - selectedApps:',
        memoizedSelectedApps,
        'customPackages:',
        customPackages
      );
      const data = await screenTimeService.getTodayUsage(memoizedSelectedApps, customPackages);
      debugLog('[useScreenTimeData] Today data:', JSON.stringify(data));

      setState((prev) => ({
        ...prev,
        todayData: data,
        error: null,
        lastUpdated: new Date(),
        isMockData: false,
      }));
    } catch (error) {
      console.error('[useScreenTimeData] Error fetching today usage:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch today usage data',
      }));
    }
  }, [memoizedSelectedApps, customPackages]);

  /**
   * Fetch weekly usage data
   */
  const refreshWeekly = useCallback(async () => {
    if (Platform.OS !== 'android') {
      // iOS: Use mock data for now
      const mockData = await screenTimeService.getWeeklyUsage();
      setState((prev) => ({
        ...prev,
        weeklyData: mockData,
        lastUpdated: new Date(),
        isMockData: true,
      }));
      return;
    }

    try {
      debugLog(
        '[useScreenTimeData] Fetching weekly usage - selectedApps:',
        memoizedSelectedApps,
        'customPackages:',
        customPackages
      );
      const data = await screenTimeService.getWeeklyUsage(memoizedSelectedApps, customPackages);
      debugLog('[useScreenTimeData] Weekly data:', JSON.stringify(data));

      setState((prev) => ({
        ...prev,
        weeklyData: data,
        error: null,
        lastUpdated: new Date(),
        isMockData: false,
      }));
    } catch (error) {
      console.error('[useScreenTimeData] Error fetching weekly usage:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch weekly usage data',
      }));
    }
  }, [memoizedSelectedApps, customPackages]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await Promise.all([refreshToday(), refreshWeekly()]);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [refreshToday, refreshWeekly]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh when selected apps or custom apps change
  // Using JSON.stringify to detect actual content changes
  const selectedAppsKey = JSON.stringify(memoizedSelectedApps);
  const customPackagesKey = JSON.stringify(customPackages);

  useEffect(() => {
    if (state.lastUpdated) {
      // Only refresh if we've already loaded data once
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppsKey, customPackagesKey]);

  return {
    ...state,
    refresh,
    refreshToday,
    refreshWeekly,
  };
}

/**
 * Hook for real-time usage updates (polling)
 * Updates every 30 seconds when app is in foreground
 */
export function useRealTimeUsage(intervalMs: number = 30000) {
  const { todayData, refresh, loading } = useScreenTimeData();

  // Use ref to avoid stale closure issues with refresh
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const interval = setInterval(() => {
      refreshRef.current();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { todayData, loading, refresh };
}
