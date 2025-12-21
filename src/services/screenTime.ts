/**
 * Screen Time Service
 *
 * Provides a high-level API for interacting with screen time tracking
 * - iOS: Uses Screen Time / Family Controls API
 * - Android: Uses UsageStatsManager
 */
import { Platform } from 'react-native';
import iOSScreenTime, {
    isAvailable as isIOSAvailable,
    getAuthorizationStatus as getIOSAuthorizationStatus,
    requestAuthorization as requestIOSAuthorization,
    AuthorizationStatus,
    AuthorizationResult,
} from '../../modules/screen-time';
import { screenTimeService as androidService, PermissionStatus } from '../native/ScreenTimeModule';
import type { ScreenTimeData } from '../types';

export type { AuthorizationStatus, AuthorizationResult, ScreenTimeData, PermissionStatus };

/**
 * Check if Screen Time API is available on this device
 */
export function isScreenTimeAvailable(): boolean {
    if (Platform.OS === 'android') {
        return true; // Always available on Android 8.0+
    }
    return isIOSAvailable();
}

/**
 * Get current authorization status
 */
export function getScreenTimeAuthorizationStatus(): AuthorizationStatus {
    if (Platform.OS === 'android') {
        // For Android, return 'notDetermined' - check permissions separately
        return 'notDetermined';
    }
    return getIOSAuthorizationStatus();
}

/**
 * Get Android permission status
 */
export async function getAndroidPermissionStatus(): Promise<PermissionStatus> {
    return androidService.getPermissionStatus();
}

/**
 * Open Usage Stats settings (Android only)
 */
export async function openUsageStatsSettings(): Promise<void> {
    await androidService.openUsageStatsSettings();
}

/**
 * Open Overlay settings (Android only)
 */
export async function openOverlaySettings(): Promise<void> {
    await androidService.openOverlaySettings();
}

/**
 * Request Screen Time authorization from user
 * - iOS: Shows system permission dialog
 * - Android: Returns current permission status (user must grant in Settings)
 */
export async function requestScreenTimeAuthorization(): Promise<AuthorizationResult> {
    if (Platform.OS === 'android') {
        const status = await androidService.getPermissionStatus();
        return {
            success: status.usageStats,
            status: status.usageStats ? 'approved' : 'notDetermined',
        };
    }
    return requestIOSAuthorization();
}

/**
 * Check if Screen Time is authorized
 */
export async function isScreenTimeAuthorized(): Promise<boolean> {
    if (Platform.OS === 'android') {
        const status = await androidService.getPermissionStatus();
        return status.usageStats;
    }
    const status = getIOSAuthorizationStatus();
    return status === 'approved';
}

/**
 * Mock user scenarios for realistic testing
 * Each scenario represents a typical user profile
 */
export type MockScenario = 'light' | 'moderate' | 'heavy' | 'severe';

interface DailyUsagePattern {
    date: string; // YYYY-MM-DD
    tiktok: number;
    youtubeShorts: number;
    instagramReels: number;
    peakHours: string[];
}

/**
 * Generate deterministic daily patterns based on scenario
 * Simulates realistic weekly patterns with weekend spikes
 */
function generateWeeklyPattern(scenario: MockScenario): DailyUsagePattern[] {
    const baseMinutes = {
        light: { tiktok: 25, youtube: 15, instagram: 10 },
        moderate: { tiktok: 55, youtube: 35, instagram: 25 },
        heavy: { tiktok: 90, youtube: 55, instagram: 40 },
        severe: { tiktok: 150, youtube: 90, instagram: 60 },
    };

    const base = baseMinutes[scenario];
    const patterns: DailyUsagePattern[] = [];
    const today = new Date();

    // Generate past 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dateStr = date.toISOString().split('T')[0];

        // Weekend multiplier (20-40% more usage)
        const weekendMultiplier = isWeekend ? 1.3 : 1.0;

        // Day-specific variance for realism (±15%)
        const dayVariance = 0.85 + (((i * 7 + dayOfWeek) % 10) / 10) * 0.3;

        // Peak hours vary by day
        const peakHours = isWeekend
            ? ['14:00', '15:00', '21:00', '22:00', '23:00']
            : ['12:00', '21:00', '22:00', '23:00'];

        patterns.push({
            date: dateStr,
            tiktok: Math.round(base.tiktok * weekendMultiplier * dayVariance),
            youtubeShorts: Math.round(base.youtube * weekendMultiplier * dayVariance),
            instagramReels: Math.round(base.instagram * weekendMultiplier * dayVariance),
            peakHours,
        });
    }

    return patterns;
}

