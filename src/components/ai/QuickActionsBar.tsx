/**
 * QuickActionsBar Component
 *
 * Displays 4 quick action buttons for common AI interactions.
 * Buttons: Explore, Plan, Training, Reflect
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { ConversationModeId } from '../../types/ai';

interface QuickAction {
  id: ConversationModeId;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'explore', icon: 'search-outline', labelKey: 'ai.quickActions.explore' },
  { id: 'plan', icon: 'create-outline', labelKey: 'ai.quickActions.plan' },
  { id: 'training', icon: 'book-outline', labelKey: 'ai.quickActions.training' },
  { id: 'reflect', icon: 'moon-outline', labelKey: 'ai.quickActions.reflect' },
];

interface QuickActionsBarProps {
  onActionPress: (modeId: ConversationModeId) => void;
}

export function QuickActionsBar({ onActionPress }: QuickActionsBarProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(300)}
      style={styles.container}
    >
      <Text
        style={[
          typography.caption,
          {
            color: colors.textMuted,
            marginBottom: spacing.sm,
            marginLeft: spacing.xs,
          },
        ]}
      >
        {t('ai.quickActions.title')}
      </Text>
      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action, index) => (
          <Pressable
            key={action.id}
            onPress={() => onActionPress(action.id)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.backgroundCard,
                borderRadius: borderRadius.md,
                borderColor: colors.border,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                opacity: pressed ? 0.7 : 1,
                marginLeft: index > 0 ? spacing.sm : 0,
              },
            ]}
          >
            <Ionicons
              name={action.icon}
              size={20}
              color={colors.primary}
              style={{ marginBottom: spacing.xs }}
            />
            <Text
              style={[
                typography.caption,
                { color: colors.textPrimary, fontWeight: '500' },
              ]}
            >
              {t(action.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
  },
});
