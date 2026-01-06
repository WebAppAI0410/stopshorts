/**
 * CategorySection Component
 * Section component for grouping topics by category with 2-column grid
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import { TopicGridCard } from './TopicGridCard';
import type { TrainingTopic, TrainingCategory, TrainingProgress } from '../../types/training';

interface CategorySectionProps {
  category: TrainingCategory;
  topics: TrainingTopic[];
  trainingProgress: Record<string, TrainingProgress>;
  onTopicPress: (topicId: string) => void;
  index?: number;
}

const CATEGORY_CONFIG: Record<
  TrainingCategory,
  {
    icon: keyof typeof Ionicons.glyphMap;
    colorKey: 'primary' | 'accent' | 'success';
  }
> = {
  research: { icon: 'school-outline', colorKey: 'primary' },
  emotional: { icon: 'heart-outline', colorKey: 'accent' },
  goal: { icon: 'flag-outline', colorKey: 'success' },
};

export function CategorySection({
  category,
  topics,
  trainingProgress,
  onTopicPress,
  index = 0,
}: CategorySectionProps) {
  const { colors, typography, spacing } = useTheme();
  const config = CATEGORY_CONFIG[category];

  const getColor = () => {
    switch (config.colorKey) {
      case 'primary':
        return colors.primary;
      case 'accent':
        return colors.accent;
      case 'success':
        return colors.success;
    }
  };

  const color = getColor();

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(index * 150)}
      style={[styles.container, { marginBottom: spacing.xl }]}
    >
      {/* Category Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: color + '20' },
          ]}
        >
          <Ionicons name={config.icon} size={20} color={color} />
        </View>
        <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
          {t(`training.categories.${category}.title`)}
        </Text>
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border, marginVertical: spacing.md },
        ]}
      />

      {/* Topics Grid */}
      <View style={[styles.grid, { gap: spacing.md }]}>
        {topics.map((topic, topicIndex) => {
          const topicProgress = trainingProgress[topic.id];
          const completedContents = topicProgress?.completedContents.length ?? 0;
          const isCompleted = topicProgress?.isCompleted ?? false;

          return (
            <TopicGridCard
              key={topic.id}
              topic={topic}
              completedContents={completedContents}
              isCompleted={isCompleted}
              onPress={() => onTopicPress(topic.id)}
              index={topicIndex}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // inline styles
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
