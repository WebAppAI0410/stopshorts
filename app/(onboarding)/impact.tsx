import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
    Button,
    ProgressIndicator,
    Header,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

export default function ImpactScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { lifetimeImpact, usageAssessment } = useAppStore();

    const handleContinue = () => {
        router.push('/(onboarding)/purpose' as Href);
    };

    // Fallback values if not calculated yet
    const yearlyHours = lifetimeImpact?.yearlyLostHours ?? (usageAssessment?.dailyUsageHours ?? 2) * 365;
    const lifetimeYears = lifetimeImpact?.lifetimeLostYears ?? Math.round(yearlyHours * 50 / (24 * 365) * 10) / 10;
    const equivalents = lifetimeImpact?.equivalents ?? {
        books: Math.round(yearlyHours / 6),
        movies: Math.round(yearlyHours / 2),
        travels: Math.round(yearlyHours / 40),
        skills: ['新しいスキルの習得'],
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.impact.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.impact.subtitle')}
                    </Text>
                </Animated.View>

                {/* Main impact stats */}
                <Animated.View
                    entering={ZoomIn.duration(600).delay(400)}
                    style={[
                        styles.impactCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderColor: colors.error,
                            borderRadius: borderRadius.xl,
                            padding: spacing.lg,
                            marginBottom: spacing.lg,
                        },
                    ]}
                >
                    <View style={styles.impactRow}>
                        <View style={styles.impactItem}>
                            <Text style={[typography.overline, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                                {t('onboarding.impact.yearlyLossLabel')}
                            </Text>
                            <Text style={[typography.hero, { color: colors.error }]}>
                                {Math.round(yearlyHours)}
                            </Text>
                            <Text style={[typography.body, { color: colors.textSecondary }]}>
                                時間/年
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.impactItem}>
                            <Text style={[typography.overline, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                                {t('onboarding.impact.lifetimeLossLabel')}
                            </Text>
                            <Text style={[typography.hero, { color: colors.error }]}>
                                {lifetimeImpact?.lifetimeLostYears ?? lifetimeYears}
                            </Text>
                            <Text style={[typography.body, { color: colors.textSecondary }]}>
                                年分
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Equivalents section */}
                <Animated.View entering={FadeInDown.duration(600).delay(600)}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        {t('onboarding.impact.equivalentsTitle')}
                    </Text>

                    <View style={styles.equivalentsGrid}>
                        <Animated.View
                            entering={FadeInDown.duration(400).delay(700)}
                            style={[
                                styles.equivalentCard,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderRadius: borderRadius.lg,
                                    padding: spacing.md,
                                },
                            ]}
                        >
                            <Ionicons name="book-outline" size={28} color={colors.accent} />
                            <Text style={[typography.statLarge, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                                {equivalents.books}
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                冊の本
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInDown.duration(400).delay(800)}
                            style={[
                                styles.equivalentCard,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderRadius: borderRadius.lg,
                                    padding: spacing.md,
                                },
                            ]}
                        >
                            <Ionicons name="film-outline" size={28} color={colors.accent} />
                            <Text style={[typography.statLarge, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                                {equivalents.movies}
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                本の映画
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInDown.duration(400).delay(900)}
                            style={[
                                styles.equivalentCard,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderRadius: borderRadius.lg,
                                    padding: spacing.md,
                                },
                            ]}
                        >
                            <Ionicons name="airplane-outline" size={28} color={colors.accent} />
                            <Text style={[typography.statLarge, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                                {equivalents.travels}
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                回の旅行
                            </Text>
                        </Animated.View>
                    </View>

                    {/* Skills section */}
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(1000)}
                        style={[
                            styles.skillsCard,
                            {
                                backgroundColor: colors.accentMuted,
                                borderRadius: borderRadius.lg,
                                padding: spacing.md,
                                marginTop: spacing.md,
                            },
                        ]}
                    >
                        <View style={styles.skillsHeader}>
                            <Ionicons name="school-outline" size={24} color={colors.accent} />
                            <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                                {t('onboarding.impact.equivalents.skills')}
                            </Text>
                        </View>
                        <View style={[styles.skillsList, { marginTop: spacing.sm }]}>
                            {equivalents.skills.map((skill, index) => (
                                <View key={index} style={styles.skillItem}>
                                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                                    <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                                        {skill}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                </Animated.View>

                {/* Call to action */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(1100)}
                    style={{ marginTop: spacing.xl }}
                >
                    <Text style={[typography.h2, { color: colors.accent, textAlign: 'center' }]}>
                        {t('onboarding.impact.callToAction')}
                    </Text>
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={3} />
                </View>
            </View>
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
    impactCard: {
        borderWidth: 2,
    },
    impactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    impactItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 80,
        marginHorizontal: 16,
    },
    equivalentsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    equivalentCard: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    skillsCard: {},
    skillsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skillsList: {},
    skillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    footer: {
        paddingTop: 20,
    },
});
