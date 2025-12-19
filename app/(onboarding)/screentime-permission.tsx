import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

export default function ScreenTimePermissionScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setScreenTimePermission } = useAppStore();

    const handleAllow = () => {
        setScreenTimePermission(true);
        router.push('/(onboarding)/reality-check' as Href);
    };

    const handleSkip = () => {
        setScreenTimePermission(false);
        router.push('/(onboarding)/reality-check' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.1} />
            <GlowOrb position="bottom-left" size="medium" color="primary" intensity={0.08} />

            <Header showBack />

            <View style={[styles.progressContainer, { paddingHorizontal: spacing.gutter }]}>
                <ProgressIndicator totalSteps={8} currentStep={3} />
            </View>

            <View style={[styles.content, { paddingHorizontal: spacing.gutter }]}>
                <Animated.View
                    entering={FadeIn.duration(600)}
                    style={[styles.iconContainer, { backgroundColor: colors.backgroundCard }]}
                >
                    <Ionicons name="bar-chart-outline" size={64} color={colors.accent} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                            marginBottom: spacing.md,
                        }
                    ]}>
                        {t('onboarding.v3.screenTimePermission.title')}
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.textSecondary,
                            textAlign: 'center',
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.screenTimePermission.subtitle')}
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(300).duration(600)}
                    style={[
                        styles.privacyNote,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderColor: colors.border,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                        },
                    ]}
                >
                    <View style={styles.privacyHeader}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
                        <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                            {t('onboarding.v3.screenTimePermission.privacyTitle')}
                        </Text>
                    </View>
                    <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                        {t('onboarding.v3.screenTimePermission.privacyNote')}
                    </Text>
                </Animated.View>
            </View>

            <Animated.View
                entering={FadeInUp.delay(400).duration(600)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('onboarding.v3.screenTimePermission.allowButton')}
                    onPress={handleAllow}
                    size="lg"
                />
                <Pressable onPress={handleSkip} style={{ marginTop: spacing.md }}>
                    <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
                        {t('onboarding.v3.screenTimePermission.skipButton')}
                    </Text>
                </Pressable>
                <View style={{ marginTop: spacing.lg }}>
                    <ProgressIndicator totalSteps={8} currentStep={3} />
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        paddingTop: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    privacyNote: {
        width: '100%',
        borderWidth: 1,
    },
    privacyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
