import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { usePurchase } from '../../src/hooks/usePurchase';
import { t } from '../../src/i18n';
import * as ScreenTime from '../../modules/screen-time';
import type { Ionicons as IoniconsType } from '@expo/vector-icons';

/** Ionicons name type extracted from component props */
type IoniconsName = React.ComponentProps<typeof IoniconsType>['name'];

type PlanType = 'monthly' | 'quarterly' | 'annual';

interface PlanOption {
    id: PlanType;
    name: string;
    price: string;
    pricePerDay?: string;
    savings?: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
    isRecommended?: boolean;
}

export default function PricingScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { completeOnboarding, setSubscriptionPlan } = useAppStore();
    const { offerings, isLoading, purchase, restore, initialize } = usePurchase();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
    const [skipTrial, setSkipTrial] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Initialize RevenueCat on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    const plans: PlanOption[] = [
        {
            id: 'monthly',
            name: t('onboarding.pricing.plans.monthly.name'),
            price: t('onboarding.pricing.plans.monthly.price'),
            pricePerDay: t('onboarding.pricing.plans.monthly.pricePerDay'),
            description: t('onboarding.pricing.plans.monthly.description'),
        },
        {
            id: 'quarterly',
            name: t('onboarding.pricing.plans.quarterly.name'),
            price: t('onboarding.pricing.plans.quarterly.price'),
            pricePerDay: t('onboarding.pricing.plans.quarterly.pricePerDay'),
            savings: t('onboarding.pricing.plans.quarterly.savings'),
            description: t('onboarding.pricing.plans.quarterly.description'),
            badge: t('onboarding.pricing.popularBadge'),
            badgeColor: colors.accent,
        },
        {
            id: 'annual',
            name: t('onboarding.pricing.plans.annual.name'),
            price: t('onboarding.pricing.plans.annual.price'),
            pricePerDay: t('onboarding.pricing.plans.annual.pricePerDay'),
            savings: t('onboarding.pricing.plans.annual.savings'),
            description: t('onboarding.pricing.plans.annual.description'),
            badge: t('onboarding.pricing.bestValueBadge'),
            badgeColor: colors.success,
            isRecommended: true,
        },
    ];

    /**
     * Complete onboarding with iOS monitoring setup
     * Starts Screen Time monitoring on iOS before navigating to main app
     */
    const finishOnboarding = useCallback(async () => {
        // Start iOS monitoring if available
        if (Platform.OS === 'ios' && ScreenTime.isAvailable()) {
            try {
                const status = ScreenTime.getAuthorizationStatus();
                if (status === 'approved') {
                    const result = await ScreenTime.startMonitoring();
                    if (result.success) {
                        if (__DEV__) console.log('[Pricing] iOS monitoring started successfully');
                    } else {
                        console.warn('[Pricing] iOS monitoring failed to start:', result.error);
                    }
                } else {
                    if (__DEV__) console.log('[Pricing] iOS monitoring skipped - authorization status:', status);
                }
            } catch (error) {
                console.error('[Pricing] iOS monitoring error:', error);
                // Continue with onboarding even if monitoring fails
            }
        }

        completeOnboarding();
        router.replace('/(main)' as Href);
    }, [completeOnboarding, router]);

    /**
     * Get the RevenueCat package for the selected plan
     */
    const getPackageForPlan = useCallback((planId: PlanType) => {
        if (!offerings?.availablePackages) return null;

        // Map plan ID to RevenueCat package identifier
        const packageMap: Record<PlanType, string> = {
            monthly: '$rc_monthly',
            quarterly: '$rc_three_month',
            annual: '$rc_annual',
        };

        const identifier = packageMap[planId];
        return offerings.availablePackages.find(pkg => pkg.identifier === identifier) ?? null;
    }, [offerings]);

    /**
     * Handle purchase with trial (free trial start)
     */
    const handleStartWithTrial = useCallback(async () => {
        const pkg = getPackageForPlan(selectedPlan);

        if (!pkg) {
            // Fallback to mock flow if RevenueCat not available
            if (__DEV__) console.log('[Pricing] RevenueCat not available, using mock flow');
            setSubscriptionPlan('trial');
            await finishOnboarding();
            return;
        }

        setIsPurchasing(true);
        try {
            const result = await purchase(pkg);

            if (result.success) {
                await finishOnboarding();
            } else if (result.error) {
                Alert.alert(
                    t('common.error'),
                    result.error,
                    [{ text: t('common.ok') }]
                );
            }
        } finally {
            setIsPurchasing(false);
        }
    }, [selectedPlan, getPackageForPlan, purchase, finishOnboarding, setSubscriptionPlan]);

    /**
     * Handle immediate purchase (skip trial)
     */
    const handleStartWithoutTrial = useCallback(async () => {
        const pkg = getPackageForPlan(selectedPlan);

        if (!pkg) {
            // Fallback to mock flow if RevenueCat not available
            if (__DEV__) console.log('[Pricing] RevenueCat not available, using mock flow');
            setSubscriptionPlan(selectedPlan);
            await finishOnboarding();
            return;
        }

        setIsPurchasing(true);
        try {
            const result = await purchase(pkg);

            if (result.success) {
                await finishOnboarding();
            } else if (result.error) {
                Alert.alert(
                    t('common.error'),
                    result.error,
                    [{ text: t('common.ok') }]
                );
            }
        } finally {
            setIsPurchasing(false);
        }
    }, [selectedPlan, getPackageForPlan, purchase, finishOnboarding, setSubscriptionPlan]);

    /**
     * Handle restore purchases
     */
    const handleRestore = useCallback(async () => {
        setIsPurchasing(true);
        try {
            const result = await restore();

            if (result.restored) {
                Alert.alert(
                    t('subscription.restoreSuccess'),
                    t('subscription.restoreSuccessMessage'),
                    [{
                        text: t('common.ok'),
                        onPress: () => {
                            // Start iOS monitoring and complete onboarding
                            finishOnboarding();
                        }
                    }]
                );
            } else {
                Alert.alert(
                    t('subscription.restoreFailed'),
                    result.error ?? t('subscription.noPurchasesToRestore'),
                    [{ text: t('common.ok') }]
                );
            }
        } finally {
            setIsPurchasing(false);
        }
    }, [restore, finishOnboarding]);

    const commitmentReasons = [
        {
            icon: 'wallet-outline' as const,
            title: t('onboarding.pricing.commitmentSection.reason1Title'),
            description: t('onboarding.pricing.commitmentSection.reason1Description'),
        },
        {
            icon: 'shield-checkmark-outline' as const,
            title: t('onboarding.pricing.commitmentSection.reason2Title'),
            description: t('onboarding.pricing.commitmentSection.reason2Description'),
        },
        {
            icon: 'flag-outline' as const,
            title: t('onboarding.pricing.commitmentSection.reason3Title'),
            description: t('onboarding.pricing.commitmentSection.reason3Description'),
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="medium" color="accent" intensity={0.1} />

            <Header showBack variant="ghost" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.pricing.title')}
                    </Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
                        {t('onboarding.pricing.subtitle')}
                    </Text>
                </Animated.View>

                {/* Trial Banner */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(200)}
                    style={[
                        styles.trialBanner,
                        {
                            backgroundColor: colors.accentMuted,
                            borderRadius: borderRadius.lg,
                        }
                    ]}
                >
                    <Ionicons name="gift-outline" size={24} color={colors.accent} />
                    <View style={styles.trialBannerText}>
                        <Text style={[typography.label, { color: colors.textPrimary }]}>
                            {t('onboarding.pricing.trialBannerTitle')}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            {t('onboarding.pricing.trialBannerDescription')}
                        </Text>
                    </View>
                </Animated.View>

                {/* Plan Selection Title */}
                <Animated.View entering={FadeInUp.duration(600).delay(300)} style={{ marginTop: spacing.xl }}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                        {t('onboarding.pricing.selectPlanTitle')}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                        {t('onboarding.pricing.selectPlanDescription')}
                    </Text>
                </Animated.View>

                {/* Plan Options */}
                <View style={styles.plansContainer}>
                    {plans.map((plan, index) => (
                        <Animated.View
                            key={plan.id}
                            entering={FadeInRight.duration(600).delay(400 + index * 100)}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.planCard,
                                    {
                                        backgroundColor: selectedPlan === plan.id
                                            ? colors.accentMuted
                                            : colors.backgroundCard,
                                        borderRadius: borderRadius.lg,
                                        borderWidth: 2,
                                        borderColor: selectedPlan === plan.id
                                            ? colors.accent
                                            : colors.border,
                                    }
                                ]}
                                onPress={() => setSelectedPlan(plan.id)}
                                activeOpacity={0.8}
                            >
                                {plan.badge && (
                                    <View style={[styles.planBadge, { backgroundColor: plan.badgeColor }]}>
                                        <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '600' }]}>
                                            {plan.badge}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.planRow}>
                                    {/* Radio Button */}
                                    <View style={[
                                        styles.radio,
                                        {
                                            borderColor: selectedPlan === plan.id ? colors.accent : colors.border,
                                            backgroundColor: selectedPlan === plan.id ? colors.accent : 'transparent',
                                            marginRight: 12,
                                        }
                                    ]}>
                                        {selectedPlan === plan.id && (
                                            <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                                        )}
                                    </View>
                                    {/* Plan Info */}
                                    <View style={styles.planInfo}>
                                        <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                            {plan.name}
                                        </Text>
                                        {plan.description && (
                                            <Text style={[typography.caption, { color: colors.textMuted }]}>
                                                {plan.description}
                                            </Text>
                                        )}
                                        {plan.savings && (
                                            <View style={[styles.savingsBadge, { backgroundColor: colors.success + '20' }]}>
                                                <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
                                                    {plan.savings}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {/* Price */}
                                    <View style={styles.priceContainer}>
                                        <Text style={[typography.h2, { color: colors.accent }]}>
                                            {plan.price}
                                        </Text>
                                        {plan.pricePerDay && (
                                            <Text style={[typography.caption, { color: colors.textMuted }]}>
                                                {plan.pricePerDay}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Skip Trial Toggle */}
                <Animated.View entering={FadeInUp.duration(600).delay(700)}>
                    <TouchableOpacity
                        style={[
                            styles.skipTrialCard,
                            {
                                marginTop: spacing.lg,
                                backgroundColor: skipTrial ? colors.backgroundCard : colors.backgroundCard,
                                borderRadius: borderRadius.lg,
                                borderWidth: 2,
                                borderColor: skipTrial ? colors.accent : colors.border,
                            }
                        ]}
                        onPress={() => setSkipTrial(!skipTrial)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.skipTrialContent}>
                            <View style={[
                                styles.checkbox,
                                {
                                    borderColor: skipTrial ? colors.accent : colors.border,
                                    backgroundColor: skipTrial ? colors.accent : 'transparent',
                                }
                            ]}>
                                {skipTrial && (
                                    <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                                )}
                            </View>
                            <View style={styles.skipTrialText}>
                                <Text style={[typography.label, { color: colors.textPrimary }]}>
                                    {t('onboarding.pricing.skipTrialToggle')}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    {t('onboarding.pricing.skipTrialToggleDescription')}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Commitment Psychology Section (only when skipping trial) */}
                {skipTrial && (
                    <Animated.View
                        entering={FadeInUp.duration(600)}
                        style={[
                            styles.commitmentCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.lg,
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                            {t('onboarding.pricing.commitmentSection.title')}
                        </Text>
                        <Text style={[typography.caption, { color: colors.accent, marginBottom: spacing.md }]}>
                            {t('onboarding.pricing.commitmentSection.subtitle')}
                        </Text>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
                            {t('onboarding.pricing.commitmentSection.description')}
                        </Text>

                        {commitmentReasons.map((reason, index) => (
                            <View key={index} style={[styles.reasonRow, { marginBottom: index < 2 ? spacing.md : 0 }]}>
                                <View style={[styles.reasonIcon, { backgroundColor: colors.accentMuted }]}>
                                    <Ionicons name={reason.icon} size={20} color={colors.accent} />
                                </View>
                                <View style={styles.reasonContent}>
                                    <Text style={[typography.label, { color: colors.textPrimary }]}>
                                        {reason.title}
                                    </Text>
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                        {reason.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Features List */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(800)}
                    style={[styles.featuresCard, { marginTop: spacing.xl }]}
                >
                    <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md }]}>
                        {t('onboarding.pricing.features.title')}
                    </Text>
                    <View style={styles.featuresList}>
                        {(Object.entries({
                            intervention: 'timer-outline',
                            unlimited: 'infinite-outline',
                            personalized: 'person-outline',
                            statistics: 'stats-chart-outline',
                            coaching: 'school-outline',
                            checkIn: 'checkbox-outline',
                        }) as [string, IoniconsName][]).map(([key, icon]) => (
                            <View key={key} style={styles.featureRow}>
                                <Ionicons name={icon} size={18} color={colors.accent} />
                                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                    {t(`onboarding.pricing.features.list.${key}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Terms Note */}
                <Animated.View entering={FadeInUp.duration(600).delay(900)} style={{ marginTop: spacing.lg }}>
                    <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                        {skipTrial
                            ? t('onboarding.pricing.termsNoteImmediate')
                            : t('onboarding.pricing.termsNoteTrial')
                        }
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }]}>
                        {t('onboarding.pricing.privacyNote')}
                    </Text>
                </Animated.View>

                <View style={{ height: spacing.xl }} />
            </ScrollView>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(1000)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                {/* Loading Indicator */}
                {(isLoading || isPurchasing) && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.accent} />
                        <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
                            {isPurchasing ? t('subscription.processing') : t('common.loading')}
                        </Text>
                    </View>
                )}

                <Button
                    title={skipTrial
                        ? t('onboarding.pricing.startNowButton', { plan: plans.find(p => p.id === selectedPlan)?.name ?? '' })
                        : t('onboarding.pricing.startTrialButton')
                    }
                    onPress={skipTrial ? handleStartWithoutTrial : handleStartWithTrial}
                    size="lg"
                    disabled={isPurchasing}
                />

                {/* Restore Purchases Link */}
                <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={handleRestore}
                    disabled={isPurchasing}
                >
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {t('subscription.restore')}
                    </Text>
                </TouchableOpacity>
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
    content: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    trialBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    trialBannerText: {
        flex: 1,
        marginLeft: 12,
    },
    plansContainer: {
        gap: 12,
    },
    planCard: {
        padding: 16,
        position: 'relative',
    },
    planBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    planRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    savingsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipTrialCard: {
        padding: 16,
    },
    skipTrialContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skipTrialText: {
        flex: 1,
        marginLeft: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commitmentCard: {
        padding: 16,
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    reasonIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reasonContent: {
        flex: 1,
    },
    featuresCard: {
        paddingVertical: 16,
    },
    featuresList: {
        gap: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    restoreButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
});
