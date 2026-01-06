/**
 * Intervention Practice Selection Page
 * Allows users to choose which intervention type to practice
 * Design based on Gemini mockup with hero card and glassmorphism mini cards
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAIStore } from '../../src/stores/useAIStore';
import { t } from '../../src/i18n';
import {
  FeaturedBreathingCard,
  MiniInterventionCard,
} from '../../src/components/intervention-practice';

export default function InterventionPracticeScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const modelStatus = useAIStore((state) => state.modelStatus);

  const isAIModelReady = modelStatus === 'ready';

  const handleBreathingPress = () => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: 'breathing' },
    });
  };

  const handleFrictionPress = () => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: 'friction' },
    });
  };

  const handleMirrorPress = () => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: 'mirror' },
    });
  };

  const handleAIPress = () => {
    if (isAIModelReady) {
      router.push({
        pathname: '/(main)/urge-surfing',
        params: { practiceType: 'ai' },
      });
    } else {
      router.push('/(main)/ai');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </Animated.View>

      {/* Title Section - Left aligned */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(50)}
        style={[styles.titleSection, { paddingHorizontal: spacing.gutter }]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('intervention.practice.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('intervention.practice.subtitle')}
        </Text>
      </Animated.View>

      {/* Featured Breathing Card */}
      <View style={[styles.featuredSection, { paddingHorizontal: spacing.gutter }]}>
        <FeaturedBreathingCard onPress={handleBreathingPress} />
      </View>

      {/* Mini Cards Grid */}
      <View style={[styles.miniCardsSection, { paddingHorizontal: spacing.gutter }]}>
        <View style={styles.miniCardsGrid}>
          <MiniInterventionCard
            type="friction"
            title={t('intervention.practice.options.friction.title')}
            onPress={handleFrictionPress}
            index={0}
          />
          <MiniInterventionCard
            type="mirror"
            title={t('intervention.practice.options.mirror.title')}
            onPress={handleMirrorPress}
            index={1}
          />
          <MiniInterventionCard
            type="ai"
            title={t('intervention.practice.options.ai.title')}
            locked={!isAIModelReady}
            onPress={handleAIPress}
            index={2}
          />
        </View>
      </View>

      {/* Footer - Simple centered text */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(400)}
        style={styles.footer}
      >
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          {t('intervention.practice.infoSimple')}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  featuredSection: {
    marginBottom: 20,
  },
  miniCardsSection: {
    marginBottom: 24,
  },
  miniCardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
