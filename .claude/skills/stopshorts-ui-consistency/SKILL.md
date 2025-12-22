---
name: stopshorts-ui-consistency
description: This skill should be used when the user asks to "review UI consistency", "check layout patterns", "verify component usage", "add new screen", "modify screen layout", "check platform differences", "ensure iOS/Android compatibility", or works with onboarding screens, dashboard screens, or settings screens. Provides comprehensive UI consistency verification procedures for the StopShorts app.
---

# StopShorts UI Consistency

Comprehensive procedures for ensuring UI consistency across the StopShorts app, covering onboarding flows, dashboard screens, component usage, and iOS/Android platform handling.

## Quick Verification Commands

```bash
# Verify ProgressIndicator consistency (all should use totalSteps={11})
grep -n "ProgressIndicator" app/(onboarding)/*.tsx

# Verify Header component usage
grep -n "<Header" app/**/*.tsx

# Find hardcoded colors (violations)
grep -rn "color: ['\"]#" app/ src/components/

# Find hardcoded spacing (violations)
grep -rn "padding: [0-9]" app/ src/components/

# Check platform-specific code
grep -rn "Platform\." app/ src/
```

## Screen Type Identification

Identify the screen type before applying patterns:

| Screen Type | Location | Key Pattern |
|-------------|----------|-------------|
| Onboarding | `app/(onboarding)/` | Header + ProgressIndicator + FadeInUp |
| Dashboard | `app/(main)/index.tsx` | Custom header + FadeInDown |
| Settings | `app/(main)/*-settings.tsx` | Header showBack + title |
| Modal/Immersive | Various | Full-screen overlay |

## Onboarding Screen Pattern

All onboarding screens MUST follow this structure:

```tsx
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
  <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
  <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

  {/* IMPORTANT: Use variant="ghost" when GlowOrb is present */}
  <Header showBack variant="ghost" />

  <ScrollView
    style={styles.scrollView}
    contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
    showsVerticalScrollIndicator={false}
  >
    <Animated.View entering={FadeInUp.duration(600)}>
      <Text style={[typography.h1, { color: colors.textPrimary }]}>Title</Text>
    </Animated.View>
    {/* Content with staggered delays: 200, 400, 600... */}
  </ScrollView>

  <Animated.View style={[styles.footer, { paddingHorizontal: spacing.gutter }]}>
    <Button title="Next" onPress={handleContinue} size="lg" />
    <View style={{ marginTop: spacing.xl }}>
      <ProgressIndicator totalSteps={11} currentStep={N} />
    </View>
  </Animated.View>
</SafeAreaView>
```

### Onboarding Step Numbers

| Step | Screen |
|------|--------|
| 1 | welcome.tsx |
| 2 | user-setup.tsx |
| 3 | the-problem.tsx |
| 4 | goal.tsx |
| 5 | app-selection.tsx |
| 6 | reality-check.tsx |
| 7 | alternative.tsx |
| 8 | if-then.tsx |
| 9 | how-it-works.tsx |
| 10 | urge-surfing-demo.tsx |
| 11 | start.tsx |

### Required Styles for Onboarding

```tsx
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 120 },
  footer: { paddingTop: 20, paddingBottom: 40 },
});
```

## Dashboard Screen Pattern

Dashboard screens use different patterns:

- Use `FadeInDown` instead of `FadeInUp`
- No Header component (custom header with avatar)
- No ProgressIndicator
- paddingBottom: 100 for tab bar clearance

## Settings Screen Pattern

Settings screens use `Header showBack` with `variant="ghost"` when GlowOrb is present:

```tsx
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
  <GlowOrb position="top-right" size="large" color="accent" intensity={0.1} />
  <Header showBack variant="ghost" title="Settings Title" />
  <ScrollView>...</ScrollView>
</SafeAreaView>
```

## Component Standards

### Required Components from `src/components/ui/`

| Component | Use Case |
|-----------|----------|
| Button | All primary CTAs |
| Header | Back navigation on all screens |
| ProgressIndicator | Onboarding footer only |
| GlowOrb | Visual decoration |
| SelectionCard | Card-style selection |
| ShieldIcon | Intervention displays |

### Theme Token Usage

Always use theme tokens, never hardcode:

```tsx
const { colors, typography, spacing, borderRadius } = useTheme();

// Correct
color: colors.textPrimary
padding: spacing.md
...typography.body
borderRadius: borderRadius.md

// Violations
color: '#333333'
padding: 16
fontSize: 14
```

### Animation Standards

```tsx
// Onboarding: FadeInUp with staggered delays
<Animated.View entering={FadeInUp.duration(600).delay(200)}>

// Dashboard: FadeInDown
<Animated.View entering={FadeInDown.duration(600).delay(200)}>

// Lists: stagger by 100ms
{items.map((item, i) => (
  <Animated.View entering={FadeInUp.duration(600).delay(200 + i * 100)}>
))}
```

## Platform-Specific Handling

### Key Files with Platform Logic

- `app/(onboarding)/reality-check.tsx` - Screen time data
- `app/(onboarding)/app-selection.tsx` - App picker
- `src/hooks/useScreenTimeData.ts` - Data fetching
- `src/services/screenTime.ts` - Native module

### Platform Patterns

```tsx
import { Platform } from 'react-native';

// Conditional rendering
{Platform.OS === 'android' && <AndroidComponent />}

// Platform-specific styles
style={Platform.OS === 'android' ? styles.android : styles.ios}

// Safe fallbacks for native features
const hasNativeModule = Platform.OS === 'android' && !!NativeModules.ScreenTimeAndroid;
```

### Platform Differences

| Feature | iOS | Android |
|---------|-----|---------|
| Screen Time | Family Controls (restricted) | UsageStatsManager |
| App Icons | Not available | PackageManager |
| Keyboard | Auto-adjustment | May need KeyboardAvoidingView |

## Review Checklist

Before completing any UI work:

- [ ] Screen type identified (onboarding/dashboard/settings)
- [ ] Correct layout pattern applied
- [ ] Header uses `variant="ghost"` when GlowOrb is present
- [ ] ProgressIndicator has correct step number (totalSteps={11})
- [ ] No hardcoded colors, spacing, or fonts
- [ ] Correct animation direction (FadeInUp/FadeInDown)
- [ ] Platform-specific code has fallbacks
- [ ] GlowOrb used for visual decoration

## Additional Resources

### Reference Files

For detailed patterns and implementation examples:
- **`references/layout-patterns.md`** - Complete screen templates, card patterns, modal patterns
- **`references/platform-specifics.md`** - iOS/Android handling details, keyboard, safe areas, native modules

### Related Skills

- **`stopshorts-onboarding`** - Onboarding flow and data calculations
- **`stopshorts-store`** - Zustand state management patterns

### Related Agents

- **`ui-reviewer`** - Automated UI review agent for design system compliance
