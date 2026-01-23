/**
 * DemoCompletePhase - Completion phase for urge surfing demo
 * Shows summary of what was learned
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Header, ProgressIndicator, GlowOrb } from '../ui';
import { t } from '../../i18n';

interface Props {
  onBack: () => void;
  onContinue: () => void;
  onTryAnother: () => void;
}

export function DemoCompletePhase({ onBack, onContinue, onTryAnother }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <GlowOrb position="top-right" size="large" color="accent" intensity={0.12} />

      <Header showBack variant="ghost" onBack={onBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 24, paddingHorizontal: spacing.gutter }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={ZoomIn.duration(600)}
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
            <Ionicons name="checkmark-circle" size={64} color={colors.accent} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
            素晴らしい！
          </Text>
          <Text style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }
          ]}>
            これが衝動サーフィングの体験です。{'\n'}
            実際のアプリ使用時も同じように介入が発生します。
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
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            学んだこと
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              衝動は波のように自然に収まる
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              深呼吸で冷静さを取り戻せる
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              一度立ち止まることで選択できる
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(600)}
        style={{ paddingHorizontal: spacing.gutter, paddingTop: 16, paddingBottom: 40 }}
      >
        <Button
          title={t('onboarding.urgeSurfingDemo.complete.continue')}
          onPress={onContinue}
          size="lg"
        />
        <TouchableOpacity
          onPress={onTryAnother}
          style={{ alignItems: 'center', paddingVertical: 12, marginTop: spacing.md }}
        >
          <Text style={[typography.body, { color: colors.textMuted }]}>
            {t('onboarding.urgeSurfingDemo.complete.tryAnother')}
          </Text>
        </TouchableOpacity>
        <View style={{ marginTop: spacing.lg }}>
          <ProgressIndicator totalSteps={9} currentStep={8} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
