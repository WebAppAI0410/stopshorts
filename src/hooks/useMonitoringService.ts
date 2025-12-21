/**
 * useMonitoringService Hook
 * Manages the Android background monitoring service lifecycle
 *
 * This hook automatically:
 * - Starts monitoring when onboarding is complete and permissions are granted
 * - Updates target apps when selection changes
 * - Handles platform differences (Android only, iOS stub)
 * - Listens for intervention events and records them in statistics store
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { screenTimeService, TARGET_APPS } from '../native/ScreenTimeModule';
import { useAppStore } from '../stores/useAppStore';
import { useStatisticsStore } from '../stores/useStatisticsStore';
import type { TargetAppId } from '../types';
import type { EmitterSubscription } from 'react-native';

// Map TargetAppId to Android package names
const TARGET_APP_PACKAGES: Record<TargetAppId, string[]> = {
  tiktok: TARGET_APPS.android.tiktok,
  youtubeShorts: TARGET_APPS.android.youtube,
  instagramReels: TARGET_APPS.android.instagram,
  twitter: ['com.twitter.android', 'com.twitter.android.lite'],
  facebookReels: ['com.facebook.katana', 'com.facebook.lite'],
  snapchat: ['com.snapchat.android'],
};

/**
 * Get all package names for selected apps
 */
function getPackageNamesForSelectedApps(
  selectedApps: TargetAppId[],
  customAppPackages: string[]
): string[] {
  const packages: string[] = [];

  // Add predefined app packages
  for (const appId of selectedApps) {
    const appPackages = TARGET_APP_PACKAGES[appId];
    if (appPackages) {
      packages.push(...appPackages);
    }
  }

  // Add custom app packages
  packages.push(...customAppPackages);

  // Remove duplicates
  return [...new Set(packages)];
}

