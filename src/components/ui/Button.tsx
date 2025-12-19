import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonProps = {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = true,
    style,
}) => {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    // Variant styles
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: colors.primary,
                    borderWidth: 0,
                };
            case 'secondary':
                return {
                    backgroundColor: colors.surface,
                    borderWidth: 0,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
            default:
                return {};
        }
    };

    // Text styles based on variant
    const getTextStyle = (): TextStyle => {
        const base: TextStyle = {
            ...typography.button,
        };

        switch (variant) {
            case 'primary':
                return { ...base, color: '#FFFFFF' };
            case 'secondary':
                return { ...base, color: colors.textPrimary };
            case 'outline':
            case 'ghost':
                return { ...base, color: colors.primary };
            default:
                return base;
        }
    };

    // Size styles
    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'sm':
                return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
            case 'md':
                return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
            case 'lg':
                return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
            default:
                return {};
        }
    };

    return (
        <AnimatedTouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                {
                    borderRadius: borderRadius.xl,
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: fullWidth ? 'stretch' : 'center',
                    opacity: disabled ? 0.5 : 1,
                },
                getVariantStyles(),
                getSizeStyles(),
                style,
                animatedStyle,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </AnimatedTouchableOpacity>
    );
};
