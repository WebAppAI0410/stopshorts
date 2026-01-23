/**
 * Screen Time Module
 * Cross-platform interface for screen time tracking
 * - iOS: Uses Family Controls API via native module
 * - Android: Uses UsageStatsManager via native module
 */

import { Platform } from 'react-native';
import * as IOSScreenTime from '../../modules/screen-time';
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

export interface UsageStat {
  packageName: string;
  appName?: string;
  totalTimeMs: number;
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

// Android native module type (dynamically imported)
interface AndroidScreenTimeNativeModule {
  getPermissionStatus(): Promise<{ usageStats: boolean; overlay: boolean; notifications: boolean }>;
  openUsageStatsSettings(): Promise<void>;
  openOverlaySettings(): Promise<void>;
  getTodayUsage(packages: string[]): Promise<UsageStat[]>;
  getUsageStats(startTime: number, endTime: number, packages: string[]): Promise<UsageStat[]>;
  getInstalledApps(): Promise<InstalledApp[]>;
  getAppIcon(packageName: string): Promise<string | null>;
  getAppName(packageName: string): Promise<string>;
  isAppInstalled(packageName: string): Promise<boolean>;
  startMonitoring(packageNames: string[]): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  updateTargetApps(packageNames: string[]): Promise<boolean>;
  isMonitoringActive(): Promise<boolean>;
  setInterventionSettings(timing: string, delayMinutes: number): Promise<boolean>;
  getInterventionSettings(): Promise<{ timing: string; delayMinutes: number }>;
}

/**
 * Android-specific implementation using native module
 */
class AndroidScreenTimeService {
  private nativeModule: AndroidScreenTimeNativeModule | null = null;

