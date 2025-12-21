import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const handleStart = () => {
        router.push('/(onboarding)/user-setup' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="xl" color="accent" intensity={0.15} />
            <GlowOrb position="bottom-left" size="large" color="primary" intensity={0.1} />

            <View style={[styles.content, { paddingHorizontal: spacing.gutter }]}>
                {/* Icon */}
                <Animated.View
                    entering={FadeIn.duration(800).delay(200)}
                    style={styles.iconContainer}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
                        <Ionicons name="heart" size={48} color={colors.accent} />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInUp.duration(800).delay(400)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            textAlign: 'center',
                            marginBottom: spacing.lg,
                            lineHeight: 40,
                        }
                    ]}>
                        {t('onboarding.v3.welcome.title')}
                    </Text>
                </Animated.View>

                {/* Subtitle */}
                <Animated.View entering={FadeInUp.duration(800).delay(600)}>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.textSecondary,
                            textAlign: 'center',
                            lineHeight: 28,
                        }
                    ]}>
                        {t('onboarding.v3.welcome.subtitle')}
                    </Text>
                </Animated.View>

                <View style={{ flex: 1 }} />

                {/* App Description Card */}
                <Animated.View
                    entering={FadeIn.duration(800).delay(800)}
                    style={[
                        styles.quoteContainer,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                            marginBottom: spacing.xl,
                        }
                    ]}
                >
                    <Text style={[
                        typography.body,
                        {
                            color: colors.textSecondary,
                            textAlign: 'center',
                            marginBottom: spacing.md,
                        }
                    ]}>
                        {t('onboarding.v3.welcome.appDescription')}
                    </Text>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.accent,
                            fontWeight: '600',
                            textAlign: 'center',
                        }
                    ]}>
                        {t('onboarding.v3.welcome.philosophy')}
                    </Text>
                </Animated.View>
            </View>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(1000)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('onboarding.v3.welcome.startButton')}
                    onPress={handleStart}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={10} currentStep={1} />
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quoteContainer: {
        width: '100%',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
