import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
    const { colors, typography, spacing, borderRadius } = useTheme();

    const isDecrease = changePercent <= 0;
    const changeColor = isDecrease ? colors.success : colors.error;
    const changeIcon = isDecrease ? '↓' : '↑';
    const absChangePercent = Math.abs(Math.round(changePercent));

    const periodLabel = mode === 'day'
        ? t('statistics.comparison.vsYesterday')
        : t('statistics.comparison.vsLastWeek');

    return (
        <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={[
                styles.container,
                {
                    backgroundColor: colors.backgroundCard,
                    borderRadius: borderRadius.xl,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.lg,
                },
            ]}
        >
            {/* Current Usage */}
            <View style={styles.mainSection}>
                <Text
                    style={[
                        typography.label,
                        { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                >
                    {mode === 'day'
                        ? t('statistics.comparison.todayUsage')
                        : t('statistics.comparison.thisWeekUsage')}
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
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            borderRadius: borderRadius.full,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
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
                                ? t('statistics.comparison.decreased', { percent: absChangePercent })
                                : t('statistics.comparison.increased', { percent: absChangePercent })
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
                        ? t('statistics.comparison.yesterday')
                        : t('statistics.comparison.lastWeek')}
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
                            borderTopColor: colors.borderSubtle,
                        },
                    ]}
                >
                    <Text
                        style={[
                            typography.bodySmall,
                            { color: colors.textMuted },
                        ]}
                    >
                        {t('statistics.comparison.fromBaseline')}
                    </Text>
                    <Text
                        style={[
                            typography.button,
                            { color: colors.success, marginLeft: spacing.xs },
                        ]}
                    >
                        ↓ {Math.abs(Math.round(baselineReduction))}%
                    </Text>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {},
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
