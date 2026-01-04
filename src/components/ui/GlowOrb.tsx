import React, { useEffect } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

type GlowOrbProps = {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: 'medium' | 'large' | 'xl';
    color: 'primary' | 'accent';
    intensity?: number;
    testID?: string;
};

export const GlowOrb: React.FC<GlowOrbProps> = ({
    position,
    size,
    color,
    intensity = 0.15,
    testID,
}) => {
    const { colors } = useTheme();
    const pulse = useSharedValue(0);

    useEffect(() => {
        pulse.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
    }, [pulse]);

    const sizeValue = {
        medium: 200,
        large: 350,
        xl: 500,
    }[size];

    const orbColor = color === 'primary' ? colors.primary : colors.accent;

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(pulse.value, [0, 1], [1, 1.1]);
        const opacity = interpolate(pulse.value, [0, 1], [intensity, intensity * 1.3]);

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    const positionStyles = {
        'top-left': { top: -sizeValue / 2, left: -sizeValue / 2 },
        'top-right': { top: -sizeValue / 2, right: -sizeValue / 2 },
        'bottom-left': { bottom: -sizeValue / 2, left: -sizeValue / 2 },
        'bottom-right': { bottom: -sizeValue / 2, right: -sizeValue / 2 },
    }[position];

    return (
        <View
            testID={testID}
            pointerEvents="none"
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            style={[
                {
                    position: 'absolute',
                    width: sizeValue,
                    height: sizeValue,
                    borderRadius: sizeValue / 2,
                    overflow: 'hidden',
                },
                positionStyles,
            ]}
        >
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                <LinearGradient
                    colors={[orbColor, 'transparent']}
                    style={{ flex: 1 }}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
        </View>
    );
};
