import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { AppSelectionModal } from '../../src/components/AppSelectionModal';
import { screenTimeService } from '../../src/native/ScreenTimeModule';
import { getAppIcon } from '../../src/constants/appIcons';
import type { TargetAppId } from '../../src/types';
import type { InstalledApp } from '../../src/native/ScreenTimeModule';

type AppOption = {
  id: TargetAppId;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const appOptions: AppOption[] = [
  { id: 'tiktok', icon: 'logo-tiktok', label: 'TikTok' },
  { id: 'youtubeShorts', icon: 'logo-youtube', label: 'YouTube Shorts' },
  { id: 'instagramReels', icon: 'logo-instagram', label: 'Instagram Reels' },
  { id: 'twitter', icon: 'logo-twitter', label: 'X (Twitter)' },
  { id: 'facebookReels', icon: 'logo-facebook', label: 'Facebook Reels' },
  { id: 'snapchat', icon: 'logo-snapchat', label: 'Snapchat Spotlight' },
];

export default function TargetAppsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const {
    selectedApps: storedSelectedApps,
    setSelectedApps,
    customApps,
    addCustomApp,
    removeCustomApp,
    setCustomAppSelected,
    setBaselineMonthlyMinutes,
  } = useAppStore();

  const [selectedApps, setLocalSelectedApps] = useState<TargetAppId[]>(storedSelectedApps);
  const [showError, setShowError] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [customAppIcons, setCustomAppIcons] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch icons for custom apps (Android only - default apps use bundled assets)
  useEffect(() => {
    const fetchIcons = async () => {
      if (Platform.OS !== 'android' || customApps.length === 0) return;

      const icons: Record<string, string> = {};
      for (const app of customApps) {
        try {
          const icon = await screenTimeService.getAppIcon(app.packageName);
          if (icon) {
            icons[app.packageName] = icon;
          }
        } catch {
          // Ignore errors, will use fallback icon
        }
      }
      setCustomAppIcons(icons);
    };

    fetchIcons();
  }, [customApps]);

  const handleToggleApp = (appId: TargetAppId) => {
    setShowError(false);
    if (selectedApps.includes(appId)) {
      setLocalSelectedApps(selectedApps.filter(id => id !== appId));
    } else {
      setLocalSelectedApps([...selectedApps, appId]);
    }
  };

  const handleAddMore = () => {
    if (Platform.OS === 'android') {
      setShowAppModal(true);
    } else {
      Alert.alert(
        t('settings.comingSoon.title'),
        t('settings.comingSoon.addMoreApps'),
        [{ text: 'OK' }]
      );
    }
  };

  const handleSelectApp = (app: InstalledApp) => {
    addCustomApp({
      packageName: app.packageName,
      appName: app.appName,
      category: app.category,
    });
  };

  const handleSave = async () => {
    const selectedCustomCount = customApps.filter((app) => app.isSelected !== false).length;
    if (selectedApps.length === 0 && selectedCustomCount === 0) {
      setShowError(true);
      return;
    }

    setIsSaving(true);
    try {
      setSelectedApps(selectedApps);

      if (Platform.OS === 'android') {
        const permissionStatus = await screenTimeService.getPermissionStatus();
        if (permissionStatus.usageStats) {
          const customPackages = customApps
            .filter((app) => app.isSelected !== false)
            .map((app) => app.packageName);
          const monthlyUsage = await screenTimeService.getMonthlyUsageWithApps(
            selectedApps,
            customPackages
          );
          if (monthlyUsage.monthlyTotal > 0) {
            setBaselineMonthlyMinutes(monthlyUsage.monthlyTotal);
          }
        }
      }

      router.back();
    } catch (error) {
      console.error('[TargetApps] Failed to save:', error);
      Alert.alert('保存エラー', '設定の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  // Exclude already-added custom apps from picker
  const excludePackages = customApps.map((app) => app.packageName);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <Text style={[
            typography.h1,
            { color: colors.textPrimary, marginBottom: spacing.sm }
          ]}>
            {t('settings.yourSettings.targetApps')}
          </Text>
          <Text style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing.xl }
          ]}>
            トラッキング・介入対象のアプリを選択します。
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {appOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(500).delay(150 + index * 60)}
            >
              <SelectionCard
                title={option.label}
                icon={option.icon}
                imageSource={getAppIcon(option.id)}
                selected={selectedApps.includes(option.id)}
                onPress={() => handleToggleApp(option.id)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Custom Apps Section (Android only) */}
        {customApps.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <Text style={[
              typography.h3,
              {
                color: colors.textPrimary,
                marginTop: spacing.xl,
                marginBottom: spacing.md,
              }
            ]}>
              追加したアプリ
            </Text>
            <View style={styles.optionsContainer}>
              {customApps.map((app, index) => (
                <Animated.View
                  key={app.packageName}
                  entering={FadeInRight.duration(400).delay(index * 40)}
                >
                  <View style={[
                    styles.customAppItem,
                    {
                      backgroundColor: colors.backgroundCard,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                    }
                  ]}>
                    <View style={[
                      styles.customAppIcon,
                      {
                        backgroundColor: colors.accentMuted,
                        borderRadius: borderRadius.md,
                        overflow: 'hidden',
                      }
                    ]}>
                      {customAppIcons[app.packageName] ? (
                        <Image
                          source={{ uri: `data:image/png;base64,${customAppIcons[app.packageName]}` }}
                          style={{ width: 36, height: 36, borderRadius: 8 }}
                        />
                      ) : (
                        <Ionicons
                          name="apps-outline"
                          size={24}
                          color={colors.accent}
                        />
                      )}
                    </View>
                    <View style={styles.customAppInfo}>
                      <Text style={[
                        typography.body,
                        { color: colors.textPrimary, fontWeight: '600' }
                      ]} numberOfLines={1}>
                        {app.appName}
                      </Text>
                      <Text style={[
                        typography.caption,
                        { color: colors.textMuted }
                      ]} numberOfLines={1}>
                        {app.category}
                      </Text>
                    </View>
                    <Switch
                      value={app.isSelected !== false}
                      onValueChange={(value) => setCustomAppSelected(app.packageName, value)}
                      trackColor={{ false: colors.surface, true: colors.accent }}
                      thumbColor={colors.background}
                    />
                    <TouchableOpacity
                      onPress={() => removeCustomApp(app.packageName)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={{ marginLeft: spacing.sm }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={22}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(650)} style={{ marginTop: spacing.lg }}>
          <Button
            title="追加のアプリを選ぶ"
            onPress={handleAddMore}
            variant="outline"
          />
        </Animated.View>

        {showError && (
          <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.error, textAlign: 'center' }]}>
              少なくとも1つのアプリを選択してください。
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View
        entering={FadeInDown.duration(600).delay(200)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter, backgroundColor: colors.background }]}
      >
        <Button
          title={isSaving ? '保存中...' : '保存'}
          onPress={handleSave}
          disabled={isSaving}
          size="lg"
        />
      </Animated.View>

      <AppSelectionModal
        visible={showAppModal}
        onClose={() => setShowAppModal(false)}
        onSelect={handleSelectApp}
        excludePackages={excludePackages}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  customAppItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customAppIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAppInfo: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
