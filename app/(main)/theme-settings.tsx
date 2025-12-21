import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, SelectionCard } from '../../src/components/ui';
import { useTheme, ThemeMode } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';
import { useSettingsBack } from '../../src/hooks/useSettingsBack';

type ThemeOption = {
  id: ThemeMode;
  icon: keyof typeof Ionicons.glyphMap;
};

const themeOptions: ThemeOption[] = [
  { id: 'light', icon: 'sunny-outline' },
  { id: 'dark', icon: 'moon-outline' },
  { id: 'system', icon: 'phone-portrait-outline' },
];

export default function ThemeSettingsScreen() {
  const { colors, typography, spacing, themeMode, setThemeMode } = useTheme();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(themeMode);
  const handleBack = useSettingsBack();

  const handleSave = () => {
    setThemeMode(selectedMode);
    handleBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.theme.title')} showBack onBack={handleBack} />

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
            {t('settings.theme.title')}
          </Text>
          <Text style={[
            typography.bodyLarge,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            {t('settings.theme.subtitle', { defaultValue: 'テーマを選択してください。' })}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {themeOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(500).delay(200 + index * 80)}
            >
              <SelectionCard
                title={t(`settings.theme.${option.id}`)}
                icon={option.icon}
                selected={selectedMode === option.id}
                onPress={() => setSelectedMode(option.id)}
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
