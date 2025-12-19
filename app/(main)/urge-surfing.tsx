/**
 * Urge Surfing Page
 * Full screen urge surfing experience
 */

import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UrgeSurfingScreen } from '../../src/components/urge-surfing';

export default function UrgeSurfingPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    appName?: string;
    source?: string;
  }>();

  const appName = params.appName || 'TikTok';
  const source = (params.source as 'shield' | 'training' | 'manual') || 'manual';

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
