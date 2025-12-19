/**
 * Screen Time Module (Mock Implementation)
 * Provides mock data for screen time statistics until real iOS API integration
 */

import { Platform } from 'react-native';

export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved' | 'unknown';

export interface AppUsage {
  bundleId: string;
  appName: string;
  minutes: number;
  openCount: number;
}

export interface UsageData {
  totalMinutes: number;
  apps: AppUsage[];
  peakHours: string[];
  lastUpdated: string;
}

// Mock app bundle IDs
const APP_BUNDLE_IDS = {
  tiktok: 'com.zhiliaoapp.musically',
  youtubeShorts: 'com.google.ios.youtube',
  instagramReels: 'com.burbn.instagram',
};

/**
 * Generate realistic mock usage data
 */
function generateMockUsageData(): UsageData {
  const now = new Date();
  const hour = now.getHours();

  // More usage during evening hours
  const timeMultiplier = hour >= 17 && hour <= 23 ? 1.5 : hour >= 6 && hour <= 9 ? 1.2 : 1;

  // Random variation
  const randomFactor = 0.7 + Math.random() * 0.6;

  const tiktokMinutes = Math.round(25 * timeMultiplier * randomFactor);
  const youtubeMinutes = Math.round(18 * timeMultiplier * randomFactor);
  const instagramMinutes = Math.round(12 * timeMultiplier * randomFactor);

  return {
    totalMinutes: tiktokMinutes + youtubeMinutes + instagramMinutes,
    apps: [
      {
        bundleId: APP_BUNDLE_IDS.tiktok,
        appName: 'TikTok',
        minutes: tiktokMinutes,
        openCount: Math.round(tiktokMinutes / 3),
      },
      {
        bundleId: APP_BUNDLE_IDS.youtubeShorts,
        appName: 'YouTube',
        minutes: youtubeMinutes,
        openCount: Math.round(youtubeMinutes / 4),
      },
      {
        bundleId: APP_BUNDLE_IDS.instagramReels,
        appName: 'Instagram',
        minutes: instagramMinutes,
        openCount: Math.round(instagramMinutes / 5),
      },
    ],
    peakHours: ['21:00', '22:00', '23:00'],
    lastUpdated: now.toISOString(),
  };
}

/**
 * Generate weekly mock usage data
 */
function generateWeeklyMockData(): {
  weeklyTotal: number;
  dailyAverage: number;
  dailyBreakdown: { date: string; minutes: number }[];
} {
  const dailyBreakdown: { date: string; minutes: number }[] = [];
  let weeklyTotal = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // More variation for realistic data
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseMinutes = isWeekend ? 90 : 60;
    const variation = Math.random() * 40 - 20;
    const minutes = Math.round(Math.max(20, baseMinutes + variation));

    weeklyTotal += minutes;
    dailyBreakdown.push({
      date: date.toISOString().split('T')[0],
      minutes,
    });
  }

  return {
    weeklyTotal,
    dailyAverage: Math.round(weeklyTotal / 7),
    dailyBreakdown,
  };
}

/**
 * Mock Screen Time Service
 */
class ScreenTimeService {
  private mockAuthStatus: AuthorizationStatus = 'notDetermined';

  /**
   * Request Screen Time authorization
   */
  async requestAuthorization(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('[ScreenTime] Screen Time API is only available on iOS');
      // For development, return true on non-iOS platforms
      this.mockAuthStatus = 'approved';
      return true;
    }

    // Simulate authorization request
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.mockAuthStatus = 'approved';
    return true;
  }

  /**
   * Get current authorization status
   */
  async getAuthorizationStatus(): Promise<AuthorizationStatus> {
    if (Platform.OS !== 'ios') {
      return 'approved'; // Return approved for development
    }
    return this.mockAuthStatus;
  }

  /**
   * Check if Screen Time is available
   */
  async isAvailable(): Promise<boolean> {
    // Real implementation would check iOS version >= 15
    return Platform.OS === 'ios' || __DEV__;
  }

  /**
   * Set shielded apps (mock)
   */
  async setShieldedApps(bundleIds: string[]): Promise<boolean> {
    console.log('[ScreenTime] Setting shielded apps:', bundleIds);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }

  /**
   * Remove shields from all apps (mock)
   */
  async unshieldApps(): Promise<boolean> {
    console.log('[ScreenTime] Removing shields from all apps');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }

  /**
   * Get usage data for a date range (mock)
   */
  async getUsageData(_startDate: Date, _endDate: Date): Promise<UsageData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateMockUsageData();
  }

  /**
   * Get weekly usage statistics (mock)
   */
  async getWeeklyUsage(): Promise<{
    weeklyTotal: number;
    dailyAverage: number;
    dailyBreakdown: { date: string; minutes: number }[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateWeeklyMockData();
  }

  /**
   * Get today's usage (mock)
   */
  async getTodayUsage(): Promise<UsageData> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.getUsageData(startOfDay, now);
  }

  /**
   * Get app usage breakdown for specific app
   */
  async getAppUsage(
    appId: 'tiktok' | 'youtubeShorts' | 'instagramReels'
  ): Promise<{ minutes: number; openCount: number }> {
    const usage = await this.getTodayUsage();
    const bundleId = APP_BUNDLE_IDS[appId];
    const appUsage = usage.apps.find((a) => a.bundleId === bundleId);

    return {
      minutes: appUsage?.minutes || 0,
      openCount: appUsage?.openCount || 0,
    };
  }

  /**
   * Subscribe to usage updates (mock - returns cleanup function)
   */
  subscribeToUsageUpdates(
    callback: (data: UsageData) => void,
    intervalMs: number = 60000
  ): () => void {
    const interval = setInterval(async () => {
      const data = await this.getTodayUsage();
      callback(data);
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const screenTimeService = new ScreenTimeService();

// Export bundle IDs for reference
export const MANAGED_APP_BUNDLE_IDS = APP_BUNDLE_IDS;
