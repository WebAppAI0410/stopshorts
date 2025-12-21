# Deep Linking Configuration

## Overview

StopShorts uses deep links to navigate users from native foreground service overlays to specific screens within the app.

## URL Scheme

- **Scheme**: `stopshorts://`
- **Configured in**: `app.json` (`expo.scheme`)

## Supported Deep Links

### Urge Surfing Screen

Opens the urge surfing experience when triggered from the intervention overlay.

**URL Format:**
```
stopshorts://urge-surfing?app={packageName}
```

**Parameters:**
- `app` (optional): The package name of the app that triggered the intervention (e.g., `com.zhiliaoapp.musically`)

**Example:**
```
stopshorts://urge-surfing?app=com.zhiliaoapp.musically
```

**Source:** Called from `CheckinForegroundService.kt` when user selects "Urge Surfing" from the intervention overlay.

## Configuration

### Expo/React Native (app.json)

```json
{
  "expo": {
    "scheme": "stopshorts"
  }
}
```

### expo-router Integration

Deep links are handled by expo-router's file-based routing. The route `app/(main)/urge-surfing.tsx` handles the `stopshorts://urge-surfing` deep link.

The screen can access query parameters using:
```typescript
import { useLocalSearchParams } from 'expo-router';

// Inside component
const { app } = useLocalSearchParams<{ app?: string }>();
```

### Android Native (Automatic)

Expo automatically generates the necessary Android intent filters in `AndroidManifest.xml` during build:

```xml
<intent-filter android:autoVerify="true" data-generated="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="stopshorts"/>
</intent-filter>
```

## Native Service Usage

In `CheckinForegroundService.kt`, the deep link is constructed and launched:

```kotlin
val appPackage = currentDetectedApp ?: ""
val deepLinkUri = android.net.Uri.parse("stopshorts://urge-surfing?app=$appPackage")

val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    setPackage(applicationContext.packageName)
}

applicationContext.startActivity(deepLinkIntent)
```

## Fallback Behavior

If the deep link fails (e.g., scheme not properly registered), the service falls back to launching the app normally:

```kotlin
catch (e: Exception) {
    val launchIntent = packageManager.getLaunchIntentForPackage(applicationContext.packageName)
    launchIntent?.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    launchIntent?.let { applicationContext.startActivity(it) }
}
```

## Testing Deep Links

### Using adb

```bash
# Test urge surfing deep link
adb shell am start -a android.intent.action.VIEW -d "stopshorts://urge-surfing?app=com.zhiliaoapp.musically" com.stopshorts.app
```

### Using Expo Go (Development)

Deep links work in Expo Go but may require the development build for full native module support.

## Future Deep Links

Additional deep links can be added by:

1. Creating the route file in `app/` directory
2. Constructing the URI in native code as needed
3. Documenting the URL format here

Example future deep links:
- `stopshorts://settings` - Open settings screen
- `stopshorts://statistics` - Open statistics screen
- `stopshorts://training` - Start training session
