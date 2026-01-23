/**
 * Urge Surfing Page
 * Full screen urge surfing / intervention experience
 *
 * Deep link: stopshorts://urge-surfing?app=<packageName>
 * - app: Package name of the blocked app (from Android overlay)
 * - appName: Display name of the blocked app
 * - source: Where the user came from (shield, training, manual, shortcut)
 *
 * Supports multiple intervention types:
 * - 'breathing': Traditional urge surfing with breathing exercises
 * - 'friction': Progressive wait time + intention confirmation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UrgeSurfingScreen } from '../../src/components/urge-surfing';
import { FrictionIntervention, MirrorIntervention, AIIntervention } from '../../src/components/interventions';
import { Header } from '../../src/components/ui';
import { useAppStore } from '../../src/stores/useAppStore';
import { useAIStore } from '../../src/stores/useAIStore';

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
    practiceType?: 'breathing' | 'friction' | 'mirror' | 'ai';  // Practice mode override
  }>();
  const { selectedInterventionType } = useAppStore();
  const modelStatus = useAIStore((state) => state.modelStatus);

  // AI model must be ready to use AI intervention
  const isAIModelReady = modelStatus === 'ready';

  // Determine which intervention to show:
  // 1. If practiceType is specified (from practice selection), use that
  // 2. Otherwise, use the selected intervention type from settings
  // 3. If AI is selected but model not ready, fall back to friction
  const rawInterventionType = params.practiceType || selectedInterventionType;
  const effectiveInterventionType = rawInterventionType === 'ai' && !isAIModelReady
    ? 'friction'
    : rawInterventionType;

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
  const getValidSource = (): 'shield' | 'training' | 'manual' | 'shortcut' => {
    const validSources = ['shield', 'training', 'manual', 'shortcut'] as const;
    if (params.source && validSources.includes(params.source as typeof validSources[number])) {
      return params.source as 'shield' | 'training' | 'manual' | 'shortcut';
    }
    // If coming from deep link with 'app' param, it's from the shield overlay
    return params.app ? 'shield' : 'manual';
  };

  const source = getValidSource();
  const isPracticeMode = source === 'training';

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

  // Render intervention based on effective type (practice override or settings)
  const renderIntervention = () => {
    switch (effectiveInterventionType) {
      case 'friction':
        return (
          <FrictionIntervention
            blockedAppName={appName}
            appPackage={params.app}
            onProceed={handleProceed}
            onDismiss={handleDismiss}
          />
        );
      case 'mirror':
        return (
          <MirrorIntervention
            blockedAppName={appName}
            onProceed={handleProceed}
            onDismiss={handleDismiss}
          />
        );
      case 'ai':
        return (
          <AIIntervention
            blockedAppName={appName}
            onProceed={handleProceed}
            onDismiss={handleDismiss}
          />
        );
      case 'breathing':
      default:
        return (
          <UrgeSurfingScreen
            blockedAppName={appName}
            onProceed={handleProceed}
            onDismiss={handleDismiss}
            source={source}
          />
        );
    }
  };

  // Practice mode: wrap intervention with floating back button
  if (isPracticeMode) {
    return (
      <View style={styles.container}>
        {renderIntervention()}
        <SafeAreaView style={styles.floatingHeader} edges={['top']}>
          <Header
            title=""
            showBack
            variant="ghost"
            onBack={() => router.back()}
          />
        </SafeAreaView>
      </View>
    );
  }

  return renderIntervention();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
