import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
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
        router.push('/(onboarding)/start' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
            <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

            <Header />

            <View style={[styles.content, { paddingHorizontal: spacing.gutter }]}>
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
                                    padding: spacing.lg,
                                    marginBottom: spacing.md,
                                }
                            ]}
                        >
                            <View style={styles.stepHeader}>
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: colors.accentMuted }
                                ]}>
                                    <Ionicons name={step.icon} size={28} color={colors.accent} />
                                </View>
                                <View style={styles.stepNumber}>
                                    <Text style={[
                                        typography.caption,
                                        { color: colors.textMuted }
                                    ]}>
                                        {t('onboarding.v3.howItWorks.stepLabel', { step: index + 1 })}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[
                                typography.h3,
                                {
                                    color: colors.textPrimary,
                                    marginTop: spacing.md,
                                    marginBottom: spacing.sm,
                                }
                            ]}>
                                {step.title}
                            </Text>
                            <Text style={[
                                typography.body,
                                { color: colors.textSecondary }
                            ]}>
                                {step.description}
                            </Text>
                        </Animated.View>
                    ))}
                </View>

                {/* Flow Diagram */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(850)}
                    style={[
                        styles.flowDiagram,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                            marginTop: spacing.lg,
                            marginBottom: spacing.xl,
                        }
                    ]}
                >
                    <Text style={[
                        typography.h2,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                            letterSpacing: 8,
                        }
                    ]}>
                        📱 → ⏱️ → 🛡️ → 💭
                    </Text>
                </Animated.View>

                {/* Note Card */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(1000)}
                    style={[
                        styles.noteCard,
                        {
                            backgroundColor: colors.accentMuted,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                        }
                    ]}
                >
                    <View style={styles.noteHeader}>
                        <Ionicons name="lightbulb-outline" size={24} color={colors.accent} />
                    </View>
                    <Text style={[
                        typography.body,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                            lineHeight: 24,
                        }
                    ]}>
                        {t('onboarding.v3.howItWorks.note')}
                    </Text>
                </Animated.View>
            </View>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(1150)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('onboarding.v3.howItWorks.understandButton')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={10} currentStep={9} />
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    stepsContainer: {
        marginBottom: 0,
    },
    stepCard: {
        position: 'relative',
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumber: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    flowDiagram: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteCard: {
        position: 'relative',
    },
    noteHeader: {
        alignItems: 'center',
        marginBottom: 12,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
