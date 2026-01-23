/**
 * ConfirmPhase Component
 * Final confirmation before proceeding to the app
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui';
import type { IntentionId } from '../../types';
import { INTENTION_OPTIONS } from '../../types/intervention';

interface ConfirmPhaseProps {
  /** Selected intention ID */
  intentionId: IntentionId;
  /** Custom text if "other" was selected */
  customText?: string;
  /** Daily open count for warning display */
  dailyOpenCount: number;
  /** Callback when user confirms to proceed */
  onProceed: () => void;
  /** Callback when user dismisses */
  onDismiss: () => void;
}

export function ConfirmPhase({
  intentionId,
  customText,
  dailyOpenCount,
  onProceed,
  onDismiss,
}: ConfirmPhaseProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const selectedOption = INTENTION_OPTIONS.find((opt) => opt.id === intentionId);
  const intentionLabel = intentionId === 'other' && customText
    ? customText
    : selectedOption
      ? t(selectedOption.labelKey)
      : '';

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={[styles.container, { paddingHorizontal: spacing.lg }]}
    >
      <View style={[styles.header, { marginBottom: spacing.xl }]}>
        <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
          {t('intervention.friction.confirm.title')}
        </Text>
      </View>

      {/* Intention Summary */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            padding: spacing.gutter,
            marginBottom: spacing.md,
          },
        ]}
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={intentionLabel}
      >
        <View style={styles.summaryRow}>
          <Ionicons
            name={selectedOption?.icon as keyof typeof Ionicons.glyphMap || 'help-outline'}
            size={24}
            color={colors.textSecondary}
          />
          <Text
            style={[
              typography.body,
              { color: colors.textPrimary, marginLeft: spacing.md, flex: 1 },
            ]}
          >
            {intentionLabel}
          </Text>
        </View>
      </View>

      {/* Warning if high open count */}
      {dailyOpenCount >= 3 && (
        <View
          style={[
            styles.warningBanner,
            {
              backgroundColor: colors.warning + '15',
              borderColor: colors.warning,
              borderRadius: borderRadius.md,
              padding: spacing.smd,
              marginBottom: spacing.xl,
            },
          ]}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLabel={t('intervention.friction.confirm.warning', { count: dailyOpenCount })}
        >
          <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
          <Text
            style={[
              typography.caption,
              { color: colors.warning, marginLeft: spacing.sm, flex: 1 },
            ]}
          >
            {t('intervention.friction.confirm.warning', { count: dailyOpenCount })}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { gap: spacing.smd }]}>
        <Button
          title={t('intervention.friction.confirm.dismiss')}
          variant="primary"
          onPress={onDismiss}
          style={styles.button}
        />
        <Button
          title={t('intervention.friction.confirm.proceed')}
          variant="ghost"
          onPress={onProceed}
          style={styles.button}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: spacing.lg (24) - applied via inline style
    justifyContent: 'center',
  },
  header: {
    // marginBottom: spacing.xl (32) - applied via inline style
  },
  summaryCard: {
    // padding: spacing.gutter (20) - applied via inline style
    borderWidth: 1,
    // marginBottom: spacing.md (16) - applied via inline style
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: spacing.smd (12) - applied via inline style
    borderWidth: 1,
    // marginBottom: spacing.xl (32) - applied via inline style
  },
  buttonContainer: {
    flexDirection: 'row',
    // gap: spacing.smd (12) - applied via inline style
  },
  button: {
    flex: 1,
  },
});
