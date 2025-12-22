import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

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
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
    const [skipTrial, setSkipTrial] = useState(false);

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

    const handleStartWithTrial = () => {
        // In real app: trigger StoreKit with trial offer for selected plan
        setSubscriptionPlan('trial');
        completeOnboarding();
        router.replace('/(main)' as Href);
    };

    const handleStartWithoutTrial = () => {
        // In real app: trigger StoreKit for immediate payment
        setSubscriptionPlan(selectedPlan);
        completeOnboarding();
        router.replace('/(main)' as Href);
    };

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
                        {Object.entries({
                            intervention: 'timer-outline',
                            unlimited: 'infinite-outline',
                            personalized: 'person-outline',
                            statistics: 'stats-chart-outline',
                            coaching: 'school-outline',
                            checkIn: 'checkbox-outline',
                        }).map(([key, icon]) => (
                            <View key={key} style={styles.featureRow}>
                                <Ionicons name={icon as any} size={18} color={colors.accent} />
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
                <Button
                    title={skipTrial
                        ? t('onboarding.pricing.startNowButton', { plan: plans.find(p => p.id === selectedPlan)?.name ?? '' })
                        : t('onboarding.pricing.startTrialButton')
                    }
                    onPress={skipTrial ? handleStartWithoutTrial : handleStartWithTrial}
                    size="lg"
                />
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
});
