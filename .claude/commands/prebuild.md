---
name: prebuild
description: Run Expo prebuild to generate native projects
---

Generate or regenerate native Android/iOS projects.

## Android Only

```bash
npx expo prebuild --platform android --clean
```

## iOS with Family Controls (Screen Time Extensions)

```bash
ENABLE_FAMILY_CONTROLS=true npx expo prebuild --platform ios --clean
cd ios && pod install
```

**重要**: iOS prebuild は必ず `ENABLE_FAMILY_CONTROLS=true` を付けること。
これがないと Screen Time Extensions が生成されない。

## Both Platforms

```bash
npx expo prebuild --platform android --clean
ENABLE_FAMILY_CONTROLS=true npx expo prebuild --platform ios --clean
cd ios && pod install
```

## When to Use

- After adding native modules
- After changing `app.json` native config
- After updating Expo SDK
- When native build fails unexpectedly

## After Prebuild

Check that custom native modules are properly linked:

**Android:**
- `android/settings.gradle` includes screen-time-android
- `android/app/build.gradle` has correct dependencies

**iOS:**
- `ios/ScreenTimeExtensions/` directory exists with 3 extensions
- `ios/StopShorts.xcodeproj/project.pbxproj` contains ScreenTimeMonitor, ScreenTimeShieldConfig, ScreenTimeShieldAction targets
