import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export type SelectionCardProps = {
    title: string;
    subtitle?: string;
    selected: boolean;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    imageSource?: ImageSourcePropType; // Static asset or require() for app icons
    imageUri?: string; // Base64 image URI for dynamic app icons (custom apps)
    compact?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SelectionCard: React.FC<SelectionCardProps> = ({
    title,
    subtitle,
    selected,
    onPress,
    icon,
    imageSource,
    imageUri,
    compact = false,
}) => {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.accentMuted : colors.backgroundCard,
        borderWidth: selected ? 2 : 1.5,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={[
                styles.container,
                {
                    padding: compact ? spacing.sm : spacing.md,
                    borderRadius: borderRadius.lg,
                    marginBottom: compact ? spacing.sm : spacing.md,
                },
                animatedStyle,
            ]}
        >
            <View style={styles.content}>
                {(icon || imageSource || imageUri) && (
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                marginRight: spacing.md,
                                backgroundColor: selected ? colors.accent : colors.surface,
                                overflow: 'hidden',
                            },
                        ]}
                    >
                        {imageSource ? (
                            <Image
                                source={imageSource}
                                style={{ width: 36, height: 36, borderRadius: 8 }}
                            />
                        ) : imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: 36, height: 36, borderRadius: 8 }}
                            />
                        ) : icon ? (
                            <Ionicons
                                name={icon}
                                size={24}
                                color={selected ? '#FFFFFF' : colors.textSecondary}
                            />
                        ) : null}
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text
                        style={[
                            typography.h3,
                            { color: selected ? colors.textPrimary : colors.textPrimary, fontSize: 18 },
                        ]}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text
                            style={[
                                typography.bodySmall,
                                { color: colors.textSecondary, marginTop: 2 },
                            ]}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
                <View
                    style={[
                        styles.checkbox,
                        {
                            borderColor: selected ? colors.accent : colors.border,
                            backgroundColor: selected ? colors.accent : 'transparent',
                        },
                    ]}
                >
                    {selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1.5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
