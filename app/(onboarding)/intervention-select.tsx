/**
 * Intervention Selection Screen (Onboarding)
 * Replaces the old if-then.tsx screen
 * Users select their preferred intervention method
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { InterventionType } from '../../src/types';

interface InterventionOption {
  id: InterventionType;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  available: boolean;
}

const INTERVENTION_OPTIONS: InterventionOption[] = [
  {
    id: 'breathing',
    icon: 'leaf-outline',
    titleKey: 'onboarding.interventionSelect.options.breathing.title',
    descriptionKey: 'onboarding.interventionSelect.options.breathing.description',
    available: true,
  },
  {
    id: 'friction',
    icon: 'time-outline',
    titleKey: 'onboarding.interventionSelect.options.friction.title',
    descriptionKey: 'onboarding.interventionSelect.options.friction.description',
    available: true,
  },
  {
    id: 'mirror',
    icon: 'camera-outline',
    titleKey: 'onboarding.interventionSelect.options.mirror.title',
    descriptionKey: 'onboarding.interventionSelect.options.mirror.description',
    available: true,
  },
  {
    id: 'ai',
    icon: 'chatbubble-outline',
    titleKey: 'onboarding.interventionSelect.options.ai.title',
    descriptionKey: 'onboarding.interventionSelect.options.ai.description',
    available: false, // Will be enabled in Phase 5
  },
];

export default function InterventionSelectScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { setSelectedInterventionType } = useAppStore();
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType | null>(null);

  const handleSelect = (type: InterventionType) => {
    const option = INTERVENTION_OPTIONS.find((o) => o.id === type);
    if (option?.available) {
      setSelectedIntervention(type);
    }
  };

  const handleContinue = () => {
    if (!selectedIntervention) return;

    setSelectedInterventionType(selectedIntervention);
    // Navigate to intervention experience screen to try the selected intervention
    router.push({
      pathname: '/(onboarding)/intervention-experience',
      params: { type: selectedIntervention },
    } as Href);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text
            style={[
              typography.h1,
              {
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              },
            ]}
          >
            {t('onboarding.interventionSelect.title')}
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              {
                color: colors.textSecondary,
                marginBottom: spacing.xl,
              },
            ]}
          >
            {t('onboarding.interventionSelect.subtitle')}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {INTERVENTION_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(500).delay(300 + index * 80)}
            >
              <View style={{ opacity: option.available ? 1 : 0.5 }}>
                <SelectionCard
                  title={t(option.titleKey)}
                  subtitle={t(option.descriptionKey)}
                  icon={option.icon}
                  selected={selectedIntervention === option.id}
                  onPress={() => handleSelect(option.id)}
                />
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
                    {t('onboarding.interventionSelect.comingSoon')}
                  </Text>
                </View>
              )}
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(800)}
          style={[
            styles.noteContainer,
            {
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginTop: spacing.xl,
            },
          ]}
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text
            style={[
              typography.bodySmall,
              {
                color: colors.textMuted,
                flex: 1,
                marginLeft: spacing.sm,
              },
            ]}
          >
            {t('onboarding.interventionSelect.note')}
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(600).delay(900)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        <Button
          title={t('onboarding.interventionSelect.tryIt')}
          onPress={handleContinue}
          disabled={!selectedIntervention}
          size="lg"
        />
        <View style={{ marginTop: spacing.xl }}>
          <ProgressIndicator totalSteps={11} currentStep={8} />
        </View>
      </Animated.View>
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});
