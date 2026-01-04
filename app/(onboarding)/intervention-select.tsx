/**
 * Intervention Selection Screen (Onboarding)
 * Users select their preferred intervention method
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SelectionCard } from '../../src/components/ui';
import { OnboardingScreenTemplate } from '../../src/components/templates';
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
    router.push({
      pathname: '/(onboarding)/intervention-experience',
      params: { type: selectedIntervention },
    } as Href);
  };

  return (
    <OnboardingScreenTemplate
      title={t('onboarding.interventionSelect.title')}
      subtitle={t('onboarding.interventionSelect.subtitle')}
      currentStep={8}
      buttonText={t('onboarding.interventionSelect.tryIt')}
      onButtonPress={handleContinue}
      buttonDisabled={!selectedIntervention}
      titleAnimationDelay={200}
      footerAnimationDelay={900}
    >
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
    </OnboardingScreenTemplate>
  );
}

const styles = StyleSheet.create({
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
});
