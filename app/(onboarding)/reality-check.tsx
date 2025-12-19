import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import screenTimeService from '../../src/services/screenTime';

export default function RealityCheckScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { hasScreenTimePermission, calculateImpactFromScreenTime, calculateImpactFromManualInput } = useAppStore();
    const [manualHours, setManualHours] = useState<number | null>(null);

    // Get screen time data (currently mock, will be replaced with real data)
    const screenTimeData = useMemo(() => screenTimeService.getMockData(), []);

    const handleContinue = () => {
        if (hasScreenTimePermission) {
            calculateImpactFromScreenTime(screenTimeData);
        } else if (manualHours !== null) {
            calculateImpactFromManualInput(manualHours);
        }
        router.push('/(onboarding)/alternative' as Href);
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { hours, mins };
    };

    const renderScreenTimeData = () => {
        const { hours, mins } = formatTime(screenTimeData.weeklyTotal);
        const yearlyHours = Math.round((screenTimeData.dailyAverage / 60) * 365);
        const books = Math.round(yearlyHours / 6);
        const peakHoursDisplay = screenTimeData.peakHours.length > 0
            ? `${screenTimeData.peakHours[0]} - ${screenTimeData.peakHours[screenTimeData.peakHours.length - 1]}`
            : '夜';

        return (
            <View style={styles.dataContainer}>
                <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.totalTimeCard}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {t('onboarding.v3.realityCheck.title')}
                    </Text>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.accent,
                            fontSize: 48,
                            marginTop: spacing.sm,
                        }
                    ]}>
                        {hours}時間{mins}分
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.breakdownContainer}>
                    {screenTimeData.appBreakdown.map((app) => {
                        const appName = {
                            tiktok: 'TikTok',
                            youtubeShorts: 'YouTube Shorts',
                            instagramReels: 'Instagram Reels',
                        }[app.app];
                        const percentage = (app.weeklyMinutes / screenTimeData.weeklyTotal) * 100;
                        const { hours: appHours, mins: appMins } = formatTime(app.weeklyMinutes);

                        return (
                            <View key={app.app} style={styles.appRow}>
                                <View style={[styles.appIcon, { backgroundColor: colors.surface }]}>
                                    <Ionicons
                                        name={
                                            app.app === 'tiktok' ? 'musical-notes' :
                                            app.app === 'youtubeShorts' ? 'logo-youtube' : 'logo-instagram'
                                        }
                                        size={20}
                                        color={colors.accent}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                                        {appName}
                                    </Text>
                                    <View style={[styles.barBackground, { backgroundColor: colors.surface }]}>
                                        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.accent }]} />
                                    </View>
                                </View>
                                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                    {appHours}h {appMins}m
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(600).delay(400)} style={[styles.infoCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg }]}>
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

                <Animated.View entering={FadeInUp.duration(600).delay(500)} style={[styles.infoCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg }]}>
                    <Ionicons name="calendar-outline" size={24} color={colors.accent} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                            {t('onboarding.v3.realityCheck.yearlyProjection')}
                        </Text>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                            {yearlyHours}時間
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(600).delay(600)} style={[styles.infoCard, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.lg }]}>
                    <Ionicons name="book-outline" size={24} color={colors.accent} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={[typography.body, { color: colors.textPrimary }]}>
                            {t('onboarding.v3.realityCheck.equivalent', { books })}
                        </Text>
                    </View>
                </Animated.View>
            </View>
        );
    };

    const renderManualInput = () => {
        const options = [
            { hours: 0.5, display: '30分くらい' },
            { hours: 1, display: '1時間くらい' },
            { hours: 2, display: '2時間くらい' },
            { hours: 3, display: '3時間以上' },
        ];

        return (
            <View style={styles.manualInputContainer}>
                <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        {t('onboarding.v3.realityCheck.manualInput.title')}
                    </Text>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {options.map((option, index) => (
                        <Animated.View
                            key={option.hours}
                            entering={FadeInUp.duration(600).delay(300 + index * 100)}
                        >
                            <SelectionCard
                                title={option.display}
                                selected={manualHours === option.hours}
                                onPress={() => setManualHours(option.hours)}
                                compact
                            />
                        </Animated.View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.12} />

            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {hasScreenTimePermission ? renderScreenTimeData() : renderManualInput()}

                <Animated.View entering={FadeInDown.duration(600).delay(700)} style={[styles.ctaContainer, { marginTop: spacing.xl }]}>
                    <Text style={[
                        typography.h2,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                        }
                    ]}>
                        {t('onboarding.v3.realityCheck.callToAction')}
                    </Text>
                </Animated.View>
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(800)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('onboarding.v3.realityCheck.reclaimButton')}
                    onPress={handleContinue}
                    disabled={!hasScreenTimePermission && manualHours === null}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={8} currentStep={4} />
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
        paddingBottom: 24,
    },
    dataContainer: {
        gap: 16,
    },
    totalTimeCard: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    breakdownContainer: {
        gap: 12,
    },
    appRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    appIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    barBackground: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 6,
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    manualInputContainer: {
        gap: 16,
    },
    optionsContainer: {
        gap: 8,
    },
    ctaContainer: {
        alignItems: 'center',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
