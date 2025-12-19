import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, RadialGradient } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface ShieldIconProps {
    size?: 'small' | 'medium' | 'large' | 'xl';
    glowing?: boolean;
    status?: 'protected' | 'warning' | 'inactive';
}

const sizeMap = {
    small: 48,
    medium: 80,
    large: 120,
    xl: 160,
};

export function ShieldIcon({ size = 'medium', glowing = true, status = 'protected' }: ShieldIconProps) {
    const { colors } = useTheme();
    const iconSize = sizeMap[size];
    const glowScale = useSharedValue(1);

    React.useEffect(() => {
        if (glowing) {
            glowScale.value = withRepeat(
                withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        }
    }, [glowing, glowScale]);

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: 0.6,
    }));

    const statusColors = {
        protected: { start: '#10B981', end: '#14B8A6' },
        warning: { start: '#F97316', end: '#EAB308' },
        inactive: { start: '#6E7681', end: '#8B949E' },
    };

    const currentColors = statusColors[status];

    return (
        <View style={[styles.container, { width: iconSize * 1.5, height: iconSize * 1.5 }]}>
            {glowing && (
                <Animated.View style={[styles.glowContainer, glowStyle]}>
                    <View
                        style={[
                            styles.glow,
                            {
                                width: iconSize * 1.3,
                                height: iconSize * 1.3,
                                backgroundColor: colors.shieldGlow,
                                borderRadius: iconSize * 0.65,
                            },
                        ]}
                    />
                </Animated.View>
            )}
            <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
                <Defs>
                    <LinearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={currentColors.start} stopOpacity="1" />
                        <Stop offset="100%" stopColor={currentColors.end} stopOpacity="1" />
                    </LinearGradient>
                    <RadialGradient id="shieldInner" cx="50%" cy="30%" r="60%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Path
                    d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
                    fill="url(#shieldGradient)"
                />
                <Path
                    d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
                    fill="url(#shieldInner)"
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
    },
});
