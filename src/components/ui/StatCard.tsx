import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    value: number;
    unit: string;
    subtitle: string;
    progressColor?: string;
}

export function StatCard({
    icon,
    iconColor,
    title,
    value,
    unit,
    subtitle,
    progressColor,
}: StatCardProps) {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const displayIconColor = iconColor || colors.accent;
    const displayProgressColor = progressColor || colors.accent;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.backgroundCard,
                    borderRadius: borderRadius.xl,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
            ]}
        >
            <View style={styles.header}>
                <Ionicons name={icon} size={18} color={displayIconColor} />
                <Text style={[typography.label, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                    {title}
                </Text>
            </View>

            <View style={styles.valueRow}>
                <Text style={[typography.statLarge, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                    {unit}
                </Text>
            </View>

            <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.xs }]}>
                {subtitle}
            </Text>

            <View style={[styles.progressBar, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            backgroundColor: displayProgressColor,
                            width: '70%',
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
