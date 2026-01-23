/**
 * EmptyStateView Component
 *
 * Displays the empty state UI when there are no messages in the AI chat.
 * Combines suggestion cards, quick actions, and conversation starters.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import { SuggestionCard } from './SuggestionCard';
import { QuickActionsBar } from './QuickActionsBar';
import { ConversationStarters } from './ConversationStarters';
import type {
  ContextualSuggestion,
  ConversationStarter,
  ConversationModeId,
} from '../../types/ai';

interface EmptyStateViewProps {
  suggestions: ContextualSuggestion[];
  starters: ConversationStarter[];
  onSuggestionPress: (suggestion: ContextualSuggestion) => void;
  onQuickAction: (modeId: ConversationModeId) => void;
  onStarterPress: (starter: ConversationStarter) => void;
}

export function EmptyStateView({
  suggestions,
  starters,
  onSuggestionPress,
  onQuickAction,
  onStarterPress,
}: EmptyStateViewProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { padding: spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.titleContainer, { paddingVertical: spacing.md }]}
      >
        <Text style={[typography.h2, { color: colors.textPrimary }]}>
          {t('ai.emptyState.title')}
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, marginTop: spacing.xs },
          ]}
        >
          {t('ai.emptyState.subtitle')}
        </Text>
      </Animated.View>

      {/* Contextual Suggestions */}
      {suggestions.length > 0 && (
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <Text
            style={[
              typography.caption,
              {
                color: colors.textMuted,
                marginBottom: spacing.sm,
                marginLeft: spacing.xs,
              },
            ]}
          >
            {t('ai.suggestions.title')}
          </Text>
          {suggestions.map((suggestion, index) => (
            <View
              key={suggestion.id}
              style={{ marginTop: index > 0 ? spacing.sm : 0 }}
            >
              <SuggestionCard
                title={t(suggestion.titleKey)}
                description={t(suggestion.descriptionKey)}
                category={suggestion.category}
                onPress={() => onSuggestionPress(suggestion)}
                index={index}
              />
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={[styles.section, { marginTop: spacing.xl }]}>
        <QuickActionsBar onActionPress={onQuickAction} />
      </View>

      {/* Conversation Starters */}
      <View style={[styles.section, { marginTop: spacing.xl }]}>
        <ConversationStarters
          starters={starters}
          onStarterPress={onStarterPress}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  titleContainer: {
    alignItems: 'center',
    // paddingVertical: spacing.md (16) - applied via inline style
  },
  section: {},
});
