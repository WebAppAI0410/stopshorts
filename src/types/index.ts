// User Purpose Types
export type UserPurpose = 'sleep' | 'study' | 'work' | 'creative' | 'mental';

// Managed App Types
export type ManagedApp = 'tiktok' | 'youtubeShorts' | 'instagramReels';

// Subscription Types
export type SubscriptionPlan = 'free' | 'trial' | 'monthly' | 'quarterly' | 'annual';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

// Sleep Profile
export interface SleepProfile {
  bedtime: string; // HH:mm format
  wakeTime: string; // HH:mm format
}

// Warning Level for time-based coaching
export type WarningLevel = 'low' | 'medium' | 'high' | 'critical';

// User State
export interface UserState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  purpose: UserPurpose | null;

  // Apps
  managedApps: ManagedApp[];

  // Sleep Profile
  sleepProfile: SleepProfile;

  // Subscription
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null; // ISO date string
  trialStartDate: string | null; // ISO date string

  // Settings
  interventionDurationMinutes: number;
}

// App Statistics Entry
export interface AppStats {
  interventionCount: number;
  blockedMinutes: number;
}

// Statistics
export interface DailyStats {
  date: string; // YYYY-MM-DD
  interventionCount: number;
  totalBlockedMinutes: number;
  apps: Partial<Record<ManagedApp, AppStats>>;
}

// Coaching Context
export interface CoachingContext {
  warningLevel: WarningLevel;
  message: string;
  suggestedThresholdMinutes: number;
  uiHints: {
    useWarmColors: boolean;
    showWarningIcon: boolean;
    emphasizeSleep: boolean;
  };
}
