/**
 * IntentionPhase Component
 * Asks user to confirm their intention for opening the app
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui';
import { INTENTION_OPTIONS } from '../../types/intervention';
import type { IntentionId } from '../../types';

interface IntentionPhaseProps {
  /** Callback when user selects an intention */
  onSelect: (intentionId: IntentionId, customText?: string) => void;
}

export function IntentionPhase({ onSelect }: IntentionPhaseProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [selectedId, setSelectedId] = useState<IntentionId | null>(null);
  const [customText, setCustomText] = useState('');

  const handleOptionPress = useCallback((id: IntentionId) => {
    setSelectedId(id);
    // If not "other", immediately proceed
    if (id !== 'other') {
      onSelect(id);
    }
  }, [onSelect]);

  const handleCustomSubmit = useCallback(() => {
    if (selectedId === 'other' && customText.trim()) {
      onSelect('other', customText.trim());
    }
  }, [selectedId, customText, onSelect]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
          {t('intervention.friction.intention.title')}
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
          ]}
        >
          {t('intervention.friction.intention.subtitle')}
        </Text>
      </View>

      <ScrollView
        style={styles.optionsList}
        contentContainerStyle={styles.optionsContent}
        showsVerticalScrollIndicator={false}
      >
        {INTENTION_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.7}
              onPress={() => handleOptionPress(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={t(option.labelKey)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? colors.accent + '15' : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? colors.accent + '20' : colors.backgroundCard },
                ]}
              >
                <Ionicons
                  name={option.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={isSelected ? colors.accent : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  typography.body,
                  {
                    color: isSelected ? colors.accent : colors.textPrimary,
                    flex: 1,
                    marginLeft: spacing.md,
                  },
                ]}
              >
                {t(option.labelKey)}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Custom text input when "other" is selected */}
        {selectedId === 'other' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.customInputContainer}>
            <TextInput
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: borderRadius.md,
                },
              ]}
              placeholder={t('intervention.friction.intention.customPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={customText}
              onChangeText={setCustomText}
              multiline
              numberOfLines={2}
              maxLength={100}
              accessibilityLabel={t('intervention.friction.intention.customPlaceholder')}
              accessibilityHint={t('common.continue')}
            />
            <Button
              title={t('common.continue')}
              onPress={handleCustomSubmit}
              disabled={!customText.trim()}
              style={{ marginTop: spacing.md }}
            />
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 24,
  },
  optionsList: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInputContainer: {
    marginTop: 8,
  },
  customInput: {
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
