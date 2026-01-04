/**
 * Urge Surfing Demo Screen
 * Allows users to experience the swipe simulator and intervention during onboarding
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeIn, FadeInUp, ZoomIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../../src/contexts/ThemeContext';
import { SwipeSimulator, AppSelector, APP_THEMES } from '../../src/components/simulator';
import { ShieldIcon, Button, Header, ProgressIndicator, GlowOrb } from '../../src/components/ui';
import { BreathingGuide, WaveAnimation } from '../../src/components/urge-surfing';
import { useSharedValue, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { useAppStore } from '../../src/stores/useAppStore';
import type { TargetAppId } from '../../src/types';
import { t } from '../../src/i18n';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type DemoPhase = 'select' | 'simulate' | 'intervention' | 'breathing' | 'complete';

export default function UrgeSurfingDemoScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [phase, setPhase] = useState<DemoPhase>('select');
  const [selectedApp, setSelectedApp] = useState<TargetAppId>('tiktok');
  const [swipeCount, setSwipeCount] = useState(0);
  const { userName } = useAppStore();
  const displayName = userName && userName.trim().length > 0 ? userName.trim() : 'ユーザー';
  const breathingProgress = useSharedValue(0);
  const breathingStartTime = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const theme = APP_THEMES[selectedApp];

  // Total breathing duration: 3 cycles × (4s inhale + 2s hold + 4s exhale) = 30s
  const BREATHING_DURATION_MS = 30000;

  // Continuous progress animation for wave calming effect
  useEffect(() => {
    if (phase === 'breathing') {
      breathingProgress.value = 0;
      breathingProgress.value = withTiming(1, {
        duration: BREATHING_DURATION_MS,
        easing: Easing.linear,
      });

      return () => {
        breathingProgress.value = 0;
      };
    }
  }, [phase]);

  const handleStartSimulation = useCallback(() => {
    setPhase('simulate');
    setSwipeCount(0);
  }, []);

  const handleIntervention = useCallback(() => {
    setPhase('intervention');
  }, []);

  const handleSwipe = useCallback((count: number) => {
    setSwipeCount(count);
  }, []);

  const handleStartBreathing = useCallback(() => {
    setPhase('breathing');
  }, []);

  const handleBreathingComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleContinueOnboarding = useCallback(() => {
    router.push('/(onboarding)/ai-preview' as Href);
  }, [router]);

  // App selection phase - follows standard onboarding layout
  if (phase === 'select') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
        <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

        <Header showBack variant="ghost" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              {t('onboarding.urgeSurfingDemo.title')}
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary },
              ]}
            >
              {t('onboarding.urgeSurfingDemo.subtitle')}
            </Text>
          </Animated.View>

          {/* Explanation Card */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(150)}
            style={[
              styles.explanationCard,
              {
                backgroundColor: colors.accentMuted,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                marginTop: spacing.xl,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={20} color={colors.accent} />
              <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                {t('onboarding.urgeSurfingDemo.whatIs.title')}
              </Text>
            </View>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 22, marginTop: spacing.sm }]}>
              {t('onboarding.urgeSurfingDemo.whatIs.description')}
            </Text>
          </Animated.View>

          {/* App Selector */}
          <Animated.View entering={FadeInUp.duration(600).delay(300)} style={{ marginTop: spacing.xl }}>
            <AppSelector
              selectedApp={selectedApp}
              availableApps={['tiktok', 'instagramReels', 'youtubeShorts', 'facebookReels']}
              onSelectApp={setSelectedApp}
              title={t('onboarding.urgeSurfingDemo.selectApp')}
            />
          </Animated.View>

          {/* Demo Info */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(450)}
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.backgroundCard,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginTop: spacing.lg,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="play-circle-outline" size={20} color={colors.accent} />
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm },
                ]}
              >
                {t('onboarding.urgeSurfingDemo.demoNote')}
              </Text>
            </View>
          </Animated.View>

          {/* Immediate Intervention Info */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(600)}
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.backgroundCard,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="flash-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  {t('onboarding.urgeSurfingDemo.immediateNote')}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                  {t('onboarding.urgeSurfingDemo.immediateDescription')}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer - standard onboarding pattern */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(750)}
          style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
        >
          <Button title={t('onboarding.urgeSurfingDemo.startButton')} onPress={handleStartSimulation} size="lg" />
          <TouchableOpacity
            onPress={handleContinueOnboarding}
            style={[styles.skipButton, { marginTop: spacing.sm }]}
          >
            <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
              {t('onboarding.urgeSurfingDemo.skipButton')}
            </Text>
          </TouchableOpacity>
          <View style={{ marginTop: spacing.lg }}>
            <ProgressIndicator totalSteps={11} currentStep={10} />
          </View>
        </Animated.View>
      </SafeAreaView>
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
                {t('onboarding.urgeSurfingDemo.swipeCounter', { current: swipeCount, total: 3 })}
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
      <View style={[styles.fullScreen, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
        <SafeAreaView style={styles.interventionContainer}>
          {/* Standard Header for consistent back button */}
          <Header showBack variant="ghost" onBack={() => setPhase('select')} />

          <View style={styles.interventionContent}>
            {/* Glow effect */}
            <View style={styles.glowContainer}>
              <View style={[styles.glowOuter, { backgroundColor: colors.shieldGlow }]} />
              <View style={[styles.glowInner, { backgroundColor: colors.accentGlow }]} />
            </View>

            {/* Header */}
            <Animated.View entering={FadeIn.duration(600)} style={styles.interventionHeader}>
              <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
              <Text style={[typography.h3, { color: colors.accent, marginLeft: spacing.sm }]}>
                {t('onboarding.urgeSurfingDemo.intervention.header')}
              </Text>
            </Animated.View>

            {/* Shield Icon */}
            <Animated.View entering={ZoomIn.duration(800).delay(200)} style={styles.shieldContainer}>
              <ShieldIcon size="xl" glowing={true} status="protected" />
            </Animated.View>

            {/* Message */}
            <Animated.View entering={FadeInUp.duration(600).delay(400)}>
              <Text
                style={[
                  typography.h1,
                  {
                    color: colors.textPrimary,
                    textAlign: 'center',
                    fontSize: 28,
                  },
                ]}
              >
                {t('onboarding.urgeSurfingDemo.intervention.title')}
              </Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: spacing.sm,
                  },
                ]}
              >
                {t('onboarding.urgeSurfingDemo.intervention.description')}
              </Text>
            </Animated.View>

            {/* Info Card */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(600)}
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  marginTop: spacing.xl,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.primary }]}>
                {t('onboarding.urgeSurfingDemo.intervention.urgeSurfingTitle')}
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.textSecondary, marginTop: spacing.xs },
                ]}
              >
                {t('onboarding.urgeSurfingDemo.intervention.urgeSurfingDescription')}
              </Text>
            </Animated.View>

            <View style={{ flex: 1 }} />

            {/* Buttons */}
            <Animated.View entering={FadeInUp.duration(600).delay(800)} style={styles.buttonContainer}>
              <Button title={t('onboarding.urgeSurfingDemo.intervention.rideWaveButton')} onPress={handleStartBreathing} size="lg" />
              <TouchableOpacity
                onPress={handleContinueOnboarding}
                style={[styles.skipButton, { marginTop: spacing.md }]}
              >
                <Text style={[typography.body, { color: colors.textMuted }]}>
                  {t('onboarding.urgeSurfingDemo.skipButton')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Breathing phase
  if (phase === 'breathing') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.breathingContent}>
          <TouchableOpacity
            onPress={() => setPhase('intervention')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Animated.View entering={FadeIn.duration(600)} style={styles.breathingHeader}>
            <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
              {t('onboarding.urgeSurfingDemo.breathing.title')}
            </Text>
            <Text
              style={[
                typography.bodySmall,
                { color: colors.primary, textAlign: 'center', marginTop: spacing.sm, fontWeight: '600' },
              ]}
            >
              {t('onboarding.urgeSurfingDemo.breathing.urgeFor', { name: displayName, app: theme?.name || 'アプリ' })}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
              ]}
            >
              {t('onboarding.urgeSurfingDemo.breathing.instruction')}
            </Text>
          </Animated.View>

          {/* Wave animation - above the breathing circle, waves calm as progress increases */}
          <Animated.View
            entering={FadeIn.duration(800)}
            style={styles.waveContainer}
          >
            <WaveAnimation
              progress={breathingProgress}
              height={150}
            />
          </Animated.View>

          {/* Breathing guide (concentric circles) */}
          <View style={styles.breathingGuideContainer}>
            <BreathingGuide
              cycles={3}
              onComplete={handleBreathingComplete}
              autoStart={true}
            />
          </View>

          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: colors.backgroundCard,
                borderRadius: borderRadius.md,
                padding: spacing.md,
              },
            ]}
          >
            <Text
              style={[
                typography.bodySmall,
                { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
              ]}
            >
              {t('onboarding.urgeSurfingDemo.breathing.quote')}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Complete phase - follows standard onboarding layout
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-right" size="large" color="accent" intensity={0.12} />

      <Header showBack variant="ghost" onBack={() => setPhase('breathing')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.duration(600)} style={styles.completeIcon}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.accent} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
            {t('onboarding.urgeSurfingDemo.complete.title')}
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
            ]}
          >
            {t('onboarding.urgeSurfingDemo.complete.description')}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginTop: spacing.xl,
            },
          ]}
        >
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            {t('onboarding.urgeSurfingDemo.complete.learnedTitle')}
          </Text>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {t('onboarding.urgeSurfingDemo.complete.learned1')}
            </Text>
          </View>
          <View style={[styles.summaryItem, { marginTop: spacing.sm }]}>
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {t('onboarding.urgeSurfingDemo.complete.learned2')}
            </Text>
          </View>
          <View style={[styles.summaryItem, { marginTop: spacing.sm }]}>
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {t('onboarding.urgeSurfingDemo.complete.learned3')}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer - standard onboarding pattern */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(600)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        <Button title={t('onboarding.urgeSurfingDemo.complete.nextButton')} onPress={handleContinueOnboarding} size="lg" />
        <View style={{ marginTop: spacing.xl }}>
          <ProgressIndicator totalSteps={11} currentStep={10} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 24,
  },
  explanationCard: {
    width: '100%',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  infoCard: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  interventionContainer: {
    flex: 1,
  },
  interventionContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  interventionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.3,
  },
  glowInner: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.5,
  },
  buttonContainer: {
    width: '100%',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  waveContainer: {
    marginTop: 16,
    marginHorizontal: -24,
  },
  breathingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  breathingHeader: {
    marginBottom: 24,
  },
  breathingGuideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteCard: {
    marginTop: 'auto',
  },
  completeContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  completeIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    width: '100%',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
