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
} from '../types';

interface AppState {
  // User State
  hasCompletedOnboarding: boolean;
  purpose: UserPurpose | null;
  managedApps: ManagedApp[];
  sleepProfile: SleepProfile;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
  trialStartDate: string | null;
  interventionDurationMinutes: number;

  // Statistics
  stats: DailyStats[];

  // Actions
  setOnboardingComplete: () => void;
  setPurpose: (purpose: UserPurpose) => void;
  setManagedApps: (apps: ManagedApp[]) => void;
  setSleepProfile: (profile: SleepProfile) => void;
  setSubscription: (
    plan: SubscriptionPlan,
    status: SubscriptionStatus,
    expiry: string | null
  ) => void;
  startTrial: () => void;
  setInterventionDuration: (minutes: number) => void;
  recordIntervention: (app: ManagedApp) => void;
  reset: () => void;
}

const initialState = {
  hasCompletedOnboarding: false,
  purpose: null,
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
  stats: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOnboardingComplete: () =>
        set({ hasCompletedOnboarding: true }),

      setPurpose: (purpose) =>
        set({ purpose }),

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
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        set({
          subscriptionPlan: 'trial',
          subscriptionStatus: 'active',
          trialStartDate: now,
          subscriptionExpiry: expiry,
        });
      },

      setInterventionDuration: (minutes) =>
        set({ interventionDurationMinutes: minutes }),

      recordIntervention: (app) => {
        const today = new Date().toISOString().split('T')[0];
        const { stats, interventionDurationMinutes } = get();
        const existingIndex = stats.findIndex((s) => s.date === today);

        if (existingIndex >= 0) {
          const updated = [...stats];
          const current = updated[existingIndex];
          current.interventionCount += 1;
          current.totalBlockedMinutes += interventionDurationMinutes;
          if (!current.apps[app]) {
            current.apps[app] = { interventionCount: 0, blockedMinutes: 0 };
          }
          current.apps[app].interventionCount += 1;
          current.apps[app].blockedMinutes += interventionDurationMinutes;
          set({ stats: updated });
        } else {
          const newStats: DailyStats = {
            date: today,
            interventionCount: 1,
            totalBlockedMinutes: interventionDurationMinutes,
            apps: {
              tiktok: { interventionCount: 0, blockedMinutes: 0 },
              youtubeShorts: { interventionCount: 0, blockedMinutes: 0 },
              instagramReels: { interventionCount: 0, blockedMinutes: 0 },
            },
          };
          newStats.apps[app] = {
            interventionCount: 1,
            blockedMinutes: interventionDurationMinutes,
          };
          set({ stats: [...stats, newStats] });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'stopshorts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
