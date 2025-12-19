// User Purpose Types
export type UserPurpose = 'sleep' | 'study' | 'work' | 'creative' | 'mental' | 'other';

// Managed App Types
export type ManagedApp = 'tiktok' | 'youtubeShorts' | 'instagramReels';

// Implementation Intent Types
export type IntentType = 'breathe' | 'stretch' | 'water' | 'checklist' | 'custom';

export interface ImplementationIntentConfig {
  type: IntentType;
  customText?: string;
}

// Addiction Severity Assessment
export type AddictionLevel = 'light' | 'moderate' | 'heavy' | 'severe';

export interface AddictionAssessment {
  dailyViewingHours: number;       // Average daily viewing hours
  dailyOpenCount: number;          // Times app is opened per day
  difficultyLevel: 1 | 2 | 3 | 4 | 5;  // 1=easy to stop, 5=very difficult
  calculatedLevel: AddictionLevel;
}

// Purpose-specific details
export interface PurposeDetails {
  // Sleep purpose
  targetBedtime?: string;          // HH:mm format
  targetWakeTime?: string;         // HH:mm format
  sleepIssues?: string[];          // 'falling_asleep' | 'waking_up' | 'quality'

  // Study purpose
  studyGoal?: 'exam' | 'certification' | 'self_study' | 'language';
  studySchedule?: 'morning' | 'afternoon' | 'evening' | 'night';

  // Work purpose
  workStyle?: 'office' | 'remote' | 'hybrid' | 'freelance';
  peakHours?: string[];            // Array of hour ranges

  // Creative purpose
  creativeField?: 'writing' | 'art' | 'music' | 'video' | 'coding' | 'other';
  creativeCustomField?: string;

  // Mental health purpose
  concernTimes?: 'morning' | 'afternoon' | 'evening' | 'night' | 'random';
  stressLevel?: 1 | 2 | 3 | 4 | 5;
}

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

  // Personalization
  addictionAssessment: AddictionAssessment | null;
  purposeDetails: PurposeDetails | null;

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

  // Implementation Intent
  implementationIntent: ImplementationIntentConfig | null;
  dailyGoalMinutes: number;
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

// Usage Assessment (New Feature v2)
export type UsageDuration = '1month' | '6months' | '1year' | '2years' | '3years+';
export type PeakUsageTime = 'morning' | 'afternoon' | 'evening' | 'night' | 'random';
export type QuitAttempts = 'never' | 'once' | 'few' | 'many';

export interface UsageAssessment {
  dailyUsageHours: number;
  dailyOpenCount: number;
  quitAttempts: QuitAttempts;
  peakUsageTime: PeakUsageTime;
  usageDuration: UsageDuration;
}

// Lifetime Impact Calculation
export interface LifetimeImpact {
  yearlyLostHours: number;
  lifetimeLostYears: number;
  equivalents: {
    books: number;
    movies: number;
    skills: string[];
    travels: number;
  };
}

// Alternative Goal Setting
export type AlternativeActivity =
  | 'reading'
  | 'exercise'
  | 'meditation'
  | 'learning'
  | 'hobby'
  | 'social'
  | 'sleep'
  | 'work'
  | 'custom';

export interface AlternativeGoal {
  activity: AlternativeActivity;
  customActivity?: string;
  weeklyTargetMinutes: number;
  specificGoal?: string;
}

// Daily Check-in
export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  didAlternativeActivity: boolean;
  activityNote?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  reflection?: string;
}

// Pricing Plan Types (updated for 3-day trial)
export type PricingPlanId = 'trial_3day' | 'monthly' | 'quarterly' | 'annual';

export interface PricingPlan {
  id: PricingPlanId;
  name: string;
  price: number;
  currency: string;
  periodDays: number;
  features: string[];
  isDefault?: boolean;
  savings?: number; // percentage
}
