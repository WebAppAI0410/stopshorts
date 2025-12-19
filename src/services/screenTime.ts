/**
 * Screen Time Service
 *
 * Provides a high-level API for interacting with iOS Screen Time / Family Controls
 */
import ScreenTime, {
    isAvailable,
    getAuthorizationStatus,
    requestAuthorization,
    AuthorizationStatus,
    AuthorizationResult,
} from '../../modules/screen-time';

export type { AuthorizationStatus, AuthorizationResult };

/**
 * Check if Screen Time API is available on this device
 */
export function isScreenTimeAvailable(): boolean {
    return isAvailable();
}

/**
 * Get current authorization status
 */
export function getScreenTimeAuthorizationStatus(): AuthorizationStatus {
    return getAuthorizationStatus();
}

/**
 * Request Screen Time authorization from user
 * Shows the system permission dialog
 */
export async function requestScreenTimeAuthorization(): Promise<AuthorizationResult> {
    return requestAuthorization();
}

/**
 * Check if Screen Time is authorized
 */
export function isScreenTimeAuthorized(): boolean {
    const status = getAuthorizationStatus();
    return status === 'approved';
}

/**
 * Get mock screen time data for development/testing
 * TODO: Replace with real data from DeviceActivityReport extension
 */
export function getMockScreenTimeData() {
    // Simulate realistic usage patterns
    const tiktokMinutes = Math.floor(Math.random() * 60) + 60; // 60-120 min daily
    const youtubeMinutes = Math.floor(Math.random() * 45) + 30; // 30-75 min daily
    const instagramMinutes = Math.floor(Math.random() * 30) + 15; // 15-45 min daily

    const dailyAverage = tiktokMinutes + youtubeMinutes + instagramMinutes;
    const weeklyTotal = dailyAverage * 7;

    return {
        weeklyTotal,
        dailyAverage,
        appBreakdown: [
            {
                app: 'tiktok' as const,
                weeklyMinutes: tiktokMinutes * 7,
                dailyAverage: tiktokMinutes,
                openCount: Math.floor(tiktokMinutes / 3), // Estimate ~3 min per session
            },
            {
                app: 'youtubeShorts' as const,
                weeklyMinutes: youtubeMinutes * 7,
                dailyAverage: youtubeMinutes,
                openCount: Math.floor(youtubeMinutes / 4),
            },
            {
                app: 'instagramReels' as const,
                weeklyMinutes: instagramMinutes * 7,
                dailyAverage: instagramMinutes,
                openCount: Math.floor(instagramMinutes / 2),
            },
        ],
        peakHours: ['21:00', '22:00', '23:00'], // Evening usage peak
        lastUpdated: new Date().toISOString(),
    };
}

export default {
    isAvailable: isScreenTimeAvailable,
    getAuthorizationStatus: getScreenTimeAuthorizationStatus,
    requestAuthorization: requestScreenTimeAuthorization,
    isAuthorized: isScreenTimeAuthorized,
    getMockData: getMockScreenTimeData,
};
