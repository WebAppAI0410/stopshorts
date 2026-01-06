/**
 * TopicGridCard Component
 * Grid card for topic list display (2-column layout)
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { TrainingTopic, TrainingCategory } from '../../types/training';

type TopicStatus = 'notStarted' | 'inProgress' | 'completed';

interface TopicGridCardProps {
  topic: TrainingTopic;
  completedContents: number;
  isCompleted: boolean;
  onPress: () => void;
  index?: number;
}

const CATEGORY_ICONS: Record<TrainingCategory, keyof typeof Ionicons.glyphMap> = {
  research: 'school-outline',
  emotional: 'heart-outline',
  goal: 'flag-outline',
};

export function TopicGridCard({
  topic,
  completedContents,
  isCompleted,
  onPress,
  index = 0,
}: TopicGridCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const totalContents = topic.contents.length;
  const progress = totalContents > 0 ? completedContents / totalContents : 0;

  const getStatus = (): TopicStatus => {
    if (isCompleted) return 'completed';
    if (completedContents > 0) return 'inProgress';
    return 'notStarted';
  };

  const status = getStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: colors.success + '15',
          borderColor: colors.success,
          statusText: t('training.completed'),
          statusColor: colors.success,
          progressColor: colors.success,
        };
      case 'inProgress':
        return {
          backgroundColor: colors.backgroundCard,
          borderColor: colors.accent,
          statusText: `${completedContents}/${totalContents} ${t('training.inProgress')}`,
          statusColor: colors.accent,
          progressColor: colors.accent,
        };
      default:
        return {
          backgroundColor: colors.backgroundCard,
          borderColor: colors.border,
          statusText: t('training.notStarted'),
          statusColor: colors.textMuted,
          progressColor: colors.border,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(index * 100)}
      style={styles.wrapper}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: config.backgroundColor,
            borderRadius: borderRadius.lg,
            borderWidth: 1.5,
            borderColor: config.borderColor,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.content, { padding: spacing.md }]}>
          {/* Icon */}
          <View style={styles.iconSection}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: config.statusColor + '20',
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : CATEGORY_ICONS[topic.category]}
                size={28}
                color={config.statusColor}
              />
            </View>
          </View>

          {/* Title */}
          <Text
            style={[
              typography.label,
              { color: colors.textPrimary, marginTop: spacing.sm, textAlign: 'center' },
            ]}
            numberOfLines={2}
          >
            {t(topic.titleKey)}
          </Text>

          {/* Progress bar */}
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.border,
                borderRadius: borderRadius.xs,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: config.progressColor,
                  width: `${progress * 100}%`,
                  borderRadius: borderRadius.xs,
                },
              ]}
            />
          </View>

          {/* Status badge */}
          <View style={[styles.statusContainer, { marginTop: spacing.sm }]}>
            {isCompleted && (
              <Ionicons name="checkmark" size={14} color={config.statusColor} />
            )}
            <Text
              style={[
                typography.caption,
                { color: config.statusColor, marginLeft: isCompleted ? 4 : 0 },
              ]}
            >
              {config.statusText}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  container: {
    flex: 1,
    minHeight: 160,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  iconSection: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