  private async getNativeModule(): Promise<AndroidScreenTimeNativeModule | null> {
    if (this.nativeModule) return this.nativeModule;

    try {
      // Dynamic import to avoid errors on iOS
      const module = await import('@stopshorts/screen-time-android');
      this.nativeModule = module.default as AndroidScreenTimeNativeModule;
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
      if (__DEV__) console.log('[ScreenTime] getTodayUsage - target packages:', packages);

      const stats = await native.getTodayUsage(packages);
      if (__DEV__) console.log('[ScreenTime] getTodayUsage - raw stats from native:', JSON.stringify(stats));

      // Return actual data even if empty - no mock fallback
      const apps: AppUsage[] = (stats || []).map((stat: UsageStat) => ({
        bundleId: stat.packageName,
        appName: stat.appName || stat.packageName,
        minutes: Math.round(stat.totalTimeMs / 60000),
        openCount: 0, // UsageStats doesn't provide this
      }));

      if (__DEV__) console.log('[ScreenTime] getTodayUsage - mapped apps:', JSON.stringify(apps));

      const totalMinutes = apps.reduce((sum, app) => sum + app.minutes, 0);
      if (__DEV__) console.log('[ScreenTime] getTodayUsage - totalMinutes:', totalMinutes);

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
   * Set intervention settings (timing mode and delay)
   * @param timing "immediate" or "delayed"
   * @param delayMinutes 5, 10, or 15
   */
  async setInterventionSettings(timing: 'immediate' | 'delayed', delayMinutes: 5 | 10 | 15): Promise<boolean> {
    const native = await this.getNativeModule();
    if (!native) {
      return false;
    }

    try {
      return await native.setInterventionSettings(timing, delayMinutes);
    } catch (error) {
      console.error('[ScreenTime] Failed to set intervention settings:', error);
      return false;
    }
  }

  /**
   * Get current intervention settings
   */
  async getInterventionSettings(): Promise<{ timing: string; delayMinutes: number } | null> {
    const native = await this.getNativeModule();
    if (!native) {
      return null;
    }

    try {
      return await native.getInterventionSettings();
    } catch (error) {
      console.error('[ScreenTime] Failed to get intervention settings:', error);
      return null;
    }
  }

  /**
   * Get usage stats for a specific date range with per-app breakdown
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getUsageStatsForRange(
    startDate: Date,
    endDate: Date,
    selectedApps: TargetAppId[] = [],
    customPackages: string[] = []
  ): Promise<Array<{ packageName: string; appName: string; totalTimeMs: number }>> {
    const native = await this.getNativeModule();
    if (!native) {
      console.error('[ScreenTime] getUsageStatsForRange - native module not available');
      return [];
    }

    try {
      const selectedPackages = selectedApps.length > 0
        ? getSelectedPackages(selectedApps)
        : getTargetPackages();
      const packages = [...new Set([...selectedPackages, ...customPackages])];
      if (__DEV__) console.log('[ScreenTime] getUsageStatsForRange - target packages:', packages);

      const stats = await native.getUsageStats(
        startDate.getTime(),
        endDate.getTime(),
        packages
      );

      if (__DEV__) console.log('[ScreenTime] getUsageStatsForRange - raw stats:', JSON.stringify(stats));

      return (stats || []).map((stat: UsageStat) => ({
        packageName: stat.packageName,
        appName: stat.appName || stat.packageName,
        totalTimeMs: stat.totalTimeMs || 0,
      }));
    } catch (error) {
      console.error('[ScreenTime] Failed to get usage stats for range:', error);
      return [];
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
      if (__DEV__) console.log('[ScreenTime] getWeeklyUsage - target packages:', packages);
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

          if (__DEV__) console.log(`[ScreenTime] getWeeklyUsage - ${dateStr} raw stats:`, JSON.stringify(stats));

          const dayMinutes = (stats || []).reduce((sum: number, stat: UsageStat) => {
            return sum + Math.round(stat.totalTimeMs / 60000);
          }, 0);

          if (__DEV__) console.log(`[ScreenTime] getWeeklyUsage - ${dateStr} minutes:`, dayMinutes);

          weeklyTotal += dayMinutes;
          dailyBreakdown.push({ date: dateStr, minutes: dayMinutes });
        } catch (dayError) {
          console.error(`[ScreenTime] getWeeklyUsage - ${dateStr} error:`, dayError);
          dailyBreakdown.push({ date: dateStr, minutes: 0 });
        }
      }

      if (__DEV__) console.log('[ScreenTime] getWeeklyUsage - weeklyTotal:', weeklyTotal, 'dailyBreakdown:', dailyBreakdown);

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
      if (__DEV__) console.log('[ScreenTime] getMonthlyUsage - target packages:', packages);
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

          const dayMinutes = (stats || []).reduce((sum: number, stat: UsageStat) => {
            return sum + Math.round(stat.totalTimeMs / 60000);
          }, 0);

          monthlyTotal += dayMinutes;
        } catch (dayError) {
          // Skip failed days
        }
      }

      if (__DEV__) console.log('[ScreenTime] getMonthlyUsage - monthlyTotal:', monthlyTotal);

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

  /**
   * Get monthly usage with per-app breakdown from native UsageStatsManager
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getMonthlyUsageWithApps(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<{
    monthlyTotal: number;
    dailyAverage: number;
    weeklyAverage: number;
    apps: AppUsage[];
  }> {
    const native = await this.getNativeModule();
    if (!native) {
      console.error('[ScreenTime] getMonthlyUsageWithApps - native module not available');
      return {
        monthlyTotal: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        apps: [],
      };
    }

    try {
      // Get packages for selected apps only (respects user's onboarding selection)
      const selectedPackages = selectedApps.length > 0
        ? getSelectedPackages(selectedApps)
        : getTargetPackages(); // Fallback to all if none selected
      const packages = [...selectedPackages, ...customPackages];
      if (__DEV__) console.log('[ScreenTime] getMonthlyUsageWithApps - target packages:', packages);

      // Accumulate per-app usage over 30 days
      const appUsageMap: Record<string, { appName: string; totalMs: number }> = {};
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

          for (const stat of (stats || [])) {
            const packageName = stat.packageName;
            const timeMs = stat.totalTimeMs || 0;

            if (!appUsageMap[packageName]) {
              appUsageMap[packageName] = {
                appName: stat.appName || packageName,
                totalMs: 0,
              };
            }
            appUsageMap[packageName].totalMs += timeMs;
            monthlyTotal += Math.round(timeMs / 60000);
          }
        } catch (dayError) {
          // Skip failed days
        }
      }

      // Convert to AppUsage array
      const apps: AppUsage[] = Object.entries(appUsageMap)
        .filter(([_, data]) => data.totalMs > 0)
        .map(([bundleId, data]) => ({
          bundleId,
          appName: data.appName,
          minutes: Math.round(data.totalMs / 60000),
          openCount: 0, // Not tracked for monthly aggregate
        }))
        .sort((a, b) => b.minutes - a.minutes); // Sort by usage descending

      if (__DEV__) console.log('[ScreenTime] getMonthlyUsageWithApps - monthlyTotal:', monthlyTotal, 'apps:', apps.length);

      return {
        monthlyTotal,
        dailyAverage: Math.round(monthlyTotal / 30),
        weeklyAverage: Math.round(monthlyTotal / 4.3),
        apps,
      };
    } catch (error) {
      console.error('[ScreenTime] Failed to get monthly usage with apps:', error);
      return {
        monthlyTotal: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        apps: [],
      };
    }
  }

}

/**
 * iOS implementation using Family Controls API
 * Uses real native module - no mock data
 */
class IOSScreenTimeService {
  /**
   * Get permission status for iOS
   */
  async getPermissionStatus(): Promise<PermissionStatus> {
    const status = IOSScreenTime.getAuthorizationStatus();
    const isApproved = status === 'approved';

    return {
      usageStats: isApproved,
      overlay: false, // iOS doesn't have overlay concept
      familyControls: isApproved,
      notifications: true, // Handled separately on iOS
    };
  }

  /**
   * Request Family Controls authorization
   */
  async requestAuthorization(): Promise<boolean> {
    const result = await IOSScreenTime.requestAuthorization();
    return result.success;
  }

  /**
   * Not applicable on iOS
   */
  async openUsageStatsSettings(): Promise<void> {
    console.log('[ScreenTime] openUsageStatsSettings is Android-only');
  }

  /**
   * Not applicable on iOS
   */
  async openOverlaySettings(): Promise<void> {
    console.log('[ScreenTime] openOverlaySettings is Android-only');
  }

  /**
   * Get today's usage based on threshold counting
   * Note: iOS cannot directly query usage stats like Android
   */
  async getTodayUsage(): Promise<UsageData> {
    const estimated = IOSScreenTime.getEstimatedUsage();

    return {
      totalMinutes: estimated.estimatedMinutes,
      apps: [], // iOS doesn't provide per-app breakdown
      peakHours: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  // ============================================
  // Installed Apps Functions
  // iOS uses FamilyActivityPicker for app selection
  // ============================================

  async getInstalledApps(): Promise<InstalledApp[]> {
    // iOS: Use FamilyActivityPicker instead
    console.log('[ScreenTime] iOS uses FamilyActivityPicker for app selection');
    return [];
  }

  async getAppIcon(_packageName: string): Promise<string | null> {
    // iOS: App icons not accessible via Family Controls
    return null;
  }

  async getAppName(_packageName: string): Promise<string> {
    // iOS: App names not directly accessible
    return _packageName;
  }

  async isAppInstalled(_packageName: string): Promise<boolean> {
    // iOS: Cannot check directly, use FamilyActivityPicker
    return false;
  }

  // ============================================
  // Monitoring Service Control Functions
  // ============================================

  async startMonitoring(_packageNames: string[]): Promise<boolean> {
    // iOS: Package names are ignored - uses FamilyActivitySelection from App Groups
    const result = await IOSScreenTime.startMonitoring();
    return result.success;
  }

  async stopMonitoring(): Promise<boolean> {
    const result = await IOSScreenTime.stopMonitoring();
    return result.success;
  }

  async updateTargetApps(_packageNames: string[]): Promise<boolean> {
    // iOS: Update is done via FamilyActivityPicker and saved to App Groups
    console.log('[ScreenTime] iOS uses FamilyActivityPicker for target app updates');
    return false;
  }

  async isMonitoringActive(): Promise<boolean> {
    return IOSScreenTime.isMonitoringActive();
  }

  async setInterventionSettings(timing: string, delayMinutes: number): Promise<boolean> {
    return IOSScreenTime.setInterventionSettings(
      timing as 'immediate' | 'delayed',
      delayMinutes
    );
  }

  async getInterventionSettings(): Promise<{ timing: string; delayMinutes: number } | null> {
    return IOSScreenTime.getInterventionSettings();
  }

  /**
   * Get monthly usage based on threshold counting
   * Note: iOS can only track current day usage via threshold counting
   */
  async getMonthlyUsageWithApps(): Promise<{
    monthlyTotal: number;
    dailyAverage: number;
    weeklyAverage: number;
    apps: AppUsage[];
  }> {
    // iOS limitation: Cannot get historical usage data
    // Return today's estimated usage as the only data point
    const estimated = IOSScreenTime.getEstimatedUsage();

    return {
      monthlyTotal: estimated.estimatedMinutes, // Today only
      dailyAverage: estimated.estimatedMinutes,
      weeklyAverage: estimated.estimatedMinutes * 7,
      apps: [], // iOS doesn't provide per-app breakdown
    };
  }

  async getUsageStatsForRange(): Promise<Array<{ packageName: string; appName: string; totalTimeMs: number }>> {
    // iOS limitation: Cannot get historical per-app data
    return [];
  }

  async getWeeklyUsage(): Promise<{
    weeklyTotal: number;
    dailyAverage: number;
    dailyBreakdown: { date: string; minutes: number }[];
  }> {
    // iOS limitation: Only today's data is available via threshold counting
    const estimated = IOSScreenTime.getEstimatedUsage();
    const today = new Date().toISOString().split('T')[0];

    return {
      weeklyTotal: estimated.estimatedMinutes,
      dailyAverage: estimated.estimatedMinutes,
      dailyBreakdown: [{ date: today, minutes: estimated.estimatedMinutes }],
    };
  }

  async getMonthlyUsage(): Promise<{
    monthlyTotal: number;
    dailyAverage: number;
    weeklyAverage: number;
  }> {
    const estimated = IOSScreenTime.getEstimatedUsage();

    return {
      monthlyTotal: estimated.estimatedMinutes,
      dailyAverage: estimated.estimatedMinutes,
      weeklyAverage: estimated.estimatedMinutes * 7,
    };
  }

  // ============================================
  // iOS-specific methods
  // ============================================

  /**
   * Check if urge surfing was requested from Shield
   */
  consumeUrgeSurfingRequest(): boolean {
    return IOSScreenTime.consumeUrgeSurfingRequest();
  }

  /**
   * Poll for intervention events from Shield
   */
  pollInterventionEvents(): IOSScreenTime.InterventionEvent[] {
    return IOSScreenTime.pollInterventionEvents();
  }

  /**
   * Get selection summary
   */
  getSelectionSummary(): IOSScreenTime.SelectionSummary {
    return IOSScreenTime.getSelectionSummary();
  }

  /**
   * Present FamilyActivityPicker to select apps
   */
  async presentFamilyActivityPicker(
    options?: IOSScreenTime.FamilyActivityPickerOptions
  ): Promise<IOSScreenTime.FamilyActivityPickerResult> {
    return IOSScreenTime.presentFamilyActivityPicker(options);
  }

  /**
   * Check if shield is in cooldown
   */
  isInShieldCooldown(): boolean {
    return IOSScreenTime.isInShieldCooldown();
  }

  /**
   * Set shield cooldown
   */
  setShieldCooldown(seconds: number): void {
    IOSScreenTime.setShieldCooldown(seconds);
  }
}

/**
 * Unified Screen Time Service
 */
class ScreenTimeService {
  private androidService: AndroidScreenTimeService | null = null;
  private iosService: IOSScreenTimeService | null = null;

  constructor() {
    if (Platform.OS === 'android') {
      this.androidService = new AndroidScreenTimeService();
    } else if (Platform.OS === 'ios') {
      this.iosService = new IOSScreenTimeService();
    }
  }

  /**
   * Check if using real native implementation
   */
  isNativeAvailable(): boolean {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<PermissionStatus> {
    if (this.androidService) {
      return this.androidService.getPermissionStatus();
    }
    if (this.iosService) {
      return this.iosService.getPermissionStatus();
    }
    return {
      usageStats: false,
      overlay: false,
      familyControls: false,
      notifications: false,
    };
  }

  /**
   * Open usage stats settings (Android only)
   */
  async openUsageStatsSettings(): Promise<void> {
    if (this.androidService) {
      await this.androidService.openUsageStatsSettings();
    } else if (this.iosService) {
      await this.iosService.openUsageStatsSettings();
    }
  }

  /**
   * Open overlay settings (Android only)
   */
  async openOverlaySettings(): Promise<void> {
    if (this.androidService) {
      await this.androidService.openOverlaySettings();
    } else if (this.iosService) {
      await this.iosService.openOverlaySettings();
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
    if (this.iosService) {
      return this.iosService.requestAuthorization();
    }
    return false;
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
    if (Platform.OS === 'ios') {
      return IOSScreenTime.isAvailable();
    }
    return __DEV__;
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
    if (this.iosService) {
      return this.iosService.getTodayUsage();
    }
    return {
      totalMinutes: 0,
      apps: [],
      peakHours: [],
      lastUpdated: new Date().toISOString(),
    };
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
   * iOS: Uses threshold counting (limited to today's data)
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

    if (this.iosService) {
      return this.iosService.getWeeklyUsage();
    }

    return {
      weeklyTotal: 0,
      dailyAverage: 0,
      dailyBreakdown: [],
    };
  }

  /**
   * Get monthly usage statistics (past 30 days)
   * Android: Uses real data from UsageStatsManager
   * iOS: Uses threshold counting (limited to today's data)
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

    if (this.iosService) {
      return this.iosService.getMonthlyUsage();
    }

    return {
      monthlyTotal: 0,
      dailyAverage: 0,
      weeklyAverage: 0,
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
    if (__DEV__) console.log('[ScreenTime] Setting shielded apps:', bundleIds);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }

  /**
   * Remove shields from all apps (iOS only, mock)
   */
  async unshieldApps(): Promise<boolean> {
    if (__DEV__) console.log('[ScreenTime] Removing shields from all apps');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }

  // ============================================
  // Installed Apps Functions (Android only)
  // Note: iOS implementation pending - requires Family Controls Entitlement
  // ============================================

  /**
   * Get list of installed launcher apps (excludes system apps)
   * Android: Uses PackageManager
   * iOS: Uses FamilyActivityPicker (not direct list)
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (this.androidService) {
      return this.androidService.getInstalledApps();
    }
    if (this.iosService) {
      return this.iosService.getInstalledApps();
    }
    return [];
  }

  /**
   * Get app icon as Base64 encoded string
   * Android only
   */
  async getAppIcon(packageName: string): Promise<string | null> {
    if (this.androidService) {
      return this.androidService.getAppIcon(packageName);
    }
    if (this.iosService) {
      return this.iosService.getAppIcon(packageName);
    }
    return null;
  }

  /**
   * Get app name for a package
   * Android only
   */
  async getAppName(packageName: string): Promise<string> {
    if (this.androidService) {
      return this.androidService.getAppName(packageName);
    }
    if (this.iosService) {
      return this.iosService.getAppName(packageName);
    }
    return packageName;
  }

  /**
   * Check if an app is installed
   * Android only
   */
  async isAppInstalled(packageName: string): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.isAppInstalled(packageName);
    }
    if (this.iosService) {
      return this.iosService.isAppInstalled(packageName);
    }
    return false;
  }

  // ============================================
  // Monitoring Service Control Functions
  // ============================================

  /**
   * Start monitoring target apps - shows check-in overlay when apps are detected
   * Android: Uses ForegroundService with overlay
   * iOS: Uses DeviceActivityMonitor extension
   */
  async startMonitoring(packageNames: string[]): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.startMonitoring(packageNames);
    }
    if (this.iosService) {
      return this.iosService.startMonitoring(packageNames);
    }
    return false;
  }

  /**
   * Stop monitoring target apps
   */
  async stopMonitoring(): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.stopMonitoring();
    }
    if (this.iosService) {
      return this.iosService.stopMonitoring();
    }
    return false;
  }

  /**
   * Update target apps while monitoring is active
   */
  async updateTargetApps(packageNames: string[]): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.updateTargetApps(packageNames);
    }
    if (this.iosService) {
      return this.iosService.updateTargetApps(packageNames);
    }
    return false;
  }

