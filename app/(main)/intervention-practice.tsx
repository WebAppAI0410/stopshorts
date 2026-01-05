/**
 * Intervention Practice Selection Page
 * Allows users to choose which intervention type to practice
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

interface PracticeOption {
  id: 'breathing' | 'friction' | 'mirror' | 'ai';
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  available: boolean;
}

const PRACTICE_OPTIONS: PracticeOption[] = [
  {
    id: 'breathing',
    icon: 'leaf-outline',
    titleKey: 'intervention.practice.options.breathing.title',
    descriptionKey: 'intervention.practice.options.breathing.description',
    available: true,
  },
  {
    id: 'friction',
    icon: 'time-outline',
    titleKey: 'intervention.practice.options.friction.title',
    descriptionKey: 'intervention.practice.options.friction.description',
    available: true,
  },
  {
    id: 'mirror',
    icon: 'person-outline',
    titleKey: 'intervention.practice.options.mirror.title',
    descriptionKey: 'intervention.practice.options.mirror.description',
    available: true,
  },
  {
    id: 'ai',
    icon: 'chatbubble-outline',
    titleKey: 'intervention.practice.options.ai.title',
    descriptionKey: 'intervention.practice.options.ai.description',
    available: true,
  },
];

export default function InterventionPracticeScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();

  const handleSelectOption = (option: PracticeOption) => {
    if (!option.available) return;
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: option.id },
    });
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
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>
            {t('intervention.practice.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      {/* Description */}
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.descriptionContainer}>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
          {t('intervention.practice.subtitle')}
        </Text>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {PRACTICE_OPTIONS.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInDown.duration(600).delay(200 + index * 100)}
          >
            <View style={{ opacity: option.available ? 1 : 0.5 }}>
              <Pressable
                onPress={() => handleSelectOption(option)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: borderRadius.xl,
                    opacity: pressed && option.available ? 0.8 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Ionicons name={option.icon} size={32} color={colors.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>
                    {t(option.titleKey)}
                  </Text>
                  <Text
                    style={[
                      typography.bodySmall,
                      { color: colors.textSecondary, marginTop: spacing.xs },
                    ]}
                  >
                    {t(option.descriptionKey)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
              </Pressable>
            </View>
            {!option.available && (
              <View
                style={[
                  styles.comingSoonBadge,
                  {
                    backgroundColor: colors.textMuted + '20',
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('intervention.practice.comingSoon')}
                </Text>
              </View>
            )}
          </Animated.View>
        ))}
      </View>

      {/* Info */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        style={[
          styles.infoCard,
          {
            backgroundColor: colors.primary + '10',
            borderRadius: borderRadius.lg,
            marginHorizontal: spacing.gutter,
          },
        ]}
      >
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 },
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
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 'auto',
    marginBottom: 24,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
