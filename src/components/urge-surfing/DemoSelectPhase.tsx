/**
 * DemoSelectPhase - App selection phase for urge surfing demo
 * Allows user to select which app to simulate
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSelector } from '../simulator';
import { Button, Header, ProgressIndicator, GlowOrb } from '../ui';
import type { TargetAppId } from '../../types';

interface Props {
  selectedApp: TargetAppId;
  onSelectApp: (app: TargetAppId) => void;
  onStartSimulation: () => void;
  onSkip: () => void;
}

export function DemoSelectPhase({ selectedApp, onSelectApp, onStartSimulation, onSkip }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
      <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

      <Header showBack variant="ghost" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 24, paddingHorizontal: spacing.gutter }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            衝動サーフィングを体験
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            アプリを使いたい衝動との付き合い方を学びましょう
          </Text>
        </Animated.View>

        {/* Explanation Card */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(150)}
          style={{
            backgroundColor: colors.accentMuted,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginTop: spacing.xl,
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="water-outline" size={20} color={colors.accent} />
            <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
              衝動サーフィングとは？
            </Text>
          </View>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 22, marginTop: spacing.sm }]}>
            衝動は波のようなもの。最初は強く押し寄せますが、必ずピークを過ぎて収まっていきます。
            {'\n\n'}
            この波に「抵抗」するのではなく、深呼吸をしながら「観察」することで、
            衝動に支配されずにやり過ごすことができます。
          </Text>
        </Animated.View>

        {/* App Selector */}
        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={{ marginTop: spacing.xl }}>
          <AppSelector
            selectedApp={selectedApp}
            availableApps={['tiktok', 'instagramReels', 'youtubeShorts', 'facebookReels']}
            onSelectApp={onSelectApp}
            title="体験するアプリを選択"
          />
        </Animated.View>

        {/* Demo Info */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(450)}
          style={{
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginTop: spacing.lg,
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="play-circle-outline" size={20} color={colors.accent} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
              デモでは3回スワイプすると介入画面が表示されます。
            </Text>
          </View>
        </Animated.View>

        {/* Immediate Intervention Info */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(600)}
          style={{
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginTop: spacing.sm,
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="flash-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                実際のアプリでは「即時介入」も選べます。
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                アプリを開いた瞬間に介入画面を表示し、無意識のスクロールを防ぎます。
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(750)}
        style={{ paddingHorizontal: spacing.gutter, paddingTop: 16, paddingBottom: 40 }}
      >
        <Button title="体験を開始" onPress={onStartSimulation} size="lg" />
        <TouchableOpacity
          onPress={onSkip}
          style={{ alignItems: 'center', paddingVertical: 12, marginTop: spacing.sm }}
        >
          <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
            スキップして続ける
          </Text>
        </TouchableOpacity>
        <View style={{ marginTop: spacing.lg }}>
          <ProgressIndicator totalSteps={9} currentStep={9} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
