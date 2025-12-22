# StopShorts Store Types

## Core Types

```typescript
type GoalType = 'quit' | 'reduce' | 'mindful' | 'productivity' | 'sleep';

type TargetAppId = 'tiktok' | 'youtubeShorts' | 'instagramReels';

type AlternativeActivity =
  | 'exercise' | 'reading' | 'hobby'
  | 'social' | 'learning' | 'custom';

type SubscriptionPlan = 'free' | 'trial' | 'monthly' | 'yearly';
type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
```

## Complex Types

```typescript
interface CustomApp {
  packageName: string;
  appName: string;
  icon?: string;  // Base64
  addedAt: string;  // ISO date
}

interface LifetimeImpact {
  yearlyLostHours: number;
  lifetimeLostYears: number;
  equivalents: {
    books: number;
    movies: number;
    skills: string[];
    travels: number;
  };
}

interface IfThenPlan {
  trigger: 'bored' | 'stressed' | 'procrastinating' | 'habit';
  action: string;
  customAction?: string;
}

interface ScreenTimeData {
  weeklyTotal: number;  // Actually monthly in current impl
  dailyAverage: number;
  appBreakdown: {
    app: TargetAppId;
    weeklyMinutes: number;
    dailyAverage: number;
    openCount: number;
  }[];
  peakHours: string[];
  lastUpdated: string;
}

interface DailyStats {
  date: string;  // YYYY-MM-DD
  interventionCount: number;
  totalBlockedMinutes: number;
  apps: Record<string, {
    interventionCount: number;
    blockedMinutes: number;
  }>;
}

interface DailyCheckIn {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  reflection?: string;
  achieved: boolean;
}
```

## Persistence

Store uses `zustand/middleware` with AsyncStorage:
```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'stopshorts-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
)
```

Data persists across app restarts.
