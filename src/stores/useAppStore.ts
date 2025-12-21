import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type UserPurpose,
  type ManagedApp,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type SleepProfile,
  type DailyStats,
  type ImplementationIntentConfig,
  type AddictionAssessment,
  type PurposeDetails,
  type UsageAssessment,
  type LifetimeImpact,
  type AlternativeGoal,
  type AlternativeActivity,
  type DailyCheckIn,
  type PricingPlanId,
  // New onboarding types
  type MotivationType,
  type ScreenTimeData,
  type IfThenPlan,
  type OnboardingCommitment,
  // App selection types
  type GoalType,
  type TargetAppId,
  type CustomApp,
  // Intervention settings
  type InterventionSettings,
  // Mapping functions
  goalTypeToPurpose,
} from '../types';

interface AppState {
  // User State
  userName: string | null;
  hasCompletedOnboarding: boolean;
  purpose: UserPurpose | null;
  addictionAssessment: AddictionAssessment | null;
  purposeDetails: PurposeDetails | null;
  managedApps: ManagedApp[];
  sleepProfile: SleepProfile;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
  trialStartDate: string | null;
  interventionDurationMinutes: number;
  implementationIntent: ImplementationIntentConfig | null;
  dailyGoalMinutes: number;

  // New Feature v2 State
  usageAssessment: UsageAssessment | null;
  lifetimeImpact: LifetimeImpact | null;
  alternativeGoals: AlternativeGoal[];
  checkIns: DailyCheckIn[];
  selectedPricingPlan: PricingPlanId | null;
  hasCompletedTutorial: boolean;

  // New Onboarding v3 State
  motivation: MotivationType | null;
  screenTimeData: ScreenTimeData | null;
  hasScreenTimePermission: boolean;
  alternativeActivity: AlternativeActivity | null;
  customAlternativeActivity: string | null;
  ifThenPlan: IfThenPlan | null;
  onboardingCommitment: OnboardingCommitment | null;

  // App Selection State
  selectedApps: TargetAppId[];
  goal: GoalType | null;

  // Custom Apps State (Android only - iOS pending Family Controls Entitlement)
  customApps: CustomApp[];

  // Baseline for metrics comparison (saved during onboarding)
  baselineMonthlyMinutes: number | null;

  // Intervention Settings (Android only)
  interventionSettings: InterventionSettings;

  // Statistics
  stats: DailyStats[];

  // Actions
  setUserName: (name: string) => void;
  setOnboardingComplete: () => void;
  setPurpose: (purpose: UserPurpose) => void;
  setAddictionAssessment: (assessment: AddictionAssessment) => void;
  setPurposeDetails: (details: PurposeDetails) => void;
  setManagedApps: (apps: ManagedApp[]) => void;
  setSleepProfile: (profile: SleepProfile) => void;
  setSubscription: (
    plan: SubscriptionPlan,
    status: SubscriptionStatus,
    expiry: string | null
  ) => void;
  startTrial: () => void;
  setInterventionDuration: (minutes: number) => void;
  setImplementationIntent: (intent: ImplementationIntentConfig) => void;
  setDailyGoal: (minutes: number) => void;
  recordIntervention: (app: ManagedApp) => void;
  reset: () => void;

  // New Feature v2 Actions
  setUsageAssessment: (assessment: UsageAssessment) => void;
  setLifetimeImpact: (impact: LifetimeImpact) => void;
  setAlternativeGoals: (goals: AlternativeGoal[]) => void;
  addCheckIn: (checkIn: DailyCheckIn) => void;
  setSelectedPricingPlan: (planId: PricingPlanId) => void;
  setTutorialComplete: () => void;
  calculateLifetimeImpact: (assessment: UsageAssessment) => LifetimeImpact;

  // New Onboarding v3 Actions
  setMotivation: (motivation: MotivationType) => void;
  setScreenTimeData: (data: ScreenTimeData) => void;
  setScreenTimePermission: (hasPermission: boolean) => void;
  setAlternativeActivity: (activity: AlternativeActivity, custom?: string) => void;
  setIfThenPlan: (plan: IfThenPlan) => void;
  completeOnboarding: () => void;
  calculateImpactFromScreenTime: (data: ScreenTimeData) => LifetimeImpact;
  calculateImpactFromManualInput: (dailyHours: number) => LifetimeImpact;

  // App Selection Actions
  setSelectedApps: (apps: TargetAppId[]) => void;
  setGoal: (goal: GoalType) => void;