/**
 * Get mock screen time data for development/testing
 *
 * @param scenario - User profile scenario (default: 'moderate')
 *   - 'light': ~50 min/day (casual user)
 *   - 'moderate': ~115 min/day (average user)
 *   - 'heavy': ~185 min/day (heavy user)
 *   - 'severe': ~300 min/day (addicted user)
 *
 * Returns deterministic data based on scenario for consistent testing.
 * Data includes realistic weekly patterns with weekend spikes.
 */
export function getMockScreenTimeData(scenario: MockScenario = 'moderate'): ScreenTimeData {
    const weeklyPatterns = generateWeeklyPattern(scenario);

    // Calculate totals from daily patterns
    const totals = weeklyPatterns.reduce(
        (acc, day) => ({
            tiktok: acc.tiktok + day.tiktok,
            youtubeShorts: acc.youtubeShorts + day.youtubeShorts,
            instagramReels: acc.instagramReels + day.instagramReels,
        }),
        { tiktok: 0, youtubeShorts: 0, instagramReels: 0 }
    );

    const weeklyTotal = totals.tiktok + totals.youtubeShorts + totals.instagramReels;
    const dailyAverage = Math.round(weeklyTotal / 7);

    // Calculate open counts based on average session duration per app
    const sessionDurations = { tiktok: 3, youtubeShorts: 4, instagramReels: 2 };

    // Get most common peak hours across the week
    const allPeakHours = weeklyPatterns.flatMap((p) => p.peakHours);
    const peakHourCounts = allPeakHours.reduce(
        (acc, hour) => {
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );
    const topPeakHours = Object.entries(peakHourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => hour);

    return {
        weeklyTotal,
        dailyAverage,
        appBreakdown: [
            {
                app: 'tiktok' as const,
                weeklyMinutes: totals.tiktok,
                dailyAverage: Math.round(totals.tiktok / 7),
                openCount: Math.round(totals.tiktok / sessionDurations.tiktok / 7),
            },
            {
                app: 'youtubeShorts' as const,
                weeklyMinutes: totals.youtubeShorts,
                dailyAverage: Math.round(totals.youtubeShorts / 7),
                openCount: Math.round(totals.youtubeShorts / sessionDurations.youtubeShorts / 7),
            },
            {
                app: 'instagramReels' as const,
                weeklyMinutes: totals.instagramReels,
                dailyAverage: Math.round(totals.instagramReels / 7),
                openCount: Math.round(totals.instagramReels / sessionDurations.instagramReels / 7),
            },
        ],
        peakHours: topPeakHours,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get detailed daily breakdown for the past week
 * Useful for charts and detailed analytics views
 */
export function getMockDailyBreakdown(
    scenario: MockScenario = 'moderate'
): DailyUsagePattern[] {
    return generateWeeklyPattern(scenario);
}

export default {
    isAvailable: isScreenTimeAvailable,
    getAuthorizationStatus: getScreenTimeAuthorizationStatus,
    requestAuthorization: requestScreenTimeAuthorization,
    isAuthorized: isScreenTimeAuthorized,
    getAndroidPermissionStatus,
    openUsageStatsSettings,
    openOverlaySettings,
    getMockData: getMockScreenTimeData,
    getMockDailyBreakdown,
};
