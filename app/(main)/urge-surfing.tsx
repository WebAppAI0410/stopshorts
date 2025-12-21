/**
 * Urge Surfing Page
 * Full screen urge surfing experience
 *
 * Deep link: stopshorts://urge-surfing?app=<packageName>
 * - app: Package name of the blocked app (from Android overlay)
 * - appName: Display name of the blocked app
 * - source: Where the user came from (shield, training, manual)
 */

import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UrgeSurfingScreen } from '../../src/components/urge-surfing';

// Map package names to display names
const PACKAGE_TO_APP_NAME: Record<string, string> = {
  'com.zhiliaoapp.musically': 'TikTok',
  'com.ss.android.ugc.trill': 'TikTok',
  'com.google.android.youtube': 'YouTube',
  'com.instagram.android': 'Instagram',
  'com.twitter.android': 'Twitter',
  'com.facebook.katana': 'Facebook',
  'com.snapchat.android': 'Snapchat',
};

export default function UrgeSurfingPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    app?: string;       // Package name (from deep link)
    appName?: string;   // Display name (optional)
    source?: string;
  }>();

  // Determine app name from params
  // Priority: appName > mapped package name > default
  const getAppDisplayName = (): string => {
    if (params.appName) return params.appName;
    if (params.app && PACKAGE_TO_APP_NAME[params.app]) {
      return PACKAGE_TO_APP_NAME[params.app];
    }
    return 'TikTok';
  };

  const appName = getAppDisplayName();

  // Validate source parameter - only accept known values
  const getValidSource = (): 'shield' | 'training' | 'manual' => {
    const validSources = ['shield', 'training', 'manual'] as const;
    if (params.source && validSources.includes(params.source as typeof validSources[number])) {
      return params.source as 'shield' | 'training' | 'manual';
    }
    // If coming from deep link with 'app' param, it's from the shield overlay
    return params.app ? 'shield' : 'manual';
  };

  const source = getValidSource();

  const handleProceed = () => {
    // In a real implementation, this would open the target app
    // For now, just go back to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)');
    }
  };

  const handleDismiss = () => {
    // Go back to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)');
    }
  };

  return (
    <UrgeSurfingScreen
      blockedAppName={appName}
      onProceed={handleProceed}
      onDismiss={handleDismiss}
      source={source}
    />
  );
}
