/**
 * Screen Time Module
 * Cross-platform interface for screen time tracking
 * - iOS: Uses Family Controls API via native module
 * - Android: Uses UsageStatsManager via native module
 */

import { Platform } from 'react-native';
import * as IOSScreenTime from '../../modules/screen-time';
import { AndroidScreenTimeService } from './ScreenTimeModule.android';
import { IOSScreenTimeService } from './ScreenTimeModule.ios';

// Re-export types
export type {
  AuthorizationStatus,
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
  InterventionSettings,
} from './ScreenTimeModule.types';

export { TARGET_APPS, TARGET_APP_ID_TO_KEY } from './ScreenTimeModule.types';

// Re-export utility functions
export { getTargetPackages, getSelectedPackages } from './ScreenTimeModule.utils';

// Re-export iOS-specific types for consumers that need them
export type {
  FamilyActivityPickerOptions,
  FamilyActivityPickerResult,
  InterventionEvent,
  SelectionSummary,
} from './ScreenTimeModule.ios';

import type { TargetAppId } from '../types';
import type {
  AuthorizationStatus,
  PermissionStatus,
  UsageData,
  WeeklyUsageResult,
  MonthlyUsageResult,
  MonthlyUsageWithAppsResult,
  UsageStatsForRangeResult,
  InstalledApp,
} from './ScreenTimeModule.types';

/**
 * Unified Screen Time Service
 * Delegates to platform-specific implementations
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
  async getWeeklyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<WeeklyUsageResult> {
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
  async getMonthlyUsage(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<MonthlyUsageResult> {
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
  async getMonthlyUsageWithApps(selectedApps: TargetAppId[] = [], customPackages: string[] = []): Promise<MonthlyUsageWithAppsResult> {
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
  ): Promise<UsageStatsForRangeResult[]> {
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
import { TARGET_APPS } from './ScreenTimeModule.types';
export const MANAGED_APP_BUNDLE_IDS = {
  tiktok: TARGET_APPS[Platform.OS === 'android' ? 'android' : 'ios'].tiktok[0],
  youtubeShorts: TARGET_APPS[Platform.OS === 'android' ? 'android' : 'ios'].youtube[0],
  instagramReels: TARGET_APPS[Platform.OS === 'android' ? 'android' : 'ios'].instagram[0],
};
