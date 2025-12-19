import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatCard, WeeklyBarChart } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';

export default function StatisticsScreen() {
    const { colors, typography, spacing } = useTheme();
    const { stats } = useAppStore();

    // Calculate weekly stats
    const getWeeklyData = () => {
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayStats = stats.find(s => s.date === dateString);

            weekData.push({
                day: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()],
                value: dayStats?.totalBlockedMinutes || Math.floor(Math.random() * 180 + 60),
            });
        }

        return weekData;
    };

    const weeklyData = getWeeklyData();
    const totalWeekMinutes = weeklyData.reduce((sum, day) => sum + day.value, 0);
    const hours = Math.floor(totalWeekMinutes / 60);
    const minutes = totalWeekMinutes % 60;

    // Get current day for highlighting
    const today = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

    // Streak calculation (placeholder)
    const streakDays = 28;
    const totalInterventions = stats.reduce((sum, s) => sum + s.interventionCount, 0) || 42;

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
                        StopShorts
                    </Text>
                </Animated.View>

                {/* Hero Stat */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.heroSection}>
                    <View style={styles.heroRow}>
                        <Text style={[typography.hero, { color: colors.textPrimary }]}>
                            {hours}h {minutes}m
                        </Text>
                        <View style={[styles.clockIcon, { borderColor: colors.accent }]}>
                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                        </View>
                    </View>
                    <Text style={[typography.body, { color: colors.textSecondary }]}>
                        Saved this week
                    </Text>
                </Animated.View>

                {/* Weekly Bar Chart */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <WeeklyBarChart data={weeklyData} highlightDay={today} />
                </Animated.View>

                {/* Stats Cards */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(300)}
                    style={[styles.cardsRow, { marginTop: spacing.lg }]}
                >
                    <StatCard
                        icon="flame-outline"
                        iconColor={colors.streak}
                        title="Streak"
                        value={streakDays}
                        unit="Days"
                        subtitle="Keep the momentum!"
                        progressColor="#8B5CF6"
                    />
                    <View style={{ width: spacing.md }} />
                    <StatCard
                        icon="shield-checkmark-outline"
                        iconColor={colors.accent}
                        title="Interventions"
                        value={totalInterventions}
                        unit="Times"
                        subtitle="Mindful pauses taken."
                        progressColor={colors.accent}
                    />
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
    heroSection: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    clockIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
    },
});
