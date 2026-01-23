/**
 * Screen Time Module - Type Definitions
 * Shared types for cross-platform screen time tracking
 */

import type { TargetAppId } from '../types';

// Authorization status
export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved' | 'unknown';

// Permission status for both platforms
export interface PermissionStatus {
  usageStats: boolean;
  overlay: boolean;
  familyControls: boolean;
  notifications: boolean;
}

// Individual app usage data
export interface AppUsage {
  bundleId: string;
  appName: string;
  minutes: number;
  openCount: number;
}

// Usage data summary
export interface UsageData {
  totalMinutes: number;
  apps: AppUsage[];
  peakHours: string[];
  lastUpdated: string;
}

// Usage stat from native module
export interface UsageStat {
  packageName: string;
  appName?: string;
  totalTimeMs: number;
}

/**
 * Installed app information
 * Android: Uses PackageManager
 * iOS: Uses FamilyActivityPicker (not direct list)
 */
export interface InstalledApp {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  category: string;
}

// Weekly usage result
export interface WeeklyUsageResult {
  weeklyTotal: number;
  dailyAverage: number;
  dailyBreakdown: { date: string; minutes: number }[];
}

// Monthly usage result
export interface MonthlyUsageResult {
  monthlyTotal: number;
  dailyAverage: number;
  weeklyAverage: number;
}

// Monthly usage with apps result
export interface MonthlyUsageWithAppsResult extends MonthlyUsageResult {
  apps: AppUsage[];
}

// Usage stats for range result
export interface UsageStatsForRangeResult {
  packageName: string;
  appName: string;
  totalTimeMs: number;
}

// Intervention settings
export interface InterventionSettings {
  timing: 'immediate' | 'delayed';
  delayMinutes: 5 | 10 | 15;
}

/**
 * Platform-specific Screen Time Service interface
 * Both Android and iOS services implement this interface
 */
export interface IScreenTimeService {
  // Permissions
  getPermissionStatus(): Promise<PermissionStatus>;
  openUsageStatsSettings(): Promise<void>;
  openOverlaySettings(): Promise<void>;

  // Usage data
  getTodayUsage(selectedApps?: TargetAppId[], customPackages?: string[]): Promise<UsageData>;
  getWeeklyUsage(selectedApps?: TargetAppId[], customPackages?: string[]): Promise<WeeklyUsageResult>;
  getMonthlyUsage(selectedApps?: TargetAppId[], customPackages?: string[]): Promise<MonthlyUsageResult>;
  getMonthlyUsageWithApps(selectedApps?: TargetAppId[], customPackages?: string[]): Promise<MonthlyUsageWithAppsResult>;
  getUsageStatsForRange(
    startDate: Date,
    endDate: Date,
    selectedApps?: TargetAppId[],
    customPackages?: string[]
  ): Promise<UsageStatsForRangeResult[]>;

  // Installed apps
  getInstalledApps(): Promise<InstalledApp[]>;
  getAppIcon(packageName: string): Promise<string | null>;
  getAppName(packageName: string): Promise<string>;
  isAppInstalled(packageName: string): Promise<boolean>;

  // Monitoring
  startMonitoring(packageNames: string[]): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  updateTargetApps(packageNames: string[]): Promise<boolean>;
  isMonitoringActive(): Promise<boolean>;

  // Intervention settings
  setInterventionSettings(timing: 'immediate' | 'delayed', delayMinutes: 5 | 10 | 15): Promise<boolean>;
  getInterventionSettings(): Promise<{ timing: string; delayMinutes: number } | null>;
}

// Target app package names (Android) / bundle IDs (iOS)
// Maps TargetAppId to package names for each platform
export const TARGET_APPS: {
  android: {
    tiktok: string[];
    youtube: string[];
    instagram: string[];
    twitter: string[];
    facebook: string[];
    snapchat: string[];
  };
  ios: {
    tiktok: string[];
    youtube: string[];
    instagram: string[];
    twitter: string[];
    facebook: string[];
    snapchat: string[];
  };
} = {
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
export const TARGET_APP_ID_TO_KEY: Record<TargetAppId, keyof typeof TARGET_APPS.android> = {
  tiktok: 'tiktok',
  youtubeShorts: 'youtube',
  instagramReels: 'instagram',
  twitter: 'twitter',
  facebookReels: 'facebook',
  snapchat: 'snapchat',
};
