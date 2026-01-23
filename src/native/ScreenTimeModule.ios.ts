/**
 * Screen Time Module - iOS Implementation
 * Uses Family Controls API via native module (modules/screen-time)
 */

import * as IOSScreenTime from '../../modules/screen-time';
import type {
  PermissionStatus,
  UsageData,
  InstalledApp,
  IScreenTimeService,
  WeeklyUsageResult,
  MonthlyUsageResult,
  MonthlyUsageWithAppsResult,
  UsageStatsForRangeResult,
} from './ScreenTimeModule.types';

// Re-export iOS-specific types for external use
export type {
  FamilyActivityPickerOptions,
  FamilyActivityPickerResult,
  InterventionEvent,
  SelectionSummary,
} from '../../modules/screen-time';

/**
 * iOS implementation using Family Controls API
 * Uses real native module - no mock data
 */
export class IOSScreenTimeService implements IScreenTimeService {
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

  async setInterventionSettings(timing: 'immediate' | 'delayed', delayMinutes: 5 | 10 | 15): Promise<boolean> {
    return IOSScreenTime.setInterventionSettings(timing, delayMinutes);
  }

  async getInterventionSettings(): Promise<{ timing: string; delayMinutes: number } | null> {
    return IOSScreenTime.getInterventionSettings();
  }

  /**
   * Get monthly usage based on threshold counting
   * Note: iOS can only track current day usage via threshold counting
   */
  async getMonthlyUsageWithApps(): Promise<MonthlyUsageWithAppsResult> {
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

  async getUsageStatsForRange(): Promise<UsageStatsForRangeResult[]> {
    // iOS limitation: Cannot get historical per-app data
    return [];
  }

  async getWeeklyUsage(): Promise<WeeklyUsageResult> {
    // iOS limitation: Only today's data is available via threshold counting
    const estimated = IOSScreenTime.getEstimatedUsage();
    const today = new Date().toISOString().split('T')[0];

    return {
      weeklyTotal: estimated.estimatedMinutes,
      dailyAverage: estimated.estimatedMinutes,
      dailyBreakdown: [{ date: today, minutes: estimated.estimatedMinutes }],
    };
  }

  async getMonthlyUsage(): Promise<MonthlyUsageResult> {
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
