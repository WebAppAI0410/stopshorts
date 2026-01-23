/**
 * Training Topic Selection Screen
 * Redesigned with card-based UI, progress ring, and featured recommendations
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Header, GlowOrb } from '../../../src/components/ui';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { t } from '../../../src/i18n';
import { useAppStore } from '../../../src/stores/useAppStore';
import { TRAINING_TOPICS, getTopicsByCategory } from '../../../src/data/trainingTopics';
import {
  ProgressRing,
  FeatureTopicCard,
  CategorySection,
} from '../../../src/components/training';
import type { TrainingCategory, TrainingTopic } from '../../../src/types/training';

const CATEGORIES: TrainingCategory[] = ['research', 'emotional', 'goal'];

export default function TrainingScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { trainingProgress, getCompletedTopicIds } = useAppStore();

  const topicsByCategory = useMemo(() => {
    return {
      research: getTopicsByCategory('research'),
      emotional: getTopicsByCategory('emotional'),
      goal: getTopicsByCategory('goal'),
    };
  }, []);

  const completedTopicIds = useMemo(() => {
    return getCompletedTopicIds();
  }, [getCompletedTopicIds]);

  const completedTopicCount = completedTopicIds.length;
  const totalTopicCount = TRAINING_TOPICS.length;
  const allCompleted = completedTopicCount === totalTopicCount;

  // Find the recommended topic (highest progress among incomplete topics)
  const recommendedTopic = useMemo((): TrainingTopic | null => {
    if (allCompleted) return null;

    let bestTopic: TrainingTopic | null = null;
    let bestProgress = -1;

    for (const topic of TRAINING_TOPICS) {
      const progress = trainingProgress[topic.id];
      const isCompleted = progress?.isCompleted ?? false;

      if (!isCompleted) {
        const completedContents = progress?.completedContents.length ?? 0;
        const totalContents = topic.contents.length;
        const progressRatio = totalContents > 0 ? completedContents / totalContents : 0;

        // Prioritize topics that are in progress (started but not completed)
        if (completedContents > 0 && progressRatio > bestProgress) {
          bestProgress = progressRatio;
          bestTopic = topic;
        } else if (bestTopic === null) {
          // If no in-progress topic found, use the first not-started topic
          bestTopic = topic;
        }
      }
    }

    return bestTopic;
  }, [trainingProgress, allCompleted]);

  const handleTopicPress = useCallback(
    (topicId: string) => {
      router.push(`/(main)/training/${topicId}` as Href);
    },
    [router]
  );

  const recommendedTopicProgress = recommendedTopic
    ? trainingProgress[recommendedTopic.id]
    : null;
  const recommendedCompletedContents =
    recommendedTopicProgress?.completedContents.length ?? 0;
  const recommendedIsCompleted = recommendedTopicProgress?.isCompleted ?? false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-right" size="large" color="primary" intensity={0.08} />

      <Header title={t('training.screenTitle')} showBack variant="ghost" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.gutter },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={[
            styles.progressCard,
            {
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <View style={styles.progressRow}>
            <ProgressRing
              completed={completedTopicCount}
              total={totalTopicCount}
              size={100}
              strokeWidth={8}
            />
            <View style={styles.progressInfo}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>
                {t('training.stats.total')}
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.textSecondary, marginTop: 4 },
                ]}
              >
                {completedTopicCount}/{totalTopicCount} {t('training.topicCount')}
                {t('training.stats.completed')}
              </Text>
              {allCompleted && (
                <Text
                  style={[
                    typography.caption,
                    { color: colors.success, marginTop: 8 },
                  ]}
                >
                  {t('training.congratulations')}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Recommended Topic */}
        {recommendedTopic && !allCompleted && (
          <Animated.View
            entering={FadeInUp.duration(500).delay(100)}
            style={{ marginBottom: spacing.xl }}
          >
            <Text
              style={[
                typography.label,
                { color: colors.textMuted, marginBottom: spacing.sm },
              ]}
            >
              {t('training.recommended')}
            </Text>
            <FeatureTopicCard
              topic={recommendedTopic}
              completedContents={recommendedCompletedContents}
              isCompleted={recommendedIsCompleted}
              onPress={() => handleTopicPress(recommendedTopic.id)}
            />
          </Animated.View>
        )}

        {/* All Completed Celebration */}
        {allCompleted && (
          <Animated.View
            entering={FadeInUp.duration(500).delay(100)}
            style={[
              styles.celebrationCard,
              {
                backgroundColor: colors.success + '15',
                borderColor: colors.success,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                marginBottom: spacing.xl,
              },
            ]}
          >
            <Text
              style={[
                typography.h3,
                { color: colors.success, textAlign: 'center' },
              ]}
            >
              {t('training.congratulations')}
            </Text>
            <Text
              style={[
                typography.bodySmall,
                { color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
              ]}
            >
              {t('training.allCompleteMessage')}
            </Text>
          </Animated.View>
        )}

        {/* Category Sections */}
        <Text
          style={[
            typography.label,
            { color: colors.textMuted, marginBottom: spacing.md },
          ]}
        >
          {t('training.allTopics')}
        </Text>

        {CATEGORIES.map((category, index) => (
          <CategorySection
            key={category}
            category={category}
            topics={topicsByCategory[category]}
            trainingProgress={trainingProgress}
            onTopicPress={handleTopicPress}
            index={index}
          />
        ))}
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
  progressCard: {
    // inline styles
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
    marginLeft: 20,
  },
  celebrationCard: {
    borderWidth: 1,
  },
});
