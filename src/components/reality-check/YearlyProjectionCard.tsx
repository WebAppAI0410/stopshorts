/**
 * YearlyProjectionCard - Displays yearly time projection based on current usage
 * Also shows peak hours if available
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';

interface Props {
  yearlyHours: number;
  peakHours?: string[];
}

export function YearlyProjectionCard({ yearlyHours, peakHours }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const hasPeakHours = peakHours && peakHours.length > 0;
  const peakHoursDisplay = hasPeakHours
    ? `${peakHours[0]} - ${peakHours[peakHours.length - 1]}`
    : null;

  return (
    <>
      {/* Peak hours - only show if we have real data */}
      {hasPeakHours && peakHoursDisplay && (
        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
          }}
        >
          <Ionicons name="time-outline" size={24} color={colors.accent} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {t('onboarding.v3.realityCheck.peakHours')}
            </Text>
            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
              {peakHoursDisplay}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Yearly projection */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(500)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.lg,
        }}
      >
        <Ionicons name="calendar-outline" size={24} color={colors.accent} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            このペースで1年続けると
          </Text>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
            年間 {yearlyHours} 時間
          </Text>
        </View>
      </Animated.View>
    </>
  );
}
