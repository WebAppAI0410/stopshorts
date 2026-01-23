/**
 * Reality Check Screen
 * Shows user's actual screen time usage and potential time savings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import {
  UsageBreakdownList,
  YearlyProjectionCard,
  AchievableSkillsSection,
} from '../../src/components/reality-check';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import {
  useRealityCheck,
  formatTime,
  calculateYearlyHours,
} from '../../src/hooks/useRealityCheck';
import { t } from '../../src/i18n';

export default function RealityCheckScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { setScreenTimeData: setStoredScreenTimeData, setBaselineMonthlyMinutes } = useAppStore();

  const {
    isLoading,
    error,
    screenTimeData,
    monthlyData,
    customAppUsage,
    fetchUsageData,
    openUsageStatsSettings,
  } = useRealityCheck();

  const handleContinue = () => {
    const customMonthlyTotal = customAppUsage.reduce((sum, app) => sum + app.monthlyMinutes, 0);
    const totalMonthlyMinutes = (monthlyData?.monthlyTotal || 0) + customMonthlyTotal;

    // Save baseline for future metrics comparison
    if (totalMonthlyMinutes > 0) {
      setBaselineMonthlyMinutes(totalMonthlyMinutes);
    }

    const yearlyHours = calculateYearlyHours(totalMonthlyMinutes);

    // Create impact with the exact same yearlyHours shown on screen
    if (yearlyHours > 0 && screenTimeData) {
      const totalDailyAverage = Math.round(totalMonthlyMinutes / 30);
      setStoredScreenTimeData({
        ...screenTimeData,
        dailyAverage: totalDailyAverage,
        lastUpdated: new Date().toISOString(),
      });

      const lifetimeLostYears = (yearlyHours * 50) / (24 * 365);
      const impact = {
        yearlyLostHours: yearlyHours,
        lifetimeLostYears: Math.round(lifetimeLostYears * 10) / 10,
        equivalents: {
          books: Math.round(yearlyHours / 6),
          movies: Math.round(yearlyHours / 2),
          skills: yearlyHours >= 500 ? ['資格取得'] :
                  yearlyHours >= 300 ? ['プログラミング入門'] :
                  yearlyHours >= 200 ? ['楽器の初級レベル'] :
                  yearlyHours >= 100 ? ['新しい言語の基礎'] : ['新しいスキルの習得'],
          travels: Math.round(yearlyHours / 40),
        },
      };
      useAppStore.getState().setLifetimeImpact(impact);
    }

    router.push('/(onboarding)/alternative' as Href);
  };

  const renderScreenTimeData = () => {
    if (!screenTimeData || !monthlyData) return null;

    const customMonthlyTotal = customAppUsage.reduce((sum, app) => sum + app.monthlyMinutes, 0);
    const totalMonthlyMinutes = monthlyData.monthlyTotal + customMonthlyTotal;
    const { hours, mins } = formatTime(totalMonthlyMinutes);
    const yearlyHours = calculateYearlyHours(totalMonthlyMinutes);
    const monthlyHours = Math.round(totalMonthlyMinutes / 60);

    return (
      <View style={styles.dataContainer}>
        {/* Analysis Header */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(100)}
          style={[styles.analysisHeader, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.lg, padding: spacing.md }]}
        >
          <Ionicons name="analytics-outline" size={20} color={colors.accent} />
          <Text style={[typography.bodySmall, { color: colors.accent, marginLeft: spacing.sm, fontWeight: '600' }]}>
            {t('onboarding.v3.realityCheck.analysisTitle')}
          </Text>
        </Animated.View>

        {/* Total Time Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.totalTimeCard}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            今月のショート動画使用時間
          </Text>
          <Text style={[
            typography.h1,
            { color: colors.accent, fontSize: 48, lineHeight: 56, marginTop: spacing.sm }
          ]}>
            {hours}時間{mins}分
          </Text>
        </Animated.View>

        {/* Usage Breakdown */}
        <Animated.View entering={FadeInUp.duration(600).delay(300)}>
          <UsageBreakdownList
            appBreakdown={screenTimeData.appBreakdown}
            customAppUsage={customAppUsage}
            totalMonthlyMinutes={totalMonthlyMinutes}
          />
        </Animated.View>

        {/* Yearly Projection */}
        <YearlyProjectionCard
          yearlyHours={yearlyHours}
          peakHours={screenTimeData.peakHours}
        />

        {/* Achievable Skills */}
        <AchievableSkillsSection
          yearlyHours={yearlyHours}
          monthlyHours={monthlyHours}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-right" size="large" color="accent" intensity={0.12} />

      <Header showBack variant="ghost" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
              使用状況を取得中...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.lg, textAlign: 'center' }]}>
              使用状況を取得できません
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
              {error}
            </Text>
            <View style={styles.errorButtons}>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.accent, borderRadius: borderRadius.md }]}
                onPress={fetchUsageData}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={[typography.body, { color: '#FFFFFF', marginLeft: spacing.sm, fontWeight: '600' }]}>
                  再試行
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settingsButton, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}
                onPress={openUsageStatsSettings}
              >
                <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
                <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                  設定を開く
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : screenTimeData ? (
          renderScreenTimeData()
        ) : null}

        {screenTimeData && (
          <Animated.View entering={FadeInDown.duration(600).delay(700)} style={[styles.ctaContainer, { marginTop: spacing.xl }]}>
            <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
              {t('onboarding.v3.realityCheck.callToAction')}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(600).delay(800)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        <Button
          title={t('onboarding.v3.realityCheck.reclaimButton')}
          onPress={handleContinue}
          size="lg"
          disabled={!screenTimeData}
        />
        <View style={{ marginTop: spacing.xl }}>
          <ProgressIndicator totalSteps={9} currentStep={6} />
        </View>
      </Animated.View>
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
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorButtons: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  dataContainer: {
    gap: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalTimeCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});
