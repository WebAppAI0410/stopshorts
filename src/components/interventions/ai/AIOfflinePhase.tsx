/**
 * AIOfflinePhase Component
 * Displayed when user is offline - provides fallback options
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { t } from '../../../i18n';
import { Button } from '../../ui';
import type { AIOfflinePhaseProps } from './types';

export function AIOfflinePhase({
  onProceed,
  onDismiss,
  onFallbackToFriction,
}: AIOfflinePhaseProps): React.JSX.Element {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.offlineContainer, { paddingHorizontal: spacing.gutter }]}
      >
        <View
          style={[
            styles.offlineIcon,
            { backgroundColor: colors.textMuted + '20', borderRadius: borderRadius.full },
          ]}
        >
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
        </View>
        <Text
          style={[
            typography.h2,
            { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.lg },
          ]}
        >
          {t('intervention.ai.offline.title')}
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
          ]}
        >
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
            onPress={onDismiss}
            variant={onFallbackToFriction ? 'secondary' : 'primary'}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            title={t('intervention.ai.proceed')}
            onPress={onProceed}
            variant="ghost"
            size="sm"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
