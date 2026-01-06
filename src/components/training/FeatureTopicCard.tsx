/**
 * FeatureTopicCard Component
 * Large featured card for "Next Recommended" topic
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { TrainingTopic, TrainingCategory } from '../../types/training';

interface FeatureTopicCardProps {
  topic: TrainingTopic;
  completedContents: number;
  isCompleted: boolean;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<TrainingCategory, keyof typeof Ionicons.glyphMap> = {
  research: 'school-outline',
  emotional: 'heart-outline',
  goal: 'flag-outline',
};

export function FeatureTopicCard({
  topic,
  completedContents,
  isCompleted,
  onPress,
}: FeatureTopicCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const totalContents = topic.contents.length;
  const progress = totalContents > 0 ? completedContents / totalContents : 0;
  const isNotStarted = completedContents === 0;

  const getButtonText = () => {
    if (isCompleted) return t('training.review');
    if (isNotStarted) return t('training.startLearning');
    return t('training.continueLearning');
  };

  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.xl,
            borderColor: isCompleted ? colors.success : colors.accent,
            borderWidth: 2,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.content, { padding: spacing.lg }]}>
          {/* Header with icon and title */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: (isCompleted ? colors.success : colors.accent) + '20',
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : CATEGORY_ICONS[topic.category]}
                size={32}
                color={isCompleted ? colors.success : colors.accent}
              />
            </View>
            <View style={styles.titleContainer}>
              <Text
                style={[typography.h3, { color: colors.textPrimary }]}
                numberOfLines={2}
              >
                {t(topic.titleKey)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary, marginTop: spacing.md },
            ]}
            numberOfLines={2}
          >
            {t(topic.descriptionKey)}
          </Text>

          {/* Progress bar */}
          <View style={[styles.progressContainer, { marginTop: spacing.lg }]}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: isCompleted ? colors.success : colors.accent,
                    width: `${progress * 100}%`,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              />
            </View>
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>

          {/* Meta info */}
          <View style={[styles.metaContainer, { marginTop: spacing.md }]}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                {topic.estimatedMinutes}{t('training.minutes')}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={16} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                {completedContents}/{totalContents} {t('training.contents')}
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.ctaButton,
              {
                backgroundColor: isCompleted ? colors.success : colors.accent,
                borderRadius: borderRadius.md,
                marginTop: spacing.lg,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: colors.background }]}>
              {getButtonText()}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.background} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    // inline styles
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
