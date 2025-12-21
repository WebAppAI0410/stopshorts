/**
 * Screen Time Module
 * Cross-platform interface for screen time tracking
 * - iOS: Uses mock data (TODO: integrate with Screen Time API)
 * - Android: Uses UsageStatsManager via native module
 */

import { Platform } from 'react-native';
import type { TargetAppId } from '../types';

// Types
export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved' | 'unknown';

export interface PermissionStatus {
  usageStats: boolean;
  overlay: boolean;
  familyControls: boolean;
  notifications: boolean;
}

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

/**
 * Installed app information (Android only)
 * Note: iOS implementation pending - requires Family Controls Entitlement approval
 */
export interface InstalledApp {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  category: string;
}

// Target app package names (Android) / bundle IDs (iOS)
// Maps TargetAppId to package names for each platform
export const TARGET_APPS = {
  android: {
    tiktok: ['com.zhiliaoapp.musically', 'com.ss.android.ugc.trill'],
    youtube: ['com.google.android.youtube'],
    instagram: ['com.instagram.android'],
    twitter: ['com.twitter.android', 'com.twitter.android.lite'],
    facebook: ['com.facebook.katana', 'com.facebook.lite'],
    snapchat: ['com.snapchat.android'],
  },
  ios: {
    tiktok: ['com.zhiliaoapp.musically'],
    youtube: ['com.google.ios.youtube'],
    instagram: ['com.burbn.instagram'],
    twitter: ['com.atebits.Tweetie2'],
    facebook: ['com.facebook.Facebook'],
    snapchat: ['com.toyopagroup.picaboo'],
  },
};

// Map TargetAppId to TARGET_APPS keys
const TARGET_APP_ID_TO_KEY: Record<TargetAppId, keyof typeof TARGET_APPS.android> = {
  tiktok: 'tiktok',
  youtubeShorts: 'youtube',
  instagramReels: 'instagram',
  twitter: 'twitter',
  facebookReels: 'facebook',
  snapchat: 'snapchat',
};

// Get all target package names for current platform (legacy - returns all)
export function getTargetPackages(): string[] {
  const platform = Platform.OS === 'android' ? 'android' : 'ios';
  const apps = TARGET_APPS[platform];
  return [
    ...apps.tiktok,
    ...apps.youtube,
    ...apps.instagram,
    ...apps.twitter,
    ...apps.facebook,
    ...apps.snapchat,
  ];
}

/**
 * Get package names for selected apps only
 * @param selectedApps Array of TargetAppId that user has selected
 * @returns Array of package names for selected apps
 */
export function getSelectedPackages(selectedApps: TargetAppId[]): string[] {
  const platform = Platform.OS === 'android' ? 'android' : 'ios';
  const apps = TARGET_APPS[platform];
  const packages: string[] = [];

  for (const appId of selectedApps) {
    const key = TARGET_APP_ID_TO_KEY[appId];
    if (key && apps[key]) {
      packages.push(...apps[key]);
    }
  }

  return packages;
}

/**
 * Generate realistic mock usage data
 */
