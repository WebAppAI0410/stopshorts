/**
 * UrgeSurfingScreen Component
 * Main urge surfing experience with 3 phases
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { Button } from '../ui';
import { IntensitySlider } from './IntensitySlider';
import { BreathingGuide } from './BreathingGuide';
// TODO: Use t() for i18n when translations are ready

type SurfingPhase = 'initial' | 'surfing' | 'complete';

interface UrgeSurfingScreenProps {
  /** Name of the blocked app */
  blockedAppName?: string;
  /** Callback when user chooses to proceed */
  onProceed: () => void;
  /** Callback when user dismisses (goes home) */
  onDismiss: () => void;
  /** Source of the intervention */
  source?: 'shield' | 'training' | 'manual';
}

const SURFING_DURATION_MS = 30000; // 30 seconds
const BREATH_CYCLES = 3;

export function UrgeSurfingScreen({
  blockedAppName = 'TikTok',
  onProceed,
  onDismiss,
  source = 'shield',
}: UrgeSurfingScreenProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [phase, setPhase] = useState<SurfingPhase>('initial');
  const [intensityBefore, setIntensityBefore] = useState(5);
  const [intensityAfter, setIntensityAfter] = useState(3);
  const [isSliderActive, setIsSliderActive] = useState(false);

  const { recordUrgeSurfing, recordIntervention } = useStatisticsStore();

  // Reset state when screen comes into focus (allows repeated practice)
  useFocusEffect(
    useCallback(() => {
      // Reset all state to initial values when screen is focused
      setPhase('initial');
      setIntensityBefore(5);
      setIntensityAfter(3);
      setIsSliderActive(false);
    }, [])
  );

  // Slider interaction callbacks
  const handleSlidingStart = useCallback(() => setIsSliderActive(true), []);
  const handleSlidingEnd = useCallback(() => setIsSliderActive(false), []);

  const handleStartSurfing = useCallback(() => {
    setPhase('surfing');
  }, []);

  const handleBreathingComplete = useCallback(() => {
    setPhase('complete');
    // Pre-set after intensity to be lower (improved)
    setIntensityAfter(Math.max(1, intensityBefore - 2));
  }, [intensityBefore]);

  const handleComplete = useCallback(() => {
    // Record successful urge surfing
    recordUrgeSurfing({
      intensityBefore,
      intensityAfter,
      durationSeconds: SURFING_DURATION_MS / 1000,
      completed: true,
    });
    recordIntervention({ proceeded: false }); // Dismissed = didn't proceed to app
    onDismiss();
  }, [intensityBefore, intensityAfter, recordUrgeSurfing, recordIntervention, onDismiss]);

  const handleSkip = useCallback(() => {
    // Record skipped urge surfing
    recordUrgeSurfing({
      intensityBefore,
      intensityAfter: intensityBefore, // No change
      durationSeconds: 0,
      completed: false,
    });
    recordIntervention({ proceeded: true }); // Proceeded to app
    onProceed();
  }, [intensityBefore, recordUrgeSurfing, recordIntervention, onProceed]);

  const handleProceedAfterComplete = useCallback(() => {
    // User completed surfing but still wants to open app
    recordIntervention({ proceeded: true });
    onProceed();
  }, [recordIntervention, onProceed]);

  // Calculate intensity reduction
  const intensityReduction = intensityBefore - intensityAfter;
  const hasImproved = intensityReduction > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isSliderActive}
      >
        {/* Initial Phase - Ask intensity and offer surfing */}
        {phase === 'initial' && (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.content}
          >
            <View style={styles.header}>
              <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
                ⏸️ ちょっと待って
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                {blockedAppName}を開こうとしています
              </Text>
            </View>

            <View style={[styles.section, { marginTop: spacing.xl }]}>
              <Text
                style={[
                  typography.bodyLarge,
                  { color: colors.textPrimary, fontWeight: '600' },
                ]}
              >
                今の衝動を観察してみましょう
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted, marginTop: spacing.xs },
                ]}
              >
                アプリを開きたい衝動の強さは？
              </Text>

              <View style={{ marginTop: spacing.md }}>
                <IntensitySlider
                  value={intensityBefore}
                  onChange={setIntensityBefore}
                  onSlidingStart={handleSlidingStart}
                  onSlidingEnd={handleSlidingEnd}
                />
              </View>
            </View>

            {/* Info card */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  marginTop: spacing.xl,
                  padding: spacing.lg,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.primary }]}>
                🌊 衝動サーフィングとは？
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.textSecondary, marginTop: spacing.xs },
                ]}
              >
                衝動は波のように必ず過ぎ去ります。30秒間、深呼吸をしながら波を観察し、やり過ごす練習をしましょう。
              </Text>
            </View>

            <View style={[styles.buttonContainer, { marginTop: spacing.xl }]}>
              <Button
                title="🌊 波に乗る（30秒）"
                onPress={handleStartSurfing}
                size="lg"
              />

              <Button
                title="今すぐ開く"
                onPress={handleSkip}
                variant="outline"
                size="lg"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </Animated.View>
        )}

        {/* Surfing Phase - Wave animation + Breathing */}
        {phase === 'surfing' && (
          <Animated.View
            entering={SlideInDown.duration(500)}
            exiting={SlideOutUp.duration(300)}
            style={styles.content}
          >
            <View style={styles.header}>
              <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
                🧘 衝動サーフィング中
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
                ]}
              >
                深呼吸をしながら、衝動を観察しましょう
              </Text>
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <BreathingGuide
                cycles={BREATH_CYCLES}
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
                  marginTop: spacing.lg,
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
                「この衝動は一時的なもの。波のように、必ず過ぎていく」
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Complete Phase - Show results */}
        {phase === 'complete' && (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.content}
          >
            <View style={styles.header}>
              <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
                ✨ 素晴らしい！
              </Text>
              <Text
                style={[
                  typography.bodyLarge,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                波を乗り越えました 🏄
              </Text>
            </View>

            <View style={[styles.section, { marginTop: spacing.xl }]}>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                今の衝動の強さは？
              </Text>

              <View style={{ marginTop: spacing.md }}>
                <IntensitySlider
                  value={intensityAfter}
                  onChange={setIntensityAfter}
                  onSlidingStart={handleSlidingStart}
                  onSlidingEnd={handleSlidingEnd}
                />
              </View>
            </View>

            {/* Comparison card */}
            <View
              style={[
                styles.comparisonCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  marginTop: spacing.lg,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                衝動の強さの変化
              </Text>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    開始時
                  </Text>
                  <Text
                    style={[
                      typography.h2,
                      { color: colors.error, marginTop: spacing.xs },
                    ]}
                  >
                    {intensityBefore}
                  </Text>
                </View>

                <Text style={[typography.h2, { color: colors.textMuted }]}>→</Text>

                <View style={styles.comparisonItem}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    今
                  </Text>
                  <Text
                    style={[
                      typography.h2,
                      { color: colors.success, marginTop: spacing.xs },
                    ]}
                  >
                    {intensityAfter}
                  </Text>
                </View>
              </View>

              {hasImproved && (
                <View
                  style={[
                    styles.improvementBadge,
                    { backgroundColor: colors.success + '20', marginTop: spacing.md },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.success }]}>
                    🎉 衝動が {intensityReduction} ポイント下がりました！
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.buttonContainer, { marginTop: spacing.xl }]}>
              <Button
                title="ホームに戻る"
                onPress={handleComplete}
                size="lg"
              />

              <Button
                title="やっぱり開く"
                onPress={handleProceedAfterComplete}
                variant="outline"
                size="lg"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
  },
  section: {
    width: '100%',
  },
  infoCard: {},
  quoteCard: {},
  buttonContainer: {
    marginTop: 'auto',
  },
  comparisonCard: {},
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  improvementBadge: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});

export default UrgeSurfingScreen;
