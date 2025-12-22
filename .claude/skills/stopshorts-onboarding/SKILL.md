---
name: stopshorts-onboarding
description: This skill should be used when the user asks to "modify onboarding", "add onboarding screen", "change onboarding flow", "fix onboarding bug", or works with the app/(onboarding)/ screens, user setup flow, or reality check calculations.
---

# StopShorts Onboarding Flow

11-step onboarding that guides users through understanding their short video usage and setting up intervention strategies.

## Screen Order

```
1.  welcome.tsx           → Initial welcome
2.  user-setup.tsx        → User name input
3.  the-problem.tsx       → Problem awareness
4.  goal.tsx              → Goal selection (GoalType)
5.  app-selection.tsx     → Target apps selection
6.  reality-check.tsx     → Usage data display + yearly projection
7.  alternative.tsx       → Alternative activity selection
8.  if-then.tsx           → Implementation intention
9.  how-it-works.tsx      → How StopShorts works
10. urge-surfing-demo.tsx → Urge surfing experience demo
11. start.tsx             → Commitment summary → pricing.tsx
```

## UI Consistency

All screens MUST follow the standard onboarding layout:
- `<Header showBack />`
- `<ProgressIndicator totalSteps={11} currentStep={N} />`
- See `stopshorts-ui-consistency` skill for details

## Key Data Flow

```
goal.tsx → setGoal(GoalType)
app-selection.tsx → setSelectedApps([TargetAppId])
                  → addCustomApp(CustomApp)
reality-check.tsx → getMonthlyUsage() → calculateImpactFromScreenTime()
                  → sets lifetimeImpact.yearlyLostHours
alternative.tsx → setAlternativeActivity(AlternativeActivity)
if-then.tsx → setIfThenPlan(IfThenPlan)
pricing.tsx → completeOnboarding()
```

## Critical Calculations

### reality-check.tsx
```typescript
// Monthly usage (includes custom apps)
const customMonthlyTotal = customAppUsage.reduce((sum, app) => sum + app.monthlyMinutes, 0);
const totalMonthlyMinutes = monthlyData.monthlyTotal + customMonthlyTotal;

// Yearly projection
const yearlyHours = Math.round(totalMonthlyMinutes * 12 / 60);
```

### Store (calculateImpactFromScreenTime)
```typescript
const dailyHours = data.dailyAverage / 60;
const yearlyLostHours = dailyHours * 365;
```

## Additional Resources

- **`references/screen-details.md`** - Each screen's props and state
