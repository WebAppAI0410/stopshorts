import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { TargetAppId } from '../../src/types';

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
    const { setSelectedApps: saveSelectedApps } = useAppStore();
    const [selectedApps, setLocalSelectedApps] = useState<TargetAppId[]>(['tiktok', 'youtubeShorts', 'instagramReels']);
    const [showError, setShowError] = useState(false);

    const handleToggleApp = (appId: TargetAppId) => {
        setShowError(false);
        if (selectedApps.includes(appId)) {
            setLocalSelectedApps(selectedApps.filter(id => id !== appId));
        } else {
            setLocalSelectedApps([...selectedApps, appId]);
        }
    };

    const handleAddMore = () => {
        Alert.alert(
            t('settings.comingSoon.title'),
            t('settings.comingSoon.addMoreApps'),
            [{ text: 'OK' }]
        );
    };

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
                                selected={selectedApps.includes(option.id)}
                                onPress={() => handleToggleApp(option.id)}
                            />
                        </Animated.View>
                    ))}
                </View>

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
});
