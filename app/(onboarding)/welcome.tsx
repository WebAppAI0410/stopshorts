import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
    Button,
    ProgressIndicator,
    ShieldIcon,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();

    const handleStart = () => {
        router.push('/(onboarding)/usage-assessment' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background glow effects */}
            <View style={styles.glowContainer}>
                <View style={[styles.glowOuter, { backgroundColor: colors.shieldGlow }]} />
            </View>

            <View style={[styles.content, { paddingHorizontal: spacing.gutter }]}>
                {/* Shield and Logo */}
                <Animated.View
                    entering={FadeInDown.duration(800).delay(200)}
                    style={styles.logoSection}
                >
                    <ShieldIcon size="large" glowing={true} status="protected" />
                    <View style={styles.logoText}>
                        <Text style={[typography.hero, { color: colors.textPrimary }]}>Stop</Text>
                        <Text style={[typography.hero, { color: colors.accent }]}>Shorts</Text>
                    </View>
                </Animated.View>

                {/* Tagline */}
                <Animated.View
                    entering={FadeInUp.duration(800).delay(600)}
                    style={{ marginTop: spacing.xl }}
                >
                    <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
                        {t('onboarding.welcome.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
                        {t('onboarding.welcome.subtitle')}
                    </Text>
                </Animated.View>

                <View style={{ flex: 1 }} />

                {/* Footer */}
                <Animated.View
                    entering={FadeInUp.duration(800).delay(800)}
                    style={styles.footer}
                >
                    <Button
                        title={t('onboarding.welcome.start')}
                        onPress={handleStart}
                        size="lg"
                    />

                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' }]}>
                        {t('onboarding.welcome.existingUser')}
                    </Text>

                    <View style={{ marginTop: spacing.xl }}>
                        <ProgressIndicator totalSteps={12} currentStep={1} />
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        paddingTop: 100,
    },
    glowOuter: {
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.3,
    },
    content: {
        flex: 1,
        paddingTop: 60,
    },
    logoSection: {
        alignItems: 'center',
    },
    logoText: {
        flexDirection: 'row',
        marginTop: 24,
    },
    footer: {
        paddingBottom: 40,
    },
});
