import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';

export default function ProfileScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { purpose, stats, subscriptionPlan } = useAppStore();

    const totalInterventions = stats.reduce((sum, s) => sum + s.interventionCount, 0);
    const totalMinutesSaved = stats.reduce((sum, s) => sum + s.totalBlockedMinutes, 0);

    const purposeLabels: Record<string, string> = {
        sleep: 'Better Sleep',
        study: 'Focus on Study',
        work: 'Work Productivity',
        creative: 'Creative Time',
        mental: 'Mental Health',
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                    <Text style={[typography.h2, { color: colors.textSecondary }]}>
                        Profile
                    </Text>
                </Animated.View>

                {/* Avatar Section */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.avatarSection}>
                    <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                        <Ionicons name="person" size={48} color={colors.textInverse} />
                    </View>
                    <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>
                        User
                    </Text>
                    <View style={[styles.badge, { backgroundColor: colors.surface, borderRadius: borderRadius.full }]}>
                        <Text style={[typography.caption, { color: colors.accent }]}>
                            {subscriptionPlan === 'free' ? 'Free Plan' : 'Premium'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Stats Summary */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(200)}
                    style={[
                        styles.statsCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }
                    ]}
                >
                    <View style={styles.statItem}>
                        <Text style={[typography.statLarge, { color: colors.textPrimary }]}>
                            {totalInterventions}
                        </Text>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                            Total Interventions
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[typography.statLarge, { color: colors.textPrimary }]}>
                            {Math.floor(totalMinutesSaved / 60)}h
                        </Text>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                            Time Saved
                        </Text>
                    </View>
                </Animated.View>

                {/* Goal */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(300)}
                    style={[
                        styles.goalCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginTop: spacing.lg,
                        }
                    ]}
                >
                    <View style={styles.goalHeader}>
                        <Ionicons name="flag-outline" size={20} color={colors.accent} />
                        <Text style={[typography.label, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                            Your Goal
                        </Text>
                    </View>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.sm }]}>
                        {purposeLabels[purpose || 'sleep'] || 'Set your goal'}
                    </Text>
                </Animated.View>

                {/* Achievements Preview */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(400)}
                    style={[
                        styles.achievementsCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginTop: spacing.lg,
                        }
                    ]}
                >
                    <View style={styles.achievementsHeader}>
                        <View style={styles.titleRow}>
                            <Ionicons name="trophy-outline" size={20} color={colors.warning} />
                            <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                                Achievements
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </View>
                    <View style={styles.badgesRow}>
                        {['🛡️', '🔥', '⭐'].map((emoji, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.achievementBadge,
                                    { backgroundColor: colors.surface, borderRadius: borderRadius.lg }
                                ]}
                            >
                                <Text style={{ fontSize: 24 }}>{emoji}</Text>
                            </View>
                        ))}
                        <View
                            style={[
                                styles.achievementBadge,
                                { backgroundColor: colors.surface, borderRadius: borderRadius.lg }
                            ]}
                        >
                            <Text style={[typography.body, { color: colors.textMuted }]}>+3</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginTop: 8,
    },
    statsCard: {
        flexDirection: 'row',
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: '100%',
    },
    goalCard: {
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementsCard: {
        padding: 16,
    },
    achievementsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    achievementBadge: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
