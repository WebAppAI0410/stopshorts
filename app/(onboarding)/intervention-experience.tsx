/**
 * Intervention Experience Screen (Onboarding)
 * Users experience their selected intervention before continuing
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Href } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { UrgeSurfingScreen } from '../../src/components/urge-surfing';
import { FrictionIntervention, MirrorIntervention } from '../../src/components/interventions';
import type { InterventionType } from '../../src/types';

type ExperiencePhase = 'intro' | 'experience' | 'complete';

// Valid intervention types that can be experienced in onboarding
const VALID_INTERVENTION_TYPES: InterventionType[] = ['breathing', 'friction', 'mirror', 'ai'];

/**
 * Validate intervention type from URL params
 * Returns valid type or 'breathing' as default
 */
function validateInterventionType(value: string | undefined): InterventionType {
  if (value && VALID_INTERVENTION_TYPES.includes(value as InterventionType)) {
    return value as InterventionType;
  }
  return 'breathing';
}

export default function InterventionExperienceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { goal } = useAppStore();

  const interventionType = validateInterventionType(params.type);
  const [phase, setPhase] = useState<ExperiencePhase>('intro');

  const handleStartExperience = useCallback(() => {
    setPhase('experience');
  }, []);

  const handleExperienceComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleContinue = useCallback(() => {
    router.push('/(onboarding)/how-it-works' as Href);
  }, [router]);

  const handleTryAnother = useCallback(() => {
    router.back();
  }, [router]);

  const getInterventionTitle = (): string => {
    switch (interventionType) {
      case 'breathing':
        return t('onboarding.interventionExperience.types.breathing');
      case 'friction':
        return t('onboarding.interventionExperience.types.friction');
      case 'mirror':
        return t('onboarding.interventionExperience.types.mirror');
      default:
        return '';
    }
  };

  // Intro phase - explain what's about to happen
  if (phase === 'intro') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[styles.centeredContent, { paddingHorizontal: spacing.gutter }]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Ionicons
              name={
                interventionType === 'breathing'
                  ? 'leaf-outline'
                  : interventionType === 'friction'
                  ? 'time-outline'
                  : 'camera-outline'
              }
              size={48}
              color={colors.primary}
            />
          </View>

          <Text
            style={[
              typography.h1,
              { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl },
            ]}
          >
            {getInterventionTitle()}
          </Text>

          <Text
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: spacing.md,
                marginBottom: spacing['2xl'],
              },
            ]}
          >
            {t('onboarding.interventionExperience.intro')}
          </Text>

          <Button
            title={t('onboarding.interventionExperience.startButton')}
            onPress={handleStartExperience}
            size="lg"
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Experience phase - show the actual intervention
  if (phase === 'experience') {
    switch (interventionType) {
      case 'friction':
        return (
          <FrictionIntervention
            blockedAppName="TikTok"
            onProceed={handleExperienceComplete}
            onDismiss={handleExperienceComplete}
          />
        );
      case 'mirror':
        return (
          <MirrorIntervention
            blockedAppName="TikTok"
            userGoal={goal ? t(`onboarding.v3.goal.options.${goal}.title`) : t('onboarding.interventionExperience.defaultGoal')}
            onProceed={handleExperienceComplete}
            onDismiss={handleExperienceComplete}
          />
        );
      case 'breathing':
      default:
        return (
          <UrgeSurfingScreen
            blockedAppName="TikTok"
            onProceed={handleExperienceComplete}
            onDismiss={handleExperienceComplete}
            source="training"
          />
        );
    }
  }

  // Complete phase - show success and options
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInUp.duration(600)}
        style={[styles.centeredContent, { paddingHorizontal: spacing.gutter }]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.success + '20' },
          ]}
        >
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>

        <Text
          style={[
            typography.h1,
            { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl },
          ]}
        >
          {t('onboarding.interventionExperience.complete.title')}
        </Text>

        <Text
          style={[
            typography.body,
            {
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: spacing.md,
              marginBottom: spacing['2xl'],
            },
          ]}
        >
          {t('onboarding.interventionExperience.complete.subtitle')}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title={t('onboarding.interventionExperience.continue')}
            onPress={handleContinue}
            size="lg"
            style={{ marginBottom: spacing.md }}
          />
          <Button
            title={t('onboarding.interventionExperience.tryAnother')}
            onPress={handleTryAnother}
            variant="ghost"
            size="lg"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
});