function generateMockUsageData(): UsageData {
  const now = new Date();
  const hour = now.getHours();

  // More usage during evening hours
  const timeMultiplier = hour >= 17 && hour <= 23 ? 1.5 : hour >= 6 && hour <= 9 ? 1.2 : 1;
  const randomFactor = 0.7 + Math.random() * 0.6;

  const tiktokMinutes = Math.round(25 * timeMultiplier * randomFactor);
  const youtubeMinutes = Math.round(18 * timeMultiplier * randomFactor);
  const instagramMinutes = Math.round(12 * timeMultiplier * randomFactor);

  const bundleIds = Platform.OS === 'android' ? TARGET_APPS.android : TARGET_APPS.ios;

  return {
    totalMinutes: tiktokMinutes + youtubeMinutes + instagramMinutes,
    apps: [
      {
        bundleId: bundleIds.tiktok[0],
        appName: 'TikTok',
        minutes: tiktokMinutes,
        openCount: Math.round(tiktokMinutes / 3),
      },
      {
        bundleId: bundleIds.youtube[0],
        appName: 'YouTube',
        minutes: youtubeMinutes,
        openCount: Math.round(youtubeMinutes / 4),
      },
      {
        bundleId: bundleIds.instagram[0],
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
 * Android-specific implementation using native module
 */
class AndroidScreenTimeService {
  private nativeModule: any = null;

  private async getNativeModule() {
    if (this.nativeModule) return this.nativeModule;

    try {
      // Dynamic import to avoid errors on iOS
      const module = await import('@stopshorts/screen-time-android');
      this.nativeModule = module.default;
      return this.nativeModule;
    } catch (error) {
      console.warn('[ScreenTime] Failed to load Android native module:', error);
      return null;
    }
  }

  async getPermissionStatus(): Promise<PermissionStatus> {
    const native = await this.getNativeModule();
    if (!native) {
      return {
        usageStats: false,
        overlay: false,
        familyControls: false,
        notifications: false,
      };
    }

    try {
      const status = await native.getPermissionStatus();
      return {
        usageStats: status.usageStats,
        overlay: status.overlay,
        familyControls: false, // iOS only
        notifications: status.notifications,
      };
    } catch (error) {
      console.error('[ScreenTime] Failed to get permission status:', error);
      return {
        usageStats: false,
        overlay: false,
        familyControls: false,
        notifications: false,
      };
    }
  }

  async openUsageStatsSettings(): Promise<void> {
    const native = await this.getNativeModule();
    if (native) {
      await native.openUsageStatsSettings();
    }
  }

  async openOverlaySettings(): Promise<void> {
    const native = await this.getNativeModule();
    if (native) {
      await native.openOverlaySettings();
    }
  }

  async getTodayUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<UsageData> {
    const native = await this.getNativeModule();
    if (!native) {
      // Return empty data instead of mock - native module required on Android
      console.error('[ScreenTime] Native module not available');
      return {
        totalMinutes: 0,
        apps: [],
        peakHours: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    try {
      // Get packages for selected apps only (respects user's onboarding selection)
      const selectedPackages = selectedApps.length > 0
        ? getSelectedPackages(selectedApps)
        : getTargetPackages(); // Fallback to all if none selected
      const packages = [...selectedPackages, ...customPackages];
      console.log('[ScreenTime] getTodayUsage - target packages:', packages);

      const stats = await native.getTodayUsage(packages);
      console.log('[ScreenTime] getTodayUsage - raw stats from native:', JSON.stringify(stats));

      // Return actual data even if empty - no mock fallback
      const apps: AppUsage[] = (stats || []).map((stat: any) => ({
        bundleId: stat.packageName,
        appName: stat.appName,
        minutes: Math.round(stat.totalTimeMs / 60000),
        openCount: 0, // UsageStats doesn't provide this
      }));

      console.log('[ScreenTime] getTodayUsage - mapped apps:', JSON.stringify(apps));

      const totalMinutes = apps.reduce((sum, app) => sum + app.minutes, 0);
      console.log('[ScreenTime] getTodayUsage - totalMinutes:', totalMinutes);

      return {
        totalMinutes,
        apps,
        peakHours: [], // Not implemented - return empty instead of hardcoded values
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[ScreenTime] Failed to get usage stats:', error);
      // Return empty data on error - no mock fallback
      return {
        totalMinutes: 0,
        apps: [],
        peakHours: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // Installed Apps Functions (Android only)
  // Note: iOS implementation pending - requires Family Controls Entitlement
  // ============================================

  /**
   * Get list of installed launcher apps (excludes system apps)
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    const native = await this.getNativeModule();
    if (!native) {
      return [];
    }

    try {
      const apps = await native.getInstalledApps();
      return apps as InstalledApp[];
    } catch (error) {
      console.error('[ScreenTime] Failed to get installed apps:', error);
      return [];
    }
  }

  /**
   * Get app icon as Base64 encoded string
   */
  async getAppIcon(packageName: string): Promise<string | null> {
    const native = await this.getNativeModule();
    if (!native) {
      return null;
    }

    try {
      return await native.getAppIcon(packageName);
    } catch (error) {
      console.error('[ScreenTime] Failed to get app icon:', error);
      return null;
    }
  }

  /**
   * Get app name for a package
   */
  async getAppName(packageName: string): Promise<string> {
    const native = await this.getNativeModule();
    if (!native) {
      return packageName;
    }

    try {
      return await native.getAppName(packageName);
    } catch (error) {
      console.error('[ScreenTime] Failed to get app name:', error);
      return packageName;
    }
  }

  /**
   * Check if an app is installed
   */
  async isAppInstalled(packageName: string): Promise<boolean> {
    const native = await this.getNativeModule();
    if (!native) {
      return false;
    }

    try {
      return await native.isAppInstalled(packageName);
    } catch (error) {
      console.error('[ScreenTime] Failed to check if app installed:', error);
      return false;
    }
  }

  // ============================================
  // Monitoring Service Control Functions
  // ============================================

  /**
   * Start monitoring target apps - shows check-in overlay when apps are detected
   */
  async startMonitoring(packageNames: string[]): Promise<boolean> {
    const native = await this.getNativeModule();
    if (!native) {
      return false;
    }

    try {
      return await native.startMonitoring(packageNames);
    } catch (error) {
      console.error('[ScreenTime] Failed to start monitoring:', error);
      return false;
    }
  }

  /**
   * Stop monitoring target apps
   */
  async stopMonitoring(): Promise<boolean> {
    const native = await this.getNativeModule();
    if (!native) {
      return false;
    }

    try {
      return await native.stopMonitoring();
    } catch (error) {
      console.error('[ScreenTime] Failed to stop monitoring:', error);
      return false;
    }
  }

  /**
   * Update target apps while monitoring is active
   */
  async updateTargetApps(packageNames: string[]): Promise<boolean> {
    const native = await this.getNativeModule();
    if (!native) {
      return false;
    }

    try {
      return await native.updateTargetApps(packageNames);
    } catch (error) {
      console.error('[ScreenTime] Failed to update target apps:', error);
      return false;
    }
  }

  /**
   * Check if monitoring service is currently running
   */
  async isMonitoringActive(): Promise<boolean> {
    const native = await this.getNativeModule();
    if (!native) {
      return false;
    }

    try {
      return await native.isMonitoringActive();
    } catch (error) {
      console.error('[ScreenTime] Failed to check monitoring status:', error);
      return false;
    }
  }

  /**
   * Get weekly usage statistics from native UsageStatsManager
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getWeeklyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<{
    weeklyTotal: number;
    dailyAverage: number;
    dailyBreakdown: { date: string; minutes: number }[];
  }> {
    const native = await this.getNativeModule();
    if (!native) {
      console.error('[ScreenTime] getWeeklyUsage - native module not available');
      return {
        weeklyTotal: 0,
        dailyAverage: 0,
        dailyBreakdown: [],
      };
    }

    try {
      // Get packages for selected apps only (respects user's onboarding selection)
      const selectedPackages = selectedApps.length > 0
        ? getSelectedPackages(selectedApps)
        : getTargetPackages(); // Fallback to all if none selected
      const packages = [...selectedPackages, ...customPackages];
      console.log('[ScreenTime] getWeeklyUsage - target packages:', packages);
      const dailyBreakdown: { date: string; minutes: number }[] = [];
      let weeklyTotal = 0;

      // Get usage for each day of the past week
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        try {
          const stats = await native.getUsageStats(
            startOfDay.getTime(),
            endOfDay.getTime(),
            packages
          );

          console.log(`[ScreenTime] getWeeklyUsage - ${dateStr} raw stats:`, JSON.stringify(stats));

          const dayMinutes = (stats || []).reduce((sum: number, stat: any) => {
            return sum + Math.round(stat.totalTimeMs / 60000);
          }, 0);

          console.log(`[ScreenTime] getWeeklyUsage - ${dateStr} minutes:`, dayMinutes);

          weeklyTotal += dayMinutes;
          dailyBreakdown.push({ date: dateStr, minutes: dayMinutes });
        } catch (dayError) {
          console.error(`[ScreenTime] getWeeklyUsage - ${dateStr} error:`, dayError);
          dailyBreakdown.push({ date: dateStr, minutes: 0 });
        }
      }

      console.log('[ScreenTime] getWeeklyUsage - weeklyTotal:', weeklyTotal, 'dailyBreakdown:', dailyBreakdown);

      return {
        weeklyTotal,
        dailyAverage: Math.round(weeklyTotal / 7),
        dailyBreakdown,
      };
    } catch (error) {
      console.error('[ScreenTime] Failed to get weekly usage:', error);
      return {
        weeklyTotal: 0,
        dailyAverage: 0,
        dailyBreakdown: [],
      };
    }
  }

  /**
   * Get monthly usage statistics from native UsageStatsManager
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getMonthlyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<{
    monthlyTotal: number;
    dailyAverage: number;
    weeklyAverage: number;
  }> {
    const native = await this.getNativeModule();
    if (!native) {
      console.error('[ScreenTime] getMonthlyUsage - native module not available');
      return {
        monthlyTotal: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
      };
    }

    try {
      // Get packages for selected apps only (respects user's onboarding selection)
      const selectedPackages = selectedApps.length > 0
        ? getSelectedPackages(selectedApps)
        : getTargetPackages(); // Fallback to all if none selected
      const packages = [...selectedPackages, ...customPackages];
      console.log('[ScreenTime] getMonthlyUsage - target packages:', packages);
      let monthlyTotal = 0;

      // Get usage for each day of the past 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        try {
          const stats = await native.getUsageStats(
            startOfDay.getTime(),
            endOfDay.getTime(),
            packages
          );

          const dayMinutes = (stats || []).reduce((sum: number, stat: any) => {
            return sum + Math.round(stat.totalTimeMs / 60000);
          }, 0);

          monthlyTotal += dayMinutes;
        } catch (dayError) {
          // Skip failed days
        }
      }

      console.log('[ScreenTime] getMonthlyUsage - monthlyTotal:', monthlyTotal);

      return {
        monthlyTotal,
        dailyAverage: Math.round(monthlyTotal / 30),
        weeklyAverage: Math.round(monthlyTotal / 4.3), // ~4.3 weeks per month
      };
    } catch (error) {
      console.error('[ScreenTime] Failed to get monthly usage:', error);
      return {
        monthlyTotal: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
      };
    }
  }
}

/**
 * Mock implementation for iOS and development
 */
class MockScreenTimeService {
  private mockAuthStatus: AuthorizationStatus = 'notDetermined';

  async getPermissionStatus(): Promise<PermissionStatus> {
    return {
      usageStats: this.mockAuthStatus === 'approved',
      overlay: false,
      familyControls: this.mockAuthStatus === 'approved',
      notifications: true,
    };
  }

  async requestAuthorization(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.mockAuthStatus = 'approved';
    return true;
  }

  async openUsageStatsSettings(): Promise<void> {
    console.log('[ScreenTime] openUsageStatsSettings is Android-only');
  }

  async openOverlaySettings(): Promise<void> {
    console.log('[ScreenTime] openOverlaySettings is Android-only');
  }

  async getTodayUsage(): Promise<UsageData> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateMockUsageData();
  }

  // ============================================
  // Installed Apps Functions (Stubs for iOS)
  // Note: iOS implementation pending - requires Family Controls Entitlement
  // ============================================

  async getInstalledApps(): Promise<InstalledApp[]> {
    // iOS: Will be implemented when Family Controls Entitlement is approved
    console.log('[ScreenTime] getInstalledApps requires Family Controls Entitlement on iOS');
    return [];
  }

  async getAppIcon(_packageName: string): Promise<string | null> {
    console.log('[ScreenTime] getAppIcon is Android-only');
    return null;
  }

  async getAppName(packageName: string): Promise<string> {
    console.log('[ScreenTime] getAppName is Android-only');
    return packageName;
  }

  async isAppInstalled(_packageName: string): Promise<boolean> {
    console.log('[ScreenTime] isAppInstalled is Android-only');
    return false;
  }

  // ============================================
  // Monitoring Service Control Functions (Stubs for iOS)
  // ============================================

  async startMonitoring(_packageNames: string[]): Promise<boolean> {
    console.log('[ScreenTime] startMonitoring is Android-only');
    return false;
  }

  async stopMonitoring(): Promise<boolean> {
    console.log('[ScreenTime] stopMonitoring is Android-only');
    return false;
  }

  async updateTargetApps(_packageNames: string[]): Promise<boolean> {
    console.log('[ScreenTime] updateTargetApps is Android-only');
    return false;
  }

  async isMonitoringActive(): Promise<boolean> {
    console.log('[ScreenTime] isMonitoringActive is Android-only');
    return false;
  }
}

/**
 * Unified Screen Time Service
 */
class ScreenTimeService {
  private androidService: AndroidScreenTimeService | null = null;
  private mockService: MockScreenTimeService = new MockScreenTimeService();

  constructor() {
    if (Platform.OS === 'android') {
      this.androidService = new AndroidScreenTimeService();
    }
  }

  /**
   * Check if using real native implementation
   */
  isNativeAvailable(): boolean {
    return Platform.OS === 'android';
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<PermissionStatus> {
    if (this.androidService) {
      return this.androidService.getPermissionStatus();
    }
    return this.mockService.getPermissionStatus();
  }

  /**
   * Open usage stats settings (Android only)
   */
  async openUsageStatsSettings(): Promise<void> {
    if (this.androidService) {
      await this.androidService.openUsageStatsSettings();
    } else {
      await this.mockService.openUsageStatsSettings();
    }
  }

  /**
   * Open overlay settings (Android only)
   */
  async openOverlaySettings(): Promise<void> {
    if (this.androidService) {
      await this.androidService.openOverlaySettings();
    } else {
      await this.mockService.openOverlaySettings();
    }
  }

  /**
   * Request Screen Time authorization (iOS) or check permissions (Android)
   */
  async requestAuthorization(): Promise<boolean> {
    if (this.androidService) {
      const status = await this.androidService.getPermissionStatus();
      return status.usageStats;
    }
    return this.mockService.requestAuthorization();
  }

  /**
   * Get current authorization status
   */
  async getAuthorizationStatus(): Promise<AuthorizationStatus> {
    const status = await this.getPermissionStatus();
    if (status.usageStats || status.familyControls) {
      return 'approved';
    }
    return 'notDetermined';
  }

  /**
   * Check if Screen Time is available
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'android') {
      return true; // Android 8.0+ is required, handled at module level
    }
    return Platform.OS === 'ios' || __DEV__;
  }

  /**
   * Get usage data for today
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getTodayUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<UsageData> {
    if (this.androidService) {
      return this.androidService.getTodayUsage(selectedApps, customPackages);
    }
    return this.mockService.getTodayUsage();
  }

  /**
   * Get usage data for a date range (mock for now)
   */
  async getUsageData(_startDate: Date, _endDate: Date): Promise<UsageData> {
    return this.getTodayUsage();
  }

  /**
   * Get weekly usage statistics
   * Android: Uses real data from UsageStatsManager
   * iOS: Uses mock data (pending Family Controls)
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getWeeklyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<{
    weeklyTotal: number;
    dailyAverage: number;
    dailyBreakdown: { date: string; minutes: number }[];
  }> {
    if (this.androidService) {
      return this.androidService.getWeeklyUsage(selectedApps, customPackages);
    }

    // iOS: Use mock data (pending Family Controls)
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateWeeklyMockData();
  }

  /**
   * Get monthly usage statistics (past 30 days)
   * Android: Uses real data from UsageStatsManager
   * iOS: Uses mock data (pending Family Controls)
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getMonthlyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<{
    monthlyTotal: number;
    dailyAverage: number;
    weeklyAverage: number;
  }> {
    if (this.androidService) {
      return this.androidService.getMonthlyUsage(selectedApps, customPackages);
    }

    // iOS: Use mock data (pending Family Controls)
    await new Promise((resolve) => setTimeout(resolve, 300));
    const weeklyData = generateWeeklyMockData();
    return {
      monthlyTotal: weeklyData.weeklyTotal * 4.3, // Approximate monthly from weekly
      dailyAverage: weeklyData.dailyAverage,
      weeklyAverage: weeklyData.weeklyTotal,
    };
  }

  /**
   * Subscribe to usage updates
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

  /**
   * Set shielded apps (iOS only, mock)
   */
  async setShieldedApps(bundleIds: string[]): Promise<boolean> {
    console.log('[ScreenTime] Setting shielded apps:', bundleIds);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }

  /**
   * Remove shields from all apps (iOS only, mock)
   */
  async unshieldApps(): Promise<boolean> {
    console.log('[ScreenTime] Removing shields from all apps');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }

  // ============================================
  // Installed Apps Functions (Android only)
  // Note: iOS implementation pending - requires Family Controls Entitlement
  // ============================================

  /**
   * Get list of installed launcher apps (excludes system apps)
   * Android only - iOS requires Family Controls Entitlement
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (this.androidService) {
      return this.androidService.getInstalledApps();
    }
    return this.mockService.getInstalledApps();
  }

  /**
   * Get app icon as Base64 encoded string
   * Android only
   */
  async getAppIcon(packageName: string): Promise<string | null> {
    if (this.androidService) {
      return this.androidService.getAppIcon(packageName);
    }
    return this.mockService.getAppIcon(packageName);
  }

  /**
   * Get app name for a package
   * Android only
   */
  async getAppName(packageName: string): Promise<string> {
    if (this.androidService) {
      return this.androidService.getAppName(packageName);
    }
    return this.mockService.getAppName(packageName);
  }

  /**
   * Check if an app is installed
   * Android only
   */
  async isAppInstalled(packageName: string): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.isAppInstalled(packageName);
    }
    return this.mockService.isAppInstalled(packageName);
  }

  // ============================================
  // Monitoring Service Control Functions
  // ============================================

  /**
   * Start monitoring target apps - shows check-in overlay when apps are detected
   * Android only - requires SYSTEM_ALERT_WINDOW and USAGE_STATS permissions
   */
  async startMonitoring(packageNames: string[]): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.startMonitoring(packageNames);
    }
    return this.mockService.startMonitoring(packageNames);
  }

  /**
   * Stop monitoring target apps
   * Android only
   */
  async stopMonitoring(): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.stopMonitoring();
    }
    return this.mockService.stopMonitoring();
  }

  /**
   * Update target apps while monitoring is active
   * Android only
   */
  async updateTargetApps(packageNames: string[]): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.updateTargetApps(packageNames);
    }
    return this.mockService.updateTargetApps(packageNames);
  }

  /**
   * Check if monitoring service is currently running
   * Android only
   */
  async isMonitoringActive(): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.isMonitoringActive();
    }
    return this.mockService.isMonitoringActive();
  }
}

// Export singleton instance
export const screenTimeService = new ScreenTimeService();

// Export for backward compatibility
export const MANAGED_APP_BUNDLE_IDS = {
  tiktok: TARGET_APPS[Platform.OS === 'android' ? 'android' : 'ios'].tiktok[0],
  youtubeShorts: TARGET_APPS[Platform.OS === 'android' ? 'android' : 'ios'].youtube[0],
  instagramReels: TARGET_APPS[Platform.OS === 'android' ? 'android' : 'ios'].instagram[0],
};