export function useMonitoringService() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const selectedApps = useAppStore((state) => state.selectedApps);
  const customApps = useAppStore((state) => state.customApps);
  const interventionSettings = useAppStore((state) => state.interventionSettings);
  const recordIntervention = useStatisticsStore((state) => state.recordIntervention);

  const isMonitoringRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const interventionListenerRef = useRef<EmitterSubscription | null>(null);
  const isMountedRef = useRef(true);
  const lastSyncedSettingsRef = useRef<string | null>(null);

  // Memoize custom app package names to prevent infinite loops
  const customAppPackages = useMemo(
    () => customApps.map((app) => app.packageName),
    [customApps]
  );

  /**
   * Start monitoring service with current target apps
   */
  const startMonitoring = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      // Check permissions first
      const permissionStatus = await screenTimeService.getPermissionStatus();

      if (!permissionStatus.usageStats || !permissionStatus.overlay) {
        console.log('[MonitoringService] Missing permissions - not starting');
        return;
      }

      const packages = getPackageNamesForSelectedApps(selectedApps, customAppPackages);

      if (packages.length === 0) {
        console.log('[MonitoringService] No apps selected - not starting');
        return;
      }

      console.log('[MonitoringService] Starting with packages:', packages);
      const success = await screenTimeService.startMonitoring(packages);

      if (success) {
        isMonitoringRef.current = true;
        console.log('[MonitoringService] Started successfully');
      } else {
        console.error('[MonitoringService] Failed to start');
      }
    } catch (error) {
      console.error('[MonitoringService] Error starting:', error);
    }
  }, [selectedApps, customAppPackages]);

  /**
   * Stop monitoring service
   */
  const stopMonitoring = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      await screenTimeService.stopMonitoring();
      isMonitoringRef.current = false;
      console.log('[MonitoringService] Stopped');
    } catch (error) {
      console.error('[MonitoringService] Error stopping:', error);
    }
  }, []);

  /**
   * Update target apps while monitoring
   */
  const updateTargetApps = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (!isMonitoringRef.current) return;

    try {
      const packages = getPackageNamesForSelectedApps(selectedApps, customAppPackages);

      if (packages.length === 0) {
        console.log('[MonitoringService] No apps selected - stopping');
        await stopMonitoring();
        return;
      }

      console.log('[MonitoringService] Updating target apps:', packages);
      await screenTimeService.updateTargetApps(packages);
    } catch (error) {
      console.error('[MonitoringService] Error updating target apps:', error);
    }
  }, [selectedApps, customAppPackages, stopMonitoring]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App coming to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Check if monitoring should be running
        if (hasCompletedOnboarding && !isMonitoringRef.current) {
          const isActive = await screenTimeService.isMonitoringActive();
          if (!isActive) {
            await startMonitoring();
          } else {
            isMonitoringRef.current = true;
          }
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [hasCompletedOnboarding, startMonitoring]);

  // Start monitoring when onboarding completes
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    if (hasCompletedOnboarding) {
      // Check if already monitoring
      screenTimeService.isMonitoringActive()
        .then((isActive) => {
          if (!isActive) {
            startMonitoring();
          } else {
            isMonitoringRef.current = true;
          }
        })
        .catch((error) => {
          console.error('[MonitoringService] Error checking monitoring status:', error);
        });
    }
  }, [hasCompletedOnboarding, startMonitoring]);

  // Update target apps when selection changes
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    if (hasCompletedOnboarding && isMonitoringRef.current) {
      updateTargetApps();
    }
  }, [selectedApps, customAppPackages, hasCompletedOnboarding, updateTargetApps]);

  // Sync intervention settings to native when they change
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!hasCompletedOnboarding) return;

    const settingsKey = `${interventionSettings.timing}-${interventionSettings.delayMinutes}`;

    // Only sync if settings actually changed
    if (lastSyncedSettingsRef.current === settingsKey) return;

    const syncSettings = async () => {
      try {
        await screenTimeService.setInterventionSettings(
          interventionSettings.timing,
          interventionSettings.delayMinutes
        );
        lastSyncedSettingsRef.current = settingsKey;
        console.log('[MonitoringService] Synced intervention settings:', interventionSettings);
      } catch (error) {
        console.error('[MonitoringService] Failed to sync intervention settings:', error);
      }
    };

    syncSettings();
  }, [hasCompletedOnboarding, interventionSettings]);

  // Track mounted state for async operations
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Listen for intervention events from native module
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const setupInterventionListener = async () => {
      try {
        // Dynamic import to avoid errors on iOS
        const module = await import('@stopshorts/screen-time-android');
        const { addInterventionListener } = module;

        // Check if still mounted before setting up listener
        if (!isMountedRef.current) return;

        // Remove existing listener if any
        if (interventionListenerRef.current) {
          interventionListenerRef.current.remove();
        }

        // Add new listener
        interventionListenerRef.current = addInterventionListener((event) => {
          console.log('[MonitoringService] Intervention event received:', event);

          // Validate event structure before using
          if (event && typeof event.proceeded === 'boolean') {
            // Record intervention in statistics store with full details
            // proceeded=true means user continued to the app (less successful)
            // proceeded=false means user went back (successful intervention)
            recordIntervention({
              proceeded: event.proceeded,
              appPackage: event.appPackage || '',
              timestamp: event.timestamp || Date.now(),
            });
          } else {
            console.warn('[MonitoringService] Invalid intervention event:', event);
          }
        });

        console.log('[MonitoringService] Intervention listener set up');
      } catch (error) {
        console.warn('[MonitoringService] Failed to set up intervention listener:', error);
      }
    };

    setupInterventionListener();

    // Cleanup listener on unmount
    return () => {
      if (interventionListenerRef.current) {
        interventionListenerRef.current.remove();
        interventionListenerRef.current = null;
      }
    };
  }, [recordIntervention]);

  return {
    startMonitoring,
    stopMonitoring,
    updateTargetApps,
  };
}
