/**
 * DemoAIExperience - AI intervention preview for demo
 * Shows features of AI coaching
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Header, GlowOrb } from '../ui';
import { t } from '../../i18n';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export function DemoAIExperience({ onBack, onComplete }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <GlowOrb position="top-right" size="large" color="accent" intensity={0.12} />

      <Header showBack variant="ghost" onBack={onBack} />

      <View style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: 20, paddingBottom: 40 }}>
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{ alignItems: 'center', marginBottom: 24 }}
        >
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.accentMuted,
          }}>
            <Ionicons name="chatbubble-ellipses" size={56} color={colors.accent} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
            {t('onboarding.urgeSurfingDemo.ai.title')}
          </Text>
          <Text style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }
          ]}>
            {t('onboarding.urgeSurfingDemo.ai.description')}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={{
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginTop: spacing.xl,
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
              {t('onboarding.urgeSurfingDemo.ai.feature1')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md }}>
            <Ionicons name="heart-outline" size={20} color={colors.accent} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
              {t('onboarding.urgeSurfingDemo.ai.feature2')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md }}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
              {t('onboarding.urgeSurfingDemo.ai.feature3')}
            </Text>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInUp.duration(600).delay(600)}>
          <Button
            title={t('onboarding.urgeSurfingDemo.ai.continue')}
            onPress={onComplete}
            size="lg"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
