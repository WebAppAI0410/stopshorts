/**
 * ExpiredSubscriptionScreen Component
 * Shown when user's subscription has expired
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import { Button } from '../ui';

interface ExpiredSubscriptionScreenProps {
  /** Called when user taps subscribe button */
  onSubscribe: () => void;
  /** Called when user taps restore purchases */
  onRestore?: () => void;
}

export function ExpiredSubscriptionScreen({
  onSubscribe,
  onRestore,
}: ExpiredSubscriptionScreenProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}
        >
          <Ionicons name="time-outline" size={64} color={colors.warning} />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.duration(600).delay(200)}
          style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl }]}
        >
          {t('subscription.expired.title')}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.duration(600).delay(300)}
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
          ]}
        >
          {t('subscription.expired.message')}
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={[styles.featuresCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.xl }]}
        >
          <Text style={[typography.label, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            {t('subscription.expired.featuresTitle')}
          </Text>

          {['interventions', 'training', 'statistics'].map((feature) => (
            <View
              key={feature}
              style={styles.featureRow}
              accessible={true}
              accessibilityLabel={t(`subscription.expired.features.${feature}`)}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                {t(`subscription.expired.features.${feature}`)}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(500)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        <Button
          title={t('subscription.expired.subscribeButton')}
          onPress={onSubscribe}
          size="lg"
          style={{ marginBottom: spacing.md }}
        />

        {onRestore && (
          <Button
            title={t('subscription.expired.restoreButton')}
            onPress={onRestore}
            variant="ghost"
            size="lg"
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresCard: {
    width: '100%',
    padding: 20,
    marginTop: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footer: {
    paddingBottom: 40,
  },
});
