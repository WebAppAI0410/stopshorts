---
name: build
description: Build the Android app using EAS Build
---

Build the StopShorts Android app.

## Steps

1. Run TypeScript check first:
```bash
npx tsc --noEmit
```

2. If TypeScript passes, run EAS build:
```bash
npx eas build --platform android --profile preview
```

## Build Profiles

- `preview` - APK for testing (default)
- `production` - AAB for Play Store

## Common Issues

- If build fails, check `eas.json` for configuration
- Ensure `app.json` version is updated
- Check native module compatibility in `modules/`
