# Project Review (StopShorts)
Date: 2026-01-03
Context: SDD in progress; several changes are provisional until spec approval.

## Scope
- Codebase review with focus on intervention timing, onboarding/urge-surfing, Storybook/dev tooling, and statistics.
- Emphasis on correctness, regressions, and spec alignment.

## Findings (ordered by severity)

### Critical
1) **Spec mismatch: “intervene every threshold crossing” vs cooldown gate**
   - Spec requires intervention at each cumulative threshold (10, 20, 30… minutes) per app per day.
   - Android service still enforces a fixed 5‑minute cooldown before showing intervention again, which can suppress expected triggers.
   - File: `modules/screen-time-android/android/src/main/java/com/stopshorts/screentime/CheckinForegroundService.kt`
   - Risk: user sees fewer interventions than spec; inconsistent behavior.

### High
2) **Dual statistics stores can diverge (AppStore vs StatisticsStore)**
   - `useAppStore` maintains legacy `stats` + `recordIntervention` while `useStatisticsStore` is used for most analytics/UI.
   - This risks double counting, stale data, or UI reading the wrong source.
   - Files: `src/stores/useAppStore.ts`, `src/stores/useStatisticsStore.ts`, `src/hooks/useMonitoringService.ts`
   - Risk: dashboards and metrics may be inconsistent or misleading.

3) **Intervention timing depends on frequent UsageStats polling**
   - Cumulative logic polls usage stats every ~1.5s and computes total usage each tick.
   - This can be heavy on battery/CPU and might be throttled by OS under load.
   - File: `modules/screen-time-android/android/src/main/java/com/stopshorts/screentime/CheckinForegroundService.kt`
   - Risk: performance/battery issues, or delayed/intermittent detection.

### Medium
4) **iOS Shortcuts integration is UI‑stubbed**
   - UI lists shortcut options but only shows “準備中” and does not share .shortcut files yet.
   - Spec says .shortcut files will be bundled and shared via sheet.
   - Files: `app/(main)/intervention-settings.tsx`, `docs/specs/07_ios_shortcuts.md`
   - Risk: iOS flow appears incomplete to users.

5) **Storybook route depends on env var and generated require file**
   - `/storybook` now conditionally requires `.rnstorybook`, but dev errors can reappear if env var is not set or `storybook:generate` isn’t rerun after story changes.
   - Files: `app/storybook.tsx`, `.rnstorybook/storybook.requires.ts`
   - Risk: confusing dev experience; non‑fatal.

6) **Gesture Handler runtime errors require fresh dev build**
   - `import 'react-native-gesture-handler'` added to entry, but if dev build predates RNGH or native changes, the runtime error persists.
   - File: `app/_layout.tsx`
   - Risk: onboarding demo crashes on device until rebuild.

### Low
7) **User name fallback now consistent in Urge Surfing and demo**
   - Default “ユーザー” applied when missing; aligns with spec.
   - Files: `src/components/urge-surfing/UrgeSurfingScreen.tsx`, `app/(onboarding)/urge-surfing-demo.tsx`, `docs/specs/08_user_display_name.md`

## Spec Alignment Notes (SDD)
- `docs/specs/06_intervention_timing.md` and `docs/specs/07_ios_shortcuts.md` are present and should remain the source of truth.
- Some implementation changes were applied before user review; keep them provisional and reconcile after approval.

## Recommendations
1) Remove or adjust cooldown to match “every threshold crossing” spec, or update spec if cooldown is intentional.
2) Consolidate stats stores (choose one) and migrate UI to a single source of truth.
3) Optimize cumulative usage computation (cache or event‑based deltas) to reduce polling overhead.
4) Implement actual .shortcut sharing flow to close iOS shortcuts gap.
5) Document Storybook usage and rebuild requirements in `docs/README.md` or `AGENT.md`.

## Test Gaps
- No automated tests for intervention timing logic (cumulative thresholds, cooldown, reset at midnight).
- No tests validating intervention event recording consistency across stores.
- No tests for Shortcuts sharing (UI state at least).

