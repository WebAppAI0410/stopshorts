import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
    Button,
    ProgressIndicator,
    Header,
    GlowOrb,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { SubscriptionPlan } from '../../src/types';

interface PlanOption {
    id: SubscriptionPlan;
    title: string;
    price: string;
    savings?: string;
    popular?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
    {
        id: 'monthly',
        title: '30日プラン',
        price: '¥980',
    },
    {
        id: 'quarterly',
        title: '90日プラン',
        price: '¥1,980',
        savings: '33%お得',
        popular: true,
    },
    {
        id: 'annual',
        title: '年間プラン',
        price: '¥3,980',
        savings: '66%お得',
    },
];

export default function CommitmentScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setOnboardingComplete, setSubscription, startTrial } = useAppStore();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('quarterly');

    const handleComplete = () => {
        // Start trial for now (free tier)
        startTrial();
        setOnboardingComplete();
        // Explicitly navigate to main screen
        router.replace('/(main)' as Href);
    };

    const features = [
        t('subscription.features.continuous'),
        t('subscription.features.unlimited'),
        t('subscription.features.personalization'),
        t('subscription.features.statistics'),
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />
            <GlowOrb position="top-right" size="xl" color="accent" intensity={0.12} />
            <GlowOrb position="bottom-left" size="xl" color="primary" intensity={0.1} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={ZoomIn.duration(800).delay(200)}
                    style={styles.heroContainer}
                >
                    <View style={[styles.heroIcon, { backgroundColor: colors.accentMuted }]}>
                        <Ionicons name="checkmark-circle" size={80} color={colors.accent} />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(800).delay(400)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
                        {t('onboarding.commitment.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }]}>
                        {t('onboarding.commitment.subtitle')}
                    </Text>
                </Animated.View>

                {/* Plan Selection */}
                <Animated.View entering={FadeInUp.duration(600).delay(500)}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        {t('onboarding.commitment.selectPlan')}
                    </Text>

                    <View style={styles.plansContainer}>
                        {PLAN_OPTIONS.map((plan, index) => (
                            <Animated.View
                                key={plan.id}
                                entering={FadeInUp.duration(400).delay(600 + index * 100)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.planCard,
                                        {
                                            backgroundColor: selectedPlan === plan.id
                                                ? colors.accentMuted
                                                : colors.surface,
                                            borderColor: selectedPlan === plan.id
                                                ? colors.accent
                                                : colors.border,
                                            borderRadius: borderRadius.lg,
                                        },
                                    ]}
                                    onPress={() => setSelectedPlan(plan.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.planHeader}>
                                        <View style={styles.planTitleRow}>
                                            <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                                {plan.title}
                                            </Text>
                                            {plan.popular && (
                                                <View style={[styles.popularBadge, { backgroundColor: colors.accent }]}>
                                                    <Text style={[typography.caption, { color: colors.textInverse }]}>
                                                        人気
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.priceRow}>
                                            <Text style={[typography.statLarge, { color: colors.accent }]}>
                                                {plan.price}
                                            </Text>
                                            {plan.savings && (
                                                <Text style={[typography.caption, { color: colors.success, marginLeft: spacing.sm }]}>
                                                    {plan.savings}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.radioOuter,
                                        {
                                            borderColor: selectedPlan === plan.id ? colors.accent : colors.border,
                                        }
                                    ]}>
                                        {selectedPlan === plan.id && (
                                            <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Features */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(900)}
                    style={[styles.featuresBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
                >
                    <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                        含まれる機能
                    </Text>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                            <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                                {feature}
                            </Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Quote */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(1000)}
                    style={styles.quoteBox}
                >
                    <Text style={[typography.body, { color: colors.textMuted, fontStyle: 'italic', textAlign: 'center' }]}>
                        "時間は唯一の本当の資産であり、あなたが管理できる唯一のものです。"
                    </Text>
                </Animated.View>
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(800).delay(1100)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('onboarding.commitment.startButton')}
                    onPress={handleComplete}
                    size="lg"
                />
                <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }]}>
                    24時間の無料トライアル付き
                </Text>
                <View style={{ marginTop: spacing.lg }}>
                    <ProgressIndicator totalSteps={12} currentStep={12} />
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
    heroContainer: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    heroIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plansContainer: {
        gap: 12,
    },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 2,
    },
    planHeader: {
        flex: 1,
    },
    planTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    popularBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    featuresBox: {
        padding: 20,
        marginTop: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    quoteBox: {
        paddingVertical: 24,
        opacity: 0.8,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 40,
    },
});
