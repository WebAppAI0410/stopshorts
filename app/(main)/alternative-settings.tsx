import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { AlternativeActivity } from '../../src/types';

type ActivityOption = {
  id: AlternativeActivity;
  icon: keyof typeof Ionicons.glyphMap;
};

const activityOptions: ActivityOption[] = [
  { id: 'reading', icon: 'book-outline' },
  { id: 'exercise', icon: 'fitness-outline' },
  { id: 'meditation', icon: 'leaf-outline' },
  { id: 'learning', icon: 'school-outline' },
  { id: 'hobby', icon: 'color-palette-outline' },
  { id: 'social', icon: 'people-outline' },
  { id: 'custom', icon: 'create-outline' },
];

export default function AlternativeSettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { alternativeActivity, customAlternativeActivity, setAlternativeActivity } = useAppStore();
  const [selectedActivity, setSelectedActivity] = useState<AlternativeActivity | null>(alternativeActivity);
  const [customActivity, setCustomActivity] = useState(customAlternativeActivity || '');

  const isValid =
    selectedActivity && (selectedActivity !== 'custom' || customActivity.trim().length > 0);

  const handleSave = () => {
    if (!selectedActivity) return;
    setAlternativeActivity(selectedActivity, customActivity || undefined);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.yourSettings.alternative')} showBack />

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
            {t('onboarding.v3.alternative.title')}
          </Text>
          <Text style={[
            typography.bodyLarge,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            {t('onboarding.v3.alternative.subtitle')}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {activityOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(500).delay(200 + index * 70)}
            >
              <SelectionCard
                title={t(`onboarding.v3.alternative.options.${option.id}`)}
                icon={option.icon}
                selected={selectedActivity === option.id}
                onPress={() => setSelectedActivity(option.id)}
              />
            </Animated.View>
          ))}
        </View>

        {selectedActivity === 'custom' && (
          <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: spacing.md }}>
            <TextInput
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                },
              ]}
              placeholder={t('onboarding.v3.alternative.customPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={customActivity}
              onChangeText={setCustomActivity}
              maxLength={50}
            />
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.gutter }]}>
        <Button
          title={t('common.save')}
          onPress={handleSave}
          disabled={!isValid}
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
  customInput: {
    borderWidth: 1,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 24,
  },
});
