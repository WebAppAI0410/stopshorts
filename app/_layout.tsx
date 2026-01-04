import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { useMonitoringService } from '../src/hooks/useMonitoringService';
import { useDailyUsageSync } from '../src/hooks/useDailyUsageSync';
import { useNotifications } from '../src/hooks/useNotifications';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppWithStatusBar />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppWithStatusBar() {
  const { isDark } = useTheme();

  // Initialize monitoring service (Android only)
  // This hook automatically starts/stops monitoring based on onboarding status
  useMonitoringService();

  // Sync daily usage data from native module to statistics store
  // This updates habit score and records usage history
  useDailyUsageSync();

  // Initialize notifications and listen for notification taps
  // This enables AI coach conversation triggers
  useNotifications();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
