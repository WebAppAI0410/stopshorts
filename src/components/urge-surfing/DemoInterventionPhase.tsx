/**
 * DemoInterventionPhase - Intervention phase for urge surfing demo
 * Shows the shield intervention screen with explanation
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ShieldIcon, Button, Header } from '../ui';

interface Props {
  onBack: () => void;
  onStartExperience: () => void;
  onSkip: () => void;
  experienceButtonText: string;
}

export function DemoInterventionPhase({ onBack, onStartExperience, onSkip, experienceButtonText }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header showBack variant="ghost" onBack={onBack} />

        <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 40 }}>
          {/* Glow effect */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <View style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: 200,
              opacity: 0.3,
              backgroundColor: colors.shieldGlow,
            }} />
            <View style={{
              position: 'absolute',
              width: 250,
              height: 250,
              borderRadius: 125,
              opacity: 0.5,
              backgroundColor: colors.accentGlow,
            }} />
          </View>

          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
            <Text style={[typography.h3, { color: colors.accent, marginLeft: spacing.sm }]}>
              StopShorts Shield
            </Text>
          </Animated.View>

          {/* Shield Icon */}
          <Animated.View
            entering={ZoomIn.duration(800).delay(200)}
            style={{ alignItems: 'center', marginVertical: 40 }}
          >
            <ShieldIcon size="xl" glowing={true} status="protected" />
          </Animated.View>

          {/* Message */}
          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <Text style={[
              typography.h1,
              { color: colors.textPrimary, textAlign: 'center', fontSize: 28 }
            ]}>
              ちょっと待って
            </Text>
            <Text style={[
              typography.body,
              { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }
            ]}>
              これが介入画面です。{'\n'}
              ここで一度立ち止まり、本当に必要か考えます。
            </Text>
          </Animated.View>

          {/* Info Card */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(600)}
            style={{
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginTop: spacing.xl,
              width: '100%',
            }}
          >
            <Text style={[typography.caption, { color: colors.primary }]}>
              衝動サーフィングとは？
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              衝動は波のように必ず過ぎ去ります。深呼吸をしながら波を観察し、やり過ごす練習をしましょう。
            </Text>
          </Animated.View>

          <View style={{ flex: 1 }} />

          {/* Buttons */}
          <Animated.View entering={FadeInUp.duration(600).delay(800)} style={{ width: '100%' }}>
            <Button title={experienceButtonText} onPress={onStartExperience} size="lg" />
            <TouchableOpacity
              onPress={onSkip}
              style={{ alignItems: 'center', paddingVertical: 12, marginTop: spacing.md }}
            >
              <Text style={[typography.body, { color: colors.textMuted }]}>
                スキップして続ける
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
