import { NativeModule, requireNativeModule } from 'expo-modules-core';
import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';

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
const ScreenTimeAndroidModule = requireNativeModule<ScreenTimeAndroidModuleType>('ScreenTimeAndroid');

// Create event emitter for the module (using React Native's NativeEventEmitter)
let emitter: NativeEventEmitter | null = null;

function getEmitter(): NativeEventEmitter {
  if (!emitter) {
    // For Expo modules, use the module directly as the native module
    emitter = new NativeEventEmitter(NativeModules.ScreenTimeAndroid || ScreenTimeAndroidModule as any);
  }
  return emitter;
}

/**
 * Add listener for intervention events from the overlay
 * @param listener Callback function that receives InterventionEvent
 * @returns Subscription that can be used to remove the listener
 */
export function addInterventionListener(listener: (event: InterventionEvent) => void): EmitterSubscription {
  return getEmitter().addListener('onIntervention', listener);
}

export default ScreenTimeAndroidModule;
