/**
 * UsageBreakdownList - Displays app usage breakdown with progress bars
 * Shows both default target apps and custom apps
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
// Note: Animated, FadeInUp could be used for animation enhancements
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getAppIcon } from '../../constants/appIcons';
import { formatTime } from '../../hooks/useRealityCheck';
import type { ScreenTimeData } from '../../types';
import type { CustomAppUsage } from '../../hooks/useRealityCheck';

interface Props {
  appBreakdown: ScreenTimeData['appBreakdown'];
  customAppUsage: CustomAppUsage[];
  totalMonthlyMinutes: number;
}

const APP_NAMES: Record<string, string> = {
  tiktok: 'TikTok',
  youtubeShorts: 'YouTube Shorts',
  instagramReels: 'Instagram Reels',
};

const APP_ICONS: Record<string, 'musical-notes' | 'logo-youtube' | 'logo-instagram'> = {
  tiktok: 'musical-notes',
  youtubeShorts: 'logo-youtube',
  instagramReels: 'logo-instagram',
};

export function UsageBreakdownList({ appBreakdown, customAppUsage, totalMonthlyMinutes }: Props) {
  const { colors, typography } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {/* Default apps */}
      {appBreakdown.map((app) => {
        const appName = APP_NAMES[app.app] || app.app;
        const percentage = totalMonthlyMinutes > 0 ? (app.weeklyMinutes / totalMonthlyMinutes) * 100 : 0;
        const { hours: appHours, mins: appMins } = formatTime(app.weeklyMinutes);

        return (
          <View key={app.app} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              overflow: 'hidden',
            }}>
              {getAppIcon(app.app) ? (
                <Image
                  source={getAppIcon(app.app)!}
                  style={{ width: 28, height: 28, borderRadius: 6 }}
                />
              ) : (
                <Ionicons
                  name={APP_ICONS[app.app] || 'apps-outline'}
                  size={20}
                  color={colors.accent}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                {appName}
              </Text>
              <View style={{
                height: 6,
                borderRadius: 3,
                overflow: 'hidden',
                marginTop: 6,
                backgroundColor: colors.surface,
              }}>
                <View style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${percentage}%`,
                  backgroundColor: colors.accent,
                }} />
              </View>
            </View>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {appHours}h {appMins}m
            </Text>
          </View>
        );
      })}

      {/* Custom apps */}
      {customAppUsage.map((app) => {
        const percentage = totalMonthlyMinutes > 0 ? (app.monthlyMinutes / totalMonthlyMinutes) * 100 : 0;
        const { hours: appHours, mins: appMins } = formatTime(app.monthlyMinutes);

        return (
          <View key={app.packageName} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              overflow: 'hidden',
            }}>
              {app.icon ? (
                <Image
                  source={{ uri: `data:image/png;base64,${app.icon}` }}
                  style={{ width: 28, height: 28, borderRadius: 6 }}
                />
              ) : (
                <Ionicons
                  name="apps-outline"
                  size={20}
                  color={colors.accent}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                {app.name}
              </Text>
              <View style={{
                height: 6,
                borderRadius: 3,
                overflow: 'hidden',
                marginTop: 6,
                backgroundColor: colors.surface,
              }}>
                <View style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${percentage}%`,
                  backgroundColor: colors.accent,
                }} />
              </View>
            </View>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {appHours}h {appMins}m
            </Text>
          </View>
        );
      })}
    </View>
  );
}
