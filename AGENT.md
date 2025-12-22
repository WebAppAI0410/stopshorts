# AGENT.md - StopShorts Project Status

> Last Updated: 2025-12-23

## Project Overview

**StopShorts** is a mobile app that helps users break their short-form video addiction (TikTok, YouTube Shorts, Instagram Reels) using behavioral psychology techniques like Urge Surfing.

## Current Implementation Status

### ✅ Completed Features

#### Onboarding Flow (10 steps)
- `app/(onboarding)/welcome.tsx` - Welcome screen with demo mode
- `app/(onboarding)/the-problem.tsx` - Problem awareness
- `app/(onboarding)/reality-check.tsx` - Usage time calculation
- `app/(onboarding)/how-it-works.tsx` - App explanation
- `app/(onboarding)/goal.tsx` - Goal selection
- `app/(onboarding)/app-selection.tsx` - Target app selection
- `app/(onboarding)/if-then.tsx` - If-Then plan setup
- `app/(onboarding)/alternative.tsx` - Alternative activities
- `app/(onboarding)/user-setup.tsx` - User profile setup
- `app/(onboarding)/start.tsx` - Setup completion
- `app/(onboarding)/urge-surfing-demo.tsx` - **NEW** Urge Surfing demo with swipe simulator

#### Main App Screens
- `app/(main)/index.tsx` - Dashboard
- `app/(main)/profile.tsx` - Profile with inline editing (merged from profile-settings)
- `app/(main)/settings.tsx` - Settings
- `app/(main)/urge-surfing.tsx` - Urge Surfing exercise (30s/60s selectable)

#### Core Components

**Swipe Simulator** (`src/components/simulator/`)
- `SwipeSimulator.tsx` - Gesture-based vertical swipe with intervention trigger
- `FakeVideoScreen.tsx` - Mock video UI matching TikTok/Instagram/YouTube
- `appThemes.ts` - App-specific themes and fake video data
- Features:
  - Fixed TopBar and BottomNavBar (don't move with swipe)
  - Tab indicator alignment fix
  - Configurable intervention threshold

**Urge Surfing** (`src/components/urge-surfing/`)
- `WaveAnimation.tsx` - Ocean wave animation with intensity-based movement
  - Uses `useFrameCallback` for 60fps smooth animation
  - Wave speed synced to breathing intensity
  - Horizontal scrolling waves (matches mockup)
- `BreathingGuide.tsx` - 4-2-4 breathing circle animation
- `UrgeMeter.tsx` - Urge intensity meter
- `BreathingTimer.tsx` - Timer display

**UI Components** (`src/components/ui/`)
- `Card.tsx`, `Button.tsx`, `ProgressBar.tsx`, etc.
- Design system: Editorial Wellness Journal theme

#### State Management (`src/stores/`)
- `useAppStore.ts` - Main app state (user, goals, settings)
- `useStatisticsStore.ts` - Usage statistics with persistence

### 🔄 In Progress

- Intervention system timing (immediate vs delayed)
- Statistics visualization improvements
- Android native module integration (UsageStatsManager)

### 📋 Not Yet Started

- iOS Screen Time API integration
- Subscription/payment (RevenueCat)
- Push notifications
- Backend services

## Recent Changes (2025-12-23)

1. **Wave Animation Fix** - Implemented horizontal wave movement matching mockup
2. **Breathing Cycles** - Fixed to 3 cycles for 30 seconds (was incorrectly 2)
3. **TikTok/Instagram UI Fix** - TopBar now stays fixed during swipe
4. **Tab Alignment** - Fixed indicator bar causing misalignment
5. **Profile Merge** - Combined profile and profile-settings into single page

## Key Files for Development

```
app/
├── (onboarding)/           # Onboarding screens
│   └── urge-surfing-demo.tsx  # Demo with SwipeSimulator
├── (main)/                 # Main app screens
│   ├── index.tsx           # Dashboard
│   ├── profile.tsx         # Profile (with inline editing)
│   └── urge-surfing.tsx    # Full urge surfing exercise

src/
├── components/
│   ├── simulator/          # Swipe simulator components
│   │   ├── SwipeSimulator.tsx
│   │   └── FakeVideoScreen.tsx
│   └── urge-surfing/       # Urge surfing components
│       └── WaveAnimation.tsx
├── stores/
│   ├── useAppStore.ts      # Main state
│   └── useStatisticsStore.ts
├── contexts/
│   └── ThemeContext.tsx    # Theme provider
└── design/
    └── theme.ts            # Color definitions
```

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Routing**: expo-router (file-based)
- **State**: Zustand + AsyncStorage
- **Animation**: react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **SVG**: react-native-svg

## Commands

```bash
# Development
npx expo start

# Type check
npx tsc --noEmit

# Build Android
npx eas build --platform android --profile development
```

## Documentation

See `docs/README.md` for full documentation index.

Key docs:
- `docs/SWIPE_SIMULATOR_DESIGN.md` - Swipe simulator architecture
- `docs/URGE_SURFING_RESEARCH.md` - Urge surfing psychological research
- `docs/INTERVENTION_AND_METRICS_PLAN.md` - Intervention system plan
