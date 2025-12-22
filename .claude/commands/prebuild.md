---
name: prebuild
description: Run Expo prebuild to generate native projects
---

Generate or regenerate native Android/iOS projects.

## Clean Prebuild

```bash
npx expo prebuild --clean
```

## Android Only

```bash
npx expo prebuild --platform android --clean
```

## When to Use

- After adding native modules
- After changing `app.json` native config
- After updating Expo SDK
- When native build fails unexpectedly

## After Prebuild

Check that custom native modules are properly linked:
- `android/settings.gradle` includes screen-time-android
- `android/app/build.gradle` has correct dependencies
