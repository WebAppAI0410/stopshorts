import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';

export interface ComparisonHeroProps {
    mode: 'day' | 'week';
    currentMinutes: number;
    previousMinutes: number;
    changePercent: number;
    baselineReduction: number | null;
}

/**
 * Format minutes into "Xh Ym" format
 * @param minutes - Total minutes to format
 * @returns Formatted string like "1h 45m" or "45m"
 */
export function formatTime(minutes: number): string {
    const absMinutes = Math.abs(Math.round(minutes));
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

export function ComparisonHero({
    mode,
    currentMinutes,
    previousMinutes,
    changePercent,
    baselineReduction,
}: ComparisonHeroProps) {
    const { colors, typography, spacing, borderRadius, isDark } = useTheme();

    const isDecrease = changePercent <= 0;
    const changeColor = isDecrease ? colors.success : colors.error;
    const changeIcon = isDecrease ? '↓' : '↑';
    const absChangePercent = Math.abs(Math.round(changePercent));

    const periodLabel = mode === 'day'
        ? t('statistics.vsYesterday')
        : t('statistics.vsLastWeek');

    // Glassmorphism styling
    const glassBackground = colors.glassBackground;
    const glassBorder = colors.glassBorder;

    const content = (
        <View style={{ padding: spacing.lg }}>
            {/* Current Usage */}
            <View style={styles.mainSection}>
                <Text
                    style={[
                        typography.label,
                        { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                >
                    {mode === 'day'
                        ? t('statistics.todayUsage')
                        : t('statistics.weeklyUsage')}
                </Text>
                <Text
                    style={[
                        typography.hero,
                        { color: colors.textPrimary },
                    ]}
                    accessibilityLabel={`${formatTime(currentMinutes)}`}
                >
                    {formatTime(currentMinutes)}
                </Text>
            </View>

            {/* Change Indicator */}
            <View style={[styles.changeSection, { marginTop: spacing.md }]}>
                <View
                    style={[
                        styles.changeBadge,
                        {
                            backgroundColor: isDecrease
                                ? colors.successMuted
                                : colors.errorMuted,
                            borderRadius: borderRadius.full,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
                            // Glow effect for the badge
                            ...(isDark && {
                                shadowColor: isDecrease ? colors.success : colors.error,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                            }),
                        },
                    ]}
                >
                    <Text
                        style={[
                            typography.button,
                            { color: changeColor },
                        ]}
                        accessibilityLabel={
                            isDecrease
                                ? t('statistics.reduction', { percent: absChangePercent })
                                : t('statistics.increase', { percent: absChangePercent })
                        }
                    >
                        {changeIcon} {absChangePercent}%
                    </Text>
                </View>
                <Text
                    style={[
                        typography.bodySmall,
                        { color: colors.textMuted, marginLeft: spacing.sm },
                    ]}
                >
                    {periodLabel}
                </Text>
            </View>

            {/* Previous Period */}
            <View style={[styles.previousSection, { marginTop: spacing.md }]}>
                <Text
                    style={[
                        typography.bodySmall,
                        { color: colors.textMuted },
                    ]}
                >
                    {mode === 'day'
                        ? t('statistics.yesterday')
                        : t('statistics.lastWeek')}
                    {': '}
                    <Text style={{ color: colors.textSecondary }}>
                        {formatTime(previousMinutes)}
                    </Text>
                </Text>
            </View>

            {/* Baseline Reduction */}
            {baselineReduction !== null && (
                <View
                    style={[
                        styles.baselineSection,
                        {
                            marginTop: spacing.md,
                            paddingTop: spacing.md,
                            borderTopWidth: 1,
                            borderTopColor: colors.glassBorderSubtle,
                        },
                    ]}
                >
                    <Text
                        style={[
                            typography.bodySmall,
                            { color: colors.textMuted },
                        ]}
                    >
                        {t('statistics.fromBaseline')}
                    </Text>
                    <Text
                        style={[
                            typography.button,
                            {
                                color: baselineReduction <= 0 ? colors.success : colors.error,
                                marginLeft: spacing.xs
                            },
                        ]}
                    >
                        {baselineReduction <= 0 ? '↓' : '↑'} {Math.abs(Math.round(baselineReduction))}%
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={[
                styles.container,
                {
                    borderRadius: borderRadius.xl,
                    overflow: 'hidden',
                    // Glow effect
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: isDark ? 0.15 : 0.08,
                    shadowRadius: 16,
                    elevation: 4,
                },
            ]}
        >
            {Platform.OS === 'ios' ? (
                <BlurView
                    intensity={40}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                        styles.blurContainer,
                        {
                            borderWidth: 1,
                            borderColor: glassBorder,
                            borderRadius: borderRadius.xl,
                        },
                    ]}
                >
                    {content}
                </BlurView>
            ) : (
                <View
                    style={[
                        styles.fallbackContainer,
                        {
                            backgroundColor: glassBackground,
                            borderWidth: 1,
                            borderColor: glassBorder,
                            borderRadius: borderRadius.xl,
                        },
                    ]}
                >
                    {content}
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {},
    blurContainer: {
        overflow: 'hidden',
    },
    fallbackContainer: {},
    mainSection: {
        alignItems: 'center',
    },
    changeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previousSection: {
        alignItems: 'center',
    },
    baselineSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
