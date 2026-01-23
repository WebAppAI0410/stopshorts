/**
 * Screen Time Module - Android Implementation
 * Uses UsageStatsManager via native module (@stopshorts/screen-time-android)
 */

import type { TargetAppId } from '../types';
import type {
  PermissionStatus,
  AppUsage,
  UsageData,
  UsageStat,
  InstalledApp,
  IScreenTimeService,
  WeeklyUsageResult,
  MonthlyUsageResult,
  MonthlyUsageWithAppsResult,
  UsageStatsForRangeResult,
} from './ScreenTimeModule.types';
import { getTargetPackages, getSelectedPackages, createEmptyUsageData, createEmptyPermissionStatus } from './ScreenTimeModule.utils';

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
export class AndroidScreenTimeService implements IScreenTimeService {
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
      return createEmptyPermissionStatus();
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
      return createEmptyPermissionStatus();
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
      return createEmptyUsageData();
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
      return createEmptyUsageData();
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
  ): Promise<UsageStatsForRangeResult[]> {
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
  async getWeeklyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<WeeklyUsageResult> {
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
  async getMonthlyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<MonthlyUsageResult> {
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
        } catch {
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
  async getMonthlyUsageWithApps(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<MonthlyUsageWithAppsResult> {
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
        } catch {
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
