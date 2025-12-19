import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

interface DayData {
    day: string;
    value: number; // in minutes
}

interface WeeklyBarChartProps {
    data: DayData[];
    maxValue?: number;
    highlightDay?: string;
}

const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function WeeklyBarChart({ data, maxValue, highlightDay }: WeeklyBarChartProps) {
    const { colors, typography, spacing } = useTheme();

    const chartHeight = 200;
    const chartWidth = Dimensions.get('window').width - 40;
    const barWidth = 32;
    const barGap = (chartWidth - barWidth * 7) / 8;

    const calculatedMax = maxValue || Math.max(...data.map(d => d.value), 60);
    const yAxisLabels = [0, Math.round(calculatedMax / 3), Math.round(calculatedMax * 2 / 3), calculatedMax];

    // Convert minutes to display format
    const formatTime = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return `${hours}h`;
        }
        return `${minutes}m`;
    };

    return (
        <View style={styles.container}>
            <Svg width={chartWidth} height={chartHeight + 40}>
                <Defs>
                    <LinearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#14B8A6" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
                    </LinearGradient>
                    <LinearGradient id="barGradientHighlight" x1="0%" y1="100%" x2="0%" y2="0%">
                        <Stop offset="0%" stopColor="#A78BFA" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#2DD4BF" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#34D399" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Y-axis labels and grid lines */}
                {yAxisLabels.map((label, index) => {
                    const y = chartHeight - (label / calculatedMax) * (chartHeight - 20);
                    return (
                        <React.Fragment key={index}>
                            <Line
                                x1={30}
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
                        </React.Fragment>
                    );
                })}

                {/* Bars */}
                {data.map((item, index) => {
                    const barHeight = (item.value / calculatedMax) * (chartHeight - 20);
                    const x = 30 + barGap + index * (barWidth + barGap);
                    const y = chartHeight - barHeight;
                    const isHighlighted = highlightDay === item.day || DAYS_SHORT[index] === highlightDay;
                    const cornerRadius = barWidth / 2;

                    return (
                        <React.Fragment key={index}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx={cornerRadius}
                                ry={cornerRadius}
                                fill={isHighlighted ? 'url(#barGradientHighlight)' : 'url(#barGradient)'}
                            />
                            {/* Glow effect for highlighted bar */}
                            {isHighlighted && (
                                <Rect
                                    x={x - 4}
                                    y={y - 4}
                                    width={barWidth + 8}
                                    height={barHeight + 8}
                                    rx={cornerRadius + 4}
                                    ry={cornerRadius + 4}
                                    fill="rgba(16, 185, 129, 0.2)"
                                />
                            )}
                            {/* Day label */}
                            <SvgText
                                x={x + barWidth / 2}
                                y={chartHeight + 20}
                                fill={isHighlighted ? colors.textPrimary : colors.textMuted}
                                fontSize={10}
                                fontWeight={isHighlighted ? '600' : '400'}
                                textAnchor="middle"
                            >
                                {DAYS_SHORT[index]}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 16,
    },
});
