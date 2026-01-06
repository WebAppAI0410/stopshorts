import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

export interface TrendChartProps {
    weeklyTotals: number[];  // 4 weeks, oldest to newest
    labels?: string[];
}

const DEFAULT_LABELS = ['4週前', '3週前', '2週前', '先週'];

/**
 * TrendChart - 4-week trend mini chart for Week tab
 * Shows simple bars with gradient (older weeks lighter, newer weeks darker)
 */
export function TrendChart({
    weeklyTotals,
    labels = DEFAULT_LABELS,
}: TrendChartProps) {
    const { colors, isDark } = useTheme();

    const chartHeight = 100;
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80; // More padding for mini chart
    const bottomPadding = 24;

    const chartData = useMemo(() => {
        const maxValue = Math.max(...weeklyTotals, 60);
        const numBars = Math.min(weeklyTotals.length, 4);
        const barGap = 16;
        const totalGapSpace = barGap * (numBars + 1);
        const barWidth = Math.min((chartWidth - totalGapSpace) / numBars, 50);

        // Generate opacity values for gradient effect (older = lighter)
        const opacities = weeklyTotals.map((_, index) => {
            const baseOpacity = isDark ? 0.4 : 0.3;
            const step = (1 - baseOpacity) / (weeklyTotals.length - 1 || 1);
            return baseOpacity + step * index;
        });

        return {
            maxValue,
            barWidth,
            barGap,
            opacities,
        };
    }, [weeklyTotals, chartWidth, isDark]);

    const formatTime = (minutes: number): string => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) return `${hours}h`;
            return `${hours}h${mins}m`;
        }
        return `${minutes}m`;
    };

    // Calculate total width of all bars and gaps
    const totalBarsWidth = weeklyTotals.length * chartData.barWidth + (weeklyTotals.length + 1) * chartData.barGap;
    const startX = (chartWidth - totalBarsWidth) / 2 + chartData.barGap;

    return (
        <View style={styles.container}>
            <Svg width={chartWidth} height={chartHeight + bottomPadding}>
                <Defs>
                    {weeklyTotals.map((_, index) => (
                        <LinearGradient
                            key={`trendGradient-${index}`}
                            id={`trendGradient-${index}`}
                            x1="0%"
                            y1="100%"
                            x2="0%"
                            y2="0%"
                        >
                            <Stop
                                offset="0%"
                                stopColor={colors.accent}
                                stopOpacity={chartData.opacities[index] * 0.8}
                            />
                            <Stop
                                offset="100%"
                                stopColor={colors.accent}
                                stopOpacity={chartData.opacities[index]}
                            />
                        </LinearGradient>
                    ))}
                </Defs>

                {/* Bars */}
                {weeklyTotals.map((value, index) => {
                    const barHeight = (value / chartData.maxValue) * (chartHeight - 10);
                    const x = startX + index * (chartData.barWidth + chartData.barGap);
                    const y = chartHeight - barHeight;
                    const cornerRadius = chartData.barWidth / 4;

                    return (
                        <G key={`trend-bar-${index}`}>
                            <Rect
                                x={x}
                                y={y}
                                width={chartData.barWidth}
                                height={Math.max(barHeight, 4)}
                                rx={cornerRadius}
                                ry={cornerRadius}
                                fill={`url(#trendGradient-${index})`}
                            />
                            {/* Value label on top of bar */}
                            <SvgText
                                x={x + chartData.barWidth / 2}
                                y={y - 6}
                                fill={colors.textSecondary}
                                fontSize={9}
                                textAnchor="middle"
                            >
                                {formatTime(value)}
                            </SvgText>
                            {/* X-axis label */}
                            <SvgText
                                x={x + chartData.barWidth / 2}
                                y={chartHeight + 16}
                                fill={colors.textMuted}
                                fontSize={9}
                                textAnchor="middle"
                            >
                                {labels[index] ?? `W${index + 1}`}
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
});
