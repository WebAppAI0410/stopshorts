import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import screenTimeService from '../../src/services/screenTime';
import { screenTimeService as nativeScreenTime, TARGET_APPS } from '../../src/native/ScreenTimeModule';
import type { ScreenTimeData } from '../../src/types';
import { getAppIcon } from '../../src/constants/appIcons';

// Package name to app ID mapping for accurate classification
const PACKAGE_TO_APP_ID: Record<string, 'tiktok' | 'youtubeShorts' | 'instagramReels'> = {
    // TikTok variants
    'com.zhiliaoapp.musically': 'tiktok',
    'com.ss.android.ugc.trill': 'tiktok',
    // YouTube
    'com.google.android.youtube': 'youtubeShorts',
    // Instagram
    'com.instagram.android': 'instagramReels',
};

export default function RealityCheckScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { calculateImpactFromScreenTime, getCustomAppPackages, customApps, selectedApps } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData | null>(null);
    const [monthlyData, setMonthlyData] = useState<{ monthlyTotal: number; dailyAverage: number; weeklyAverage: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Custom app usage breakdown (not in ScreenTimeData type)
    const [customAppUsage, setCustomAppUsage] = useState<Array<{ packageName: string; name: string; monthlyMinutes: number; dailyMinutes: number; openCount: number; icon?: string }>>([]);

    // Fetch real usage data on Android, mock data on iOS
    const fetchUsageData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (Platform.OS === 'android') {
                console.log('[RealityCheck] Fetching Android usage data...');

                const permissionStatus = await nativeScreenTime.getPermissionStatus();
                console.log('[RealityCheck] Permission status:', JSON.stringify(permissionStatus));

                if (!permissionStatus.usageStats) {
                    // No permission - show error, NOT mock
                    setError('使用状況へのアクセス許可が必要です');
                    setScreenTimeData(null);
                    return;
                }

                // Get custom app packages from store
                const customPackages = getCustomAppPackages();
                console.log('[RealityCheck] Selected apps:', selectedApps);
                console.log('[RealityCheck] Custom app packages:', customPackages);

                // Fetch REAL monthly usage data from native (including custom apps)
                // Pass selectedApps (TargetAppId[]) first, then customPackages (string[])
                console.log('[RealityCheck] Fetching monthly usage...');
                const monthlyUsageData = await nativeScreenTime.getMonthlyUsage(selectedApps, customPackages);
                console.log('[RealityCheck] Monthly data:', JSON.stringify(monthlyUsageData));
                setMonthlyData(monthlyUsageData);

                console.log('[RealityCheck] Fetching today usage...');
                const todayUsage = await nativeScreenTime.getTodayUsage(selectedApps, customPackages);
                console.log('[RealityCheck] Today usage:', JSON.stringify(todayUsage));

                // Classify apps by packageName (NOT appName)
                const appBreakdown: ScreenTimeData['appBreakdown'] = [];
                const appTotals: Record<'tiktok' | 'youtubeShorts' | 'instagramReels', { weekly: number; daily: number; count: number }> = {
                    tiktok: { weekly: 0, daily: 0, count: 0 },
                    youtubeShorts: { weekly: 0, daily: 0, count: 0 },
                    instagramReels: { weekly: 0, daily: 0, count: 0 },
                };

                // Track custom apps separately
                const customAppTotals: Record<string, { name: string; daily: number; count: number }> = {};

                // Aggregate by app ID using packageName
                console.log('[RealityCheck] Processing apps:', todayUsage.apps.length, 'apps found');
                console.log('[RealityCheck] Custom packages to match:', customPackages);
                for (const app of todayUsage.apps) {
                    console.log('[RealityCheck] App:', app.bundleId, 'minutes:', app.minutes);
                    const appId = PACKAGE_TO_APP_ID[app.bundleId];
                    if (appId) {
                        console.log('[RealityCheck] Matched to default app:', appId);
                        // Known target app - use real data
                        appTotals[appId].daily += app.minutes;
                        appTotals[appId].count += app.openCount;
                    } else if (customPackages.includes(app.bundleId)) {
                        console.log('[RealityCheck] Matched to custom app:', app.bundleId, 'name:', app.appName);
                        // Custom app - track separately
                        if (!customAppTotals[app.bundleId]) {
                            customAppTotals[app.bundleId] = { name: app.appName, daily: 0, count: 0 };
                        }
                        customAppTotals[app.bundleId].daily += app.minutes;
                        customAppTotals[app.bundleId].count += app.openCount;
                    } else {
                        console.log('[RealityCheck] No match for bundleId:', app.bundleId);
                    }
                }

                // Build app breakdown from aggregated data (using monthly estimates)
                for (const [appId, totals] of Object.entries(appTotals) as [keyof typeof appTotals, typeof appTotals[keyof typeof appTotals]][]) {
                    if (totals.daily > 0) {
                        appBreakdown.push({
                            app: appId,
                            // Use monthly data for estimates
                            weeklyMinutes: monthlyUsageData.monthlyTotal > 0
                                ? Math.round((totals.daily / (todayUsage.totalMinutes || 1)) * monthlyUsageData.monthlyTotal)
                                : totals.daily * 30,
                            dailyAverage: totals.daily,
                            openCount: totals.count,
                        });
                    }
                }

                // Build custom app usage breakdown with proper names from store
                const customUsage: typeof customAppUsage = [];
                for (const [packageName, totals] of Object.entries(customAppTotals)) {
                    if (totals.daily > 0) {
                        // Get the proper app name from the store (saved when user added the app)
                        const storedApp = customApps.find(a => a.packageName === packageName);
                        const appName = storedApp?.appName || totals.name;

                        customUsage.push({
                            packageName,
                            name: appName,
                            monthlyMinutes: monthlyUsageData.monthlyTotal > 0
                                ? Math.round((totals.daily / (todayUsage.totalMinutes || 1)) * monthlyUsageData.monthlyTotal)
                                : totals.daily * 30,
                            dailyMinutes: totals.daily,
                            openCount: totals.count,
                        });
                    }
                }
                console.log('[RealityCheck] Custom app usage:', customUsage);

                // Fetch icons for custom apps
                const customUsageWithIcons = await Promise.all(
                    customUsage.map(async (app) => {
                        try {
                            const icon = await nativeScreenTime.getAppIcon(app.packageName);
                            return { ...app, icon: icon || undefined };
                        } catch {
                            return app;
                        }
                    })
                );
                console.log('[RealityCheck] Custom app usage with icons:', customUsageWithIcons.length);

                // Use real monthly data, NOT estimate
                const data: ScreenTimeData = {
                    weeklyTotal: monthlyUsageData.monthlyTotal, // Now stores monthly total
                    dailyAverage: monthlyUsageData.dailyAverage,
                    appBreakdown,
                    // peakHours: Empty if not implemented (NOT hardcoded)
                    peakHours: [],
                    lastUpdated: new Date().toISOString(),
                };

                console.log('[RealityCheck] Final data - monthlyTotal:', data.weeklyTotal, 'appBreakdown:', data.appBreakdown.length, 'customApps:', customUsageWithIcons.length);

                // Check if we have any usage (default apps OR custom apps)
                const hasAnyUsage = monthlyUsageData.monthlyTotal > 0 || data.appBreakdown.length > 0 || customUsageWithIcons.length > 0;
                if (!hasAnyUsage) {
                    // No usage data found
                    console.log('[RealityCheck] ERROR: No data found, showing error UI');
                    setError('使用データが見つかりませんでした。対象アプリを使用してから再度お試しください。');
                    setScreenTimeData(null);
                    setCustomAppUsage([]);
                    return;
                }

                console.log('[RealityCheck] SUCCESS: Data found, showing results');

                setScreenTimeData(data);
                setCustomAppUsage(customUsageWithIcons);
            } else {
                // iOS: use mock data (pending Family Controls Entitlement)
                const mockData = screenTimeService.getMockData();
                setScreenTimeData(mockData);
                // Set mock monthly data based on weekly mock
                setMonthlyData({
                    monthlyTotal: mockData.weeklyTotal * 4.3,
                    dailyAverage: mockData.dailyAverage,
                    weeklyAverage: mockData.weeklyTotal,
                });
            }
        } catch (err) {
            console.error('[RealityCheck] Failed to fetch usage data:', err);
            // Android: Show error, NOT mock fallback
            if (Platform.OS === 'android') {
                setError('使用状況の取得に失敗しました。再試行してください。');
                setScreenTimeData(null);
            } else {
                // iOS: fallback to mock (expected behavior)
                const mockData = screenTimeService.getMockData();
                setScreenTimeData(mockData);
                setMonthlyData({
                    monthlyTotal: mockData.weeklyTotal * 4.3,
                    dailyAverage: mockData.dailyAverage,
                    weeklyAverage: mockData.weeklyTotal,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsageData();
    }, []);

    const handleContinue = () => {
        if (screenTimeData && monthlyData) {
            // Include custom app usage in the impact calculation
            const customMonthlyTotal = customAppUsage.reduce((sum, app) => sum + app.monthlyMinutes, 0);

            // Calculate total monthly minutes (same as displayed on this screen)
            const totalMonthlyMinutes = monthlyData.monthlyTotal + customMonthlyTotal;

            // Convert monthly total to daily average: monthly ÷ 30 days
            // This ensures consistency with the yearlyHours displayed on this screen
            // (yearlyHours = totalMonthlyMinutes * 12 / 60 = dailyAverage * 30 * 12 / 60 = dailyAverage * 6)
            const totalDailyAverage = Math.round(totalMonthlyMinutes / 30);

            const updatedScreenTimeData = {
                ...screenTimeData,
                // Use calculated daily average from total monthly minutes
                dailyAverage: totalDailyAverage,
            };
            calculateImpactFromScreenTime(updatedScreenTimeData);
        }
        router.push('/(onboarding)/alternative' as Href);
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { hours, mins };
    };

    const renderScreenTimeData = () => {
        if (!screenTimeData || !monthlyData) return null;
        // Include custom app usage in total (now monthly)
        const customMonthlyTotal = customAppUsage.reduce((sum, app) => sum + app.monthlyMinutes, 0);
        const totalMonthlyMinutes = monthlyData.monthlyTotal + customMonthlyTotal;
        const { hours, mins } = formatTime(totalMonthlyMinutes);

        // Calculate yearly projection directly from monthly data
        // 月間分数 × 12ヶ月 ÷ 60分 = 年間時間
        const yearlyHours = Math.round(totalMonthlyMinutes * 12 / 60);

        // Concrete skills with required hours (research-based estimates)
        // Universally applicable across all countries
        const achievableSkills = [
            // Under 2 hours (Instant wins)
            { hours: 0.5, skill: 'マジックを1つ覚える', icon: 'sparkles-outline' as const, category: 'game' },
            { hours: 1, skill: '折り紙で鶴を折る', icon: 'paper-plane-outline' as const, category: 'creative' },
            { hours: 1, skill: 'ロープの結び方5種類', icon: 'link-outline' as const, category: 'life' },
            { hours: 1.5, skill: '手作りパスタを作る', icon: 'restaurant-outline' as const, category: 'life' },

            // 2-9 hours (Micro wins)
            { hours: 2, skill: 'ルービックキューブ完成', icon: 'cube-outline' as const, category: 'game' },
            { hours: 3, skill: 'Excelの基本関数をマスター', icon: 'grid-outline' as const, category: 'tech' },
            { hours: 4, skill: 'スマホで映える写真編集', icon: 'camera-outline' as const, category: 'creative' },
            { hours: 5, skill: 'ジャグリング3つ', icon: 'baseball-outline' as const, category: 'game' },
            { hours: 6, skill: '簡単なカクテル5種類', icon: 'wine-outline' as const, category: 'life' },
            { hours: 8, skill: '速読の基礎テクニック', icon: 'book-outline' as const, category: 'life' },

            // 10-40 hours (Ultra quick wins)
            { hours: 10, skill: 'タイピングが2倍速く', icon: 'keypad-outline' as const, category: 'tech' },
            { hours: 15, skill: '瞑想の習慣化', icon: 'leaf-outline' as const, category: 'life' },
            { hours: 20, skill: '基本的なPhotoshop操作', icon: 'image-outline' as const, category: 'creative' },
            { hours: 25, skill: 'チェスの基本戦略', icon: 'grid-outline' as const, category: 'game' },
            { hours: 30, skill: '簡単な曲をウクレレで', icon: 'musical-notes-outline' as const, category: 'music' },
            { hours: 40, skill: 'ヨガの基本ポーズ習得', icon: 'body-outline' as const, category: 'fitness' },

            // 50-100 hours (Quick wins)
            { hours: 50, skill: '料理の基礎をマスター', icon: 'restaurant-outline' as const, category: 'life' },
            { hours: 75, skill: '基本的な応急処置の習得', icon: 'medkit-outline' as const, category: 'life' },
            { hours: 100, skill: '新しい言語で自己紹介', icon: 'chatbubbles-outline' as const, category: 'language' },
            { hours: 100, skill: 'ギターで10曲弾ける', icon: 'musical-notes-outline' as const, category: 'music' },

            // 150-300 hours (Beginner skills)
            { hours: 150, skill: 'Webサイトを作れる', icon: 'code-slash-outline' as const, category: 'tech' },
            { hours: 200, skill: '投資・資産運用の基礎', icon: 'trending-up-outline' as const, category: 'finance' },
            { hours: 200, skill: 'フルマラソン完走', icon: 'fitness-outline' as const, category: 'fitness' },
            { hours: 250, skill: 'ピアノで中級曲が弾ける', icon: 'musical-note-outline' as const, category: 'music' },
            { hours: 300, skill: '旅行レベルの外国語会話', icon: 'airplane-outline' as const, category: 'language' },

            // 400-600 hours (Intermediate)
            { hours: 400, skill: '外国語でプレゼンができる', icon: 'easel-outline' as const, category: 'language' },
            { hours: 500, skill: 'スマホアプリを開発', icon: 'phone-portrait-outline' as const, category: 'tech' },
            { hours: 500, skill: 'イラストを仕事にできる', icon: 'brush-outline' as const, category: 'creative' },
            { hours: 600, skill: '起業に必要な財務知識', icon: 'briefcase-outline' as const, category: 'finance' },

            // 800-1200 hours (Advanced)
            { hours: 800, skill: '外国語で仕事ができる', icon: 'globe-outline' as const, category: 'language' },
            { hours: 1000, skill: 'プログラマーとして就職', icon: 'laptop-outline' as const, category: 'tech' },
            { hours: 1000, skill: 'バンドでライブ演奏', icon: 'mic-outline' as const, category: 'music' },
            { hours: 1200, skill: '小説を一冊書き上げる', icon: 'book-outline' as const, category: 'creative' },

            // 1500-3000 hours (Professional)
            { hours: 1500, skill: 'シェフとして働ける', icon: 'restaurant-outline' as const, category: 'career' },
            { hours: 2000, skill: 'プロの通訳・翻訳者', icon: 'language-outline' as const, category: 'language' },
            { hours: 2500, skill: 'フリーランスエンジニア', icon: 'rocket-outline' as const, category: 'tech' },
            { hours: 3000, skill: '音楽講師として教える', icon: 'school-outline' as const, category: 'music' },
            { hours: 3000, skill: 'MBA相当のビジネス知識', icon: 'analytics-outline' as const, category: 'career' },

            // 5000+ hours (Expert)
            { hours: 5000, skill: '医療専門家レベル', icon: 'medical-outline' as const, category: 'career' },
            { hours: 6000, skill: 'プロミュージシャン', icon: 'musical-notes-outline' as const, category: 'music' },
            { hours: 10000, skill: '世界トップレベルの専門家', icon: 'trophy-outline' as const, category: 'career' },
        ];

        // Find skills achievable within 1, 2, 3 years at current pace
        const getAchievableInYears = (years: number) => {
            const hoursAvailable = yearlyHours * years;
            return achievableSkills
                .filter(s => s.hours <= hoursAvailable)
                .sort((a, b) => b.hours - a.hours);
        };

        const in1Year = getAchievableInYears(1);
        const in2Years = getAchievableInYears(2);
        const in3Years = getAchievableInYears(3);

        // Get the most impressive skill for each timeframe (different categories if possible)
        const getTopSkillsVaried = () => {
            const result: typeof achievableSkills = [];
            const usedCategories = new Set<string>();

            // Get top skill for 1 year
            if (in1Year.length > 0) {
                result.push({ ...in1Year[0], hours: 1 }); // hours = years for display
                usedCategories.add(in1Year[0].category);
            }

            // Get different category skill for 2 years
            const twoYearDiff = in2Years.find(s => !usedCategories.has(s.category));
            if (twoYearDiff) {
                result.push({ ...twoYearDiff, hours: 2 });
                usedCategories.add(twoYearDiff.category);
            } else if (in2Years.length > 0 && in2Years[0].hours > (in1Year[0]?.hours || 0)) {
                result.push({ ...in2Years[0], hours: 2 });
            }

            // Get different category skill for 3 years
            const threeYearDiff = in3Years.find(s => !usedCategories.has(s.category));
            if (threeYearDiff) {
                result.push({ ...threeYearDiff, hours: 3 });
            } else if (in3Years.length > 0 && in3Years[0].hours > (in2Years[0]?.hours || 0)) {
                result.push({ ...in3Years[0], hours: 3 });
            }

            return result;
        };

        const topSkills = getTopSkillsVaried();

        // Calculate what could be achieved right now with monthly time
        const monthlyHours = Math.round(totalMonthlyMinutes / 60);
        const quickWins = achievableSkills.filter(s => s.hours <= monthlyHours * 3); // 3 months

        // Only show peakHours if we have real data (NOT hardcoded/default)
        const hasPeakHours = screenTimeData.peakHours.length > 0;
        const peakHoursDisplay = hasPeakHours
            ? `${screenTimeData.peakHours[0]} - ${screenTimeData.peakHours[screenTimeData.peakHours.length - 1]}`
            : null;

        return (
            <View style={styles.dataContainer}>
                {/* Analysis Header */}
                <Animated.View entering={FadeInUp.duration(600).delay(100)} style={[styles.analysisHeader, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.lg, padding: spacing.md }]}>
                    <Ionicons name="analytics-outline" size={20} color={colors.accent} />
                    <Text style={[typography.bodySmall, { color: colors.accent, marginLeft: spacing.sm, fontWeight: '600' }]}>
                        {t('onboarding.v3.realityCheck.analysisTitle')}
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.totalTimeCard}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        今月のショート動画使用時間
                    </Text>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.accent,
                            fontSize: 48,
                            lineHeight: 56,
                            marginTop: spacing.sm,
                        }
                    ]}>
                        {hours}時間{mins}分
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.breakdownContainer}>
                    {/* Default apps */}
                    {screenTimeData.appBreakdown.map((app) => {
                        const appName = {
                            tiktok: 'TikTok',
                            youtubeShorts: 'YouTube Shorts',
                            instagramReels: 'Instagram Reels',
                        }[app.app];
                        const percentage = totalMonthlyMinutes > 0 ? (app.weeklyMinutes / totalMonthlyMinutes) * 100 : 0;
                        const { hours: appHours, mins: appMins } = formatTime(app.weeklyMinutes);

                        return (
                            <View key={app.app} style={styles.appRow}>
                                <View style={[styles.appIcon, { backgroundColor: colors.surface, overflow: 'hidden' }]}>
                                    {getAppIcon(app.app) ? (
                                        <Image
                                            source={getAppIcon(app.app)!}
                                            style={{ width: 28, height: 28, borderRadius: 6 }}
                                        />
                                    ) : (
                                        <Ionicons
                                            name={
                                                app.app === 'tiktok' ? 'musical-notes' :
                                                app.app === 'youtubeShorts' ? 'logo-youtube' : 'logo-instagram'
                                            }
                                            size={20}
                                            color={colors.accent}
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                                        {appName}
                                    </Text>
                                    <View style={[styles.barBackground, { backgroundColor: colors.surface }]}>
                                        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.accent }]} />
                                    </View>
                                </View>
                                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                    {appHours}h {appMins}m
                                </Text>
                            </View>
                        );
                    })}
                    {/* Custom apps */}
                    {customAppUsage.map((app) => {
                        const percentage = totalMonthlyMinutes > 0 ? (app.monthlyMinutes / totalMonthlyMinutes) * 100 : 0;
                        const { hours: appHours, mins: appMins } = formatTime(app.monthlyMinutes);

                        return (
                            <View key={app.packageName} style={styles.appRow}>
                                <View style={[styles.appIcon, { backgroundColor: colors.surface, overflow: 'hidden' }]}>
                                    {app.icon ? (
                                        <Image
                                            source={{ uri: `data:image/png;base64,${app.icon}` }}
                                            style={{ width: 28, height: 28, borderRadius: 6 }}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="apps-outline"
                                            size={20}
                                            color={colors.accent}
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                                        {app.name}
                                    </Text>
                                    <View style={[styles.barBackground, { backgroundColor: colors.surface }]}>
                                        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.accent }]} />
                                    </View>
                                </View>
                                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                    {appHours}h {appMins}m
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Only show peakHours if we have real data */}
                {hasPeakHours && peakHoursDisplay && (
                    <Animated.View entering={FadeInUp.duration(600).delay(400)} style={[styles.infoCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg }]}>
                        <Ionicons name="time-outline" size={24} color={colors.accent} />
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                {t('onboarding.v3.realityCheck.peakHours')}
                            </Text>
                            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                                {peakHoursDisplay}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Yearly projection */}
                <Animated.View entering={FadeInUp.duration(600).delay(500)} style={[styles.infoCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg }]}>
                    <Ionicons name="calendar-outline" size={24} color={colors.accent} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                            このペースで1年続けると
                        </Text>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                            年間 {yearlyHours} 時間
                        </Text>
                    </View>
                </Animated.View>

                {/* Main impact message */}
                <Animated.View entering={FadeInUp.duration(600).delay(600)} style={[
                    styles.skillMasteryCard,
                    {
                        backgroundColor: colors.accent,
                        borderRadius: borderRadius.lg,
                        padding: spacing.lg,
                    }
                ]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[
                            typography.h3,
                            {
                                color: '#FFFFFF',
                                marginBottom: spacing.sm,
                                textAlign: 'center',
                            }
                        ]}>
                            この時間があれば...
                        </Text>
                        <Text style={[
                            typography.body,
                            {
                                color: 'rgba(255,255,255,0.9)',
                                textAlign: 'center',
                                lineHeight: 24,
                            }
                        ]}>
                            あなたの年間 {yearlyHours} 時間で{'\n'}
                            人生を変えるスキルが身につきます
                        </Text>
                    </View>
                </Animated.View>

                {/* Achievable skills list */}
                {topSkills.length > 0 && (
                    <Animated.View entering={FadeInUp.duration(600).delay(700)}>
                        <Text style={[
                            typography.h3,
                            {
                                color: colors.textPrimary,
                                marginBottom: spacing.md,
                                marginTop: spacing.sm,
                            }
                        ]}>
                            具体的に何ができる？
                        </Text>
                        <View style={styles.skillsContainer}>
                            {topSkills.slice(0, 3).map((item, index) => (
                                <Animated.View
                                    key={`${item.skill}-${index}`}
                                    entering={FadeInUp.duration(400).delay(750 + index * 100)}
                                    style={[
                                        styles.skillCard,
                                        {
                                            backgroundColor: colors.backgroundCard,
                                            borderRadius: borderRadius.md,
                                            borderLeftWidth: 4,
                                            borderLeftColor: colors.accent,
                                        }
                                    ]}
                                >
                                    <View style={[styles.skillIconContainer, { backgroundColor: colors.accentMuted }]}>
                                        <Ionicons name={item.icon} size={20} color={colors.accent} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                                            {item.skill}
                                        </Text>
                                        <Text style={[typography.caption, { color: colors.accent, marginTop: 2 }]}>
                                            {item.hours}年で達成可能
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Quick win - what you could achieve in 3 months */}
                {quickWins.length > 0 && (
                    <Animated.View entering={FadeInUp.duration(600).delay(900)} style={[
                        styles.quickWinCard,
                        {
                            backgroundColor: colors.success + '15',
                            borderRadius: borderRadius.lg,
                            borderWidth: 1,
                            borderColor: colors.success + '30',
                        }
                    ]}>
                        <Ionicons name="flash-outline" size={24} color={colors.success} />
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                            <Text style={[typography.bodySmall, { color: colors.success, fontWeight: '600' }]}>
                                今すぐ始めれば3ヶ月で
                            </Text>
                            <Text style={[typography.body, { color: colors.textPrimary, marginTop: 2 }]}>
                                {quickWins[quickWins.length - 1].skill}
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.12} />

            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Show loading indicator, error, or analyzed data */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
                            使用状況を取得中...
                        </Text>
                    </View>
                ) : error ? (
                    // Error UI with retry and settings buttons (Android only)
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
                                onPress={() => nativeScreenTime.openUsageStatsSettings()}
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

                {/* Only show CTA if we have data */}
                {screenTimeData && (
                    <Animated.View entering={FadeInDown.duration(600).delay(700)} style={[styles.ctaContainer, { marginTop: spacing.xl }]}>
                        <Text style={[
                            typography.h2,
                            {
                                color: colors.textPrimary,
                                textAlign: 'center',
                            }
                        ]}>
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
                    <ProgressIndicator totalSteps={10} currentStep={6} />
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
    breakdownContainer: {
        gap: 12,
    },
    appRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    appIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    barBackground: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 6,
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    skillMasteryCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    skillsContainer: {
        gap: 10,
    },
    skillCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    skillIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickWinCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    ctaContainer: {
        alignItems: 'center',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
