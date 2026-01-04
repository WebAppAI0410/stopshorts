# Storybook + Gesture Handler Runtime Fixes (Spec)

## Goal
Resolve Storybook runtime errors and RNGestureHandlerModule missing errors in dev builds.

## Scope
- Storybook route stability in Expo Router.
- Gesture Handler initialization at app entry.
- Dev build prerequisites documented (no production behavior changes).

## Requirements
1) Storybook route must follow Expo Router + Storybook recommended pattern:
   - `app/storybook.tsx` re-exports `.rnstorybook` default.

2) Gesture Handler must be initialized at the entry file:
   - Add `import 'react-native-gesture-handler';` at the very top of `app/_layout.tsx`.

3) Dev build prerequisites must be explicit:
   - If native deps changed, a new dev build (or prebuild) is required before running on device.

## Edge Cases
- If Storybook is disabled via `EXPO_PUBLIC_STORYBOOK_ENABLED`, the route should not crash.
- If a dev build was created before Gesture Handler was installed, runtime will still fail.

## Acceptance Criteria
- `/storybook` loads without `start is not a function` error when Storybook is enabled.
- No `RNGestureHandlerModule` missing error on Android after rebuild + entry import.
- `app/storybook.tsx` is minimal and matches docs.

## References
- Storybook Expo Router setup
- RNGH/React Navigation install requirements
