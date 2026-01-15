import { Platform } from 'expo-modules-core';

// MARK: - Types

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

export interface SelectionSummary {
    applicationCount: number;
    categoryCount: number;
    webDomainCount: number;
    isEmpty: boolean;
    totalCount: number;
}

export interface InterventionSettings {
    timing: 'immediate' | 'delayed';
    delayMinutes: number;
}

export interface EstimatedUsage {
    thresholdCount: number;
    estimatedMinutes: number;
    accuracy: string;
    note: string;
}

export interface InterventionEvent {
    action: string;
    proceeded: boolean;
    appToken: string;
    timestamp: number;
}

export interface ShieldResult {
    success: boolean;
    error?: string;
}

export interface FamilyActivityPickerOptions {
    headerText?: string;
    footerText?: string;
}

export interface FamilyActivityPickerResult {
    success: boolean;
    applicationCount?: number;
    categoryCount?: number;
    webDomainCount?: number;
    isEmpty?: boolean;
    error?: string;
}

export interface ScreenTimeModuleType {
    // Availability
    isAvailable(): boolean;

    // Authorization
    getAuthorizationStatus(): AuthorizationStatus;
    requestAuthorization(): Promise<AuthorizationResult>;

    // App Selection
    getShortVideoAppIdentifiers(): string[];
    hasSelectedApps(): boolean;
    getSelectionSummary(): SelectionSummary;
    clearSelection(): Promise<boolean>;
    presentFamilyActivityPicker(options?: FamilyActivityPickerOptions): Promise<FamilyActivityPickerResult>;

    // Shield Management
    clearAllShields(): Promise<boolean>;
    applyShields(): Promise<ShieldResult>;

    // Intervention Settings
    setInterventionSettings(timing: string, delayMinutes: number): boolean;
    getInterventionSettings(): InterventionSettings;

    // Usage Statistics
    getEstimatedUsage(): EstimatedUsage;

    // Urge Surfing
    consumeUrgeSurfingRequest(): boolean;
    hasUrgeSurfingRequest(): boolean;

    // Intervention Events
    pollInterventionEvents(): InterventionEvent[];

    // Monitoring State
    isMonitoringActive(): boolean;

    // Shield Cooldown
    isInShieldCooldown(): boolean;
    setShieldCooldown(seconds: number): void;

    // Debug
    debugPrintAppGroupsValues(): void;
}

// MARK: - Module Initialization

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
        console.log('[ScreenTime] Native module not available - using fallback mode');
        ScreenTimeModule = null;
    }
}

// MARK: - Availability

/**
 * Check if Screen Time API is available on this device
 * Requires iOS 15+
 */
export function isAvailable(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.isAvailable();
}

// MARK: - Authorization

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

// MARK: - App Selection

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
 * Get summary of selected apps
 */
export function getSelectionSummary(): SelectionSummary {
    if (!ScreenTimeModule) {
        return {
            applicationCount: 0,
            categoryCount: 0,
            webDomainCount: 0,
            isEmpty: true,
            totalCount: 0,
        };
    }
    return ScreenTimeModule.getSelectionSummary();
}

/**
 * Clear saved app selection
 */
export async function clearSelection(): Promise<boolean> {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.clearSelection();
}

/**
 * Present the FamilyActivityPicker to select apps to monitor
 * Selection is automatically saved to App Groups for use by extensions
 */
export async function presentFamilyActivityPicker(
    options?: FamilyActivityPickerOptions
): Promise<FamilyActivityPickerResult> {
    if (!ScreenTimeModule) {
        return {
            success: false,
            error: 'Screen Time API is only available on iOS 15+',
        };
    }
    return ScreenTimeModule.presentFamilyActivityPicker(options);
}

// MARK: - Shield Management

/**
 * Clear all app shields/blocks
 */
export async function clearAllShields(): Promise<boolean> {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.clearAllShields();
}

/**
 * Apply shields to selected apps
 */
export async function applyShields(): Promise<ShieldResult> {
    if (!ScreenTimeModule) {
        return {
            success: false,
            error: 'Screen Time API is only available on iOS 15+',
        };
    }
    return ScreenTimeModule.applyShields();
}

// MARK: - Intervention Settings

/**
 * Set intervention settings (timing mode and delay)
 * @param timing - "immediate" or "delayed"
 * @param delayMinutes - 5, 10, or 15 minutes
 */
export function setInterventionSettings(
    timing: 'immediate' | 'delayed',
    delayMinutes: number
): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.setInterventionSettings(timing, delayMinutes);
}

/**
 * Get current intervention settings
 */
export function getInterventionSettings(): InterventionSettings {
    if (!ScreenTimeModule) {
        return { timing: 'immediate', delayMinutes: 5 };
    }
    return ScreenTimeModule.getInterventionSettings();
}

// MARK: - Usage Statistics

/**
 * Get estimated usage for today (based on threshold counts)
 * Note: iOS cannot directly query usage stats like Android.
 * This returns an estimate based on 5-minute threshold intervals.
 */
export function getEstimatedUsage(): EstimatedUsage {
    if (!ScreenTimeModule) {
        return {
            thresholdCount: 0,
            estimatedMinutes: 0,
            accuracy: '5 minutes',
            note: 'Screen Time API not available',
        };
    }
    return ScreenTimeModule.getEstimatedUsage();
}

// MARK: - Urge Surfing

/**
 * Consume urge surfing request flag
 * Called when app becomes active to check if Shield requested urge surfing
 * @returns true if request was pending (and is now cleared)
 */
export function consumeUrgeSurfingRequest(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.consumeUrgeSurfingRequest();
}

/**
 * Check if urge surfing was requested (without consuming)
 */
export function hasUrgeSurfingRequest(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.hasUrgeSurfingRequest();
}

// MARK: - Intervention Events

/**
 * Poll and consume pending intervention events
 * These are events recorded by the ShieldAction extension
 */
export function pollInterventionEvents(): InterventionEvent[] {
    if (!ScreenTimeModule) return [];
    return ScreenTimeModule.pollInterventionEvents();
}

// MARK: - Monitoring State

/**
 * Check if monitoring is currently active
 */
export function isMonitoringActive(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.isMonitoringActive();
}

// MARK: - Shield Cooldown

/**
 * Check if shield is in cooldown period
 */
export function isInShieldCooldown(): boolean {
    if (!ScreenTimeModule) return false;
    return ScreenTimeModule.isInShieldCooldown();
}

/**
 * Set shield cooldown (in seconds)
 */
export function setShieldCooldown(seconds: number): void {
    if (!ScreenTimeModule) return;
    ScreenTimeModule.setShieldCooldown(seconds);
}

// MARK: - Debug

/**
 * Print all App Groups values for debugging
 */
export function debugPrintAppGroupsValues(): void {
    if (!ScreenTimeModule) {
        console.log('[ScreenTime] Native module not available');
        return;
    }
    ScreenTimeModule.debugPrintAppGroupsValues();
}

// MARK: - Default Export

export default {
    isAvailable,
    getAuthorizationStatus,
    requestAuthorization,
    getShortVideoAppIdentifiers,
    hasSelectedApps,
    getSelectionSummary,
    clearSelection,
    presentFamilyActivityPicker,
    clearAllShields,
    applyShields,
    setInterventionSettings,
    getInterventionSettings,
    getEstimatedUsage,
    consumeUrgeSurfingRequest,
    hasUrgeSurfingRequest,
    pollInterventionEvents,
    isMonitoringActive,
    isInShieldCooldown,
    setShieldCooldown,
    debugPrintAppGroupsValues,
};
