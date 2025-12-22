# Platform-Specific Handling Reference

## Overview

StopShorts supports both iOS and Android with different native capabilities. This document details how to handle platform differences correctly.

## Screen Time Data

### Android (Full Support)

```tsx
// src/hooks/useScreenTimeData.ts
import { Platform } from 'react-native';
import ScreenTimeAndroid from '../../modules/screen-time-android';

if (Platform.OS === 'android') {
  const data = await ScreenTimeAndroid.getUsageStats(startTime, endTime);
  // Returns actual usage data from UsageStatsManager
}
```

### iOS (Limited Support)

```tsx
// iOS requires Family Controls entitlement (App Store distribution only)
if (Platform.OS === 'ios') {
  // Show manual input or mock data
  // Real screen time not available in development
}
```

### Fallback Pattern

```tsx
const { todayData, loading, isMockData } = useScreenTimeData();

// Always check for mock data
if (isMockData) {
  // Show indicator that data is simulated
  <View style={styles.mockBanner}>
    <Text>Demo Mode - Using simulated data</Text>
  </View>
}
```

## App Selection

### Android - Native App Picker

```tsx
// app/(onboarding)/app-selection.tsx
{Platform.OS === 'android' && (
  <TouchableOpacity onPress={() => setShowAppModal(true)}>
    <Text>Add app from device</Text>
  </TouchableOpacity>
)}

// Uses AppSelectionModal with native app list
<AppSelectionModal
  visible={showAppModal}
  onClose={() => setShowAppModal(false)}
  onSelect={handleSelectApp}
  excludePackages={alreadySelectedPackages}
/>
```

### iOS - Manual Selection Only

```tsx
// iOS shows predefined list only (no native app picker)
{Platform.OS === 'ios' && (
  <Text style={styles.iosNote}>
    Select from the predefined apps above
  </Text>
)}
```

## Keyboard Handling

### Android

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

// Android often needs explicit KeyboardAvoidingView
<KeyboardAvoidingView
  behavior={Platform.OS === 'android' ? 'height' : 'padding'}
  keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
>
  {/* Form content */}
</KeyboardAvoidingView>
```

### iOS

```tsx
// iOS usually handles keyboard automatically with ScrollView
// But may need adjustment for fixed footers
<KeyboardAvoidingView behavior="padding">
  {/* Content */}
</KeyboardAvoidingView>
```

## Safe Area Handling

### Both Platforms

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

// Always use SafeAreaView from safe-area-context, not react-native
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  {/* Content */}
</SafeAreaView>
```

### Android Navigation Bar

```tsx
// Android may need extra padding for navigation bar
const styles = StyleSheet.create({
  footer: {
    paddingBottom: Platform.OS === 'android' ? 20 : 40,
  },
});
```

## Haptic Feedback

### Implementation Pattern

```tsx
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const triggerHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  // Android: Haptics may not work on all devices, use with fallback
  if (Platform.OS === 'android') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback: no haptic on unsupported devices
    }
  }
};
```

## Status Bar

### Handling Pattern

```tsx
import { StatusBar, Platform } from 'react-native';

// In _layout.tsx or screen component
<StatusBar
  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  backgroundColor={Platform.OS === 'android' ? colors.background : undefined}
/>
```

## Touch Feedback

### Android Ripple Effect

```tsx
import { TouchableNativeFeedback, TouchableOpacity, Platform, View } from 'react-native';

const PlatformTouchable = ({ children, onPress, style }) => {
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple('#00000020', false)}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};
```

## Font Rendering

### Platform Differences

```tsx
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    // Android may need explicit fontFamily
    ...Platform.select({
      android: { fontFamily: 'sans-serif-medium' },
      ios: { fontFamily: 'System' },
    }),
  },
};
```

## Native Module Checks

### Before Using Native Features

```tsx
import { Platform, NativeModules } from 'react-native';

const isNativeModuleAvailable = () => {
  if (Platform.OS === 'android') {
    return !!NativeModules.ScreenTimeAndroid;
  }
  return false; // iOS module not available in dev
};

// Usage
if (isNativeModuleAvailable()) {
  // Use native feature
} else {
  // Show fallback UI
}
```

## Testing Checklist

### Android-Specific Tests

- [ ] UsageStatsManager permission flow works
- [ ] App selection modal shows installed apps
- [ ] Keyboard doesn't overlap inputs
- [ ] Navigation bar doesn't overlap content
- [ ] Back button (hardware) navigates correctly

### iOS-Specific Tests

- [ ] Safe area insets render correctly (notch, home indicator)
- [ ] Keyboard dismisses properly
- [ ] Swipe-back gesture works
- [ ] Status bar style matches theme

### Both Platforms

- [ ] All screens render without errors
- [ ] Theme switching works
- [ ] Animations perform well
- [ ] Touch targets are adequate (44pt minimum)
- [ ] Text is readable in both themes
