/**
 * Urge Surfing Demo Screen
 * Allows users to experience the swipe simulator and intervention during onboarding
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { SwipeSimulator, APP_THEMES } from '../../src/components/simulator';
import { FrictionIntervention, MirrorIntervention } from '../../src/components/interventions';
import {
  DemoSelectPhase,
  DemoInterventionPhase,
  DemoCompletePhase,
  DemoBreathingExperience,
  DemoAIExperience,
} from '../../src/components/urge-surfing';
import { useUrgeSurfingDemo } from '../../src/hooks/useUrgeSurfingDemo';

export default function UrgeSurfingDemoScreen() {
  const {
    phase,
    selectedApp,
    swipeCount,
    displayName,
    selectedInterventionType,
    goal,
    breathingProgress,
    setPhase,
    setSelectedApp,
    handleStartSimulation,
    handleIntervention,
    handleSwipe,
    handleStartExperience,
    handleExperienceComplete,
    handleTryAnother,
    handleContinueOnboarding,
    getExperienceButtonText,
  } = useUrgeSurfingDemo();

  const theme = APP_THEMES[selectedApp];

  // App selection phase
  if (phase === 'select') {
    return (
      <DemoSelectPhase
        selectedApp={selectedApp}
        onSelectApp={setSelectedApp}
        onStartSimulation={handleStartSimulation}
        onSkip={handleContinueOnboarding}
      />
    );
  }

  // Simulation phase
  if (phase === 'simulate') {
    return (
      <GestureHandlerRootView style={styles.fullScreen}>
        <View style={[styles.fullScreen, { backgroundColor: theme.backgroundColor }]}>
          {/* Close button overlay */}
          <SafeAreaView style={styles.overlayHeader} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => setPhase('select')}
              style={[styles.overlayCloseButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={[styles.swipeCounter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Text style={styles.swipeCounterText}>
                {swipeCount}/3 スワイプ
              </Text>
            </View>
          </SafeAreaView>

          <SwipeSimulator
            appId={selectedApp}
            interventionAfterSwipes={3}
            onIntervention={handleIntervention}
            onSwipe={handleSwipe}
          />
        </View>
      </GestureHandlerRootView>
    );
  }

  // Intervention phase
  if (phase === 'intervention') {
    return (
      <DemoInterventionPhase
        onBack={() => setPhase('select')}
        onStartExperience={handleStartExperience}
        onSkip={handleContinueOnboarding}
        experienceButtonText={getExperienceButtonText()}
      />
    );
  }

  // Experience phase - shows intervention based on selected type
  if (phase === 'experience') {
    // Breathing intervention
    if (selectedInterventionType === 'breathing') {
      return (
        <DemoBreathingExperience
          displayName={displayName}
          appName={theme?.name || 'TikTok'}
          breathingProgress={breathingProgress}
          onBack={() => setPhase('intervention')}
          onComplete={handleExperienceComplete}
        />
      );
    }

    // Friction intervention
    if (selectedInterventionType === 'friction') {
      return (
        <FrictionIntervention
          blockedAppName={theme?.name || 'TikTok'}
          onProceed={handleExperienceComplete}
          onDismiss={handleExperienceComplete}
        />
      );
    }

    // Mirror intervention
    if (selectedInterventionType === 'mirror') {
      return (
        <MirrorIntervention
          blockedAppName={theme?.name || 'TikTok'}
          userGoal={goal ?? undefined}
          onProceed={handleExperienceComplete}
          onDismiss={handleExperienceComplete}
        />
      );
    }

    // AI intervention preview
    return (
      <DemoAIExperience
        onBack={() => setPhase('intervention')}
        onComplete={handleExperienceComplete}
      />
    );
  }

  // Complete phase
  return (
    <DemoCompletePhase
      onBack={() => setPhase('experience')}
      onContinue={handleContinueOnboarding}
      onTryAnother={handleTryAnother}
    />
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  overlayCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeCounter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  swipeCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
