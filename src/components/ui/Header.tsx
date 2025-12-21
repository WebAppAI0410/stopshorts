import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type HeaderProps = {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
    variant?: 'default' | 'ghost';
};

export const Header: React.FC<HeaderProps> = ({
    title,
    showBack = true,
    onBack,
    rightElement,
    variant = 'default',
}) => {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingHorizontal: spacing.gutter,
                    marginTop: spacing.md,
                    backgroundColor: variant === 'ghost' ? 'transparent' : colors.background,
                },
            ]}
        >
            <View style={styles.left}>
                {showBack && (
                    <TouchableOpacity
                        onPress={() => (onBack ? onBack() : router.back())}
                        style={[
                            styles.backButton,
                            {
                                backgroundColor: colors.surface,
                                borderRadius: 12,
                            },
                        ]}
                    >
                        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.center}>
                {title && (
                    <Text style={[typography.h3, { color: colors.textPrimary }]}>{title}</Text>
                )}
            </View>

            <View style={styles.right}>{rightElement}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    left: {
        flex: 1,
        alignItems: 'flex-start',
    },
    center: {
        flex: 2,
        alignItems: 'center',
    },
    right: {
        flex: 1,
        alignItems: 'flex-end',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
