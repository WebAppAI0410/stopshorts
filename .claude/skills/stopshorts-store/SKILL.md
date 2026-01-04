---
name: stopshorts-store
description: This skill should be used when the user asks to "add store action", "modify state", "persist data", "access user data", or works with useAppStore, Zustand state, or AsyncStorage persistence.
---

# StopShorts Zustand Store

Global state management with AsyncStorage persistence.

## Location
`src/stores/useAppStore.ts`

## Quick Usage

```typescript
import { useAppStore } from '../src/stores/useAppStore';

// Read state
const goal = useAppStore((state) => state.goal);
const { lifetimeImpact, screenTimeData } = useAppStore();

// Call actions
const { setGoal, completeOnboarding } = useAppStore();
setGoal('reduce');
```

## Key State Groups

### Onboarding
```typescript
goal: GoalType | null
selectedApps: TargetAppId[]
customApps: CustomApp[]
lifetimeImpact: LifetimeImpact | null
alternativeActivity: AlternativeActivity | null
ifThenPlan: IfThenPlan | null
hasCompletedOnboarding: boolean
```

### Subscription
```typescript
subscriptionPlan: 'free' | 'trial' | 'monthly' | 'yearly'
subscriptionStatus: 'active' | 'expired' | 'cancelled'
trialStartDate: string | null
```

### Statistics
```typescript
// NOTE: stats moved to useStatisticsStore
checkIns: DailyCheckIn[]
```

## Statistics Store
For intervention/urge surfing statistics, use `useStatisticsStore`:
```typescript
import { useStatisticsStore } from '../src/stores/useStatisticsStore';

// Read statistics
const { getTodayStats, lifetime, getHabitScore } = useStatisticsStore();
const todayStats = getTodayStats();

// Record intervention
const { recordIntervention, recordUrgeSurfing } = useStatisticsStore();
recordIntervention({ proceeded: false, appPackage: 'com.tiktok.android' });
```

## Critical Actions (useAppStore)

### calculateImpactFromScreenTime(data)
Calculates yearly impact from screen time data:
```typescript
const dailyHours = data.dailyAverage / 60;
const yearlyLostHours = dailyHours * 365;
// Sets lifetimeImpact
```

### completeOnboarding()
Validates and finalizes onboarding:
- Requires: alternativeActivity, ifThenPlan, goal
- Sets: hasCompletedOnboarding, starts trial

### recordIntervention (DEPRECATED)
**Moved to `useStatisticsStore.recordIntervention()`**
Use the statistics store for intervention recording.

## Additional Resources

- **`references/types.md`** - All TypeScript types
