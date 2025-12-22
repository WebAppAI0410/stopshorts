# Onboarding Screen Details

## 1. welcome.tsx
- No state changes
- Navigation: → the-problem

## 2. the-problem.tsx
- No state changes
- Shows problem awareness content
- Navigation: → goal

## 3. goal.tsx
**State:**
```typescript
setGoal(goal: GoalType)
// GoalType: 'quit' | 'reduce' | 'mindful' | 'productivity' | 'sleep'
```
- Navigation: → app-selection

## 4. app-selection.tsx
**State:**
```typescript
setSelectedApps(apps: TargetAppId[])
// TargetAppId: 'tiktok' | 'youtubeShorts' | 'instagramReels'

addCustomApp({ packageName, appName, icon })
// For user-added apps (Android only)
```
- Uses static app icons from `src/constants/appIcons.ts`
- Navigation: → user-setup

## 5. user-setup.tsx
**State:**
```typescript
setUserName(name: string)
```
- Navigation: → reality-check

## 6. reality-check.tsx
**Fetches:**
```typescript
const monthlyData = await screenTimeService.getMonthlyUsage(customPackages);
const todayData = await screenTimeService.getTodayUsage(customPackages);
```

**Displays:**
- Monthly total usage
- Per-app breakdown (including custom apps)
- Yearly projection
- Achievable skills (based on 10,000 hour rule)

**On Continue:**
```typescript
// IMPORTANT: Include custom app usage
const customDailyAverage = Math.round(customMonthlyTotal / 30);
calculateImpactFromScreenTime({
  ...screenTimeData,
  dailyAverage: monthlyData.dailyAverage + customDailyAverage,
});
```
- Navigation: → alternative

## 7. alternative.tsx
**State:**
```typescript
setAlternativeActivity(activity: AlternativeActivity, custom?: string)
// AlternativeActivity: 'exercise' | 'reading' | 'hobby' | 'social' | 'learning' | 'custom'
```
- Navigation: → if-then

## 8. if-then.tsx
**State:**
```typescript
setIfThenPlan({
  trigger: 'bored' | 'stressed' | 'procrastinating' | 'habit',
  action: string,
  customAction?: string,
})
```
- Navigation: → start

## 9. start.tsx
**Displays (from store):**
- goal
- lifetimeImpact.yearlyLostHours
- alternativeActivity
- ifThenPlan

- Navigation: → pricing

## 10. pricing.tsx
**State:**
```typescript
setSelectedPricingPlan(planId: PricingPlanId)
completeOnboarding() // Sets hasCompletedOnboarding = true, starts trial
```
- Navigation: → /(main)/home

## Progress Indicator
All screens use `<ProgressIndicator totalSteps={10} currentStep={N} />`

## Common Components
- `Header` - Back button, optional title
- `Button` - Primary CTA
- `GlowOrb` - Decorative background element
- `SelectionCard` - Choice cards with icons
