import React, { useMemo } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { DayData } from '../../types/statistics';

export interface WeeklyComparisonChartProps {
    currentWeek: DayData[];
    previousWeek: DayData[];
    baselineDailyMinutes?: number;
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/**
 * WeeklyComparisonChart - Daily comparison chart for Week tab
 * Shows side-by-side bars comparing this week vs last week usage
 */
export function WeeklyComparisonChart({
    currentWeek,
    previousWeek,
    baselineDailyMinutes,
}: WeeklyComparisonChartProps) {
    const { colors } = useTheme();
    const { width: screenWidth } = useWindowDimensions();

    const chartHeight = 160;
    const chartWidth = screenWidth - 48;
    const yAxisWidth = 35;
    const availableWidth = chartWidth - yAxisWidth;

    const chartData = useMemo(() => {
        const allCurrentValues = currentWeek.map(d => d.minutes);
        const allPreviousValues = previousWeek.map(d => d.minutes);
        const allValues = [...allCurrentValues, ...allPreviousValues];
        const maxValue = Math.max(...allValues, baselineDailyMinutes ?? 0, 30);

        // Calculate bar dimensions for grouped bars (2 bars per day)
        const numDays = 7;
        const groupGap = 8; // Gap between day groups
        const barGap = 2; // Gap between bars within a group
        const totalGroupSpace = availableWidth - groupGap * (numDays + 1);
        const groupWidth = totalGroupSpace / numDays;
        const barWidth = Math.min((groupWidth - barGap) / 2, 16);

        const yAxisLabels = [0, Math.round(maxValue / 2), maxValue];

        return {
            maxValue,
            groupGap,
            barGap,
            groupWidth,
            barWidth,
            yAxisLabels,
        };
    }, [currentWeek, previousWeek, baselineDailyMinutes, availableWidth]);

    const formatTime = (minutes: number): string => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return `${hours}h`;
        }
        return `${minutes}m`;
    };

    const baselineY = baselineDailyMinutes
        ? chartHeight - (baselineDailyMinutes / chartData.maxValue) * (chartHeight - 20)
        : null;

    return (
        <View style={styles.container}>
            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('statistics.legendThisWeek')}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.textSecondary }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('statistics.legendLastWeek')}</Text>
                </View>
            </View>

            <Svg width={chartWidth} height={chartHeight + 30}>
                <Defs>
                    <LinearGradient id="currentWeekGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={colors.accent} stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Y-axis labels and grid lines */}
                {chartData.yAxisLabels.map((label, index) => {
                    const y = chartHeight - (label / chartData.maxValue) * (chartHeight - 20);
                    return (
                        <G key={`yaxis-${index}`}>
                            <Line
                                x1={yAxisWidth}
                                y1={y}
                                x2={chartWidth}
                                y2={y}
                                stroke={colors.border}
                                strokeWidth={1}
                                strokeDasharray="4,4"
                            />
                            <SvgText
                                x={0}
                                y={y + 4}
                                fill={colors.textMuted}
                                fontSize={10}
                            >
                                {formatTime(label)}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Baseline dashed line */}
                {baselineY !== null && (
                    <Line
                        x1={yAxisWidth}
                        y1={baselineY}
                        x2={chartWidth}
                        y2={baselineY}
                        stroke={colors.warning}
                        strokeWidth={1.5}
                        strokeDasharray="6,4"
                        opacity={0.7}
                    />
                )}

                {/* Grouped bars for each day */}
                {DAY_KEYS.map((dayKey, index) => {
                    const currentValue = currentWeek[index]?.minutes ?? 0;
                    const previousValue = previousWeek[index]?.minutes ?? 0;

                    const groupX = yAxisWidth + chartData.groupGap + index * (chartData.groupWidth + chartData.groupGap);
                    const groupCenter = groupX + chartData.groupWidth / 2;

                    const currentBarHeight = (currentValue / chartData.maxValue) * (chartHeight - 20);
                    const previousBarHeight = (previousValue / chartData.maxValue) * (chartHeight - 20);

                    const currentX = groupCenter - chartData.barWidth - chartData.barGap / 2;
                    const previousX = groupCenter + chartData.barGap / 2;

                    const cornerRadius = chartData.barWidth / 4;

                    return (
                        <G key={`day-${index}`}>
                            {/* Current week bar */}
                            <Rect
                                x={currentX}
                                y={chartHeight - currentBarHeight}
                                width={chartData.barWidth}
                                height={Math.max(currentBarHeight, 2)}
                                rx={cornerRadius}
                                ry={cornerRadius}
                                fill="url(#currentWeekGradient)"
                            />
                            {/* Previous week bar */}
                            <Rect
                                x={previousX}
                                y={chartHeight - previousBarHeight}
                                width={chartData.barWidth}
                                height={Math.max(previousBarHeight, 2)}
                                rx={cornerRadius}
                                ry={cornerRadius}
                                fill={colors.textSecondary}
                                opacity={0.5}
                            />
                            {/* X-axis label */}
                            <SvgText
                                x={groupCenter}
                                y={chartHeight + 16}
                                fill={colors.textMuted}
                                fontSize={10}
                                textAnchor="middle"
                            >
                                {t(`statistics.dayShort.${dayKey}`)}
                            </SvgText>
                        </G>
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 12,
    },
});
