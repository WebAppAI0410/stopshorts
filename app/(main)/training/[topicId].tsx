/**
 * Training Topic Detail Screen
 * Shows article, quiz, and worksheet content for a specific topic
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Header, Button, GlowOrb } from '../../../src/components/ui';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { t } from '../../../src/i18n';
import { useAppStore } from '../../../src/stores/useAppStore';
import { getTopicById } from '../../../src/data/trainingTopics';
import type { TrainingContent } from '../../../src/types/training';

type ContentPhase = 'list' | 'article' | 'quiz' | 'worksheet' | 'complete';

export default function TopicDetailScreen() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const {
    trainingProgress,
    completeContent,
    saveWorksheetAnswer,
    recordQuizScore,
    markTopicCompleted,
    isContentCompleted,
  } = useAppStore();

  const topic = useMemo(() => getTopicById(topicId || ''), [topicId]);
  const topicProgress = topicId ? trainingProgress[topicId] : undefined;
  const [phase, setPhase] = useState<ContentPhase>('list');
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [worksheetAnswers, setWorksheetAnswers] = useState<Record<string, string>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Load saved worksheet answers from store when topic changes
  // This sync from store to local state is intentional for editing workflow
  useEffect(() => {
    if (topicProgress?.worksheetAnswers) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorksheetAnswers(topicProgress.worksheetAnswers);
    }
  }, [topicProgress?.worksheetAnswers]);

  // All useCallback hooks must be called before any early returns (React Hooks rules)
  const handleContentPress = useCallback((content: TrainingContent) => {
    if (!topic) return;
    const index = topic.contents.findIndex((c) => c.id === content.id);
    setCurrentContentIndex(index);
    setPhase(content.type);
    setShowQuizResult(false);
  }, [topic]);

  const handleNextContent = useCallback(() => {
    if (!topicId || !topic) return;

    // Mark current content as completed
    const currentContentItem = topic.contents[currentContentIndex];
    if (currentContentItem) {
      completeContent(topicId, currentContentItem.id);

      // For quizzes, calculate and record score
      if (currentContentItem.type === 'quiz' && currentContentItem.questions) {
        const totalQuestions = currentContentItem.questions.length;
        const correctAnswers = currentContentItem.questions.filter(
          (q) => quizAnswers[q.id] === q.correctIndex
        ).length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        recordQuizScore(topicId, currentContentItem.id, score);
      }

      // For worksheets, save all answers
      if (currentContentItem.type === 'worksheet' && currentContentItem.prompts) {
        currentContentItem.prompts.forEach((prompt) => {
          const answer = worksheetAnswers[prompt.id];
          if (answer) {
            saveWorksheetAnswer(topicId, prompt.id, answer);
          }
        });
      }
    }

    if (currentContentIndex < topic.contents.length - 1) {
      const nextContent = topic.contents[currentContentIndex + 1];
      setCurrentContentIndex(currentContentIndex + 1);
      setPhase(nextContent.type);
      setShowQuizResult(false);
    } else {
      // Mark topic as completed when all contents are done
      markTopicCompleted(topicId);
      setPhase('complete');
    }
  }, [currentContentIndex, topic, topicId, quizAnswers, worksheetAnswers, completeContent, recordQuizScore, saveWorksheetAnswer, markTopicCompleted]);

  const handleQuizAnswer = useCallback((questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, []);

  const handleWorksheetChange = useCallback((promptId: string, text: string) => {
    setWorksheetAnswers((prev) => ({ ...prev, [promptId]: text }));
  }, []);

  const handleBack = useCallback(() => {
    if (phase === 'list') {
      router.back();
    } else {
      setPhase('list');
    }
  }, [phase, router]);

  // Early return for error state - must be after all hooks
  if (!topic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={t('common.error')} showBack />
        <View style={styles.errorContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {t('training.topicNotFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentContent = topic.contents[currentContentIndex];

  // Content List Phase
  const renderContentList = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Topic Header */}
      <Animated.View entering={FadeInUp.duration(500)}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>
          {t(topic.titleKey)}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          {t(topic.descriptionKey)}
        </Text>
        <View style={[styles.metaRow, { marginTop: spacing.md }]}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
            {topic.estimatedMinutes}{t('training.minutes')}
          </Text>
        </View>
      </Animated.View>

      {/* Content Items */}
      <View style={[styles.contentsList, { marginTop: spacing.xl }]}>
        {topic.contents.map((content, index) => {
          const contentCompleted = topicId ? isContentCompleted(topicId, content.id) : false;
          const iconName = content.type === 'article' ? 'document-text-outline' :
                          content.type === 'quiz' ? 'help-circle-outline' : 'create-outline';

          return (
            <Animated.View
              key={content.id}
              entering={FadeInUp.duration(400).delay(200 + index * 100)}
            >
              <Pressable
                onPress={() => handleContentPress(content)}
                style={({ pressed }) => [
                  styles.contentCard,
                  {
                    backgroundColor: colors.backgroundCard,
                    borderRadius: borderRadius.lg,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.contentIcon,
                    { backgroundColor: contentCompleted ? colors.success + '20' : colors.primary + '20' },
                  ]}
                >
                  <Ionicons
                    name={contentCompleted ? 'checkmark-circle' : iconName}
                    size={24}
                    color={contentCompleted ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.contentInfo}>
                  <Text style={[typography.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>
                    {t(`training.contentTypes.${content.type}`)}
                  </Text>
                  <Text style={[typography.h3, { color: colors.textPrimary, marginTop: 2, fontSize: 16 }]}>
                    {t(content.titleKey)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );

  // Article Phase
  const renderArticle = () => {
    if (currentContent?.type !== 'article' || !currentContent.bodyKey) return null;

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
            {t(currentContent.titleKey)}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 26 }]}>
            {t(currentContent.bodyKey)}
          </Text>
        </Animated.View>

        <View style={[styles.buttonContainer, { marginTop: spacing['2xl'] }]}>
          <Button
            title={t('training.nextContent')}
            onPress={handleNextContent}
            size="lg"
          />
        </View>
      </ScrollView>
    );
  };

  // Quiz Phase
  const renderQuiz = () => {
    if (currentContent?.type !== 'quiz' || !currentContent.questions) return null;

    const allAnswered = currentContent.questions.every((q) => quizAnswers[q.id] !== undefined);

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
            {t(currentContent.titleKey)}
          </Text>

          {currentContent.questions.map((question) => (
            <View
              key={question.id}
              style={[
                styles.questionCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Text style={[typography.body, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                {t(question.questionKey)}
              </Text>

              {question.optionKeys.map((optionKey, oIndex) => {
                const isSelected = quizAnswers[question.id] === oIndex;
                const showResult = showQuizResult && quizAnswers[question.id] !== undefined;
                const isCorrect = oIndex === question.correctIndex;

                let bgColor = colors.surface;
                if (showQuizResult) {
                  if (isSelected && isCorrect) bgColor = colors.success + '20';
                  else if (isSelected && !isCorrect) bgColor = colors.error + '20';
                  else if (isCorrect) bgColor = colors.success + '10';
                }

                return (
                  <Pressable
                    key={oIndex}
                    onPress={() => !showQuizResult && handleQuizAnswer(question.id, oIndex)}
                    disabled={showQuizResult}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected && !showResult ? colors.primary + '20' : bgColor,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <Text style={[typography.body, { color: colors.textPrimary }]}>
                      {t(optionKey)}
                    </Text>
                    {showResult && isCorrect && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    )}
                  </Pressable>
                );
              })}

              {showQuizResult && quizAnswers[question.id] !== undefined && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  style={[
                    styles.explanationBox,
                    {
                      backgroundColor: colors.accentMuted,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      marginTop: spacing.md,
                    },
                  ]}
                >
                  <Text style={[typography.bodySmall, { color: colors.textPrimary }]}>
                    {t(question.explanationKey)}
                  </Text>
                </Animated.View>
              )}
            </View>
          ))}
        </Animated.View>

        <View style={[styles.buttonContainer, { marginTop: spacing.lg }]}>
          {!showQuizResult ? (
            <Button
              title={t('training.quiz.checkAnswers')}
              onPress={() => setShowQuizResult(true)}
              disabled={!allAnswered}
              size="lg"
            />
          ) : (
            <Button
              title={t('training.nextContent')}
              onPress={handleNextContent}
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    );
  };

  // Worksheet Phase
  const renderWorksheet = () => {
    if (currentContent?.type !== 'worksheet' || !currentContent.prompts) return null;

    const allFilled = currentContent.prompts.every((p) => {
      const answer = worksheetAnswers[p.id] || '';
      return answer.length >= (p.minLength || 1);
    });

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
            {t(currentContent.titleKey)}
          </Text>

          {currentContent.prompts.map((prompt) => (
            <View
              key={prompt.id}
              style={[
                styles.promptCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Text style={[typography.body, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                {t(prompt.promptKey)}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
                placeholder={t(prompt.placeholderKey)}
                placeholderTextColor={colors.textMuted}
                value={worksheetAnswers[prompt.id] || ''}
                onChangeText={(text) => handleWorksheetChange(prompt.id, text)}
                multiline
                numberOfLines={4}
                maxLength={prompt.maxLength || 500}
              />
              {prompt.minLength && (
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {t('training.worksheet.minLength', { count: prompt.minLength })}
                </Text>
              )}
            </View>
          ))}
        </Animated.View>

        <View style={[styles.buttonContainer, { marginTop: spacing.lg }]}>
          <Button
            title={t('training.worksheet.submit')}
            onPress={handleNextContent}
            disabled={!allFilled}
            size="lg"
          />
        </View>
      </ScrollView>
    );
  };

  // Complete Phase
  const renderComplete = () => (
    <View style={[styles.completeContainer, { paddingHorizontal: spacing.gutter }]}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.completeContent}>
        <View
          style={[
            styles.completeIcon,
            { backgroundColor: colors.success + '20' },
          ]}
        >
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl }]}>
          {t('training.complete.title')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
          {t('training.complete.message')}
        </Text>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('training.complete.backToList')}
          onPress={() => router.back()}
          size="lg"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-right" size="large" color="primary" intensity={0.08} />

      <Header
        title={phase === 'list' ? t(topic.titleKey) : t(`training.contentTypes.${currentContent?.type || 'article'}`)}
        showBack
        onBack={handleBack}
        variant="ghost"
      />

      {phase === 'list' && renderContentList()}
      {phase === 'article' && renderArticle()}
      {phase === 'quiz' && renderQuiz()}
      {phase === 'worksheet' && renderWorksheet()}
      {phase === 'complete' && renderComplete()}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentsList: {
    gap: 12,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentInfo: {
    flex: 1,
  },
  questionCard: {
    // inline styles
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  explanationBox: {
    // inline styles
  },
  promptCard: {
    // inline styles
  },
  textInput: {
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  completeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
