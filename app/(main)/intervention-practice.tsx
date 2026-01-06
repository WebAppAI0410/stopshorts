/**
 * Intervention Practice Selection Page
 * Allows users to choose which intervention type to practice
 * Features a hero card for breathing and mini cards for other interventions
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAIStore } from '../../src/stores/useAIStore';
import { t } from '../../src/i18n';
import {
  FeaturedBreathingCard,
  MiniInterventionCard,
} from '../../src/components/intervention-practice';

export default function InterventionPracticeScreen() {
  const { colors, typography, spacing, borderRadius, isDark } = useTheme();
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
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </Animated.View>

      {/* Title Section */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={styles.titleSection}
      >
        <Text style={[typography.h2, { color: colors.textPrimary }]}>
          {t('intervention.practice.title')}
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
          ]}
        >
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
            subtitle={t('intervention.practice.options.friction.description')}
            onPress={handleFrictionPress}
            index={0}
          />
          <MiniInterventionCard
            type="mirror"
            title={t('intervention.practice.options.mirror.title')}
            subtitle={t('intervention.practice.options.mirror.description')}
            onPress={handleMirrorPress}
            index={1}
          />
          <MiniInterventionCard
            type="ai"
            title={t('intervention.practice.options.ai.title')}
            subtitle={t('intervention.practice.options.ai.description')}
            locked={!isAIModelReady}
            lockedLabel={t('intervention.practice.locked')}
            onPress={handleAIPress}
            index={2}
          />
        </View>
      </View>

      {/* Footer Info */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={[
          styles.footer,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.03)',
            borderRadius: borderRadius.md,
            marginHorizontal: spacing.gutter,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text
          style={[
            styles.footerText,
            { color: colors.textSecondary, marginLeft: spacing.sm },
          ]}
        >
          {t('intervention.practice.info')}
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
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  featuredSection: {
    marginBottom: 24,
  },
  miniCardsSection: {
    marginBottom: 24,
  },
  miniCardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginTop: 'auto',
    marginBottom: 24,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
