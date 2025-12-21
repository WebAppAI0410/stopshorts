import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';
import { useAppStore } from '../../src/stores/useAppStore';
import { goalTypeToPurpose } from '../../src/types';
import type { GoalType } from '../../src/types';
import { useSettingsBack } from '../../src/hooks/useSettingsBack';

type GoalOption = {
  id: GoalType;
  icon: keyof typeof Ionicons.glyphMap;
};

const goalOptions: GoalOption[] = [
  { id: 'concentration', icon: 'locate-outline' },
  { id: 'sleep', icon: 'moon-outline' },
  { id: 'time', icon: 'time-outline' },
  { id: 'mental', icon: 'leaf-outline' },
];

export default function GoalSettingsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { goal, setGoal, setPurpose } = useAppStore();
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(goal);
  const handleBack = useSettingsBack();

  const handleSave = () => {
    if (!selectedGoal) return;
    setGoal(selectedGoal);
    setPurpose(goalTypeToPurpose(selectedGoal));
    handleBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.yourSettings.goal')} showBack onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600).delay(100)}>
          <Text style={[
            typography.h1,
            { color: colors.textPrimary, marginBottom: spacing.sm }
          ]}>
            {t('onboarding.v3.goal.title')}
          </Text>
          <Text style={[
            typography.bodyLarge,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            {t('onboarding.v3.goal.subtitle')}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {goalOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(600).delay(200 + index * 80)}
            >
              <SelectionCard
                title={t(`onboarding.v3.goal.options.${option.id}.title`)}
                subtitle={t(`onboarding.v3.goal.options.${option.id}.description`)}
                icon={option.icon}
                selected={selectedGoal === option.id}
                onPress={() => setSelectedGoal(option.id)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.gutter }]}>
        <Button
          title={t('common.save')}
          onPress={handleSave}
          disabled={!selectedGoal}
          size="lg"
        />
      </View>
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
  footer: {
    paddingTop: 20,
    paddingBottom: 24,
  },
});
