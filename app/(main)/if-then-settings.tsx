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
import type { IfThenAction, IfThenPlan } from '../../src/types';

type ActionOption = {
  id: IfThenAction;
  icon: keyof typeof Ionicons.glyphMap;
};

const actionOptions: ActionOption[] = [
  { id: 'breathe', icon: 'leaf-outline' },
  { id: 'read_page', icon: 'book-outline' },
  { id: 'look_outside', icon: 'eye-outline' },
  { id: 'short_walk', icon: 'walk-outline' },
  { id: 'stretch', icon: 'body-outline' },
  { id: 'water', icon: 'water-outline' },
  { id: 'custom', icon: 'create-outline' },
];

export default function IfThenSettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { ifThenPlan, setIfThenPlan } = useAppStore();
  const [selectedAction, setSelectedAction] = useState<IfThenAction | null>(ifThenPlan?.action || null);
  const [customAction, setCustomAction] = useState(ifThenPlan?.customAction || '');

  const canSave = selectedAction && (selectedAction !== 'custom' || customAction.trim().length > 0);

  const handleSave = () => {
    if (!selectedAction) return;
    const plan: IfThenPlan = {
      action: selectedAction,
      customAction: selectedAction === 'custom' ? customAction : undefined,
    };
    setIfThenPlan(plan);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.yourSettings.ifThen')} showBack />

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
            {t('onboarding.v3.ifThen.title')}
          </Text>
          <Text style={[
            typography.bodyLarge,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            {t('onboarding.v3.ifThen.subtitle')}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {actionOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(500).delay(200 + index * 70)}
            >
              <SelectionCard
                title={t(`onboarding.v3.ifThen.options.${option.id}`)}
                icon={option.icon}
                selected={selectedAction === option.id}
                onPress={() => setSelectedAction(option.id)}
              />
            </Animated.View>
          ))}
        </View>

        {selectedAction === 'custom' && (
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
              placeholder={t('onboarding.v3.ifThen.customPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={customAction}
              onChangeText={setCustomAction}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.gutter }]}>
        <Button
          title={t('common.save')}
          onPress={handleSave}
          disabled={!canSave}
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
