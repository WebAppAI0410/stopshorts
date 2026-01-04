import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb, ShieldIcon } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

type StepData = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
};

export default function HowItWorksScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const steps: StepData[] = [
        {
            icon: 'phone-portrait-outline',
            title: t('onboarding.v3.howItWorks.steps.step1.title'),
            description: t('onboarding.v3.howItWorks.steps.step1.description'),
        },
        {
            icon: 'time-outline',
            title: t('onboarding.v3.howItWorks.steps.step2.title'),
            description: t('onboarding.v3.howItWorks.steps.step2.description'),
        },
        {
            icon: 'checkmark-circle-outline',
            title: t('onboarding.v3.howItWorks.steps.step3.title'),
            description: t('onboarding.v3.howItWorks.steps.step3.description'),
        },
    ];

    const handleContinue = () => {
        // Navigate to mandatory urge surfing demo
        router.push('/(onboarding)/urge-surfing-demo' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
            <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

            <Header showBack variant="ghost" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.howItWorks.title')}
                    </Text>
                </Animated.View>

                {/* Steps */}
                <View style={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInRight.duration(600).delay(400 + index * 150)}
                            style={[
                                styles.stepCard,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderRadius: borderRadius.lg,
                                    padding: spacing.md,
                                    marginBottom: spacing.sm,
                                }
                            ]}
                        >
                            <View style={styles.stepRow}>
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: colors.accentMuted }
                                ]}>
                                    <Ionicons name={step.icon} size={24} color={colors.accent} />
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={[
                                        typography.caption,
                                        { color: colors.textMuted, marginBottom: 2 }
                                    ]}>
                                        {t('onboarding.v3.howItWorks.stepLabel', { step: index + 1 })}
                                    </Text>
                                    <Text style={[
                                        typography.h3,
                                        { color: colors.textPrimary, fontSize: 16 }
                                    ]}>
                                        {step.title}
                                    </Text>
                                    <Text style={[
                                        typography.bodySmall,
                                        { color: colors.textSecondary, marginTop: 2 }
                                    ]}>
                                        {step.description}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Note Card */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(850)}
                    style={[
                        styles.noteCard,
                        {
                            backgroundColor: colors.accentMuted,
                            borderRadius: borderRadius.lg,
                            padding: spacing.md,
                            marginTop: spacing.md,
                        }
                    ]}
                >
                    <View style={styles.noteRow}>
                        <Ionicons name="bulb-outline" size={20} color={colors.accent} />
                        <Text style={[
                            typography.bodySmall,
                            {
                                color: colors.textPrimary,
                                flex: 1,
                                marginLeft: spacing.sm,
                            }
                        ]}>
                            {t('onboarding.v3.howItWorks.note')}
                        </Text>
                    </View>
                </Animated.View>

                {/* Next Step Preview */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(1000)}
                    style={[
                        styles.demoCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.accent + '40',
                            padding: spacing.lg,
                            marginTop: spacing.xl,
                        }
                    ]}
                >
                    <View style={styles.demoIconContainer}>
                        <ShieldIcon size="medium" glowing={false} status="protected" />
                    </View>
                    <Text style={[
                        typography.h3,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                            marginTop: spacing.md,
                        }
                    ]}>
                        {t('onboarding.v3.howItWorks.nextPreview.title')}
                    </Text>
                    <Text style={[
                        typography.bodySmall,
                        {
                            color: colors.textSecondary,
                            textAlign: 'center',
                            marginTop: spacing.xs,
                        }
                    ]}>
                        {t('onboarding.v3.howItWorks.nextPreview.description')}
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(1150)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('onboarding.v3.howItWorks.experienceButton')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={11} currentStep={9} />
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
        paddingTop: 8,
        paddingBottom: 24,
    },
    stepsContainer: {
        gap: 0,
    },
    stepCard: {
        // styles applied inline
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepContent: {
        flex: 1,
    },
    noteCard: {
        // styles applied inline
    },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    demoCard: {
        alignItems: 'center',
    },
    demoIconContainer: {
        alignItems: 'center',
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
