/**
 * SuggestionCard Component
 *
 * Displays a contextual suggestion based on user's situation.
 * Used to guide users toward relevant AI interactions.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { SuggestionCategory } from '../../types/ai';

interface SuggestionCardProps {
  title: string;
  description: string;
  category: SuggestionCategory;
  onPress: () => void;
  index?: number;
}

export function SuggestionCard({
  title,
  description,
  category,
  onPress,
  index = 0,
}: SuggestionCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getCategoryConfig = () => {
    switch (category) {
      case 'progress':
        return {
          icon: 'trophy-outline' as const,
          color: colors.success,
          bgColor: colors.success + '20',
        };
      case 'concern':
        return {
          icon: 'heart-outline' as const,
          color: colors.warning,
          bgColor: colors.warning + '20',
        };
      case 'learning':
        return {
          icon: 'book-outline' as const,
          color: colors.primary,
          bgColor: colors.primary + '20',
        };
      case 'routine':
        return {
          icon: 'time-outline' as const,
          color: colors.accent,
          bgColor: colors.accent + '20',
        };
      default:
        return {
          icon: 'bulb-outline' as const,
          color: colors.primary,
          bgColor: colors.primary + '20',
        };
    }
  };

  const config = getCategoryConfig();

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(300)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            borderColor: colors.border,
            padding: spacing.md,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: config.bgColor,
                borderRadius: borderRadius.full,
                marginRight: spacing.smd,
              },
            ]}
          >
            <Ionicons name={config.icon} size={20} color={config.color} />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textMuted, marginTop: 2 },
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color={colors.textMuted}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: spacing.smd (12) - applied via inline style
  },
  textContainer: {
    flex: 1,
  },
});
