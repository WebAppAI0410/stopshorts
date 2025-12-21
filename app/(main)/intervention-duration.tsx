import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { useSettingsBack } from '../../src/hooks/useSettingsBack';

type DurationOption = {
  minutes: number;
  icon: keyof typeof Ionicons.glyphMap;
};

const durationOptions: DurationOption[] = [
  { minutes: 1, icon: 'timer-outline' },
  { minutes: 3, icon: 'timer-outline' },
  { minutes: 5, icon: 'timer-outline' },
  { minutes: 10, icon: 'timer-outline' },
];

export default function InterventionDurationScreen() {
  const { colors, typography, spacing } = useTheme();
  const { interventionDurationMinutes, setInterventionDuration } = useAppStore();
  const [selectedMinutes, setSelectedMinutes] = useState(interventionDurationMinutes);
  const handleBack = useSettingsBack();

  const handleSave = () => {
    setInterventionDuration(selectedMinutes);
    handleBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.limits.interventionTime')} showBack onBack={handleBack} />

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
            {t('settings.limits.interventionTime')}
          </Text>
          <Text style={[
            typography.bodyLarge,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            {t('settings.limits.interventionTimeDescription', { defaultValue: '介入後に表示するガイドの長さを選択してください。' })}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {durationOptions.map((option, index) => (
            <Animated.View
              key={option.minutes}
              entering={FadeInRight.duration(500).delay(200 + index * 70)}
            >
              <SelectionCard
                title={t('settings.limits.minutesValue', { minutes: option.minutes })}
                icon={option.icon}
                selected={selectedMinutes === option.minutes}
                onPress={() => setSelectedMinutes(option.minutes)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.gutter }]}>
        <Button
          title={t('common.save')}
          onPress={handleSave}
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
