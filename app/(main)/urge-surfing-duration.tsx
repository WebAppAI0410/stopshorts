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
  seconds: 30 | 60;
  icon: keyof typeof Ionicons.glyphMap;
};

const durationOptions: DurationOption[] = [
  { seconds: 30, icon: 'timer-outline' },
  { seconds: 60, icon: 'timer-outline' },
];

export default function UrgeSurfingDurationScreen() {
  const { colors, typography, spacing } = useTheme();
  const { urgeSurfingDurationSeconds, setUrgeSurfingDuration } = useAppStore();
  const [selectedSeconds, setSelectedSeconds] = useState(urgeSurfingDurationSeconds);
  const handleBack = useSettingsBack();

  const handleSave = () => {
    setUrgeSurfingDuration(selectedSeconds);
    handleBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.limits.urgeSurfingDuration')} showBack onBack={handleBack} />

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
            {t('settings.limits.urgeSurfingDuration')}
          </Text>
          <Text style={[
            typography.bodyLarge,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            {t('settings.limits.urgeSurfingDurationDescription', { defaultValue: '衝動サーフィンのガイド時間を選択してください。' })}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {durationOptions.map((option, index) => (
            <Animated.View
              key={option.seconds}
              entering={FadeInRight.duration(500).delay(200 + index * 70)}
            >
              <SelectionCard
                title={t('settings.limits.secondsValue', { seconds: option.seconds })}
                icon={option.icon}
                selected={selectedSeconds === option.seconds}
                onPress={() => setSelectedSeconds(option.seconds)}
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
