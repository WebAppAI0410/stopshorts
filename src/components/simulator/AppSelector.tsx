/**
 * AppSelector Component
 * Allows user to select which app's UI to simulate
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { APP_THEMES } from './appThemes';
import { getAppIcon } from '../../constants/appIcons';
import type { TargetAppId } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface AppSelectorProps {
  /** Currently selected app */
  selectedApp: TargetAppId;
  /** Available apps to choose from */
  availableApps?: TargetAppId[];
  /** Called when app is selected */
  onSelectApp: (appId: TargetAppId) => void;
  /** Optional title */
  title?: string;
}

export function AppSelector({
  selectedApp,
  availableApps = ['tiktok', 'instagramReels', 'youtubeShorts', 'twitter', 'facebookReels', 'snapchat'],
  onSelectApp,
  title = '体験するアプリを選択',
}: AppSelectorProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Animated.Text
          entering={FadeInUp.duration(400)}
          style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}
        >
          {title}
        </Animated.Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {availableApps.map((appId, index) => {
          const theme = APP_THEMES[appId];
          const isSelected = selectedApp === appId;
          const appIcon = getAppIcon(appId);

          return (
            <Animated.View
              key={appId}
              entering={FadeInUp.duration(400).delay(index * 100)}
            >
              <TouchableOpacity
                style={[
                  styles.appCard,
                  {
                    backgroundColor: isSelected ? theme.accentColor : colors.backgroundCard,
                    borderRadius: borderRadius.lg,
                    borderWidth: 2,
                    borderColor: isSelected ? theme.accentColor : 'transparent',
                  },
                ]}
                onPress={() => onSelectApp(appId)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.surface,
                    },
                  ]}
                >
                  {appIcon ? (
                    <Image source={appIcon} style={styles.appIcon} />
                  ) : (
                    <Ionicons
                      name="apps"
                      size={24}
                      color={isSelected ? '#FFFFFF' : theme.accentColor}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.appName,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {theme.name}
                </Text>
                <Text
                  style={[
                    styles.appSubName,
                    {
                      color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textMuted,
                    },
                  ]}
                >
                  {theme.displayName}
                </Text>

                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  appCard: {
    width: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  appName: {
    fontSize: 13,
    textAlign: 'center',
  },
  appSubName: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default AppSelector;
