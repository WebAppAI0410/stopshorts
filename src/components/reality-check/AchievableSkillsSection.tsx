/**
 * AchievableSkillsSection - Displays skills achievable with reclaimed time
 * Shows top skills for 1, 2, 3 years and quick wins
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getTopVariedSkills, getQuickWins } from '../../hooks/useRealityCheck';
// AchievableSkill type is used internally by getTopVariedSkills/getQuickWins

interface Props {
  yearlyHours: number;
  monthlyHours: number;
}

export function AchievableSkillsSection({ yearlyHours, monthlyHours }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const topSkills = getTopVariedSkills(yearlyHours);
  const quickWins = getQuickWins(monthlyHours);

  if (topSkills.length === 0) {
    return null;
  }

  return (
    <>
      {/* Main impact message */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(600)}
        style={{
          backgroundColor: colors.accent,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[
            typography.h3,
            {
              color: '#FFFFFF',
              marginBottom: spacing.sm,
              textAlign: 'center',
            }
          ]}>
            この時間があれば...
          </Text>
          <Text style={[
            typography.body,
            {
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              lineHeight: 24,
            }
          ]}>
            あなたの年間 {yearlyHours} 時間で{'\n'}
            人生を変えるスキルが身につきます
          </Text>
        </View>
      </Animated.View>

      {/* Achievable skills list */}
      <Animated.View entering={FadeInUp.duration(600).delay(700)}>
        <Text style={[
          typography.h3,
          {
            color: colors.textPrimary,
            marginBottom: spacing.md,
            marginTop: spacing.sm,
          }
        ]}>
          具体的に何ができる？
        </Text>
        <View style={{ gap: 10 }}>
          {topSkills.slice(0, 3).map((item, index) => (
            <Animated.View
              key={`${item.skill.skill}-${index}`}
              entering={FadeInUp.duration(400).delay(750 + index * 100)}
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: borderRadius.md,
                borderLeftWidth: 4,
                borderLeftColor: colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                gap: 12,
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.accentMuted,
              }}>
                <Ionicons
                  name={item.skill.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={colors.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {item.skill.skill}
                </Text>
                <Text style={[typography.caption, { color: colors.accent, marginTop: 2 }]}>
                  {item.years}年で達成可能
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Quick win - what you could achieve in 3 months */}
      {quickWins.length > 0 && (
        <Animated.View
          entering={FadeInUp.duration(600).delay(900)}
          style={{
            backgroundColor: colors.success + '15',
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.success + '30',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <Ionicons name="flash-outline" size={24} color={colors.success} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.bodySmall, { color: colors.success, fontWeight: '600' }]}>
              今すぐ始めれば3ヶ月で
            </Text>
            <Text style={[typography.body, { color: colors.textPrimary, marginTop: 2 }]}>
              {quickWins[quickWins.length - 1].skill}
            </Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}