  // Custom Apps Actions (Android only - iOS pending Family Controls Entitlement)
  addCustomApp: (app: Omit<CustomApp, 'addedAt'>) => void;
  removeCustomApp: (packageName: string) => void;
  getCustomAppPackages: () => string[];

  // Subscription Actions
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;

  // Baseline & Intervention Actions
  setBaselineMonthlyMinutes: (minutes: number) => void;
  setInterventionSettings: (settings: Partial<InterventionSettings>) => void;
}

const initialState = {
  userName: null,
  hasCompletedOnboarding: false,
  purpose: null,
  addictionAssessment: null,
  purposeDetails: null,
  managedApps: [],
  sleepProfile: {
    bedtime: '23:00',
    wakeTime: '07:00',
  },
  subscriptionPlan: 'free' as SubscriptionPlan,
  subscriptionStatus: 'active' as SubscriptionStatus,
  subscriptionExpiry: null,
  trialStartDate: null,
  interventionDurationMinutes: 5,
  implementationIntent: null,
  dailyGoalMinutes: 60,
  stats: [],
  // New Feature v2 initial state
  usageAssessment: null,
  lifetimeImpact: null,
  alternativeGoals: [],
  checkIns: [],
  selectedPricingPlan: null,
  hasCompletedTutorial: false,
  // New Onboarding v3 initial state
  motivation: null,
  screenTimeData: null,
  hasScreenTimePermission: false,
  alternativeActivity: null,
  customAlternativeActivity: null,
  ifThenPlan: null,
  onboardingCommitment: null,
  // App Selection initial state
  selectedApps: ['tiktok', 'youtubeShorts', 'instagramReels'] as TargetAppId[],
  goal: null,
  // Custom Apps initial state (Android only - iOS pending Family Controls Entitlement)
  customApps: [] as CustomApp[],
  // Baseline for metrics comparison
  baselineMonthlyMinutes: null as number | null,
  // Intervention settings (Android only)
  interventionSettings: {
    timing: 'immediate',
    delayMinutes: 5,
  } as InterventionSettings,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserName: (name) =>
        set({ userName: name }),

      setOnboardingComplete: () =>
        set({ hasCompletedOnboarding: true }),

      setPurpose: (purpose) =>
        set({ purpose }),

      setAddictionAssessment: (assessment) =>
        set({ addictionAssessment: assessment }),

      setPurposeDetails: (details) =>
        set({ purposeDetails: details }),

      setManagedApps: (apps) =>
        set({ managedApps: apps }),

      setSleepProfile: (profile) =>
        set({ sleepProfile: profile }),

      setSubscription: (plan, status, expiry) =>
        set({
          subscriptionPlan: plan,
          subscriptionStatus: status,
          subscriptionExpiry: expiry,
        }),

      startTrial: () => {
        const now = new Date().toISOString();
        const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
        set({
          subscriptionPlan: 'trial',
          subscriptionStatus: 'active',
          trialStartDate: now,
          subscriptionExpiry: expiry,
        });
      },

      setInterventionDuration: (minutes) =>
        set({ interventionDurationMinutes: minutes }),

      setImplementationIntent: (intent) =>
        set({ implementationIntent: intent }),

      setDailyGoal: (minutes) =>
        set({ dailyGoalMinutes: minutes }),

      recordIntervention: (app) => {
        const today = new Date().toISOString().split('T')[0];
        const { stats, interventionDurationMinutes } = get();
        const existingIndex = stats.findIndex((s) => s.date === today);

        // 古いデータのクリーンアップ (90日以上前のデータを削除)
        const MAX_STATS_DAYS = 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - MAX_STATS_DAYS);
        const cutoffString = cutoffDate.toISOString().split('T')[0];

        const createEmptyAppStats = () => ({
          tiktok: { interventionCount: 0, blockedMinutes: 0 },
          youtubeShorts: { interventionCount: 0, blockedMinutes: 0 },
          instagramReels: { interventionCount: 0, blockedMinutes: 0 },
        });

        let updatedStats: DailyStats[];

        if (existingIndex >= 0) {
          // イミュータブルな更新パターン
          updatedStats = stats.map((stat, index) => {
            if (index !== existingIndex) return stat;
            return {
              ...stat,
              interventionCount: stat.interventionCount + 1,
              totalBlockedMinutes: stat.totalBlockedMinutes + interventionDurationMinutes,
              apps: {
                ...stat.apps,
                [app]: {
                  interventionCount: (stat.apps[app]?.interventionCount ?? 0) + 1,
                  blockedMinutes: (stat.apps[app]?.blockedMinutes ?? 0) + interventionDurationMinutes,
                },
              },
            };
          });
        } else {
          const newStats: DailyStats = {
            date: today,
            interventionCount: 1,
            totalBlockedMinutes: interventionDurationMinutes,
            apps: {
              ...createEmptyAppStats(),
              [app]: {
                interventionCount: 1,
                blockedMinutes: interventionDurationMinutes,
              },
            },
          };
          updatedStats = [...stats, newStats];
        }

        // 古いデータを除外して設定
        const filteredStats = updatedStats.filter((s) => s.date >= cutoffString);
        set({ stats: filteredStats });
      },

      reset: () => set(initialState),

      // New Feature v2 Actions
      setUsageAssessment: (assessment) =>
        set({ usageAssessment: assessment }),

      setLifetimeImpact: (impact) =>
        set({ lifetimeImpact: impact }),

      setAlternativeGoals: (goals) =>
        set({ alternativeGoals: goals }),

      addCheckIn: (checkIn) => {
        const { checkIns } = get();
        // Keep only last 90 days of check-ins
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        const cutoffString = cutoffDate.toISOString().split('T')[0];
        const filteredCheckIns = checkIns.filter((c) => c.date >= cutoffString);
        // Replace if same date exists, otherwise add
        const existingIndex = filteredCheckIns.findIndex((c) => c.date === checkIn.date);
        if (existingIndex >= 0) {
          filteredCheckIns[existingIndex] = checkIn;
        } else {
          filteredCheckIns.push(checkIn);
        }
        set({ checkIns: filteredCheckIns });
      },

      setSelectedPricingPlan: (planId) =>
        set({ selectedPricingPlan: planId }),

      setTutorialComplete: () =>
        set({ hasCompletedTutorial: true }),

      calculateLifetimeImpact: (assessment) => {
        // Calculate yearly lost hours
        const yearlyLostHours = assessment.dailyUsageHours * 365;

        // Assume user will continue for 50 more years (average remaining lifespan)
        const remainingYears = 50;
        const totalLostHours = yearlyLostHours * remainingYears;
        const lifetimeLostYears = totalLostHours / (24 * 365);

        // Calculate equivalents
        // Book: ~6 hours to read
        const books = Math.round(yearlyLostHours / 6);
        // Movie: ~2 hours
        const movies = Math.round(yearlyLostHours / 2);
        // Travel: ~40 hours (including planning)
        const travels = Math.round(yearlyLostHours / 40);

        // Skills based on hours (100 hours = basic skill)
        const skillHours = yearlyLostHours;
        const skills: string[] = [];
        if (skillHours >= 100) skills.push('新しい言語の基礎');
        if (skillHours >= 200) skills.push('楽器の初級レベル');
        if (skillHours >= 300) skills.push('プログラミング入門');
        if (skillHours >= 500) skills.push('資格取得');

        const impact = {
          yearlyLostHours,
          lifetimeLostYears: Math.round(lifetimeLostYears * 10) / 10,
          equivalents: {
            books,
            movies,
            skills: skills.length > 0 ? skills : ['新しいスキルの習得'],
            travels,
          },
        };

        set({ lifetimeImpact: impact });
        return impact;
      },

      // New Onboarding v3 Actions
      setMotivation: (motivation) =>
        set({ motivation }),

      setScreenTimeData: (data) =>
        set({ screenTimeData: data }),

      setScreenTimePermission: (hasPermission) =>
        set({ hasScreenTimePermission: hasPermission }),

      setAlternativeActivity: (activity, custom) =>
        set({
          alternativeActivity: activity,
          customAlternativeActivity: custom || null,
        }),

      setIfThenPlan: (plan) =>
        set({ ifThenPlan: plan }),

      completeOnboarding: () => {
        const state = get();

        // Validate required onboarding data (motivation is optional in v3 flow)
        if (!state.alternativeActivity || !state.ifThenPlan || !state.goal) {
          console.error('[Onboarding] Cannot complete: missing required data', {
            alternativeActivity: !!state.alternativeActivity,
            ifThenPlan: !!state.ifThenPlan,
            goal: !!state.goal,
          });
          return; // Early return if validation fails
        }

        const now = new Date().toISOString();
        const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

        // Map GoalType to UserPurpose for personalization
        const mappedPurpose = goalTypeToPurpose(state.goal);

        // Create commitment summary (motivation is optional in v3 flow)
        const commitment: OnboardingCommitment = {
          ...(state.motivation && { motivation: state.motivation }),
          goal: state.goal,
          screenTimeData: state.screenTimeData,
          alternativeActivity: state.alternativeActivity,
          customActivity: state.customAlternativeActivity || undefined,
          ifThenPlan: state.ifThenPlan,
          completedAt: now,
        };

        set({
          hasCompletedOnboarding: true,
          onboardingCommitment: commitment,
          purpose: mappedPurpose,  // Set purpose from goal for personalization
          subscriptionPlan: 'trial',
          subscriptionStatus: 'active',
          trialStartDate: now,
          subscriptionExpiry: expiry,
        });
      },

      calculateImpactFromScreenTime: (data) => {
        const dailyHours = data.dailyAverage / 60;
        // Use 360 days (12 months × 30 days) to match reality-check display calculation
        const yearlyLostHours = dailyHours * 360;
        const remainingYears = 50;
        const lifetimeLostYears = (yearlyLostHours * remainingYears) / (24 * 365);

        const books = Math.round(yearlyLostHours / 6);
        const movies = Math.round(yearlyLostHours / 2);
        const travels = Math.round(yearlyLostHours / 40);

        const skills: string[] = [];
        if (yearlyLostHours >= 100) skills.push('新しい言語の基礎');
        if (yearlyLostHours >= 200) skills.push('楽器の初級レベル');
        if (yearlyLostHours >= 300) skills.push('プログラミング入門');
        if (yearlyLostHours >= 500) skills.push('資格取得');

        const impact: LifetimeImpact = {
          yearlyLostHours,
          lifetimeLostYears: Math.round(lifetimeLostYears * 10) / 10,
          equivalents: {
            books,
            movies,
            skills: skills.length > 0 ? skills : ['新しいスキルの習得'],
            travels,
          },
        };

        set({ lifetimeImpact: impact });
        return impact;
      },

      calculateImpactFromManualInput: (dailyHours) => {
        const yearlyLostHours = dailyHours * 365;
        const remainingYears = 50;
        const lifetimeLostYears = (yearlyLostHours * remainingYears) / (24 * 365);

        const books = Math.round(yearlyLostHours / 6);
        const movies = Math.round(yearlyLostHours / 2);
        const travels = Math.round(yearlyLostHours / 40);

        const skills: string[] = [];
        if (yearlyLostHours >= 100) skills.push('新しい言語の基礎');
        if (yearlyLostHours >= 200) skills.push('楽器の初級レベル');
        if (yearlyLostHours >= 300) skills.push('プログラミング入門');
        if (yearlyLostHours >= 500) skills.push('資格取得');

        const impact: LifetimeImpact = {
          yearlyLostHours,
          lifetimeLostYears: Math.round(lifetimeLostYears * 10) / 10,
          equivalents: {
            books,
            movies,
            skills: skills.length > 0 ? skills : ['新しいスキルの習得'],
            travels,
          },
        };

        set({ lifetimeImpact: impact });
        return impact;
      },

      // App Selection Actions
      setSelectedApps: (apps) =>
        set({ selectedApps: apps }),

      setGoal: (goal) =>
        set({ goal }),

      // Custom Apps Actions (Android only - iOS pending Family Controls Entitlement)
      addCustomApp: (app) => {
        const { customApps } = get();
        // Avoid duplicates
        if (customApps.some((a) => a.packageName === app.packageName)) {
          return;
        }
        const newApp: CustomApp = {
          ...app,
          addedAt: new Date().toISOString(),
        };
        set({ customApps: [...customApps, newApp] });
      },

      removeCustomApp: (packageName) => {
        const { customApps } = get();
        set({
          customApps: customApps.filter((a) => a.packageName !== packageName),
        });
      },

      getCustomAppPackages: () => {
        const { customApps } = get();
        return customApps.map((a) => a.packageName);
      },

      // Subscription Actions
      setSubscriptionPlan: (plan) => {
        const now = new Date().toISOString();
        if (plan === 'trial') {
          const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          set({
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
            trialStartDate: now,
            subscriptionExpiry: expiry,
          });
        } else {
          set({
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
          });
        }
      },

      // Baseline & Intervention Actions
      setBaselineMonthlyMinutes: (minutes) => {
        set({ baselineMonthlyMinutes: minutes });
      },

      setInterventionSettings: (settings) => {
        const { interventionSettings } = get();
        set({
          interventionSettings: {
            ...interventionSettings,
            ...settings,
          },
        });
      },
    }),
    {
      name: 'stopshorts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
