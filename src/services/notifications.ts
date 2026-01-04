/**
 * Notification Service for StopShorts
 * Handles local notifications for AI conversation triggers
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import type { InterventionRecord } from '../stores/useStatisticsStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Notification data types
export interface NotificationData {
  screen?: string;
  type?: 'high_frequency' | 'success_celebration' | 'daily_checkin';
  [key: string]: unknown;
}

/**
 * Request notification permissions
 * @returns true if permissions granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) {
      console.log('[Notifications] Permission not granted');
    }
    return false;
  }

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('ai-coach', {
      name: 'AIコーチ',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C65D3B',
    });
  }

  return true;
}

/**
 * Check if high frequency intervention attempts detected
 * @param interventionHistory - Array of intervention records
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @param threshold - Number of attempts to trigger (default: 3)
 * @returns true if high frequency detected
 */
export function checkHighFrequency(
  interventionHistory: InterventionRecord[],
  windowMs: number = 60 * 60 * 1000,
  threshold: number = 3
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const recentAttempts = interventionHistory.filter(
    (record) => record.timestamp > windowStart
  );

  return recentAttempts.length >= threshold;
}

/**
 * Send AI proposal notification when high frequency detected
 */
export async function sendAIProposalNotification(): Promise<string | undefined> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AIコーチからの提案',
        body: '最近よく頑張っていますね。少し話しませんか？',
        data: { screen: 'ai', type: 'high_frequency' } as NotificationData,
        sound: true,
      },
      trigger: null, // Immediate notification
    });

    if (__DEV__) {
      console.log('[Notifications] AI proposal notification sent:', identifier);
    }

    return identifier;
  } catch (error) {
    if (__DEV__) {
      console.error('[Notifications] Failed to send AI proposal:', error);
    }
    return undefined;
  }
}

/**
 * Send celebration notification for successful long block
 * @param savedMinutes - Minutes saved from blocking
 */
export async function sendSuccessCelebrationNotification(
  savedMinutes: number
): Promise<string | undefined> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '素晴らしい！',
        body: `今日は${savedMinutes}分の時間を取り戻しました。この調子で続けましょう！`,
        data: { screen: 'stats', type: 'success_celebration' } as NotificationData,
        sound: true,
      },
      trigger: null,
    });

    if (__DEV__) {
      console.log('[Notifications] Success celebration sent:', identifier);
    }

    return identifier;
  } catch (error) {
    if (__DEV__) {
      console.error('[Notifications] Failed to send celebration:', error);
    }
    return undefined;
  }
}

/**
 * Schedule daily check-in notification
 * @param hour - Hour to send notification (default: 20 = 8PM)
 * @param minute - Minute to send notification (default: 0)
 */
export async function scheduleDailyCheckinNotification(
  hour: number = 20,
  minute: number = 0
): Promise<string | undefined> {
  try {
    // Cancel existing daily check-in notifications
    await cancelDailyCheckinNotification();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '今日の振り返り',
        body: '今日一日どうでしたか？AIコーチと話してみませんか？',
        data: { screen: 'ai', type: 'daily_checkin' } as NotificationData,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    if (__DEV__) {
      console.log('[Notifications] Daily check-in scheduled:', identifier);
    }

    return identifier;
  } catch (error) {
    if (__DEV__) {
      console.error('[Notifications] Failed to schedule daily check-in:', error);
    }
    return undefined;
  }
}

/**
 * Cancel daily check-in notification
 */
export async function cancelDailyCheckinNotification(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      const data = notification.content.data as NotificationData | undefined;
      if (data?.type === 'daily_checkin') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Notifications] Failed to cancel daily check-in:', error);
    }
  }
}

/**
 * Handle notification response (when user taps notification)
 * @param response - Notification response
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const data = response.notification.request.content.data as NotificationData | undefined;

  if (__DEV__) {
    console.log('[Notifications] Response received:', data);
  }

  if (data?.screen) {
    // Navigate to the appropriate screen
    switch (data.screen) {
      case 'ai':
        router.push('/(main)/intervention/ai');
        break;
      case 'stats':
        router.push('/(main)/stats');
        break;
      default:
        if (__DEV__) {
          console.log('[Notifications] Unknown screen:', data.screen);
        }
    }
  }
}

/**
 * Add notification response listener
 * @returns Subscription object for cleanup
 */
export function addNotificationResponseListener(): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
