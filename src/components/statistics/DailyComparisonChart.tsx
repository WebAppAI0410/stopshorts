import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Time of day breakdown for usage statistics
 */
export interface TimeOfDayBreakdown {
    morning: number;   // 6-9
    daytime: number;   // 9-17
    evening: number;   // 17-21
    night: number;     // 21-6
}

export interface DailyComparisonChartProps {
    today: TimeOfDayBreakdown;
    yesterday: TimeOfDayBreakdown;
    baselineDailyMinutes?: number;
}

const TIME_SLOTS = [
    { key: 'morning' as const, label: '朝' },
    { key: 'daytime' as const, label: '昼' },
    { key: 'evening' as const, label: '夕' },
    { key: 'night' as const, label: '夜' },
];

/**
 * DailyComparisonChart - Time-of-day comparison chart for Day tab
 * Shows side-by-side bars comparing today vs yesterday usage
 */
export function DailyComparisonChart({
    today,
    yesterday,
    baselineDailyMinutes,
}: DailyComparisonChartProps) {
    const { colors } = useTheme();

    const chartHeight = 160;
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 48;
    const yAxisWidth = 35;
    const availableWidth = chartWidth - yAxisWidth;

    const chartData = useMemo(() => {
        const allValues = [
            today.morning, today.daytime, today.evening, today.night,
            yesterday.morning, yesterday.daytime, yesterday.evening, yesterday.night,
        ];
        const maxValue = Math.max(...allValues, baselineDailyMinutes ? baselineDailyMinutes / 4 : 0, 15);

        // Calculate bar dimensions for grouped bars (2 bars per slot with gap)
        const numSlots = TIME_SLOTS.length;
        const groupGap = 16; // Gap between time slot groups
        const barGap = 4; // Gap between bars within a group
        const totalGroupSpace = availableWidth - groupGap * (numSlots + 1);
        const groupWidth = totalGroupSpace / numSlots;
        const barWidth = (groupWidth - barGap) / 2;

        const yAxisLabels = [0, Math.round(maxValue / 2), maxValue];

        return {
            maxValue,
            groupGap,
            barGap,
            groupWidth,
            barWidth: Math.min(barWidth, 30),
            yAxisLabels,
        };
    }, [today, yesterday, baselineDailyMinutes, availableWidth]);

    const formatTime = (minutes: number): string => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return `${hours}h`;
        }
        return `${minutes}m`;
    };

    const baselineY = baselineDailyMinutes
        ? chartHeight - (baselineDailyMinutes / 4 / chartData.maxValue) * (chartHeight - 20)
        : null;

    return (
        <View style={styles.container}>
            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>今日</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.textSecondary }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>昨日</Text>
                </View>
            </View>

            <Svg width={chartWidth} height={chartHeight + 30}>
                <Defs>
                    <LinearGradient id="todayGradient" x1="0%" y1="100%" x2="0%" y2="0%">
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

                {/* Grouped bars for each time slot */}
                {TIME_SLOTS.map((slot, index) => {
                    const todayValue = today[slot.key];
                    const yesterdayValue = yesterday[slot.key];

                    const groupX = yAxisWidth + chartData.groupGap + index * (chartData.groupWidth + chartData.groupGap);
                    const groupCenter = groupX + chartData.groupWidth / 2;

                    const todayBarHeight = (todayValue / chartData.maxValue) * (chartHeight - 20);
                    const yesterdayBarHeight = (yesterdayValue / chartData.maxValue) * (chartHeight - 20);

                    const todayX = groupCenter - chartData.barWidth - chartData.barGap / 2;
                    const yesterdayX = groupCenter + chartData.barGap / 2;

                    const cornerRadius = chartData.barWidth / 4;

                    return (
                        <G key={`slot-${index}`}>
                            {/* Today bar */}
                            <Rect
                                x={todayX}
                                y={chartHeight - todayBarHeight}
                                width={chartData.barWidth}
                                height={Math.max(todayBarHeight, 2)}
                                rx={cornerRadius}
                                ry={cornerRadius}
                                fill="url(#todayGradient)"
                            />
                            {/* Yesterday bar */}
                            <Rect
                                x={yesterdayX}
                                y={chartHeight - yesterdayBarHeight}
                                width={chartData.barWidth}
                                height={Math.max(yesterdayBarHeight, 2)}
                                rx={cornerRadius}
                                ry={cornerRadius}
                                fill={colors.textSecondary}
                                opacity={0.6}
                            />
                            {/* X-axis label */}
                            <SvgText
                                x={groupCenter}
                                y={chartHeight + 18}
                                fill={colors.textMuted}
                                fontSize={12}
                                textAnchor="middle"
                            >
                                {slot.label}
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
