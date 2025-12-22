---
paths: src/native/**/*.ts, modules/**/*
---

# Native Module Rules

## Platform Handling
- Always check `Platform.OS` before calling native methods
- Provide mock/fallback for iOS when Android-only features are used
- Never use mock data on Android unless absolutely necessary

## Error Handling
- Wrap all native calls in try-catch
- Return sensible defaults on error (empty arrays, 0, false)
- Log errors with module context: `console.error('[ScreenTime]', error)`

## Permissions
- Check permission status before accessing protected APIs
- Provide clear error messages when permissions are denied
- Never silently fail - always inform the user

## Android UsageStats
- Use `getUsageStats()` with proper time ranges
- Handle empty stats gracefully (user may not have used target apps)
- Package names are case-sensitive

## Data Flow
- Native -> TypeScript: Use proper type definitions
- Validate data from native before using
- Convert timestamps/durations to appropriate units (ms -> minutes)
