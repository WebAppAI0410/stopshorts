/**
 * useRealityCheck - Data fetching and calculation logic for reality check screen
 * Handles Android UsageStats API and iOS mock data
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '../stores/useAppStore';
import screenTimeService from '../services/screenTime';
import { screenTimeService as nativeScreenTime } from '../native/ScreenTimeModule';
import type { ScreenTimeData } from '../types';

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

export interface CustomAppUsage {
  packageName: string;
  name: string;
  monthlyMinutes: number;
  dailyMinutes: number;
  openCount: number;
  icon?: string;
}

export interface MonthlyData {
  monthlyTotal: number;
  dailyAverage: number;
  weeklyAverage: number;
}

export interface UseRealityCheckResult {
  isLoading: boolean;
  error: string | null;
  screenTimeData: ScreenTimeData | null;
  monthlyData: MonthlyData | null;
  customAppUsage: CustomAppUsage[];
  fetchUsageData: () => Promise<void>;
  openUsageStatsSettings: () => void;
}

export function useRealityCheck(): UseRealityCheckResult {
  const {
    setScreenTimeData: setStoredScreenTimeData,
    setScreenTimePermission,
    getCustomAppPackages,
    customApps,
    selectedApps,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customAppUsage, setCustomAppUsage] = useState<CustomAppUsage[]>([]);

  const fetchUsageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'android') {
        if (__DEV__) console.log('[RealityCheck] Fetching Android usage data...');

        const permissionStatus = await nativeScreenTime.getPermissionStatus();
        if (__DEV__) console.log('[RealityCheck] Permission status:', JSON.stringify(permissionStatus));

        if (!permissionStatus.usageStats) {
          setError('使用状況へのアクセス許可が必要です');
          setScreenTimeData(null);
          return;
        }

        const customPackages = getCustomAppPackages();
        if (__DEV__) console.log('[RealityCheck] Selected apps:', selectedApps);
        if (__DEV__) console.log('[RealityCheck] Custom app packages:', customPackages);

        if (__DEV__) console.log('[RealityCheck] Fetching monthly usage with apps...');
        const monthlyUsageData = await nativeScreenTime.getMonthlyUsageWithApps(selectedApps, customPackages);
        if (__DEV__) console.log('[RealityCheck] Monthly data:', JSON.stringify(monthlyUsageData));

        setMonthlyData({
          monthlyTotal: monthlyUsageData.monthlyTotal,
          dailyAverage: monthlyUsageData.dailyAverage,
          weeklyAverage: monthlyUsageData.weeklyAverage,
        });

        const appBreakdown: ScreenTimeData['appBreakdown'] = [];
        const appTotals: Record<'tiktok' | 'youtubeShorts' | 'instagramReels', { monthly: number; count: number }> = {
          tiktok: { monthly: 0, count: 0 },
          youtubeShorts: { monthly: 0, count: 0 },
          instagramReels: { monthly: 0, count: 0 },
        };

        const customAppTotals: Record<string, { name: string; monthly: number; count: number }> = {};

        if (__DEV__) console.log('[RealityCheck] Processing monthly apps:', monthlyUsageData.apps.length, 'apps found');
        if (__DEV__) console.log('[RealityCheck] Custom packages to match:', customPackages);

        for (const app of monthlyUsageData.apps) {
          if (__DEV__) console.log('[RealityCheck] App:', app.bundleId, 'monthly minutes:', app.minutes);
          const appId = PACKAGE_TO_APP_ID[app.bundleId];
          if (appId) {
            if (__DEV__) console.log('[RealityCheck] Matched to default app:', appId);
            appTotals[appId].monthly += app.minutes;
            appTotals[appId].count += app.openCount;
          } else if (customPackages.includes(app.bundleId)) {
            if (__DEV__) console.log('[RealityCheck] Matched to custom app:', app.bundleId, 'name:', app.appName);
            if (!customAppTotals[app.bundleId]) {
              customAppTotals[app.bundleId] = { name: app.appName, monthly: 0, count: 0 };
            }
            customAppTotals[app.bundleId].monthly += app.minutes;
            customAppTotals[app.bundleId].count += app.openCount;
          } else {
            if (__DEV__) console.log('[RealityCheck] No match for bundleId:', app.bundleId);
          }
        }

        for (const [appId, totals] of Object.entries(appTotals) as [keyof typeof appTotals, typeof appTotals[keyof typeof appTotals]][]) {
          if (totals.monthly > 0) {
            appBreakdown.push({
              app: appId,
              weeklyMinutes: totals.monthly,
              dailyAverage: Math.round(totals.monthly / 30),
              openCount: totals.count,
            });
          }
        }

        const customUsage: CustomAppUsage[] = [];
        for (const [packageName, totals] of Object.entries(customAppTotals)) {
          if (totals.monthly > 0) {
            const storedApp = customApps.find(a => a.packageName === packageName);
            const appName = storedApp?.appName || totals.name;

            customUsage.push({
              packageName,
              name: appName,
              monthlyMinutes: totals.monthly,
              dailyMinutes: Math.round(totals.monthly / 30),
              openCount: totals.count,
            });
          }
        }
        if (__DEV__) console.log('[RealityCheck] Custom app usage:', customUsage);

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
        if (__DEV__) console.log('[RealityCheck] Custom app usage with icons:', customUsageWithIcons.length);

        const data: ScreenTimeData = {
          weeklyTotal: monthlyUsageData.monthlyTotal,
          dailyAverage: monthlyUsageData.dailyAverage,
          appBreakdown,
          peakHours: [],
          lastUpdated: new Date().toISOString(),
        };

        if (__DEV__) console.log('[RealityCheck] Final data - monthlyTotal:', data.weeklyTotal, 'appBreakdown:', data.appBreakdown.length, 'customApps:', customUsageWithIcons.length);

        const hasAnyUsage = monthlyUsageData.monthlyTotal > 0 || data.appBreakdown.length > 0 || customUsageWithIcons.length > 0;
        if (!hasAnyUsage) {
          if (__DEV__) console.log('[RealityCheck] ERROR: No data found, showing error UI');
          setError('使用データが見つかりませんでした。対象アプリを使用してから再度お試しください。');
          setScreenTimeData(null);
          setCustomAppUsage([]);
          return;
        }

        if (__DEV__) console.log('[RealityCheck] SUCCESS: Data found, showing results');

        setScreenTimeData(data);
        setStoredScreenTimeData(data);
        setScreenTimePermission(true);
        setCustomAppUsage(customUsageWithIcons);
      } else {
        // iOS: use mock data (pending Family Controls Entitlement)
        const mockData = screenTimeService.getMockData();
        setScreenTimeData(mockData);
        setStoredScreenTimeData(mockData);
        setScreenTimePermission(true);
        setMonthlyData({
          monthlyTotal: mockData.weeklyTotal * 4.3,
          dailyAverage: mockData.dailyAverage,
          weeklyAverage: mockData.weeklyTotal,
        });
      }
    } catch (err) {
      console.error('[RealityCheck] Failed to fetch usage data:', err);
      if (Platform.OS === 'android') {
        setError('使用状況の取得に失敗しました。再試行してください。');
        setScreenTimeData(null);
      } else {
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
  }, [getCustomAppPackages, customApps, selectedApps, setStoredScreenTimeData, setScreenTimePermission]);

  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  const openUsageStatsSettings = useCallback(() => {
    nativeScreenTime.openUsageStatsSettings();
  }, []);

  return {
    isLoading,
    error,
    screenTimeData,
    monthlyData,
    customAppUsage,
    fetchUsageData,
    openUsageStatsSettings,
  };
}

// Utility functions for time formatting and calculations
export function formatTime(minutes: number): { hours: number; mins: number } {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { hours, mins };
}

export function calculateYearlyHours(totalMonthlyMinutes: number): number {
  return Math.round(totalMonthlyMinutes * 12 / 60);
}

export interface AchievableSkill {
  hours: number;
  skill: string;
  icon: string;
  category: string;
}

// Achievable skills data - universal skills applicable across all countries
export const ACHIEVABLE_SKILLS: AchievableSkill[] = [
  // Under 2 hours (Instant wins)
  { hours: 0.5, skill: 'マジックを1つ覚える', icon: 'sparkles-outline', category: 'game' },
  { hours: 1, skill: '折り紙で鶴を折る', icon: 'paper-plane-outline', category: 'creative' },
  { hours: 1, skill: 'ロープの結び方5種類', icon: 'link-outline', category: 'life' },
  { hours: 1.5, skill: '手作りパスタを作る', icon: 'restaurant-outline', category: 'life' },

  // 2-9 hours (Micro wins)
  { hours: 2, skill: 'ルービックキューブ完成', icon: 'cube-outline', category: 'game' },
  { hours: 3, skill: 'Excelの基本関数をマスター', icon: 'grid-outline', category: 'tech' },
  { hours: 4, skill: 'スマホで映える写真編集', icon: 'camera-outline', category: 'creative' },
  { hours: 5, skill: 'ジャグリング3つ', icon: 'baseball-outline', category: 'game' },
  { hours: 6, skill: '簡単なカクテル5種類', icon: 'wine-outline', category: 'life' },
  { hours: 8, skill: '速読の基礎テクニック', icon: 'book-outline', category: 'life' },

  // 10-40 hours (Ultra quick wins)
  { hours: 10, skill: 'タイピングが2倍速く', icon: 'keypad-outline', category: 'tech' },
  { hours: 15, skill: '瞑想の習慣化', icon: 'leaf-outline', category: 'life' },
  { hours: 20, skill: '基本的なPhotoshop操作', icon: 'image-outline', category: 'creative' },
  { hours: 25, skill: 'チェスの基本戦略', icon: 'grid-outline', category: 'game' },
  { hours: 30, skill: '簡単な曲をウクレレで', icon: 'musical-notes-outline', category: 'music' },
  { hours: 40, skill: 'ヨガの基本ポーズ習得', icon: 'body-outline', category: 'fitness' },

  // 50-100 hours (Quick wins)
  { hours: 50, skill: '料理の基礎をマスター', icon: 'restaurant-outline', category: 'life' },
  { hours: 75, skill: '基本的な応急処置の習得', icon: 'medkit-outline', category: 'life' },
  { hours: 100, skill: '新しい言語で自己紹介', icon: 'chatbubbles-outline', category: 'language' },
  { hours: 100, skill: 'ギターで10曲弾ける', icon: 'musical-notes-outline', category: 'music' },

  // 150-300 hours (Beginner skills)
  { hours: 150, skill: 'Webサイトを作れる', icon: 'code-slash-outline', category: 'tech' },
  { hours: 200, skill: '投資・資産運用の基礎', icon: 'trending-up-outline', category: 'finance' },
  { hours: 200, skill: 'フルマラソン完走', icon: 'fitness-outline', category: 'fitness' },
  { hours: 250, skill: 'ピアノで中級曲が弾ける', icon: 'musical-note-outline', category: 'music' },
  { hours: 300, skill: '旅行レベルの外国語会話', icon: 'airplane-outline', category: 'language' },

  // 400-600 hours (Intermediate)
  { hours: 400, skill: '外国語でプレゼンができる', icon: 'easel-outline', category: 'language' },
  { hours: 500, skill: 'スマホアプリを開発', icon: 'phone-portrait-outline', category: 'tech' },
  { hours: 500, skill: 'イラストを仕事にできる', icon: 'brush-outline', category: 'creative' },
  { hours: 600, skill: '起業に必要な財務知識', icon: 'briefcase-outline', category: 'finance' },

  // 800-1200 hours (Advanced)
  { hours: 800, skill: '外国語で仕事ができる', icon: 'globe-outline', category: 'language' },
  { hours: 1000, skill: 'プログラマーとして就職', icon: 'laptop-outline', category: 'tech' },
  { hours: 1000, skill: 'バンドでライブ演奏', icon: 'mic-outline', category: 'music' },
  { hours: 1200, skill: '小説を一冊書き上げる', icon: 'book-outline', category: 'creative' },

  // 1500-3000 hours (Professional)
  { hours: 1500, skill: 'シェフとして働ける', icon: 'restaurant-outline', category: 'career' },
  { hours: 2000, skill: 'プロの通訳・翻訳者', icon: 'language-outline', category: 'language' },
  { hours: 2500, skill: 'フリーランスエンジニア', icon: 'rocket-outline', category: 'tech' },
  { hours: 3000, skill: '音楽講師として教える', icon: 'school-outline', category: 'music' },
  { hours: 3000, skill: 'MBA相当のビジネス知識', icon: 'analytics-outline', category: 'career' },

  // 5000+ hours (Expert)
  { hours: 5000, skill: '医療専門家レベル', icon: 'medical-outline', category: 'career' },
  { hours: 6000, skill: 'プロミュージシャン', icon: 'musical-notes-outline', category: 'music' },
  { hours: 10000, skill: '世界トップレベルの専門家', icon: 'trophy-outline', category: 'career' },
];

export function getAchievableSkillsInYears(yearlyHours: number, years: number): AchievableSkill[] {
  const hoursAvailable = yearlyHours * years;
  return ACHIEVABLE_SKILLS
    .filter(s => s.hours <= hoursAvailable)
    .sort((a, b) => b.hours - a.hours);
}

export function getTopVariedSkills(yearlyHours: number): { skill: AchievableSkill; years: number }[] {
  const result: { skill: AchievableSkill; years: number }[] = [];
  const usedCategories = new Set<string>();

  const in1Year = getAchievableSkillsInYears(yearlyHours, 1);
  const in2Years = getAchievableSkillsInYears(yearlyHours, 2);
  const in3Years = getAchievableSkillsInYears(yearlyHours, 3);

  if (in1Year.length > 0) {
    result.push({ skill: in1Year[0], years: 1 });
    usedCategories.add(in1Year[0].category);
  }

  const twoYearDiff = in2Years.find(s => !usedCategories.has(s.category));
  if (twoYearDiff) {
    result.push({ skill: twoYearDiff, years: 2 });
    usedCategories.add(twoYearDiff.category);
  } else if (in2Years.length > 0 && in2Years[0].hours > (in1Year[0]?.hours || 0)) {
    result.push({ skill: in2Years[0], years: 2 });
  }

  const threeYearDiff = in3Years.find(s => !usedCategories.has(s.category));
  if (threeYearDiff) {
    result.push({ skill: threeYearDiff, years: 3 });
  } else if (in3Years.length > 0 && in3Years[0].hours > (in2Years[0]?.hours || 0)) {
    result.push({ skill: in3Years[0], years: 3 });
  }

  return result;
}

export function getQuickWins(monthlyHours: number): AchievableSkill[] {
  const threeMonthHours = monthlyHours * 3;
  return ACHIEVABLE_SKILLS.filter(s => s.hours <= threeMonthHours);
}
