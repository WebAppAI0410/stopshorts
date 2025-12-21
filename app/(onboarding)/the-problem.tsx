import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

type ProblemCard = {
    icon: keyof typeof Ionicons.glyphMap;
    titleKey: string;
    descriptionKey: string;
};

const problemCards: ProblemCard[] = [
    {
        icon: 'skull-outline',
        titleKey: 'onboarding.v3.theProblem.cards.concentration.title',
        descriptionKey: 'onboarding.v3.theProblem.cards.concentration.description',
    },
    {
        icon: 'flash-outline',
        titleKey: 'onboarding.v3.theProblem.cards.dopamine.title',
        descriptionKey: 'onboarding.v3.theProblem.cards.dopamine.description',
    },
    {
        icon: 'moon-outline',
        titleKey: 'onboarding.v3.theProblem.cards.sleep.title',
        descriptionKey: 'onboarding.v3.theProblem.cards.sleep.description',
    },
];

export default function TheProblemScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const handleContinue = () => {
        router.push('/(onboarding)/goal' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title and Subtitle */}
                <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            marginBottom: spacing.sm,
                        }
                    ]}>
                        {t('onboarding.v3.theProblem.title')}
                    </Text>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.textSecondary,
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.theProblem.subtitle')}
                    </Text>
                </Animated.View>

                {/* Problem Cards */}
                <View style={styles.cardsContainer}>
                    {problemCards.map((card, index) => (
                        <Animated.View
                            key={card.titleKey}
                            entering={FadeInRight.duration(600).delay(200 + index * 100)}
                        >
                            <View
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor: colors.backgroundCard,
                                        borderRadius: borderRadius.lg,
                                        padding: spacing.lg,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <View
                                        style={[
                                            styles.iconContainer,
                                            {
                                                backgroundColor: colors.accentMuted,
                                                borderRadius: borderRadius.md,
                                            }
                                        ]}
                                    >
                                        <Ionicons name={card.icon} size={24} color={colors.accent} />
                                    </View>
                                    <Text style={[
                                        typography.h3,
                                        {
                                            color: colors.textPrimary,
                                            flex: 1,
                                            marginLeft: spacing.md,
                                        }
                                    ]}>
                                        {t(card.titleKey)}
                                    </Text>
                                </View>
                                <Text style={[
                                    typography.body,
                                    {
                                        color: colors.textSecondary,
                                        marginTop: spacing.sm,
                                        lineHeight: 24,
                                    }
                                ]}>
                                    {t(card.descriptionKey)}
                                </Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Footnote */}
                <Animated.View
                    entering={FadeInUp.duration(600).delay(600)}
                    style={[
                        styles.footnoteContainer,
                        {
                            backgroundColor: colors.surface,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                            marginTop: spacing.xl,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.accent,
                        }
                    ]}
                >
                    <View style={styles.footnoteHeader}>
                        <Ionicons name="information-circle" size={20} color={colors.accent} />
                        <Text style={[
                            typography.caption,
                            {
                                color: colors.accent,
                                fontWeight: '600',
                                marginLeft: spacing.xs,
                            }
                        ]}>
                            {t('onboarding.v3.theProblem.footnoteLabel')}
                        </Text>
                    </View>
                    <Text style={[
                        typography.body,
                        {
                            color: colors.textSecondary,
                            marginTop: spacing.sm,
                            lineHeight: 22,
                        }
                    ]}>
                        {t('onboarding.v3.theProblem.footnote')}
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(800)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.next')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={10} currentStep={3} />
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
    scrollContent: {
        paddingTop: 8,
        paddingBottom: 120,
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footnoteContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    footnoteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
