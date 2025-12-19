import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

export default function StartScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const motivation = useAppStore((state) => state.motivation);
    const lifetimeImpact = useAppStore((state) => state.lifetimeImpact);
    const alternativeActivity = useAppStore((state) => state.alternativeActivity);
    const customAlternativeActivity = useAppStore((state) => state.customAlternativeActivity);
    const ifThenPlan = useAppStore((state) => state.ifThenPlan);
    const completeOnboarding = useAppStore((state) => state.completeOnboarding);

    // Motivation display names
    const getMotivationDisplayName = (motivationType: string | null): string => {
        switch (motivationType) {
            case 'meaningful_time':
                return '意味ある時間を過ごす';
            case 'pursue_goals':
                return 'やりたいことに向き合う';
            case 'relationships':
                return '大切な人との時間を守る';
            case 'self_control':
                return '自分をコントロールする';
            default:
                return '';
        }
    };

    // If-Then action display names
    const getIfThenActionDisplayName = (planAction: string | null, customAction?: string): string => {
        switch (planAction) {
            case 'breathe':
                return '深呼吸を3回する';
            case 'read_page':
                return '本を1ページ読む';
            case 'look_outside':
                return '外の景色を見る';
            case 'short_walk':
                return '5分散歩する';
            case 'stretch':
                return 'ストレッチする';
            case 'water':
                return '水を飲む';
            case 'custom':
                return customAction || '';
            default:
                return '';
        }
    };

    const handleStart = () => {
        completeOnboarding();
        router.replace('/(main)' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="lg" color="accent" intensity={0.12} />
            <GlowOrb position="bottom-left" size="md" color="primary" intensity={0.08} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Checkmark Icon */}
                <Animated.View
                    entering={ZoomIn.duration(600).delay(200)}
                    style={styles.iconContainer}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.accent} />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInUp.duration(800).delay(400)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                            marginBottom: spacing.md,
                            fontSize: 32,
                        }
                    ]}>
                        {t('onboarding.v3.start.title')}
                    </Text>
                </Animated.View>

                {/* Commitment Card */}
                <Animated.View
                    entering={FadeInUp.duration(800).delay(600)}
                    style={[
                        styles.commitmentCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                            marginTop: spacing.xl,
                        }
                    ]}
                >
                    {/* Row 1: Motivation */}
                    <View style={[styles.commitmentRow, { marginBottom: spacing.lg }]}>
                        <Text style={[
                            typography.caption,
                            {
                                color: colors.textMuted,
                                marginBottom: spacing.xs,
                            }
                        ]}>
                            {t('onboarding.v3.start.motivationLabel')}
                        </Text>
                        <Text style={[
                            typography.bodyLarge,
                            {
                                color: colors.textPrimary,
                                fontWeight: '600',
                            }
                        ]}>
                            {getMotivationDisplayName(motivation)}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={[
                        styles.divider,
                        {
                            backgroundColor: colors.divider,
                            marginBottom: spacing.lg,
                        }
                    ]} />

                    {/* Row 2: Time to Reclaim */}
                    <View style={[styles.commitmentRow, { marginBottom: spacing.lg }]}>
                        <Text style={[
                            typography.caption,
                            {
                                color: colors.textMuted,
                                marginBottom: spacing.xs,
                            }
                        ]}>
                            {t('onboarding.v3.start.timeLabel')}
                        </Text>
                        <Text style={[
                            typography.bodyLarge,
                            {
                                color: colors.accent,
                                fontWeight: '600',
                            }
                        ]}>
                            {t('onboarding.v3.start.timeValue', {
                                hours: Math.round(lifetimeImpact?.yearlyLostHours || 0)
                            })}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={[
                        styles.divider,
                        {
                            backgroundColor: colors.divider,
                            marginBottom: spacing.lg,
                        }
                    ]} />

                    {/* Row 3: Alternative Activity */}
                    <View style={[styles.commitmentRow, { marginBottom: spacing.lg }]}>
                        <Text style={[
                            typography.caption,
                            {
                                color: colors.textMuted,
                                marginBottom: spacing.xs,
                            }
                        ]}>
                            {t('onboarding.v3.start.alternativeLabel')}
                        </Text>
                        <Text style={[
                            typography.bodyLarge,
                            {
                                color: colors.textPrimary,
                                fontWeight: '600',
                            }
                        ]}>
                            {alternativeActivity === 'custom'
                                ? customAlternativeActivity
                                : t(`onboarding.v3.alternative.options.${alternativeActivity}`)}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={[
                        styles.divider,
                        {
                            backgroundColor: colors.divider,
                            marginBottom: spacing.lg,
                        }
                    ]} />

                    {/* Row 4: If-Then Plan */}
                    <View style={styles.commitmentRow}>
                        <Text style={[
                            typography.caption,
                            {
                                color: colors.textMuted,
                                marginBottom: spacing.xs,
                            }
                        ]}>
                            {t('onboarding.v3.start.ifThenLabel')}
                        </Text>
                        <Text style={[
                            typography.bodyLarge,
                            {
                                color: colors.textPrimary,
                                fontWeight: '600',
                            }
                        ]}>
                            {getIfThenActionDisplayName(
                                ifThenPlan?.action || null,
                                ifThenPlan?.customAction
                            )}
                        </Text>
                    </View>
                </Animated.View>

                {/* Trial Note */}
                <Animated.View
                    entering={FadeInUp.duration(800).delay(800)}
                    style={[styles.trialNote, { marginTop: spacing.xl }]}
                >
                    <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
                    <Text style={[
                        typography.caption,
                        {
                            color: colors.textMuted,
                            marginLeft: spacing.xs,
                            flex: 1,
                        }
                    ]}>
                        {t('onboarding.v3.start.trialNote')}
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
                    title={t('onboarding.v3.start.startButton')}
                    onPress={handleStart}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={8} currentStep={8} />
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
    content: {
        flexGrow: 1,
        paddingTop: 60,
        paddingBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commitmentCard: {
        width: '100%',
    },
    commitmentRow: {
        width: '100%',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    trialNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 4,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
