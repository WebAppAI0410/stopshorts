/**
 * Screen Time Module - Utility Functions
 * Platform-agnostic helper functions
 */

import { Platform } from 'react-native';
import { TARGET_APPS, TARGET_APP_ID_TO_KEY } from './ScreenTimeModule.types';
import type { TargetAppId } from '../types';

// Type for platform-specific app packages
type PlatformApps = {
  tiktok: string[];
  youtube: string[];
  instagram: string[];
  twitter: string[];
  facebook: string[];
  snapchat: string[];
};

// Fallback values for TARGET_APPS in case of circular dependency issues
const FALLBACK_TARGET_APPS: { android: PlatformApps; ios: PlatformApps } = {
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

// Fallback for TARGET_APP_ID_TO_KEY
const FALLBACK_TARGET_APP_ID_TO_KEY: Record<TargetAppId, keyof PlatformApps> = {
  tiktok: 'tiktok',
  youtubeShorts: 'youtube',
  instagramReels: 'instagram',
  twitter: 'twitter',
  facebookReels: 'facebook',
  snapchat: 'snapchat',
};

/**
 * Get TARGET_APPS safely with fallback for circular dependency issues
 */
function getTargetApps(): { android: PlatformApps; ios: PlatformApps } {
  if (TARGET_APPS && typeof TARGET_APPS === 'object' && TARGET_APPS.android) {
    return TARGET_APPS;
  }
  return FALLBACK_TARGET_APPS;
}

/**
 * Get TARGET_APP_ID_TO_KEY safely with fallback
 */
function getTargetAppIdToKey(): Record<TargetAppId, keyof PlatformApps> {
  if (TARGET_APP_ID_TO_KEY && typeof TARGET_APP_ID_TO_KEY === 'object') {
    return TARGET_APP_ID_TO_KEY;
  }
  return FALLBACK_TARGET_APP_ID_TO_KEY;
}

/**
 * Get all target package names for current platform (legacy - returns all)
 */
export function getTargetPackages(): string[] {
  const platform = Platform.OS === 'android' ? 'android' : 'ios';
  const apps = getTargetApps()[platform];
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
  const apps = getTargetApps()[platform];
  const keyMap = getTargetAppIdToKey();
  const packages: string[] = [];

  for (const appId of selectedApps) {
    const key = keyMap[appId];
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