  /**
   * Check if monitoring service is currently running
   */
  async isMonitoringActive(): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.isMonitoringActive();
    }
    if (this.iosService) {
      return this.iosService.isMonitoringActive();
    }
    return false;
  }

  /**
   * Set intervention settings (timing mode and delay)
   * @param timing "immediate" or "delayed"
   * @param delayMinutes 5, 10, or 15
   */
  async setInterventionSettings(timing: 'immediate' | 'delayed', delayMinutes: 5 | 10 | 15): Promise<boolean> {
    if (this.androidService) {
      return this.androidService.setInterventionSettings(timing, delayMinutes);
    }
    if (this.iosService) {
      return this.iosService.setInterventionSettings(timing, delayMinutes);
    }
    return false;
  }

  /**
   * Get current intervention settings
   */
  async getInterventionSettings(): Promise<{ timing: string; delayMinutes: number } | null> {
    if (this.androidService) {
      return this.androidService.getInterventionSettings();
    }
    if (this.iosService) {
      return this.iosService.getInterventionSettings();
    }
    return null;
  }

  /**
   * Get monthly usage with per-app breakdown
   * Android: Uses real data from UsageStatsManager
   * iOS: Uses threshold counting (limited to today's data, no app breakdown)
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getMonthlyUsageWithApps(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<{
    monthlyTotal: number;
    dailyAverage: number;
    weeklyAverage: number;
    apps: AppUsage[];
  }> {
    if (this.androidService) {
      return this.androidService.getMonthlyUsageWithApps(selectedApps, customPackages);
    }
    if (this.iosService) {
      return this.iosService.getMonthlyUsageWithApps();
    }
    return {
      monthlyTotal: 0,
      dailyAverage: 0,
      weeklyAverage: 0,
      apps: [],
    };
  }

  /**
   * Get raw usage stats for a date range (per app)
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @param selectedApps - Array of TargetAppId that user has selected
   * @param customPackages - Additional package names to include (e.g., user-added apps)
   */
  async getUsageStatsForRange(
    startDate: Date,
    endDate: Date,
    selectedApps: TargetAppId[] = [],
    customPackages: string[] = []
  ): Promise<Array<{ packageName: string; appName: string; totalTimeMs: number }>> {
    if (this.androidService) {
      return this.androidService.getUsageStatsForRange(
        startDate,
        endDate,
        selectedApps,
        customPackages
      );
    }
    if (this.iosService) {
      return this.iosService.getUsageStatsForRange();
    }
    return [];
  }

  // ============================================
  // iOS-specific methods
  // ============================================

  /**
   * Check if urge surfing was requested from Shield (iOS only)
   */
  consumeUrgeSurfingRequest(): boolean {
    if (this.iosService) {
      return this.iosService.consumeUrgeSurfingRequest();
    }
    return false;
  }

  /**
   * Poll for intervention events from Shield (iOS only)
   */
  pollInterventionEvents(): IOSScreenTime.InterventionEvent[] {
    if (this.iosService) {
      return this.iosService.pollInterventionEvents();
    }
    return [];
  }

  /**
   * Get selection summary (iOS only)
   */
  getSelectionSummary(): IOSScreenTime.SelectionSummary {
    if (this.iosService) {
      return this.iosService.getSelectionSummary();
    }
    return {
      applicationCount: 0,
      categoryCount: 0,
      webDomainCount: 0,
      isEmpty: true,
      totalCount: 0,
    };
  }

  /**
   * Present FamilyActivityPicker to select apps (iOS only)
   */
  async presentFamilyActivityPicker(
    options?: IOSScreenTime.FamilyActivityPickerOptions
  ): Promise<IOSScreenTime.FamilyActivityPickerResult> {
    if (this.iosService) {
      return this.iosService.presentFamilyActivityPicker(options);
    }
    return {
      success: false,
      error: 'FamilyActivityPicker is only available on iOS',
    };
  }

  /**
   * Check if shield is in cooldown (iOS only)
   */
  isInShieldCooldown(): boolean {
    if (this.iosService) {
      return this.iosService.isInShieldCooldown();
    }
    return false;
  }

  /**
   * Set shield cooldown (iOS only)
   */
  setShieldCooldown(seconds: number): void {
    if (this.iosService) {
      this.iosService.setShieldCooldown(seconds);
    }
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
