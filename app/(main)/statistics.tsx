import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatCard } from '../../src/components/ui';
import {
    TabSelector,
    ComparisonHero,
    DailyComparisonChart,
    WeeklyComparisonChart,
    TrendChart,
} from '../../src/components/statistics';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useStatisticsStore } from '../../src/stores/useStatisticsStore';
import { useScreenTimeData } from '../../src/hooks/useScreenTimeData';
import { t } from '../../src/i18n';

export default function StatisticsScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const [selectedTab, setSelectedTab] = useState<'day' | 'week'>('day');

    const {
        getWeeklyStats,
        getStreak,
        lifetime,
        getEarnedBadges,
        getDailyComparison,
        getWeeklyComparison,
        getBaselineDailyMinutes,
    } = useStatisticsStore();

    const { isMockData } = useScreenTimeData();

    const weeklyStats = getWeeklyStats();
    const currentStreak = getStreak();
    const earnedBadges = getEarnedBadges();
    const dailyComparison = getDailyComparison();
    const weeklyComparison = getWeeklyComparison();
    const baselineDailyMinutes = getBaselineDailyMinutes();

    const hasRealScreenTimeData = !isMockData;
    const hasRealData = hasRealScreenTimeData || lifetime.totalUrgeSurfingCompleted > 0;

    // Calculate baseline reduction percentage
    const baselineReduction = useMemo(() => {
        if (!baselineDailyMinutes) return null;
        const currentAvg = selectedTab === 'day'
            ? dailyComparison.today.total
            : weeklyComparison.currentWeek.dailyAvg;
        if (baselineDailyMinutes === 0) return 0;
        return ((currentAvg - baselineDailyMinutes) / baselineDailyMinutes) * 100;
    }, [baselineDailyMinutes, selectedTab, dailyComparison, weeklyComparison]);

    // Prepare chart data
    const dailyChartData = useMemo(() => ({
        today: dailyComparison.today.byTimeOfDay,
        yesterday: dailyComparison.yesterday.byTimeOfDay,
    }), [dailyComparison]);

    const weeklyChartData = useMemo(() => ({
        currentWeek: weeklyComparison.currentWeek.data,
        previousWeek: weeklyComparison.previousWeek.data,
    }), [weeklyComparison]);

    // 4-week trend data (weekly totals)
    const trendData = useMemo(() => {
        // Get 4 weeks of data - for now use current week total repeated
        // In a real implementation, this would come from historical data
        const currentTotal = weeklyComparison.currentWeek.total;
        const previousTotal = weeklyComparison.previousWeek.total;
        return [
            Math.round(previousTotal * 1.2), // 4 weeks ago (estimate)
            Math.round(previousTotal * 1.1), // 3 weeks ago (estimate)
            previousTotal, // 2 weeks ago (last week)
            currentTotal,  // This week
        ];
    }, [weeklyComparison]);

    const streakDays = currentStreak || (hasRealData ? currentStreak : 28);
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
                        {t('statistics.title')}
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

                {/* Tab Selector */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <TabSelector
                        selectedTab={selectedTab}
                        onTabChange={setSelectedTab}
                    />
                </Animated.View>

                {/* Comparison Hero */}
                <Animated.View entering={FadeInDown.duration(600).delay(150)} style={{ marginTop: spacing.md }}>
                    <ComparisonHero
                        mode={selectedTab}
                        currentMinutes={selectedTab === 'day'
                            ? dailyComparison.today.total
                            : weeklyComparison.currentWeek.total}
                        previousMinutes={selectedTab === 'day'
                            ? dailyComparison.yesterday.total
                            : weeklyComparison.previousWeek.total}
                        changePercent={selectedTab === 'day'
                            ? dailyComparison.changePercent
                            : weeklyComparison.changePercent}
                        baselineReduction={baselineReduction}
                    />
                </Animated.View>

                {/* Comparison Chart */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(200)}
                    style={[
                        styles.chartCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginTop: spacing.lg,
                        }
                    ]}
                >
                    {selectedTab === 'day' ? (
                        <DailyComparisonChart
                            today={dailyChartData.today}
                            yesterday={dailyChartData.yesterday}
                            baselineDailyMinutes={baselineDailyMinutes ?? undefined}
                        />
                    ) : (
                        <WeeklyComparisonChart
                            currentWeek={weeklyChartData.currentWeek}
                            previousWeek={weeklyChartData.previousWeek}
                            baselineDailyMinutes={baselineDailyMinutes ?? undefined}
                        />
                    )}
                </Animated.View>

                {/* 4-Week Trend (Week tab only) */}
                {selectedTab === 'week' && (
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(250)}
                        style={[
                            styles.trendCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.border,
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                            {t('statistics.trendTitle')}
                        </Text>
                        <TrendChart weeklyTotals={trendData} />
                    </Animated.View>
                )}

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
                        progressColor={colors.streak}
                    />
                    <View style={{ width: spacing.md }} />
                    <StatCard
                        icon="water-outline"
                        iconColor={colors.primary}
                        title={t('statistics.surfing')}
                        value={totalUrgeSurfing}
                        unit={t('statistics.times')}
                        subtitle={t('statistics.successRate', { percent: Math.round(successRate * 100) })}
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
                        {t('statistics.earnedBadges')}
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
                                {t('statistics.noBadgesYet')}
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
                            {t('statistics.surfingStats')}
                        </Text>
                        <View style={styles.surfingStatsRow}>
                            <View style={styles.surfingStat}>
                                <Text style={[typography.statLarge, { color: colors.primary }]}>
                                    {lifetime.totalUrgeSurfingCompleted}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    {t('statistics.completedCount')}
                                </Text>
                            </View>
                            <View style={styles.surfingStat}>
                                <Text style={[typography.statLarge, { color: colors.accent }]}>
                                    {Math.round(lifetime.totalSavedHours * 10) / 10}h
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    {t('statistics.savedTime')}
                                </Text>
                            </View>
                            <View style={styles.surfingStat}>
                                <Text style={[typography.statLarge, { color: colors.streak }]}>
                                    {lifetime.longestStreak}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    {t('statistics.longestStreak')}
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
    chartCard: {
        padding: 16,
    },
    trendCard: {
        padding: 16,
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
