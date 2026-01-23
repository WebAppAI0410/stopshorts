/**
 * DemoBreathingExperience - Breathing intervention experience for demo
 * Shows wave animation and breathing guide
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { WaveAnimation, BreathingGuide } from './index';

interface Props {
  displayName: string;
  appName: string;
  breathingProgress: SharedValue<number>;
  onBack: () => void;
  onComplete: () => void;
}

export function DemoBreathingExperience({
  displayName,
  appName,
  breathingProgress,
  onBack,
  onComplete,
}: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ alignSelf: 'flex-start', padding: 8, marginBottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(600)} style={{ marginBottom: 24 }}>
          <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
            衝動サーフィング中
          </Text>
          <Text style={[
            typography.bodySmall,
            { color: colors.primary, textAlign: 'center', marginTop: spacing.sm, fontWeight: '600' }
          ]}>
            {`${displayName}さんの`}「{appName}を見たい」という衝動
          </Text>
          <Text style={[
            typography.caption,
            { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }
          ]}>
            深呼吸をしながら、この「波」を静かに観察しましょう
          </Text>
        </Animated.View>

        {/* Wave animation */}
        <Animated.View entering={FadeIn.duration(800)} style={{ marginHorizontal: -24, marginTop: 16 }}>
          <WaveAnimation progress={breathingProgress} height={150} />
        </Animated.View>

        {/* Breathing guide */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <BreathingGuide cycles={3} onComplete={onComplete} autoStart={true} />
        </View>

        <View style={{
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginTop: 'auto',
        }}>
          <Text style={[
            typography.bodySmall,
            { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }
          ]}>
            「この衝動は一時的なもの。波のように、必ず過ぎていく」
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
