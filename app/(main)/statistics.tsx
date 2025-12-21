import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatCard, WeeklyBarChart } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { useStatisticsStore } from '../../src/stores/useStatisticsStore';
import { useScreenTimeData } from '../../src/hooks/useScreenTimeData';
import { t } from '../../src/i18n';

// Fixed demo data to prevent re-renders from changing values (iOS fallback)
const DEMO_WEEKLY_DATA = [120, 95, 140, 80, 110, 150, 130];

export default function StatisticsScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { stats } = useAppStore();
    const {
        getWeeklyStats,
        getStreak,
        lifetime,
        getEarnedBadges,
    } = useStatisticsStore();

    // Get real screen time data from Android native module
    const { weeklyData: nativeWeeklyData, loading: screenTimeLoading, isMockData } = useScreenTimeData();

    // Get data from intervention statistics store
    const weeklyStats = getWeeklyStats();
    const currentStreak = getStreak();
    const earnedBadges = getEarnedBadges();

    // Check if we have real data from Android
    // isMockData=false means real data from Android, even if weeklyTotal is 0
    const hasRealScreenTimeData = !isMockData && nativeWeeklyData !== null;
    const hasRealData = hasRealScreenTimeData || lifetime.totalUrgeSurfingCompleted > 0;

    // Calculate weekly stats with memoization
    // Android: Use real data from native module
    // iOS: Fall back to demo data
    const weeklyData = useMemo(() => {
        const today = new Date();
        const result = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];

            // Try to get data from Android native module first
            let dayMinutes = 0;
            if (hasRealScreenTimeData && nativeWeeklyData?.dailyBreakdown) {
                const nativeDay = nativeWeeklyData.dailyBreakdown.find(d => d.date === dateString);
                dayMinutes = nativeDay?.minutes || 0;
            } else {
                // Fall back to old stats or demo data
                const dayStats = stats.find(s => s.date === dateString);
                dayMinutes = dayStats?.totalBlockedMinutes || DEMO_WEEKLY_DATA[6 - i];
            }

            result.push({
                day: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()],
                value: dayMinutes,
            });
        }

        return result;
    }, [stats, hasRealScreenTimeData, nativeWeeklyData]);

    const totalWeekMinutes = hasRealScreenTimeData
        ? (nativeWeeklyData?.weeklyTotal || 0)
        : weeklyData.reduce((sum, day) => sum + day.value, 0);
    const hours = Math.floor(totalWeekMinutes / 60);
    const minutes = totalWeekMinutes % 60;

    // Get current day for highlighting
    const today = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

    // Streak and interventions - use new store data with demo fallback
    const streakDays = currentStreak || (hasRealData ? stats.length : 28);
    const totalInterventions = lifetime.totalInterventions || stats.reduce((sum, s) => sum + s.interventionCount, 0) || 42;
    const totalUrgeSurfing = lifetime.totalUrgeSurfingCompleted || 0;
    const successRate = weeklyStats.successRate || 0;

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
                        {screenTimeLoading ? (
                            <ActivityIndicator size="large" color={colors.accent} />
                        ) : (
                            <Text style={[typography.hero, { color: colors.textPrimary }]}>
                                {hours}h {minutes}m
                            </Text>
                        )}
                        <View style={[styles.clockIcon, { borderColor: colors.accent }]}>
                            <Ionicons name="phone-portrait" size={24} color={colors.accent} />
                        </View>
                    </View>
                    <Text style={[typography.body, { color: colors.textSecondary }]}>
                        {hasRealScreenTimeData ? '今週の使用時間' : t('statistics.savedThisWeek')}
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
                        icon="water-outline"
                        iconColor={colors.primary}
                        title="サーフィング"
                        value={totalUrgeSurfing}
                        unit="回"
                        subtitle={`成功率 ${Math.round(successRate * 100)}%`}
                        progressColor={colors.primary}
                    />
                </Animated.View>

                {/* Badges Section */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(400)}
                    style={[
                        styles.badgesCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginTop: spacing.lg,
                        }
                    ]}
                >
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        獲得バッジ
                    </Text>
                    {earnedBadges.length > 0 ? (
                        <View style={styles.badgesGrid}>
                            {earnedBadges.map((badge) => (
                                <View key={badge.id} style={styles.badgeItem}>
                                    <Text style={{ fontSize: 28 }}>{badge.icon}</Text>
                                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
                                        {badge.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyBadges}>
                            <Ionicons name="trophy-outline" size={32} color={colors.textMuted} />
                            <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
                                衝動サーフィングを完了してバッジを獲得しよう
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Urge Surfing Stats */}
                {totalUrgeSurfing > 0 && (
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(500)}
                        style={[
                            styles.surfingStatsCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.border,
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                            🌊 サーフィング統計
                        </Text>
                        <View style={styles.surfingStatsRow}>
                            <View style={styles.surfingStat}>
                                <Text style={[typography.statLarge, { color: colors.primary }]}>
                                    {lifetime.totalUrgeSurfingCompleted}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    完了回数
                                </Text>
                            </View>
                            <View style={styles.surfingStat}>
                                <Text style={[typography.statLarge, { color: colors.accent }]}>
                                    {Math.round(lifetime.totalSavedHours * 10) / 10}h
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    節約時間
                                </Text>
                            </View>
                            <View style={styles.surfingStat}>
                                <Text style={[typography.statLarge, { color: colors.streak }]}>
                                    {lifetime.longestStreak}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    最長連続
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
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
    badgesCard: {
        padding: 16,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    badgeItem: {
        width: 70,
        alignItems: 'center',
    },
    emptyBadges: {
        alignItems: 'center',
        padding: 24,
    },
    surfingStatsCard: {
        padding: 16,
    },
    surfingStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    surfingStat: {
        alignItems: 'center',
    },
});
