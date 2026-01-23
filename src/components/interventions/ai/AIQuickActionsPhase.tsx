/**
 * AIQuickActionsPhase Component
 * Mode selection screen before starting conversation
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { t } from '../../../i18n';
import { ModelDownloadCard } from '../../ai/ModelDownloadCard';
import type { ConversationModeId } from '../../../types/ai';
import type { AIQuickActionsPhaseProps, QuickAction } from './types';

/**
 * Quick action configuration for conversation modes
 */
const QUICK_ACTIONS: QuickAction[] = [
  { id: 'explore', icon: 'search-outline', labelKey: 'intervention.ai.quickActions.explore' },
  { id: 'plan', icon: 'list-outline', labelKey: 'intervention.ai.quickActions.plan' },
  { id: 'training', icon: 'school-outline', labelKey: 'intervention.ai.quickActions.training' },
  { id: 'reflect', icon: 'moon-outline', labelKey: 'intervention.ai.quickActions.reflect' },
];

export function AIQuickActionsPhase({
  onSelectMode,
  llmStatus,
  llmIsReady,
  downloadProgress,
  llmError,
  onDownloadModel,
  showDownloadCard,
  onSkipDownload,
}: AIQuickActionsPhaseProps): React.JSX.Element {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400).delay(200)} style={styles.container}>
      {/* Model Download Card - shown when LLM not ready AND not skipped */}
      {showDownloadCard && !llmIsReady && llmStatus !== 'unavailable' && (
        <View style={{ marginBottom: spacing.lg, width: '100%' }}>
          <ModelDownloadCard
            status={llmStatus}
            progress={downloadProgress}
            error={llmError}
            onDownload={onDownloadModel}
            onRetry={onDownloadModel}
            onSkip={onSkipDownload}
            showSkip={true}
          />
        </View>
      )}

      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
        ]}
      >
        {t('intervention.ai.quickActions.title')}
      </Text>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action, index) => (
          <Animated.View key={action.id} entering={FadeInUp.duration(300).delay(100 * index)}>
            <Pressable
              onPress={() => onSelectMode(action.id as ConversationModeId)}
              style={({ pressed }) => [
                styles.quickActionButton,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.primary + '15', borderRadius: borderRadius.full },
                ]}
              >
                <Ionicons
                  name={action.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  typography.body,
                  { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                {t(action.labelKey)}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  quickActionButton: {
    width: 140,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
