/**
 * ConversationStarters Component
 *
 * Displays a list of common conversation starters that users can tap
 * to immediately start a conversation with the AI coach.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { ConversationStarter } from '../../types/ai';

interface ConversationStartersProps {
  starters: ConversationStarter[];
  onStarterPress: (starter: ConversationStarter) => void;
}

export function ConversationStarters({
  starters,
  onStarterPress,
}: ConversationStartersProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  if (starters.length === 0) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(300)}
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
        {t('ai.starters.title')}
      </Text>
      <View style={styles.startersContainer}>
        {starters.map((starter, index) => (
          <Pressable
            key={starter.id}
            onPress={() => onStarterPress(starter)}
            style={({ pressed }) => [
              styles.starterChip,
              {
                backgroundColor: pressed
                  ? colors.primary + '30'
                  : colors.backgroundCard,
                borderRadius: borderRadius.full,
                borderColor: colors.border,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                marginRight: spacing.sm,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <Text
              style={[
                typography.body,
                { color: colors.textPrimary, fontSize: 14 },
              ]}
              numberOfLines={1}
            >
              {t(starter.textKey)}
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
  startersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  starterChip: {
    borderWidth: 1,
  },
});
