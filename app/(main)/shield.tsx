import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ShieldIcon } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { getPersonalizedMessage, getCoachingContext } from '../../src/services/personalization';

interface ShieldScreenProps {
    onClose?: () => void;
    onExtend?: () => void;
}

export default function ShieldScreen({ onClose, onExtend }: ShieldScreenProps) {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const {
        interventionSettings,
        purpose,
        sleepProfile,
        addictionAssessment,
        implementationIntent,
    } = useAppStore();

    const thresholdMinutes = interventionSettings.delayMinutes;

    // Get personalized message and coaching context
    const personalizedData = useMemo(() => {
        return getPersonalizedMessage(
            purpose,
            sleepProfile,
            addictionAssessment,
            implementationIntent
        );
    }, [purpose, sleepProfile, addictionAssessment, implementationIntent]);

    const coachingContext = useMemo(() => {
        return getCoachingContext(purpose, sleepProfile);
    }, [purpose, sleepProfile]);

    const { message, warningLevel, implementationIntentText } = personalizedData;
    const { uiHints } = coachingContext;

    // Get appropriate colors based on warning level
    const getGlowColor = () => {
        if (uiHints.useWarmColors) {
            return 'rgba(239, 68, 68, 0.3)'; // Red glow for critical
        }
        return colors.shieldGlow;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Radial glow effect */}
            <View style={styles.glowContainer}>
                <View style={[styles.glowOuter, { backgroundColor: getGlowColor() }]} />
                <View style={[styles.glowInner, { backgroundColor: uiHints.useWarmColors ? 'rgba(239, 68, 68, 0.4)' : colors.accentGlow }]} />
            </View>

            <View style={styles.content}>
                {/* Header with warning icon if critical */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
                    {uiHints.showWarningIcon && (
                        <Ionicons name="warning" size={24} color="#EF4444" style={{ marginRight: 8 }} />
                    )}
                    <Text style={[typography.h3, { color: uiHints.useWarmColors ? '#EF4444' : colors.accent }]}>
                        StopShorts Shield
                    </Text>
                </Animated.View>

                {/* Shield Icon */}
                <Animated.View entering={FadeInUp.duration(800).delay(200)} style={styles.shieldContainer}>
                    <ShieldIcon size="xl" glowing={true} status="protected" />
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInUp.duration(600).delay(400)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
                        {t('shield.title', { minutes: thresholdMinutes })}
                    </Text>
                </Animated.View>

                {/* Personalized Message */}
                <Animated.View entering={FadeInUp.duration(600).delay(500)} style={{ marginTop: spacing.xl }}>
                    <Text style={[styles.quote, { color: colors.textSecondary }]}>
                        "{message}"
                    </Text>
                </Animated.View>

                {/* Implementation Intent */}
                {implementationIntentText && (
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(600)}
                        style={[styles.intentBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
                    >
                        <Text style={[typography.label, { color: colors.textMuted, marginBottom: 4 }]}>
                            {t('shield.yourPromise')}
                        </Text>
                        <Text style={[typography.body, { color: colors.accent, fontWeight: '600' }]}>
                            「{implementationIntentText}」
                        </Text>
                    </Animated.View>
                )}

                <View style={{ flex: 1 }} />

                {/* Buttons */}
                <Animated.View entering={FadeInUp.duration(600).delay(700)} style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            {
                                backgroundColor: colors.accent,
                                borderRadius: borderRadius.xl,
                            }
                        ]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={[typography.button, { color: colors.textInverse }]}>
                            {t('shield.buttons.close')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.secondaryButton,
                            {
                                borderRadius: borderRadius.xl,
                            }
                        ]}
                        onPress={onExtend}
                        activeOpacity={0.8}
                    >
                        <Text style={[typography.button, { color: colors.textSecondary }]}>
                            {warningLevel === 'critical'
                                ? t('shield.buttons.extend', { minutes: thresholdMinutes }) + t('shield.notRecommended')
                                : t('shield.buttons.extend', { minutes: thresholdMinutes })
                            }
                        </Text>
                        <View style={[styles.underline, { backgroundColor: colors.textMuted }]} />
                    </TouchableOpacity>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
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
    intentBox: {
        marginTop: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    buttonContainer: {
        gap: 16,
    },
    primaryButton: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    underline: {
        height: 1,
        width: '60%',
        marginTop: 4,
    },
});
