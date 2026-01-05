/**
 * AI Coach Screen
 * Standalone AI chatbot accessible from bottom navigation tab
 *
 * Features:
 * - Chat interface with AI assistant
 * - Local LLM inference (Qwen 3 0.6B via react-native-executorch)
 * - Pattern-based fallback when LLM not available
 * - Session management with memory
 * - Crisis detection (mental health keywords)
 * - Offline detection with banner
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Alert,
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
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAIStore, selectMessages } from '../../src/stores/useAIStore';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { useExecutorchLLM } from '../../src/hooks/useExecutorchLLM';
import { handleCrisisIfDetected } from '../../src/services/ai';
import { ModelDownloadCard } from '../../src/components/ai/ModelDownloadCard';
import { t } from '../../src/i18n';
import type { Message, ConversationModeId } from '../../src/types/ai';

export default function AIScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const { isOffline } = useNetworkStatus();

  const [inputText, setInputText] = useState('');
  // Track previous status for download completion detection
  const prevStatusRef = useRef<string | null>(null);
  // Standalone mode always uses 'free' conversation mode
  const conversationMode: ConversationModeId = 'free';

  // AI Store
  const startSession = useAIStore((state) => state.startSession);
  const endSession = useAIStore((state) => state.endSession);
  const sendMessage = useAIStore((state) => state.sendMessage);
  const addAIGreeting = useAIStore((state) => state.addAIGreeting);
  const isGenerating = useAIStore((state) => state.isGenerating);
  const messages = useAIStore(selectMessages);
  const personaId = useAIStore((state) => state.personaId);

  // LLM Hook - integrates with local Qwen 3 0.6B model
  const llm = useExecutorchLLM({
    personaId,
    modeId: conversationMode,
  });

  // Animation for typing indicator
  const typingOpacity = useSharedValue(0);
  const typingStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
  }));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are designed to be mutable
    typingOpacity.value = withTiming(isGenerating ? 1 : 0, { duration: 200 });
  }, [isGenerating, typingOpacity]);

  // Start session on mount
  useEffect(() => {
    startSession();

    return () => {
      endSession('navigation_away');
    };
  }, [startSession, endSession]);

  // Add AI greeting only when model is ready
  useEffect(() => {
    if (llm.isReady && messages.length === 0) {
      const timer = setTimeout(() => {
        const greeting = t('ai.greeting');
        addAIGreeting(greeting);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [llm.isReady, messages.length, addAIGreeting]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Handle model download
  const handleDownloadModel = useCallback(() => {
    llm.startDownload();
  }, [llm]);

  // Detect download completion and show toast
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const currentStatus = llm.status;

    // Show toast when transitioning from downloading to ready
    if (prevStatus === 'downloading' && currentStatus === 'ready') {
      Alert.alert(
        t('ai.model.ready'),
        t('ai.downloadComplete'),
        [{ text: 'OK' }]
      );
    }

    prevStatusRef.current = currentStatus;
  }, [llm.status]);

  // Handle send message - uses LLM when available, falls back to pattern matching
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isGenerating || llm.isGenerating) return;

    const userInput = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    // Check for crisis keywords FIRST - before any LLM processing
    const crisisResponse = handleCrisisIfDetected(userInput);
    if (crisisResponse) {
      // Add user message to session
      const session = useAIStore.getState().currentSession;
      if (session) {
        const userMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
          tokenEstimate: Math.ceil(userInput.length / 2.5),
        };
        const aiMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: crisisResponse,
          timestamp: Date.now(),
          tokenEstimate: Math.ceil(crisisResponse.length / 2.5),
        };
        useAIStore.setState({
          currentSession: {
            ...session,
            messages: [...session.messages, userMessage, aiMessage],
            lastActivityAt: Date.now(),
          },
        });
      }
      return;
    }

    // If LLM is ready, use it for generation
    if (llm.isReady) {
      try {
        // Add user message first
        const session = useAIStore.getState().currentSession;
        if (session) {
          const userMessage: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            role: 'user',
            content: userInput,
            timestamp: Date.now(),
            tokenEstimate: Math.ceil(userInput.length / 2.5),
          };
          useAIStore.setState({
            currentSession: {
              ...session,
              messages: [...session.messages, userMessage],
              lastActivityAt: Date.now(),
            },
            isGenerating: true,
          });
        }

        // Generate response using LLM
        const response = await llm.generate(userInput, messages);

        // Add AI response
        const updatedSession = useAIStore.getState().currentSession;
        if (updatedSession) {
          if (response) {
            const aiMessage: Message = {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              role: 'assistant',
              content: response,
              timestamp: Date.now(),
              tokenEstimate: Math.ceil(response.length / 2.5),
            };
            useAIStore.setState({
              currentSession: {
                ...updatedSession,
                messages: [...updatedSession.messages, aiMessage],
                lastActivityAt: Date.now(),
              },
              isGenerating: false,
            });
          } else {
            // Empty response - still need to reset isGenerating
            useAIStore.setState({ isGenerating: false });
            // Fall back to pattern matching for empty responses
            sendMessage(userInput);
          }
        } else {
          useAIStore.setState({ isGenerating: false });
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[AIScreen] LLM generation error:', error);
        }
        useAIStore.setState({ isGenerating: false });
        // Fall back to store's pattern matching on error
        sendMessage(userInput);
      }
    } else {
      // Fall back to store's pattern matching when LLM not ready
      sendMessage(userInput);
    }
  }, [inputText, isGenerating, llm, messages, sendMessage]);

  // Render message bubble
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isUser = item.role === 'user';
      const EnterAnimation = isUser ? SlideInRight : SlideInLeft;

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
        >
          {!isUser && (
            <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderRadius: borderRadius.full }]}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
          )}
          <Text
            style={[
              typography.body,
              { color: isUser ? '#FFFFFF' : colors.textPrimary, flex: 1 },
            ]}
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
    >
      <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderRadius: borderRadius.full }]}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
      </View>
      <View style={styles.typingDots}>
        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
        <View style={[styles.dot, { backgroundColor: colors.textMuted, marginHorizontal: 4 }]} />
        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
      </View>
    </Animated.View>
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
          style={[styles.header, { paddingHorizontal: spacing.gutter, borderBottomColor: colors.border }]}
        >
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15', borderRadius: borderRadius.full }]}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              {t('ai.screenTitle')}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {t('ai.subtitle')}
            </Text>
          </View>
        </Animated.View>

        {/* Offline Banner */}
        {isOffline && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[
              styles.offlineBanner,
              {
                backgroundColor: colors.warning + '20',
                borderBottomColor: colors.warning + '40',
                paddingHorizontal: spacing.gutter,
              },
            ]}
          >
            <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
            <Text style={[typography.caption, { color: colors.warning, marginLeft: spacing.xs }]}>
              {t('ai.offlineBanner')}
            </Text>
          </Animated.View>
        )}

        {/* Model Download Card - Required before chat can be used */}
        {!llm.isReady && llm.status !== 'unavailable' && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.md }}
          >
            <ModelDownloadCard
              status={llm.status}
              progress={llm.downloadProgress}
              error={llm.error?.message}
              onDownload={handleDownloadModel}
              onRetry={handleDownloadModel}
              showSkip={false}
            />
          </Animated.View>
        )}

        {/* Messages List */}
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
                {llm.isReady ? t('ai.emptyMessage') : t('ai.chatDisabled')}
              </Text>
            </Animated.View>
          }
        />

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
                backgroundColor: llm.isReady ? colors.background : colors.backgroundCard,
                color: colors.textPrimary,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                opacity: llm.isReady ? 1 : 0.5,
              },
            ]}
            placeholder={llm.isReady ? t('ai.inputPlaceholder') : t('ai.chatDisabled')}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={llm.isReady && !isGenerating}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!llm.isReady || !inputText.trim() || isGenerating}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: llm.isReady && inputText.trim() ? colors.primary : colors.backgroundCard,
                borderRadius: borderRadius.full,
                opacity: pressed ? 0.8 : llm.isReady ? 1 : 0.5,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={20}
              color={llm.isReady && inputText.trim() ? '#FFFFFF' : colors.textMuted}
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
