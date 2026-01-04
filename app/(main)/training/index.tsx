/**
 * Training Topic Selection Screen
 * Shows available psychological training topics organized by category
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Header, GlowOrb } from '../../../src/components/ui';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { t } from '../../../src/i18n';
import { TRAINING_TOPICS, getTopicsByCategory } from '../../../src/data/trainingTopics';
import type { TrainingCategory, TrainingTopic } from '../../../src/types/training';

type CategoryInfo = {
  category: TrainingCategory;
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: 'primary' | 'accent' | 'success';
};

const CATEGORIES: CategoryInfo[] = [
  { category: 'research', icon: 'book-outline', colorKey: 'primary' },
  { category: 'emotional', icon: 'heart-outline', colorKey: 'accent' },
  { category: 'goal', icon: 'flag-outline', colorKey: 'success' },
];

export default function TrainingScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const topicsByCategory = useMemo(() => {
    return {
      research: getTopicsByCategory('research'),
      emotional: getTopicsByCategory('emotional'),
      goal: getTopicsByCategory('goal'),
    };
  }, []);

  const handleTopicPress = useCallback(
    (topicId: string) => {
      router.push(`/(main)/training/${topicId}` as Href);
    },
    [router]
  );

  const getColorForCategory = (colorKey: 'primary' | 'accent' | 'success') => {
    switch (colorKey) {
      case 'primary':
        return colors.primary;
      case 'accent':
        return colors.accent;
      case 'success':
        return colors.success;
    }
  };

  const renderTopicCard = (topic: TrainingTopic, index: number, colorKey: 'primary' | 'accent' | 'success') => {
    const color = getColorForCategory(colorKey);
    const completedContents = 0; // TODO: Get from store
    const totalContents = topic.contents.length;
    const progress = totalContents > 0 ? completedContents / totalContents : 0;
    const isCompleted = progress === 1;

    return (
      <Animated.View
        key={topic.id}
        entering={FadeInRight.duration(400).delay(200 + index * 80)}
      >
        <Pressable
          onPress={() => handleTopicPress(topic.id)}
          style={({ pressed }) => [
            styles.topicCard,
            {
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.lg,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={styles.topicContent}>
            <View style={styles.topicHeader}>
              <Text
                style={[typography.h3, { color: colors.textPrimary, flex: 1, fontSize: 16 }]}
                numberOfLines={1}
              >
                {t(topic.titleKey)}
              </Text>
              {isCompleted && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </View>
            <Text
              style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}
              numberOfLines={2}
            >
              {t(topic.descriptionKey)}
            </Text>
            <View style={[styles.topicMeta, { marginTop: spacing.sm }]}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                  {topic.estimatedMinutes}{t('training.minutes')}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="layers-outline" size={14} color={colors.textMuted} />
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                  {completedContents}/{totalContents}
                </Text>
              </View>
            </View>
            {/* Progress bar */}
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.border, marginTop: spacing.sm },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: color,
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textMuted}
            style={styles.chevron}
          />
        </Pressable>
      </Animated.View>
    );
  };

  const renderCategory = (categoryInfo: CategoryInfo, categoryIndex: number) => {
    const { category, icon, colorKey } = categoryInfo;
    const topics = topicsByCategory[category];
    const color = getColorForCategory(colorKey);

    return (
      <Animated.View
        key={category}
        entering={FadeInUp.duration(500).delay(categoryIndex * 150)}
        style={[styles.categorySection, { marginBottom: spacing.xl }]}
      >
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: color + '20' },
            ]}
          >
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={styles.categoryTitleContainer}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              {t(`training.categories.${category}.title`)}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {topics.length} {t('training.topicCount')}
            </Text>
          </View>
        </View>

        {/* Topics List */}
        <View style={[styles.topicsContainer, { marginTop: spacing.md }]}>
          {topics.map((topic, index) => renderTopicCard(topic, index, colorKey))}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-right" size="large" color="primary" intensity={0.08} />

      <Header
        title={t('training.screenTitle')}
        showBack
        variant="ghost"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>0</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {t('training.stats.completed')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>
                {TRAINING_TOPICS.length}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {t('training.stats.total')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>0</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {t('training.stats.streak')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Categories */}
        {CATEGORIES.map((cat, index) => renderCategory(cat, index))}
      </ScrollView>
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
    paddingBottom: 40,
  },
  statsCard: {
    // inline styles
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  categorySection: {
    // inline styles
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  topicsContainer: {
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  topicContent: {
    flex: 1,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  chevron: {
    marginLeft: 12,
  },
});
