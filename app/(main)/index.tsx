import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    ShieldIcon,
    ProgressBar,
    StreakIndicator,
    Button,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { useStatisticsStore } from '../../src/stores/useStatisticsStore';
import { t } from '../../src/i18n';

export default function DashboardScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { stats } = useAppStore();
    const { getTodayStats, getStreak, lifetime, getNewBadges } = useStatisticsStore();

    // Get statistics from new store
    const todayStatsNew = getTodayStats();
    const currentStreak = getStreak();
    const newBadges = getNewBadges();

    // Check if we have real data
    const hasRealData = stats.length > 0 || todayStatsNew.urgeSurfing.completed > 0;

    // Get today's statistics (merge old and new)
    const todayDate = new Date().toISOString().split('T')[0];
    const todayStatsOld = stats.find(s => s.date === todayDate) || {
        interventionCount: 0,
        totalBlockedMinutes: 0
    };

    // Use new store data if available, otherwise fall back to old
    const todayStats = {
        interventionCount: todayStatsNew.interventions.triggered || todayStatsOld.interventionCount,
        totalBlockedMinutes: Math.round(lifetime.totalSavedHours * 60) || todayStatsOld.totalBlockedMinutes,
        urgeSurfingCompleted: todayStatsNew.urgeSurfing.completed,
    };

    // Calculate streak from new store
    const streakDays = currentStreak || 7;

    // Generate completed days for streak indicator
    const completedDays = Array.from({ length: 7 }, (_, i) => {
        if (currentStreak > 0) {
            return i < Math.min(currentStreak, 7);
        }
        // Demo data if no streak
        return i < 4;
    });

    const handleStartSurfing = () => {
        router.push('/(main)/urge-surfing');
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
                    <View>
                        <Text style={[typography.h1, { color: colors.textPrimary }]}>
                            {t('home.greeting')}
                        </Text>
                        <Text style={[typography.h1, { color: colors.textPrimary }]}>
                            {t('home.user')}
                        </Text>
                    </View>
                    <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                        <Ionicons name="person" size={20} color={colors.textInverse} />
                    </View>
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
                                {t('home.demoMode')}
                            </Text>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                                {t('home.demoModeDescription')}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Main Status Card */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(100)}
                    style={[
                        styles.statusCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius['2xl'],
                            borderWidth: 1,
                            borderColor: colors.border,
                        }
                    ]}
                >
                    {/* Glow effect background */}
                    <View style={[styles.glowBackground, { backgroundColor: colors.cardGlow }]} />

                    <ShieldIcon size="large" glowing={true} status="protected" />

                    <View style={styles.statusRow}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                        <Text style={[typography.h2, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                            {t('home.protected')}
                        </Text>
                    </View>

                    {/* Today's Interventions */}
                    <View style={styles.statRow}>
                        <View style={styles.statLabel}>
                            <Ionicons name="hand-left-outline" size={18} color={colors.accent} />
                            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                {t('home.stats.todayInterventions')}: {todayStats.interventionCount}
                            </Text>
                        </View>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                            {todayStats.interventionCount}
                        </Text>
                    </View>
                    <ProgressBar progress={Math.min(todayStats.interventionCount * 20, 100)} variant="primary" />

                    {/* Time Recovered */}
                    <View style={[styles.statRow, { marginTop: spacing.md }]}>
                        <View style={styles.statLabel}>
                            <Ionicons name="time-outline" size={18} color={colors.accent} />
                            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                {t('home.stats.timeSaved')}: {todayStats.totalBlockedMinutes} min
                            </Text>
                        </View>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                            {todayStats.totalBlockedMinutes} min
                        </Text>
                    </View>
                    <ProgressBar progress={Math.min(todayStats.totalBlockedMinutes * 2, 100)} variant="secondary" />
                </Animated.View>

                {/* Streak Indicator */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={{ marginTop: spacing.lg }}>
                    <StreakIndicator streakDays={streakDays} completedDays={completedDays} />
                </Animated.View>

                {/* Urge Surfing Card */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(300)}
                    style={[
                        styles.surfingCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.primary + '40',
                            marginTop: spacing.lg,
                        }
                    ]}
                >
                    <View style={styles.surfingCardContent}>
                        <View style={[styles.surfingIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={{ fontSize: 32 }}>🌊</Text>
                        </View>
                        <View style={styles.surfingInfo}>
                            <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                衝動サーフィング
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                                今日 {todayStats.urgeSurfingCompleted} 回完了
                            </Text>
                        </View>
                    </View>
                    <Button
                        title="練習する"
                        onPress={handleStartSurfing}
                        variant="outline"
                        size="sm"
                        style={{ marginTop: spacing.md }}
                    />
                </Animated.View>

                {/* New Badges */}
                {newBadges.length > 0 && (
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(350)}
                        style={[
                            styles.badgeCard,
                            {
                                backgroundColor: colors.warning + '15',
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.warning + '40',
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <Text style={[typography.label, { color: colors.warning }]}>
                            🎉 新しいバッジを獲得！
                        </Text>
                        <View style={styles.badgeRow}>
                            {newBadges.map((badge) => (
                                <View key={badge.id} style={styles.badgeItem}>
                                    <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                                    <Text style={[typography.caption, { color: colors.textPrimary, marginTop: 4 }]}>
                                        {badge.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Daily Tip Card */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(400)}
                    style={[
                        styles.tipCard,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginTop: spacing.lg,
                        }
                    ]}
                >
                    <View style={[styles.tipIcon, { backgroundColor: colors.accent }]}>
                        <Ionicons name="bulb" size={24} color={colors.textInverse} />
                    </View>
                    <View style={styles.tipContent}>
                        <Text style={[typography.h3, { color: colors.textPrimary }]}>
                            {t('home.dailyTip')}
                        </Text>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                            {t('home.dailyTipMessage')}
                        </Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
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
    statusCard: {
        padding: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    glowBackground: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 8,
    },
    statLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipCard: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    tipIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipContent: {
        flex: 1,
        marginLeft: 16,
    },
    surfingCard: {
        padding: 16,
    },
    surfingCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    surfingIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    surfingInfo: {
        flex: 1,
        marginLeft: 16,
    },
    badgeCard: {
        padding: 16,
        alignItems: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 24,
    },
    badgeItem: {
        alignItems: 'center',
    },
});
