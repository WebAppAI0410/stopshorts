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

type PlanType = 'trial' | 'monthly' | 'quarterly' | 'annual';

interface PlanOption {
    id: PlanType;
    name: string;
    price: string;
    pricePerDay?: string;
    savings?: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
}

export default function PricingScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { completeOnboarding, setSubscriptionPlan } = useAppStore();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('trial');
    const [showPaidPlans, setShowPaidPlans] = useState(false);

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
        },
    ];

    const handleStartTrial = () => {
        setSubscriptionPlan('trial');
        completeOnboarding();
        router.replace('/(main)' as Href);
    };

    const handleSelectPlan = () => {
        // In a real app, this would trigger Apple StoreKit subscription
        // For now, set as trial since actual subscription will be handled by StoreKit
        setSubscriptionPlan(selectedPlan === 'trial' ? 'trial' : selectedPlan);
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

            <Header showBack />

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
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.pricing.subtitle')}
                    </Text>
                </Animated.View>

                {/* Free Trial Section */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(200)}
                    style={[
                        styles.trialCard,
                        {
                            backgroundColor: colors.accentMuted,
                            borderRadius: borderRadius.xl,
                            borderWidth: 2,
                            borderColor: colors.accent,
                        }
                    ]}
                >
                    <View style={styles.trialHeader}>
                        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                            <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '600' }]}>
                                {t('onboarding.pricing.trialBadge')}
                            </Text>
                        </View>
                    </View>
                    <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                        {t('onboarding.pricing.freeTrialTitle')}
                    </Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                        {t('onboarding.pricing.freeTrialDescription')}
                    </Text>
                    <View style={styles.trialPrice}>
                        <Text style={[typography.hero, { color: colors.accent }]}>
                            {t('onboarding.pricing.plans.trial_3day.price')}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
                            / 3{t('statistics.days')}
                        </Text>
                    </View>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                        {t('onboarding.pricing.plans.trial_3day.afterTrial')}
                    </Text>
                </Animated.View>

                {/* Toggle to show paid plans */}
                <Animated.View entering={FadeInUp.duration(600).delay(300)}>
                    <TouchableOpacity
                        style={[styles.toggleButton, { marginTop: spacing.lg }]}
                        onPress={() => setShowPaidPlans(!showPaidPlans)}
                        activeOpacity={0.7}
                    >
                        <Text style={[typography.body, { color: colors.accent }]}>
                            {t('onboarding.pricing.skipTrial')}
                        </Text>
                        <Ionicons
                            name={showPaidPlans ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.accent}
                        />
                    </TouchableOpacity>
                </Animated.View>

                {/* Paid Plans Section */}
                {showPaidPlans && (
                    <>
                        {/* Commitment Psychology Section */}
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

                        {/* After Trial Description */}
                        <Animated.View entering={FadeInUp.duration(600).delay(100)} style={{ marginTop: spacing.xl }}>
                            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                                {t('onboarding.pricing.afterTrialTitle')}
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                                {t('onboarding.pricing.afterTrialDescription')}
                            </Text>
                        </Animated.View>

                        {/* Plan Options */}
                        <View style={styles.plansContainer}>
                            {plans.map((plan, index) => (
                                <Animated.View
                                    key={plan.id}
                                    entering={FadeInRight.duration(600).delay(200 + index * 100)}
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
                                        <View style={styles.planHeader}>
                                            <View>
                                                <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                                    {plan.name}
                                                </Text>
                                                {plan.description && (
                                                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                                                        {plan.description}
                                                    </Text>
                                                )}
                                            </View>
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
                                        {plan.savings && (
                                            <View style={[styles.savingsBadge, { backgroundColor: colors.success + '20' }]}>
                                                <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
                                                    {plan.savings}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.radioContainer}>
                                            <View style={[
                                                styles.radio,
                                                {
                                                    borderColor: selectedPlan === plan.id ? colors.accent : colors.border,
                                                    backgroundColor: selectedPlan === plan.id ? colors.accent : 'transparent',
                                                }
                                            ]}>
                                                {selectedPlan === plan.id && (
                                                    <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </>
                )}

                {/* Features List */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(400)}
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
                <Animated.View entering={FadeInUp.duration(600).delay(500)} style={{ marginTop: spacing.lg }}>
                    <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                        {t('onboarding.pricing.termsNote')}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }]}>
                        {t('onboarding.pricing.privacyNote')}
                    </Text>
                </Animated.View>

                <View style={{ height: spacing.xl }} />
            </ScrollView>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(600)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={showPaidPlans && selectedPlan !== 'trial'
                        ? t('onboarding.pricing.selectPlan')
                        : t('onboarding.pricing.startTrial')
                    }
                    onPress={showPaidPlans && selectedPlan !== 'trial' ? handleSelectPlan : handleStartTrial}
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
    trialCard: {
        padding: 20,
    },
    trialHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trialPrice: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
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
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    savingsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 8,
    },
    radioContainer: {
        position: 'absolute',
        left: 16,
        top: 20,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
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
