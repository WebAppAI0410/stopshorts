import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserPurpose,
  ManagedApp,
  SubscriptionPlan,
  SubscriptionStatus,
  SleepProfile,
  DailyStats,
  ImplementationIntentConfig,
  AddictionAssessment,
  PurposeDetails,
  UsageAssessment,
  LifetimeImpact,
  AlternativeGoal,
  DailyCheckIn,
  PricingPlanId,
} from '../types';

interface AppState {
  // User State
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

  // Statistics
  stats: DailyStats[];

  // Actions
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
}

const initialState = {
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
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

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
    }),
    {
      name: 'stopshorts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
