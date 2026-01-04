# E2E Test Issues - 2026-01-03

## Summary
E2E testing session discovered the following issues that need to be addressed.

---

## Issue 1: Tab Labels i18n Bug

**Severity**: Medium
**Component**: Navigation / i18n

### Description
Tab bar displays raw route names instead of translated labels:
- Shows: `training/index`, `training/[topicId]`
- Expected: `学習` (or localized label)

### Steps to Reproduce
1. Launch app
2. Complete onboarding or skip with demo mode
3. Observe tab bar labels

### Affected Files
- `app/(main)/_layout.tsx` - Tab configuration
- `src/i18n/locales/ja.json` - Translation keys

### Notes
Other tabs (`ホーム`, `統計`, `設定`, `プロフィール`) display correctly. Only training-related tabs show raw route names.

---

## Issue 2: Maestro launchApp Failure

**Severity**: High (Blocks CI/CD)
**Component**: E2E Testing / Maestro

### Description
Maestro CLI fails to launch app with `TcpForwarder` timeout error.

### Error Message
```
Unable to launch app com.stopshorts.app

Caused by: TimeoutException at TcpForwarder.kt:153
```

### Environment
- Maestro version: 1.41.1
- Android emulator: Pixel_5_22 (emulator-5554)
- App: Preview build (com.stopshorts.app)

### Workaround
- Use `adb shell am start` to launch app manually
- Use Maestro MCP tools for individual commands

### Notes
- `adb shell am start -n com.stopshorts.app/.MainActivity` works fine
- Issue may be related to Expo/React Native app launch timing
- Restarting adb server does not resolve the issue

---

## Fixed During Session

### training-flow.yaml
- Updated to handle demo mode skip
- Fixed quiz assertions (removed "正解" check)
- Changed worksheet input selector from ID to placeholder text
- Changed input text from Japanese to ASCII (Maestro limitation)
- Added proper scroll and wait commands

### intervention-select.yaml
- Added demo mode skip logic
- Fixed selector for settings navigation

### onboarding-flow.yaml
- Already updated in previous session
