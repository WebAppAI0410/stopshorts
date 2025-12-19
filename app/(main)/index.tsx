import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    ShieldIcon,
    ProgressBar,
    StreakIndicator,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

export default function DashboardScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { stats } = useAppStore();

    // Get today's statistics
    const todayDate = new Date().toISOString().split('T')[0];
    const todayStats = stats.find(s => s.date === todayDate) || {
        interventionCount: 0,
        totalBlockedMinutes: 0
    };

    // Calculate streak (simplified - counts consecutive days with interventions)
    const streakDays = 7; // Placeholder
    const completedDays = [true, true, true, true, false, false, false]; // Placeholder

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
                            User!
                        </Text>
                    </View>
                    <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                        <Ionicons name="person" size={20} color={colors.textInverse} />
                    </View>
                </Animated.View>

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
                            Protected
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

                {/* Daily Tip Card */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(300)}
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
                            Daily Tip
                        </Text>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                            Try setting a dedicated time for focused work without distractions today.
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
});
