import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatCard, WeeklyBarChart } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

// Fixed demo data to prevent re-renders from changing values
const DEMO_WEEKLY_DATA = [120, 95, 140, 80, 110, 150, 130];

export default function StatisticsScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { stats } = useAppStore();

    // Check if we have real data
    const hasRealData = stats.length > 0;

    // Calculate weekly stats with memoization
    const weeklyData = useMemo(() => {
        const today = new Date();
        const result = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayStats = stats.find(s => s.date === dateString);

            result.push({
                day: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()],
                value: dayStats?.totalBlockedMinutes || DEMO_WEEKLY_DATA[6 - i],
            });
        }

        return result;
    }, [stats]);

    const totalWeekMinutes = weeklyData.reduce((sum, day) => sum + day.value, 0);
    const hours = Math.floor(totalWeekMinutes / 60);
    const minutes = totalWeekMinutes % 60;

    // Get current day for highlighting
    const today = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

    // Streak and interventions - use demo values if no real data
    const streakDays = hasRealData ? stats.length : 28;
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

                {/* Demo Mode Banner */}
                {!hasRealData && (
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(50)}
                        style={[
                            styles.demoBanner,
                            {
                                backgroundColor: colors.warning + '20',
                                borderRadius: borderRadius.lg,
                                borderWidth: 1,
                                borderColor: colors.warning + '40',
                            }
                        ]}
                    >
                        <View style={styles.demoIconContainer}>
                            <Ionicons name="flask-outline" size={18} color={colors.warning} />
                        </View>
                        <View style={styles.demoTextContainer}>
                            <Text style={[typography.label, { color: colors.warning }]}>
                                {t('statistics.demoMode')}
                            </Text>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                                {t('statistics.demoModeDescription')}
                            </Text>
                        </View>
                    </Animated.View>
                )}

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
                        {t('statistics.savedThisWeek')}
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
                        title={t('statistics.streak')}
                        value={streakDays}
                        unit={t('statistics.days')}
                        subtitle={t('statistics.keepMomentum')}
                        progressColor="#8B5CF6"
                    />
                    <View style={{ width: spacing.md }} />
                    <StatCard
                        icon="shield-checkmark-outline"
                        iconColor={colors.accent}
                        title={t('statistics.interventions')}
                        value={totalInterventions}
                        unit={t('statistics.times')}
                        subtitle={t('statistics.mindfulPauses')}
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
    demoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 16,
    },
    demoIconContainer: {
        marginRight: 12,
    },
    demoTextContainer: {
        flex: 1,
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
