/**
 * AIIntervention Component
 * Conversational AI chatbot for mindful intervention
 *
 * Features:
 * - Chat interface with AI assistant
 * - Pattern-based responses (placeholder for LLM)
 * - Session management with memory
 * - "Quit" (primary) and "Give in to temptation" (ghost) buttons
 */

import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAIStore, selectMessages } from '../../stores/useAIStore';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { t } from '../../i18n';
import { Button } from '../ui';
import type { Message } from '../../types/ai';

interface AIInterventionProps {
  /** Name of the blocked app */
  blockedAppName: string;
  /** Callback when user chooses to proceed */
  onProceed: () => void;
  /** Callback when user dismisses (goes home) */
  onDismiss: () => void;
  /** Callback when user chooses friction intervention as fallback (offline) */
  onFallbackToFriction?: () => void;
  /** Minimum messages before showing decision buttons (default: 2) */
  minMessages?: number;
}

export function AIIntervention({
  blockedAppName,
  onProceed,
  onDismiss,
  onFallbackToFriction,
  minMessages = 2,
}: AIInterventionProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const mountMeasuredRef = useRef(false);
  const llmResponsePendingRef = useRef(false);
  const { isOffline } = useNetworkStatus();

  const [inputText, setInputText] = useState('');
  const [showButtons, setShowButtons] = useState(false);

  // AI Store
  const startSession = useAIStore((state) => state.startSession);
  const endSession = useAIStore((state) => state.endSession);
  const sendMessage = useAIStore((state) => state.sendMessage);
  const addAIGreeting = useAIStore((state) => state.addAIGreeting);
  const isGenerating = useAIStore((state) => state.isGenerating);
  const messages = useAIStore(selectMessages);

  // Statistics
  const { recordIntervention } = useStatisticsStore();

  // Animation for typing indicator
  const typingOpacity = useSharedValue(0);
  const typingStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
  }));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are designed to be mutable
    typingOpacity.value = withTiming(isGenerating ? 1 : 0, { duration: 200 });
  }, [isGenerating, typingOpacity]);

  // Start mount time measurement (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    performanceMonitor.start('ai_intervention_mount');
  }, []);

  // End mount time measurement
  useEffect(() => {
    if (!mountMeasuredRef.current) {
      mountMeasuredRef.current = true;
      performanceMonitor.end('ai_intervention_mount');
    }
  }, []);

  // Track LLM response time
  useEffect(() => {
    if (!isGenerating && llmResponsePendingRef.current) {
      // LLM finished generating
      llmResponsePendingRef.current = false;
      performanceMonitor.end('llm_response');
    }
  }, [isGenerating]);

  // Start session on mount with initial AI greeting
  useEffect(() => {
    startSession();

    // AI initiates the conversation with a greeting
    // Using a short delay for natural feel
    const timer = setTimeout(() => {
      const greeting = t('intervention.ai.greeting', { app: blockedAppName });
      addAIGreeting(greeting);
    }, 500);

    return () => {
      clearTimeout(timer);
      // End session on unmount
      endSession('navigation_away');
    };
  }, [startSession, endSession, addAIGreeting, blockedAppName]);

  // Show decision buttons after minimum exchanges (excluding initial greeting)
  useEffect(() => {
    // minMessages * 2 for user + AI exchanges, +1 for initial AI greeting
    if (messages.length >= minMessages * 2 + 1) {
      setShowButtons(true);
    }
  }, [messages.length, minMessages]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || isGenerating) return;

    // Start LLM response timing
    performanceMonitor.start('llm_response');
    llmResponsePendingRef.current = true;

    sendMessage(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  }, [inputText, isGenerating, sendMessage]);

  // Handle proceed action
  const handleProceed = useCallback(() => {
    recordIntervention({ proceeded: true });
    endSession('user_explicit');
    onProceed();
  }, [recordIntervention, endSession, onProceed]);

  // Handle dismiss action
  const handleDismiss = useCallback(() => {
    recordIntervention({ proceeded: false });
    endSession('user_explicit');
    onDismiss();
  }, [recordIntervention, endSession, onDismiss]);

  // Render message bubble
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isUser = item.role === 'user';
      const EnterAnimation = isUser ? SlideInRight : SlideInLeft;
      const accessibilityLabel = isUser
        ? t('intervention.ai.accessibility.userMessage', { content: item.content })
        : t('intervention.ai.accessibility.aiMessage', { content: item.content });

      return (
        <Animated.View
          entering={EnterAnimation.duration(300).delay(index === messages.length - 1 ? 0 : 0)}
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
            {
              backgroundColor: isUser ? colors.primary : colors.backgroundCard,
              borderRadius: borderRadius.lg,
              marginLeft: isUser ? spacing.xl : 0,
              marginRight: isUser ? 0 : spacing.xl,
            },
          ]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={accessibilityLabel}
        >
          {!isUser && (
            <View
              style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderRadius: borderRadius.full }]}
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
          )}
          <Text
            style={[
              typography.body,
              { color: isUser ? '#FFFFFF' : colors.textPrimary, flex: 1 },
            ]}
            importantForAccessibility="no"
          >
            {item.content}
          </Text>
        </Animated.View>
      );
    },
    [colors, typography, spacing, borderRadius, messages.length]
  );

  // Typing indicator
  const renderTypingIndicator = () => (
    <Animated.View
      style={[
        styles.typingIndicator,
        { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg },
        typingStyle,
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={t('intervention.ai.accessibility.aiTyping')}
      accessibilityLiveRegion="assertive"
    >
      <View
        style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderRadius: borderRadius.full }]}
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="sparkles" size={16} color={colors.primary} />
      </View>
      <View style={styles.typingDots} importantForAccessibility="no-hide-descendants">
        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
        <View style={[styles.dot, { backgroundColor: colors.textMuted, marginHorizontal: 4 }]} />
        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
      </View>
    </Animated.View>
  );

  // Render offline fallback UI
  if (isOffline) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.offlineContainer, { paddingHorizontal: spacing.gutter }]}
        >
          <View style={[styles.offlineIcon, { backgroundColor: colors.textMuted + '20', borderRadius: borderRadius.full }]}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.lg }]}>
            {t('intervention.ai.offline.title')}
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm }]}>
            {t('intervention.ai.offline.message')}
          </Text>
          <View style={[styles.offlineButtons, { marginTop: spacing.xl }]}>
            {onFallbackToFriction && (
              <Button
                title={t('intervention.ai.offline.useFriction')}
                onPress={onFallbackToFriction}
                variant="primary"
                style={{ marginBottom: spacing.sm }}
              />
            )}
            <Button
              title={t('intervention.ai.quit')}
              onPress={handleDismiss}
              variant={onFallbackToFriction ? 'secondary' : 'primary'}
              style={{ marginBottom: spacing.sm }}
            />
            <Button
              title={t('intervention.ai.proceed')}
              onPress={handleProceed}
              variant="ghost"
              size="sm"
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.header, { paddingHorizontal: spacing.gutter, borderBottomColor: colors.border }]}
        >
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15', borderRadius: borderRadius.full }]}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              {t('intervention.ai.title')}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {t('intervention.ai.subtitle', { app: blockedAppName })}
            </Text>
          </View>
        </Animated.View>

        {/* Messages List */}
        <View
          accessibilityLiveRegion="polite"
          style={{ flex: 1 }}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              { paddingHorizontal: spacing.gutter, paddingBottom: spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isGenerating ? renderTypingIndicator : null}
            ListEmptyComponent={
              <Animated.View
                entering={FadeIn.duration(400).delay(200)}
                style={styles.emptyContainer}
              >
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
                  {t('intervention.ai.emptyMessage')}
                </Text>
              </Animated.View>
            }
          />
        </View>

        {/* Decision Buttons (shown after minimum exchanges) */}
        {showButtons && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={[styles.buttonsContainer, { paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm }]}
          >
            <Button
              title={t('intervention.ai.quit')}
              onPress={handleDismiss}
              variant="primary"
              style={{ marginBottom: spacing.sm }}
              accessibilityLabel={t('intervention.ai.accessibility.quitButton')}
            />
            <Button
              title={t('intervention.ai.proceed')}
              onPress={handleProceed}
              variant="ghost"
              size="sm"
              accessibilityLabel={t('intervention.ai.accessibility.proceedButton')}
            />
          </Animated.View>
        )}

        {/* Input Area */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.backgroundCard,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.gutter,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              typography.body,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
            placeholder={t('intervention.ai.inputPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isGenerating}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            accessibilityLabel={t('intervention.ai.accessibility.inputLabel')}
            accessibilityHint={t('intervention.ai.accessibility.inputHint')}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isGenerating}
            accessibilityRole="button"
            accessibilityLabel={
              inputText.trim()
                ? t('intervention.ai.accessibility.sendButton')
                : t('intervention.ai.accessibility.sendButtonDisabled')
            }
            accessibilityState={{ disabled: !inputText.trim() || isGenerating }}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.backgroundCard,
                borderRadius: borderRadius.full,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? '#FFFFFF' : colors.textMuted}
            />
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  messagesList: {
    paddingTop: 16,
    flexGrow: 1,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    alignSelf: 'flex-start',
    maxWidth: '40%',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  buttonsContainer: {
    paddingTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineIcon: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineButtons: {
    width: '100%',
  },
});
