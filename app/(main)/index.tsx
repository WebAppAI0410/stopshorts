import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    ShieldIcon,
    ProgressBar,
    ProgressCard,
    Button,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useStatisticsStore } from '../../src/stores/useStatisticsStore';
import { useScreenTimeData } from '../../src/hooks/useScreenTimeData';
import { useAppStore } from '../../src/stores/useAppStore';
import { TRAINING_TOPICS } from '../../src/data/trainingTopics';
import { t } from '../../src/i18n';

export default function DashboardScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    // Consolidated: use only useStatisticsStore for intervention/urge surfing stats
    const { getTodayStats, lifetime, getNewBadges } = useStatisticsStore();

    // Get real screen time data from Android native module
    const { todayData, loading: screenTimeLoading, isMockData } = useScreenTimeData();

    // Get training progress data
    const completedTopicIds = useAppStore((state) => state.getCompletedTopicIds());
    const totalTopics = TRAINING_TOPICS.length;
    const completedTopicsCount = completedTopicIds.length;
    const trainingProgress = totalTopics > 0 ? (completedTopicsCount / totalTopics) * 100 : 0;

    // Get statistics from intervention store
    const todayStatsNew = getTodayStats();
    const newBadges = getNewBadges();

    // Check if we have real data (Android: from native module when data is fetched)
    // isMockData=false means real data from Android, even if totalMinutes is 0
    const hasRealScreenTimeData = !isMockData && todayData !== null;
    const hasRealData = hasRealScreenTimeData || todayStatsNew.urgeSurfing.completed > 0;

    // Get today's statistics
    // Android: Use real usage data from native module
    // iOS: Show 0 (real screen time not available without Family Controls entitlement)
    const todayUsageMinutes = hasRealScreenTimeData
        ? (todayData?.totalMinutes ?? 0)
        : 0;

    const todayStats = {
        interventionCount: todayStatsNew.interventions.triggered,
        // Show actual usage time from Android, not "saved" time
        totalUsageMinutes: todayUsageMinutes,
        // Total saved time from urge surfing
        totalSavedMinutes: Math.round(lifetime.totalSavedHours * 60),
        urgeSurfingCompleted: todayStatsNew.urgeSurfing.completed,
    };

    const handleStartPractice = () => {
        router.push('/(main)/intervention-practice');
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

                {/* Demo/Mock Mode Banner */}
                {(isMockData || !hasRealData) && (
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
                                {isMockData ? t('home.mockDataMode') : t('home.demoMode')}
                            </Text>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                                {isMockData ? t('home.mockDataDescription') : t('home.demoModeDescription')}
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

                    {/* Today's Usage (Android: real data) */}
                    <View style={styles.statRow}>
                        <View style={styles.statLabel}>
                            <Ionicons name="phone-portrait-outline" size={18} color={colors.accent} />
                            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                {t('home.stats.todayUsage')}
                            </Text>
                        </View>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                            {screenTimeLoading ? '...' : `${todayStats.totalUsageMinutes} ${t('home.units.minutes')}`}
                        </Text>
                    </View>
                    <ProgressBar progress={Math.min(todayStats.totalUsageMinutes, 100)} variant="primary" />

                    {/* Today's Interventions */}
                    <View style={[styles.statRow, { marginTop: spacing.md }]}>
                        <View style={styles.statLabel}>
                            <Ionicons name="hand-left-outline" size={18} color={colors.accent} />
                            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                {t('home.stats.interventionCount')}
                            </Text>
                        </View>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                            {todayStats.interventionCount} {t('home.units.times')}
                        </Text>
                    </View>
                    <ProgressBar progress={Math.min(todayStats.interventionCount * 20, 100)} variant="secondary" />
                </Animated.View>

                {/* Progress Card (Replacement for StreakIndicator) */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={{ marginTop: spacing.lg }}>
                    <ProgressCard
                        onPress={() => router.push('/(main)/statistics')}
                    />
                </Animated.View>

                {/* Training Progress Card */}
                <Animated.View entering={FadeInDown.duration(600).delay(250)}>
                    <Pressable
                        onPress={() => router.push('/(main)/training')}
                        style={[
                            styles.trainingCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.accent + '40',
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <View style={styles.trainingCardContent}>
                            <View style={[styles.trainingIcon, { backgroundColor: colors.accent + '20' }]}>
                                <Ionicons name="school-outline" size={28} color={colors.accent} />
                            </View>
                            <View style={styles.trainingInfo}>
                                <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                    {t('home.training.title')}
                                </Text>
                                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                                    {t('home.training.progress', { completed: completedTopicsCount, total: totalTopics })} {t('home.training.completed')}
                                </Text>
                            </View>
                            <View style={styles.trainingArrow}>
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </View>
                        </View>
                        {trainingProgress > 0 && (
                            <View style={[styles.trainingProgressBar, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
                                <View
                                    style={[
                                        styles.trainingProgressFill,
                                        {
                                            backgroundColor: colors.accent,
                                            width: `${trainingProgress}%`,
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Pressable>
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
                            <Text style={{ fontSize: 32 }}>🛡️</Text>
                        </View>
                        <View style={styles.surfingInfo}>
                            <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                {t('home.practice.title')}
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                                {t('home.practice.description')}
                            </Text>
                        </View>
                    </View>
                    <Button
                        title={t('home.practice.button')}
                        onPress={handleStartPractice}
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
                            🎉 {t('home.badges.newBadge')}
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
    trainingCard: {
        padding: 16,
    },
    trainingCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trainingIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trainingInfo: {
        flex: 1,
        marginLeft: 16,
    },
    trainingArrow: {
        marginLeft: 8,
    },
    trainingProgressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    trainingProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
