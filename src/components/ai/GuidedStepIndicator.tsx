/**
 * GuidedStepIndicator Component
 *
 * Displays progress through a guided conversation with step dots.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';

interface GuidedStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function GuidedStepIndicator({
  currentStep,
  totalSteps,
}: GuidedStepIndicatorProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {t('ai.guided.step', { current: currentStep + 1, total: totalSteps })}
      </Text>
      <View style={[styles.dotsContainer, { marginLeft: spacing.sm }]}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index <= currentStep ? colors.primary : colors.border,
                borderRadius: borderRadius.full,
                marginLeft: index > 0 ? spacing.xs : 0,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
  },
});
