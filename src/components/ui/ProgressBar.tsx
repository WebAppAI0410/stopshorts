import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressBarProps {
    progress: number; // 0-100
    height?: number;
    variant?: 'primary' | 'secondary' | 'accent';
    animated?: boolean;
}

export function ProgressBar({
    progress,
    height = 8,
    variant = 'primary',
    animated = true,
}: ProgressBarProps) {
    const { colors, borderRadius } = useTheme();
    const clampedProgress = Math.min(100, Math.max(0, progress));

    const gradientColors = {
        primary: { start: '#10B981', end: '#14B8A6' },
        secondary: { start: '#14B8A6', end: '#8B5CF6' },
        accent: { start: '#34D399', end: '#10B981' },
    };

    const currentGradient = gradientColors[variant];

    const animatedWidth = useAnimatedStyle(() => ({
        width: animated
            ? withTiming(`${clampedProgress}%`, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            })
            : `${clampedProgress}%`,
    }));

    return (
        <View
            style={[
                styles.container,
                {
                    height,
                    backgroundColor: colors.surface,
                    borderRadius: height / 2,
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.fill,
                    {
                        height,
                        borderRadius: height / 2,
                    },
                    animatedWidth,
                ]}
            >
                <Svg width="100%" height={height}>
                    <Defs>
                        <LinearGradient id={`progressGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={currentGradient.start} />
                            <Stop offset="100%" stopColor={currentGradient.end} />
                        </LinearGradient>
                    </Defs>
                    <Rect
                        x="0"
                        y="0"
                        width="100%"
                        height={height}
                        rx={height / 2}
                        fill={`url(#progressGradient-${variant})`}
                    />
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        overflow: 'hidden',
    },
});
