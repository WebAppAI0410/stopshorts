import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
import type { PricingPlanId } from '../../src/types';

interface PlanOption {
    id: PricingPlanId;
    isDefault: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
    { id: 'trial_3day', isDefault: true },
    { id: 'monthly', isDefault: false },
    { id: 'quarterly', isDefault: false },
    { id: 'annual', isDefault: false },
];

const FEATURES = [
    'intervention',
    'unlimited',
    'personalized',
    'statistics',
    'coaching',
    'checkIn',
];

export default function PricingScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setSelectedPricingPlan, startTrial } = useAppStore();

    const [selectedPlan, setSelectedPlan] = useState<PricingPlanId>('trial_3day');

    const handleContinue = () => {
        setSelectedPricingPlan(selectedPlan);
        if (selectedPlan === 'trial_3day') {
            startTrial();
        }
        router.push('/(onboarding)/permission' as Href);
    };

    const renderPlanCard = (plan: PlanOption, index: number) => {
        const isSelected = selectedPlan === plan.id;
        const isTrial = plan.id === 'trial_3day';

        return (
            <Animated.View
                key={plan.id}
                entering={FadeInDown.duration(400).delay(200 + index * 100)}
            >
                <Pressable
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[
                        styles.planCard,
                        {
                            backgroundColor: isSelected ? colors.accentMuted : colors.backgroundCard,
                            borderColor: isSelected ? colors.accent : colors.border,
                            borderRadius: borderRadius.xl,
                            padding: spacing.md,
                            marginBottom: spacing.md,
                            borderWidth: isSelected ? 2 : 1,
                        },
                    ]}
                >
                    {/* Badge for trial */}
                    {isTrial && (
                        <View
                            style={[
                                styles.badge,
                                {
                                    backgroundColor: colors.accent,
                                    borderRadius: borderRadius.sm,
                                    paddingHorizontal: spacing.sm,
                                    paddingVertical: 2,
                                    position: 'absolute',
                                    top: -10,
                                    right: spacing.md,
                                },
                            ]}
                        >
                            <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                                {t('onboarding.pricing.trialBadge')}
                            </Text>
                        </View>
                    )}

                    <View style={styles.planHeader}>
                        <View style={styles.planInfo}>
                            <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                {t(`onboarding.pricing.plans.${plan.id}.name`)}
                            </Text>
                            {!isTrial && (
                                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                                    {t(`onboarding.pricing.plans.${plan.id}.pricePerDay`)}
                                </Text>
                            )}
                            {isTrial && (
                                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                                    {t(`onboarding.pricing.plans.${plan.id}.description`)}
                                </Text>
                            )}
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={[typography.h2, { color: isSelected ? colors.accent : colors.textPrimary }]}>
                                {t(`onboarding.pricing.plans.${plan.id}.price`)}
                            </Text>
                            {plan.id === 'quarterly' || plan.id === 'annual' ? (
                                <View
                                    style={[
                                        styles.savingsBadge,
                                        {
                                            backgroundColor: colors.success,
                                            borderRadius: borderRadius.sm,
                                            paddingHorizontal: spacing.xs,
                                            paddingVertical: 1,
                                            marginTop: 4,
                                        },
                                    ]}
                                >
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontSize: 10 }]}>
                                        {t(`onboarding.pricing.plans.${plan.id}.savings`)}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Selection indicator */}
                    <View
                        style={[
                            styles.radioOuter,
                            {
                                borderColor: isSelected ? colors.accent : colors.border,
                                position: 'absolute',
                                left: spacing.md,
                                top: '50%',
                                transform: [{ translateY: -12 }],
                            },
                        ]}
                    >
                        {isSelected && (
                            <View
                                style={[
                                    styles.radioInner,
                                    { backgroundColor: colors.accent },
                                ]}
                            />
                        )}
                    </View>

                    {/* After trial note */}
                    {isTrial && isSelected && (
                        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                            {t(`onboarding.pricing.plans.${plan.id}.afterTrial`)}
                        </Text>
                    )}
                </Pressable>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.pricing.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.pricing.subtitle')}
                    </Text>
                </Animated.View>

                {/* Commitment effect info */}
                <Animated.View
                    entering={ZoomIn.duration(400).delay(150)}
                    style={[
                        styles.commitmentCard,
                        {
                            backgroundColor: colors.accentMuted,
                            borderRadius: borderRadius.lg,
                            padding: spacing.md,
                            marginBottom: spacing.xl,
                        },
                    ]}
                >
                    <View style={styles.commitmentHeader}>
                        <Ionicons name="bulb-outline" size={20} color={colors.accent} />
                        <Text style={[typography.h3, { color: colors.accent, marginLeft: spacing.sm }]}>
                            {t('onboarding.pricing.commitmentTitle')}
                        </Text>
                    </View>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                        {t('onboarding.pricing.commitmentDescription')}
                    </Text>
                </Animated.View>

                {/* Plan options */}
                <View style={{ paddingLeft: 40 }}>
                    {PLAN_OPTIONS.map((plan, index) => renderPlanCard(plan, index))}
                </View>

                {/* Features list */}
                <Animated.View
                    entering={FadeInUp.duration(400).delay(600)}
                    style={{ marginTop: spacing.lg }}
                >
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        {t('onboarding.pricing.features.title')}
                    </Text>
                    <View style={styles.featuresList}>
                        {FEATURES.map((feature, index) => (
                            <View key={feature} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                    {t(`onboarding.pricing.features.list.${feature}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Terms note */}
                <Animated.View
                    entering={FadeInUp.duration(400).delay(700)}
                    style={{ marginTop: spacing.lg }}
                >
                    <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                        {t('onboarding.pricing.termsNote')}
                    </Text>
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={selectedPlan === 'trial_3day'
                        ? t('onboarding.pricing.startTrial')
                        : t('onboarding.pricing.subscribe')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={10} />
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
    commitmentCard: {},
    commitmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planCard: {
        position: 'relative',
    },
    badge: {},
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    savingsBadge: {},
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
    featuresList: {},
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    footer: {
        paddingTop: 20,
    },
});
