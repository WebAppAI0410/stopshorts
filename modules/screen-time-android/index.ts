import { NativeModule, requireNativeModule } from 'expo-modules-core';
import { Platform, NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';

export interface PermissionStatus {
  usageStats: boolean;
  overlay: boolean;
  notifications: boolean;
}

export interface UsageData {
  packageName: string;
  appName: string;
  totalTimeMs: number;
  lastUsed: number;
}

/**
 * Installed app information returned by getInstalledApps
 */
export interface InstalledAppInfo {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  category: string;
}

/**
 * Intervention event data emitted when user interacts with overlay
 */
export interface InterventionEvent {
  proceeded: boolean;       // true if user chose to continue, false if they went back
  appPackage: string;       // Package name of the detected app
  timestamp: number;        // Event timestamp in milliseconds
}

/**
 * Intervention settings for Android
 */
export interface InterventionSettings {
  timing: 'immediate' | 'delayed';
  delayMinutes: 5 | 10 | 15;
}

interface ScreenTimeAndroidModuleType extends NativeModule {
  getPermissionStatus(): Promise<PermissionStatus>;
  openUsageStatsSettings(): Promise<void>;
  openOverlaySettings(): Promise<void>;
  hasUsageStatsPermission(): Promise<boolean>;
  hasOverlayPermission(): Promise<boolean>;
  getUsageStats(startTime: number, endTime: number, packageNames: string[]): Promise<UsageData[]>;
  getTodayUsage(packageNames: string[]): Promise<UsageData[]>;
  getCurrentForegroundApp(): Promise<string | null>;
  // Installed Apps Functions
  getInstalledApps(): Promise<InstalledAppInfo[]>;
  getAppIcon(packageName: string): Promise<string | null>;
  getAppName(packageName: string): Promise<string>;
  isAppInstalled(packageName: string): Promise<boolean>;
  // Monitoring Service Control Functions
  startMonitoring(packageNames: string[]): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  updateTargetApps(packageNames: string[]): Promise<boolean>;
  isMonitoringActive(): Promise<boolean>;
  // Intervention Settings Functions
  setInterventionSettings(timing: string, delayMinutes: number): Promise<boolean>;
  getInterventionSettings(): Promise<InterventionSettings>;
}

// This call loads the native module object from the JSI.
// Only available on Android - will throw on other platforms
let ScreenTimeAndroidModule: ScreenTimeAndroidModuleType | null = null;

if (Platform.OS === 'android') {
  try {
    ScreenTimeAndroidModule = requireNativeModule<ScreenTimeAndroidModuleType>('ScreenTimeAndroid');
  } catch (e) {
    console.warn('[ScreenTimeAndroid] Native module not available:', e);
  }
}

// Create event emitter for the module
// For Expo modules, we need to use NativeEventEmitter with the native module
let emitter: NativeEventEmitter | null = null;

function getEmitter(): NativeEventEmitter | null {
  if (!ScreenTimeAndroidModule) {
    return null;
  }
  if (!emitter) {
    // NativeEventEmitter requires a native module that implements addListener/removeListeners
    // Expo modules expose this through NativeModules bridge
    const nativeModule = NativeModules.ScreenTimeAndroid ?? ScreenTimeAndroidModule;
    emitter = new NativeEventEmitter(nativeModule as any);
  }
  return emitter;
}

/**
 * No-op subscription for non-Android platforms
 */
const noOpSubscription: EmitterSubscription = {
  remove: () => {},
} as EmitterSubscription;

/**
 * Add listener for intervention events from the overlay
 * @param listener Callback function that receives InterventionEvent
 * @returns Subscription that can be used to remove the listener, or a no-op subscription if not on Android
 */
export function addInterventionListener(listener: (event: InterventionEvent) => void): EmitterSubscription {
  const eventEmitter = getEmitter();
  if (!eventEmitter) {
    // Return a no-op subscription for non-Android platforms
    return noOpSubscription;
  }
  return eventEmitter.addListener('onIntervention', listener);
}

/**
 * Check if ScreenTimeAndroid native module is available.
 * Use this before calling module methods to ensure null safety.
 * @returns true if on Android and module loaded successfully
 */
export function isScreenTimeAndroidAvailable(): boolean {
  return Platform.OS === 'android' && ScreenTimeAndroidModule !== null;
}

/**
 * Get the ScreenTimeAndroid module with type narrowing.
 * Throws an error if module is not available.
 * Use isScreenTimeAndroidAvailable() first to check availability.
 * @throws Error if not on Android or module failed to load
 */
export function getScreenTimeAndroidModule(): ScreenTimeAndroidModuleType {
  if (!ScreenTimeAndroidModule) {
    throw new Error(
      '[ScreenTimeAndroid] Module not available. ' +
      'Ensure you are on Android and the module is properly linked.'
    );
  }
  return ScreenTimeAndroidModule;
}

export default ScreenTimeAndroidModule;
