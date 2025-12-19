import { Platform } from 'expo-modules-core';

// Types
export type AuthorizationStatus =
    | 'notDetermined'
    | 'denied'
    | 'approved'
    | 'unavailable'
    | 'unknown';

export interface AuthorizationResult {
    success: boolean;
    status: AuthorizationStatus;
    error?: string;
}

export interface ScreenTimeModuleType {
    isAvailable(): boolean;
    getAuthorizationStatus(): AuthorizationStatus;
    requestAuthorization(): Promise<AuthorizationResult>;
    getShortVideoAppIdentifiers(): string[];
    hasSelectedApps(): boolean;
    clearAllShields(): Promise<boolean>;
}

// Get the native module (only available on iOS with development build)
// Returns null in Expo Go since custom native modules are not supported
let ScreenTimeModule: ScreenTimeModuleType | null = null;

if (Platform.OS === 'ios') {
    try {
        // Dynamic import to avoid crash in Expo Go
        const { requireNativeModule } = require('expo-modules-core');
        ScreenTimeModule = requireNativeModule('ScreenTime');
    } catch {
        // Native module not available (Expo Go or module not linked)
        console.log('[ScreenTime] Native module not available - using mock mode');
        ScreenTimeModule = null;
    }
}

/**
 * Check if Screen Time API is available on this device
 * Requires iOS 15+
 */
export function isAvailable(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.isAvailable();
}

/**
 * Get current Family Controls authorization status
 */
export function getAuthorizationStatus(): AuthorizationStatus {
    if (!ScreenTimeModule) return 'unavailable';
    return ScreenTimeModule.getAuthorizationStatus();
}

/**
 * Request Family Controls authorization from the user
 * Shows system permission dialog
 */
export async function requestAuthorization(): Promise<AuthorizationResult> {
    if (!ScreenTimeModule) {
        return {
            success: false,
            status: 'unavailable',
            error: 'Screen Time API is only available on iOS 15+',
        };
    }
    return ScreenTimeModule.requestAuthorization();
}

/**
 * Get bundle identifiers for short-video apps we want to monitor
 */
export function getShortVideoAppIdentifiers(): string[] {
    if (!ScreenTimeModule) return [];
    return ScreenTimeModule.getShortVideoAppIdentifiers();
}

/**
 * Check if user has selected any apps to monitor
 */
export function hasSelectedApps(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.hasSelectedApps();
}

/**
 * Clear all app shields/blocks
 */
export async function clearAllShields(): Promise<boolean> {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.clearAllShields();
}

export default {
    isAvailable,
    getAuthorizationStatus,
    requestAuthorization,
    getShortVideoAppIdentifiers,
    hasSelectedApps,
    clearAllShields,
};
