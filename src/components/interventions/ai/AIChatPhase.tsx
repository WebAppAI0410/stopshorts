/**
 * AIChatPhase Component
 * Chat interface with message list and input area
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import { useTheme } from '../../../contexts/ThemeContext';
import { t } from '../../../i18n';
import { Button } from '../../ui';
import type { Message } from '../../../types/ai';
import type { AIChatPhaseProps } from './types';

export function AIChatPhase({
  blockedAppName,
  messages,
  isGenerating,
  showButtons,
  inputText,
  onChangeText,
  onSend,
  onProceed,
  onDismiss,
  flatListRef,
  listEmptyComponent,
}: AIChatPhaseProps): React.JSX.Element {
  const { colors, typography, spacing, borderRadius } = useTheme();

  // Animation for typing indicator
  const typingOpacity = useSharedValue(0);
  const typingStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
  }));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are designed to be mutable
    typingOpacity.value = withTiming(isGenerating ? 1 : 0, { duration: 200 });
  }, [isGenerating, typingOpacity]);

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
              padding: spacing.smd,
              marginBottom: spacing.sm,
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
              style={[
                styles.aiAvatar,
                {
                  backgroundColor: colors.primary + '20',
                  borderRadius: borderRadius.full,
                  marginRight: spacing.sm,
                },
              ]}
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
          )}
          <Text
            style={[
              typography.body,
              { color: isUser ? colors.white : colors.textPrimary, flex: 1 },
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
  const renderTypingIndicator = useCallback(
    () => (
      <Animated.View
        style={[
          styles.typingIndicator,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            padding: spacing.smd,
          },
          typingStyle,
        ]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={t('intervention.ai.accessibility.aiTyping')}
        accessibilityLiveRegion="assertive"
      >
        <View
          style={[
            styles.aiAvatar,
            {
              backgroundColor: colors.primary + '20',
              borderRadius: borderRadius.full,
              marginRight: spacing.sm,
            },
          ]}
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
    ),
    [colors, borderRadius, spacing, typingStyle]
  );

  // Empty state
  const renderEmptyState = useCallback(
    () => (
      <Animated.View entering={FadeIn.duration(400).delay(200)} style={styles.emptyContainer}>
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
          {t('intervention.ai.emptyMessage')}
        </Text>
      </Animated.View>
    ),
    [colors, typography]
  );

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
          style={[
            styles.header,
            {
              paddingHorizontal: spacing.gutter,
              paddingVertical: spacing.smd,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor: colors.primary + '15',
                borderRadius: borderRadius.full,
                marginRight: spacing.smd,
              },
            ]}
          >
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
        <View accessibilityLiveRegion="polite" style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              {
                paddingHorizontal: spacing.gutter,
                paddingTop: spacing.md,
                paddingBottom: spacing.lg,
              },
            ]}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isGenerating ? renderTypingIndicator : null}
            ListEmptyComponent={listEmptyComponent ?? renderEmptyState}
          />
        </View>

        {/* Decision Buttons (shown after minimum exchanges) */}
        {showButtons && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={[
              styles.buttonsContainer,
              { paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm },
            ]}
          >
            <Button
              title={t('intervention.ai.quit')}
              onPress={onDismiss}
              variant="primary"
              style={{ marginBottom: spacing.sm }}
              accessibilityLabel={t('intervention.ai.accessibility.quitButton')}
            />
            <Button
              title={t('intervention.ai.proceed')}
              onPress={onProceed}
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
            onChangeText={onChangeText}
            multiline
            maxLength={500}
            editable={!isGenerating}
            returnKeyType="send"
            onSubmitEditing={onSend}
          />
          <Pressable
            onPress={onSend}
            disabled={!inputText.trim() || isGenerating}
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
              color={inputText.trim() ? colors.white : colors.textMuted}
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
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
