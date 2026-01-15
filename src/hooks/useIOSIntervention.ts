/**
 * useIOSIntervention Hook
 * Handles iOS-specific intervention flow detection
 *
 * This hook:
 * - Checks for urge surfing requests when app becomes active
 * - Polls for intervention events from Shield extensions
 * - Records intervention events in statistics store
 * - Navigates to urge surfing screen when requested
 */

import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { screenTimeService } from '../native/ScreenTimeModule';
import { useStatisticsStore } from '../stores/useStatisticsStore';
import { useAppStore } from '../stores/useAppStore';

// Polling interval for intervention events (1 second)
const POLL_INTERVAL_MS = 1000;

export function useIOSIntervention() {
  const router = useRouter();
  const recordIntervention = useStatisticsStore((state) => state.recordIntervention);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  const appStateRef = useRef(AppState.currentState);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Check if urge surfing was requested from Shield and navigate
   */
  const checkUrgeSurfingRequest = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    if (!isMountedRef.current) return;

    try {
      const requested = screenTimeService.consumeUrgeSurfingRequest();
      if (requested) {
        console.log('[IOSIntervention] Urge surfing requested, navigating...');
        router.push('/urge-surfing');
      }
    } catch (error) {
      console.error('[IOSIntervention] Error checking urge surfing request:', error);
    }
  }, [router]);

  /**
   * Poll for intervention events from Shield extensions
   */
  const pollInterventionEvents = useCallback(() => {
    if (Platform.OS !== 'ios') return;
    if (!isMountedRef.current) return;

    try {
      const events = screenTimeService.pollInterventionEvents();

      for (const event of events) {
        console.log('[IOSIntervention] Intervention event:', event);

        // Record intervention in statistics store
        recordIntervention({
          proceeded: event.proceeded,
          type: 'friction',
          appPackage: event.appToken || '',
          timestamp: event.timestamp || Date.now(),
        });
      }
    } catch (error) {
      console.error('[IOSIntervention] Error polling intervention events:', error);
    }
  }, [recordIntervention]);

  /**
   * Start polling for intervention events
   */
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return; // Already polling

    pollIntervalRef.current = setInterval(pollInterventionEvents, POLL_INTERVAL_MS);
    console.log('[IOSIntervention] Started polling for intervention events');
  }, [pollInterventionEvents]);

  /**
   * Stop polling for intervention events
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log('[IOSIntervention] Stopped polling for intervention events');
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!hasCompletedOnboarding) return;

    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App coming to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[IOSIntervention] App became active, checking for urge surfing request');
        await checkUrgeSurfingRequest();
        startPolling();
      }

      // App going to background
      if (nextAppState === 'background') {
        stopPolling();
      }

      appStateRef.current = nextAppState;
    });

    // Initial check when hook mounts
    if (AppState.currentState === 'active') {
      checkUrgeSurfingRequest();
      startPolling();
    }

    return () => {
      subscription.remove();
      stopPolling();
    };
  }, [hasCompletedOnboarding, checkUrgeSurfingRequest, startPolling, stopPolling]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    checkUrgeSurfingRequest,
  };
}
