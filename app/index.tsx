import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '../src/stores/useAppStore';

// 開発中は毎回オンボーディングを表示する場合は true に
const FORCE_ONBOARDING = __DEV__ && true; // false に変更で通常動作

export default function Index() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const reset = useAppStore((state) => state.reset);

  useEffect(() => {
    if (FORCE_ONBOARDING) {
      reset();
    }
  }, [reset]);

  // FORCE_ONBOARDINGがtrueの場合、常にオンボーディングへ
  if (FORCE_ONBOARDING || !hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(main)" />;
}
