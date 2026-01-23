/**
 * GuidedConversation Component
 *
 * Displays a guided conversation flow with structured questions,
 * multiple choice options, and free text input.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import { GuidedStepIndicator } from './GuidedStepIndicator';
import { getGuidedTemplate, getCurrentStep, getTotalSteps } from '../../data/guidedConversations';
import type { GuidedConversationState, GuidedOption } from '../../types/ai';

interface GuidedConversationProps {
  state: GuidedConversationState;
  onOptionSelect: (value: string) => void;
  onFreeInput: (text: string) => void;
  onCancel: () => void;
  onComplete: () => void;
}

export function GuidedConversation({
  state,
  onOptionSelect,
  onFreeInput,
  onCancel,
  onComplete,
}: GuidedConversationProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [inputText, setInputText] = useState('');

  const template = getGuidedTemplate(state.templateId);
  const currentStep = getCurrentStep(state.templateId, state.currentStepIndex);
  const totalSteps = getTotalSteps(state.templateId);

  const handleCancel = useCallback(() => {
    Alert.alert(
      t('ai.guided.confirmCancel'),
      '',
      [
        { text: t('ai.guided.confirmCancelNo'), style: 'cancel' },
        {
          text: t('ai.guided.confirmCancelYes'),
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  }, [onCancel]);

  const handleSubmitInput = useCallback(() => {
    if (inputText.trim()) {
      onFreeInput(inputText.trim());
      setInputText('');
    }
  }, [inputText, onFreeInput]);

  const handleOptionPress = useCallback((option: GuidedOption) => {
    if (option.value === 'complete') {
      onComplete();
    } else if (option.value === 'edit') {
      // Go back to first step - this would need store support
      // For now, just cancel
      handleCancel();
    } else {
      onOptionSelect(option.value);
    }
  }, [onOptionSelect, onComplete, handleCancel]);

  if (!template || !currentStep) {
    return null;
  }

  // Build the prompt with any template variables
  let promptText = t(currentStep.promptKey);
  if (state.currentStepIndex === 3 && state.templateId === 'if-then') {
    // Final confirmation step - inject trigger and action
    promptText = t(currentStep.promptKey, {
      trigger: state.responses['trigger'] || '',
      action: state.responses['alternative'] || '',
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            borderColor: colors.border,
            padding: spacing.lg,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              {t(template.titleKey)}
            </Text>
            <GuidedStepIndicator
              currentStep={state.currentStepIndex}
              totalSteps={totalSteps}
            />
          </View>
          <Pressable
            onPress={handleCancel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-outline"
              size={24}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        {/* Question */}
        <ScrollView
          style={[styles.content, { marginTop: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(300)}>
            <Text
              style={[
                typography.body,
                { color: colors.textPrimary, lineHeight: 24 },
              ]}
            >
              {promptText}
            </Text>

            {/* Options */}
            {currentStep.options && currentStep.options.length > 0 && (
              <View style={[styles.optionsContainer, { marginTop: spacing.lg }]}>
                {currentStep.options.map((option, index) => (
                  <Pressable
                    key={`${currentStep.id}-${index}`}
                    onPress={() => handleOptionPress(option)}
                    style={({ pressed }) => [
                      styles.optionButton,
                      {
                        backgroundColor: pressed
                          ? colors.primary + '20'
                          : colors.background,
                        borderRadius: borderRadius.md,
                        borderColor: colors.border,
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.lg,
                        marginTop: index > 0 ? spacing.sm : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {t(option.textKey)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Free input */}
            {currentStep.allowFreeInput && (
              <View style={[styles.inputContainer, { marginTop: spacing.lg }]}>
                {currentStep.options && currentStep.options.length > 0 && (
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textMuted, marginBottom: spacing.sm },
                    ]}
                  >
                    {t('ai.guided.freeInputHint')}
                  </Text>
                )}
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.background,
                      borderRadius: borderRadius.md,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={t('ai.inputPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        color: colors.textPrimary,
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.md,
                      },
                    ]}
                    multiline
                    onSubmitEditing={handleSubmitInput}
                  />
                  <Pressable
                    onPress={handleSubmitInput}
                    disabled={!inputText.trim()}
                    style={({ pressed }) => [
                      styles.sendButton,
                      {
                        backgroundColor: inputText.trim()
                          ? colors.primary
                          : colors.border,
                        borderRadius: borderRadius.full,
                        marginRight: spacing.sm,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="arrow-forward-outline"
                      size={18}
                      color={colors.textInverse}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  optionsContainer: {},
  optionButton: {
    borderWidth: 1,
  },
  inputContainer: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
