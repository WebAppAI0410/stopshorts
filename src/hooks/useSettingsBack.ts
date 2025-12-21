import { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

export function useSettingsBack() {
  const router = useRouter();

  const goToSettings = useCallback(() => {
    router.replace('/(main)/settings');
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goToSettings();
      return true;
    });

    return () => subscription.remove();
  }, [goToSettings]);

  return goToSettings;
}
