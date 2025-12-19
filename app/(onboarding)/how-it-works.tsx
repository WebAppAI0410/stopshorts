import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight, FadeIn, ZoomIn } from 'react-native-reanimated';
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
    const [showDemo, setShowDemo] = useState(false);

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

            <Header showBack />

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

                {/* Demo Section */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(1000)}
                    style={[
                        styles.demoCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
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
                        {t('onboarding.v3.howItWorks.demo.title')}
                    </Text>
                    <Text style={[
                        typography.bodySmall,
                        {
                            color: colors.textSecondary,
                            textAlign: 'center',
                            marginTop: spacing.xs,
                            marginBottom: spacing.lg,
                        }
                    ]}>
                        {t('onboarding.v3.howItWorks.demo.subtitle')}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.demoButton,
                            {
                                backgroundColor: colors.accent,
                                borderRadius: borderRadius.lg,
                            }
                        ]}
                        onPress={() => setShowDemo(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="play-circle" size={20} color={colors.textInverse} />
                        <Text style={[
                            typography.button,
                            {
                                color: colors.textInverse,
                                marginLeft: spacing.sm,
                            }
                        ]}>
                            {t('onboarding.v3.howItWorks.demo.tryButton')}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            {/* Demo Modal */}
            <Modal
                visible={showDemo}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowDemo(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
                    <SafeAreaView style={styles.modalContent}>
                        {/* Glow Effects */}
                        <View style={styles.glowContainer}>
                            <View style={[styles.glowOuter, { backgroundColor: colors.shieldGlow }]} />
                            <View style={[styles.glowInner, { backgroundColor: colors.accentGlow }]} />
                        </View>

                        <View style={styles.modalInner}>
                            {/* Header */}
                            <Animated.View entering={FadeIn.duration(600)} style={styles.modalHeader}>
                                <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
                                <Text style={[typography.h3, { color: colors.accent, marginLeft: spacing.sm }]}>
                                    StopShorts Shield
                                </Text>
                            </Animated.View>

                            {/* Shield Icon */}
                            <Animated.View entering={ZoomIn.duration(800).delay(200)} style={styles.shieldContainer}>
                                <ShieldIcon size="xl" glowing={true} status="protected" />
                            </Animated.View>

                            {/* Message */}
                            <Animated.View entering={FadeInUp.duration(600).delay(400)}>
                                <Text style={[
                                    typography.h1,
                                    {
                                        color: colors.textPrimary,
                                        textAlign: 'center',
                                    }
                                ]}>
                                    {t('onboarding.v3.howItWorks.demo.shieldMessage')}
                                </Text>
                            </Animated.View>

                            {/* Quote */}
                            <Animated.View entering={FadeInUp.duration(600).delay(500)} style={{ marginTop: spacing.xl }}>
                                <Text style={[
                                    styles.quote,
                                    { color: colors.textSecondary }
                                ]}>
                                    "{t('onboarding.v3.howItWorks.demo.quote')}"
                                </Text>
                            </Animated.View>

                            <View style={{ flex: 1 }} />

                            {/* Close Button */}
                            <Animated.View entering={FadeInUp.duration(600).delay(700)} style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalPrimaryButton,
                                        {
                                            backgroundColor: colors.accent,
                                            borderRadius: borderRadius.xl,
                                        }
                                    ]}
                                    onPress={() => setShowDemo(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[typography.button, { color: colors.textInverse }]}>
                                        {t('onboarding.v3.howItWorks.demo.closeButton')}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 1,
        width: '100%',
    },
    modalInner: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shieldContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    quote: {
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 20,
    },
    modalButtonContainer: {
        gap: 16,
    },
    modalPrimaryButton: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowOuter: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.3,
    },
    glowInner: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.5,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
