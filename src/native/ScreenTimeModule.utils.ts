/**
 * Screen Time Module - Utility Functions
 * Platform-agnostic helper functions
 */

import { Platform } from 'react-native';
import { TARGET_APPS, TARGET_APP_ID_TO_KEY } from './ScreenTimeModule.types';
import type { TargetAppId } from '../types';

/**
 * Get all target package names for current platform (legacy - returns all)
 */
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
 * Create empty usage data response
 */
export function createEmptyUsageData(): {
  totalMinutes: number;
  apps: never[];
  peakHours: never[];
  lastUpdated: string;
} {
  return {
    totalMinutes: 0,
    apps: [],
    peakHours: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Create empty permission status
 */
export function createEmptyPermissionStatus(): {
  usageStats: boolean;
  overlay: boolean;
  familyControls: boolean;
  notifications: boolean;
} {
  return {
    usageStats: false,
    overlay: false,
    familyControls: false,
    notifications: false,
  };
}
