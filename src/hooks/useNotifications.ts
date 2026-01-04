/**
 * useNotifications Hook
 * Manages notification setup and listeners for StopShorts
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  requestNotificationPermissions,
  addNotificationResponseListener,
  sendAIProposalNotification,
  checkHighFrequency,
} from '../services/notifications';
import { useStatisticsStore } from '../stores/useStatisticsStore';

// Track if we've already sent a high frequency notification recently
// to avoid spamming the user
const HIGH_FREQUENCY_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Hook to initialize notifications and listen for taps
 * Should be called once at app root level
 */
export function useNotifications(): void {
  const lastHighFrequencyNotificationRef = useRef<number>(0);
  const interventionHistory = useStatisticsStore((state) => state.interventionHistory);

  // Setup notification permissions and response listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    // Request permissions on mount
    requestNotificationPermissions();

    // Add listener for notification taps
    const subscription = addNotificationResponseListener();

    return () => {
      subscription.remove();
    };
  }, []);

  // Check for high frequency attempts when intervention history changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const now = Date.now();
    const cooldownElapsed = now - lastHighFrequencyNotificationRef.current > HIGH_FREQUENCY_COOLDOWN_MS;

    if (cooldownElapsed && checkHighFrequency(interventionHistory)) {
      lastHighFrequencyNotificationRef.current = now;
      sendAIProposalNotification();

      if (__DEV__) {
        console.log('[useNotifications] High frequency detected, sending AI proposal');
      }
    }
  }, [interventionHistory]);
}

/**
 * Hook to check and send high frequency notification
 * Can be called from intervention components
 * @returns Function to trigger high frequency check
 */
export function useHighFrequencyCheck(): () => Promise<void> {
  const lastNotificationRef = useRef<number>(0);
  const interventionHistory = useStatisticsStore((state) => state.interventionHistory);

  return async () => {
    if (Platform.OS === 'web') {
      return;
    }

    const now = Date.now();
    const cooldownElapsed = now - lastNotificationRef.current > HIGH_FREQUENCY_COOLDOWN_MS;

    if (cooldownElapsed && checkHighFrequency(interventionHistory)) {
      lastNotificationRef.current = now;
      await sendAIProposalNotification();

      if (__DEV__) {
        console.log('[useHighFrequencyCheck] High frequency detected, notification sent');
      }
    }
  };
}
