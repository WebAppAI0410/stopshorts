/**
 * TrainingRecommendationCard Component
 *
 * Displays an inline training recommendation within the chat conversation.
 * Shows when the conversation content relates to a training topic.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { TrainingRecommendation } from '../../types/ai';

interface TrainingRecommendationCardProps {
  recommendation: TrainingRecommendation;
  onPress: () => void;
  onDismiss?: () => void;
}

export function TrainingRecommendationCard({
  recommendation,
  onPress,
  onDismiss,
}: TrainingRecommendationCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: colors.primary + '10',
          borderRadius: borderRadius.lg,
          borderColor: colors.primary + '30',
          padding: spacing.md,
          marginVertical: spacing.sm,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primary + '20',
              borderRadius: borderRadius.full,
              marginRight: spacing.sm,
            },
          ]}
        >
          <Ionicons name="book-outline" size={18} color={colors.primary} />
        </View>
        <Text
          style={[
            typography.caption,
            { color: colors.primary, fontWeight: '600', flex: 1 },
          ]}
        >
          {t('ai.training.recommendTitle')}
        </Text>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-outline"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      <View style={[styles.content, { marginTop: spacing.sm }]}>
        <Text
          style={[typography.body, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {recommendation.topicTitle}
        </Text>
        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, marginTop: 2 },
          ]}
          numberOfLines={2}
        >
          {recommendation.reason}
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: pressed ? colors.primary : colors.primary + '90',
            borderRadius: borderRadius.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            marginTop: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            typography.caption,
            { color: colors.textInverse, fontWeight: '600' },
          ]}
        >
          {t('ai.training.recommendAction')}
        </Text>
        <Ionicons
          name="arrow-forward-outline"
          size={14}
          color={colors.textInverse}
          style={{ marginLeft: spacing.xs }}
        />
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
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: spacing.sm (8) - applied via inline style
  },
  content: {},
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
