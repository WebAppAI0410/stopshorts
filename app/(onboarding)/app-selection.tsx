import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, SelectionCard } from '../../src/components/ui';
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

export default function AppSelectionScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setSelectedApps: saveSelectedApps, addCustomApp, customApps, removeCustomApp } = useAppStore();
    const [selectedApps, setLocalSelectedApps] = useState<TargetAppId[]>(['tiktok', 'youtubeShorts', 'instagramReels']);
    const [showError, setShowError] = useState(false);
    const [showAppModal, setShowAppModal] = useState(false);
    const [customAppIcons, setCustomAppIcons] = useState<Record<string, string>>({});

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
            // Android: Show app selection modal
            setShowAppModal(true);
        } else {
            // iOS: Show coming soon message (pending Family Controls Entitlement)
            Alert.alert(
                t('settings.comingSoon.title'),
                t('settings.comingSoon.addMoreApps'),
                [{ text: 'OK' }]
            );
        }
    };

    const handleSelectApp = (app: InstalledApp) => {
        // Add to custom apps store
        addCustomApp({
            packageName: app.packageName,
            appName: app.appName,
            category: app.category,
        });
    };

    const handleRemoveCustomApp = (packageName: string) => {
        removeCustomApp(packageName);
    };

    // Get excluded packages (already added custom apps)
    const excludePackages = customApps.map((app) => app.packageName);

    const handleContinue = () => {
        if (selectedApps.length === 0) {
            setShowError(true);
            return;
        }

        // Store all selected apps to Zustand
        saveSelectedApps(selectedApps);

        router.push('/(onboarding)/reality-check' as Href);
    };

    const isValid = selectedApps.length > 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            marginBottom: spacing.sm,
                        }
                    ]}>
                        {t('onboarding.v3.appSelection.title')}
                    </Text>
                    <Text style={[
                        typography.body,
                        {
                            color: colors.textSecondary,
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.appSelection.note')}
                    </Text>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {appOptions.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(500).delay(200 + index * 80)}
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
                    <Animated.View entering={FadeInUp.duration(500).delay(600)}>
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
                                    entering={FadeInRight.duration(400).delay(index * 50)}
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
                                        <TouchableOpacity
                                            onPress={() => handleRemoveCustomApp(app.packageName)}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={24}
                                                color={colors.error}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                <Animated.View entering={FadeInUp.duration(500).delay(700)}>
                    <Button
                        title={t('onboarding.v3.appSelection.addMore')}
                        onPress={handleAddMore}
                        variant="secondary"
                        size="md"
                        style={{ marginTop: spacing.md }}
                    />
                </Animated.View>

                {showError && (
                    <Animated.View
                        entering={FadeInUp.duration(400)}
                        style={[
                            styles.errorContainer,
                            {
                                backgroundColor: colors.error + '20',
                                borderRadius: borderRadius.md,
                                padding: spacing.md,
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <Ionicons name="warning" size={20} color={colors.error} />
                        <Text style={[
                            typography.body,
                            {
                                color: colors.error,
                                flex: 1,
                                marginLeft: spacing.sm,
                            }
                        ]}>
                            {t('onboarding.v3.appSelection.validation')}
                        </Text>
                    </Animated.View>
                )}
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(800)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!isValid}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={10} currentStep={5} />
                </View>
            </Animated.View>

            {/* App Selection Modal (Android only) */}
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
        paddingTop: 8,
        paddingBottom: 120,
    },
    optionsContainer: {
        gap: 12,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
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
});
