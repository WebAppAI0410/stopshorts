import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StreakIndicatorProps {
    streakDays: number;
    completedDays: boolean[]; // Array of 7 booleans for M-S
    onPress?: () => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakIndicator({ streakDays, completedDays, onPress }: StreakIndicatorProps) {
    const { colors, typography, spacing, borderRadius } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.xl, borderColor: colors.border, borderWidth: 1 }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={{ fontSize: 18, marginRight: 6 }}>🔥</Text>
                    <View>
                        <Text style={[typography.h3, { color: colors.textPrimary }]}>
                            {streakDays}日連続
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                            アプリ利用継続中
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>

            <View style={styles.daysContainer}>
                {DAY_LABELS.map((day, index) => {
                    const isCompleted = completedDays[index];
                    const isToday = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6);

                    return (
                        <View key={index} style={styles.dayItem}>
                            <View
                                style={[
                                    styles.dayPill,
                                    {
                                        borderRadius: borderRadius.lg,
                                        borderWidth: isToday ? 2 : 1,
                                        borderColor: isCompleted ? colors.accent : colors.border,
                                    },
                                ]}
                            >
                                {isCompleted ? (
                                    <Svg width="100%" height="100%">
                                        <Defs>
                                            <LinearGradient id={`dayGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                <Stop offset="0%" stopColor="#10B981" />
                                                <Stop offset="100%" stopColor="#14B8A6" />
                                            </LinearGradient>
                                        </Defs>
                                        <Rect
                                            x="0"
                                            y="0"
                                            width="100%"
                                            height="100%"
                                            rx={12}
                                            fill={`url(#dayGradient-${index})`}
                                        />
                                    </Svg>
                                ) : (
                                    <View style={[styles.emptyPill, { backgroundColor: colors.surface }]} />
                                )}
                            </View>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                                {day}
                            </Text>
                            {isCompleted && index === 0 && (
                                <Ionicons
                                    name="checkmark"
                                    size={12}
                                    color={colors.textPrimary}
                                    style={styles.checkmark}
                                />
                            )}
                        </View>
                    );
                })}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
        position: 'relative',
    },
    dayPill: {
        width: 36,
        height: 56,
        overflow: 'hidden',
    },
    emptyPill: {
        flex: 1,
        borderRadius: 12,
    },
    checkmark: {
        position: 'absolute',
        bottom: 30,
    },
});
