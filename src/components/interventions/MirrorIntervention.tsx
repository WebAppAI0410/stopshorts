/**
 * MirrorIntervention Component
 * Shows front camera with user's goal overlaid for self-reflection
 *
 * Features:
 * - Front camera preview with goal text overlay
 * - Countdown timer for reflection period
 * - Fallback UI when camera permission is denied or native module unavailable
 * - "Quit" (primary) and "Give in to temptation" (ghost) buttons
 *
 * Note: expo-camera requires a development build (dev-client).
 * In Expo Go or when native module is unavailable, fallback UI is shown.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../stores/useAppStore';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { t } from '../../i18n';
import { Button } from '../ui';

// Lazy load expo-camera to avoid crash when native module isn't available
let CameraView: React.ComponentType<{ style?: object; facing?: string; mirror?: boolean }> | null = null;
let useCameraPermissions: (() => [{ granted: boolean; canAskAgain: boolean } | null, () => Promise<void>]) | null = null;
let cameraAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const expoCamera = require('expo-camera');
  CameraView = expoCamera.CameraView;
  useCameraPermissions = expoCamera.useCameraPermissions;
  cameraAvailable = true;
} catch {
  // expo-camera native module not available (e.g., running in Expo Go)
  if (__DEV__) {
    console.log('[MirrorIntervention] expo-camera not available, using fallback UI');
  }
}

interface MirrorInterventionProps {
  /** Name of the blocked app */
  blockedAppName: string;
  /** User's goal for reflection */
  userGoal?: string;
  /** Callback when user chooses to proceed */
  onProceed: () => void;
  /** Callback when user dismisses (goes home) */
  onDismiss: () => void;
  /** Duration of reflection in seconds (default: 15) */
  mirrorDuration?: number;
  /** Show countdown timer (default: true) */
  showCountdown?: boolean;
}

type MirrorPhase = 'reflecting' | 'deciding';

// Fallback hook when expo-camera is not available
function useFallbackPermissions(): [{ granted: boolean; canAskAgain: boolean } | null, () => Promise<void>] {
  return [{ granted: false, canAskAgain: false }, async () => {}];
}

export function MirrorIntervention({
  blockedAppName,
  userGoal,
  onProceed,
  onDismiss,
  mirrorDuration = 15,
  showCountdown = true,
}: MirrorInterventionProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  // Use real hook if available, otherwise fallback
  const permissionHook = useCameraPermissions || useFallbackPermissions;
  const [permission, requestPermission] = permissionHook();

  const [phase, setPhase] = useState<MirrorPhase>('reflecting');
  const [countdown, setCountdown] = useState(mirrorDuration);

  const { onboardingCommitment, goal, alternativeActivity, customAlternativeActivity } = useAppStore();
  const { recordIntervention } = useStatisticsStore();

  // Animation for goal text pulsing
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Get user's goal from store or props
  const displayGoal = useMemo((): string => {
    // Priority: prop > commitment > alternative activity
    if (userGoal) return userGoal;

    if (onboardingCommitment?.customActivity) {
      return onboardingCommitment.customActivity;
    }

    if (customAlternativeActivity) {
      return customAlternativeActivity;
    }

    // Use goal type translation
    if (goal) {
      return t(`onboarding.v3.goal.options.${goal}.title`);
    }

    // Use alternative activity translation
    if (alternativeActivity && alternativeActivity !== 'custom') {
      return t(`onboarding.v3.alternative.options.${alternativeActivity}`);
    }

    // Default message
    return t('intervention.mirror.defaultGoal');
  }, [userGoal, onboardingCommitment, customAlternativeActivity, goal, alternativeActivity]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'reflecting') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('deciding');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  // Handle proceed action
  const handleProceed = useCallback(() => {
    recordIntervention({ proceeded: true });
    onProceed();
  }, [recordIntervention, onProceed]);

  // Handle dismiss action
  const handleDismiss = useCallback(() => {
    recordIntervention({ proceeded: false });
    onDismiss();
  }, [recordIntervention, onDismiss]);

  const hasPermission = cameraAvailable && permission?.granted;
  const canRequestPermission = cameraAvailable && permission?.canAskAgain;

  // Auto-request camera permission on mount
  useEffect(() => {
    if (cameraAvailable && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Render camera or fallback view
  const renderCameraView = () => {
    if (!hasPermission || !CameraView) {
      // Fallback UI when camera permission denied or native module unavailable
      return (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.fallbackContainer, { backgroundColor: colors.backgroundCard }]}
        >
          <Ionicons name="eye-outline" size={80} color={colors.textMuted} />
          <Animated.Text
            style={[
              typography.h2,
              styles.goalTextFallback,
              { color: colors.textPrimary },
              pulseStyle,
            ]}
          >
            {displayGoal}
          </Animated.Text>
          <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.md }]}>
            {t('intervention.mirror.noCamera')}
          </Text>
          {canRequestPermission && (
            <Pressable
              onPress={handleRequestPermission}
              style={[
                styles.permissionButton,
                { backgroundColor: colors.primary + '20', borderRadius: borderRadius.lg },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('intervention.mirror.enableCamera')}
            >
              <Text style={[typography.body, { color: colors.primary }]}>
                {t('intervention.mirror.enableCamera')}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      );
    }

    // Camera view with goal overlay
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="front"
          mirror={true}
        />
        {/* Dark overlay for text readability */}
        <View style={[styles.cameraOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        {/* Goal text overlay */}
        <View style={styles.goalOverlay}>
          <Animated.Text
            style={[
              typography.h1,
              styles.goalTextCamera,
              { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.8)' },
              pulseStyle,
            ]}
          >
            {displayGoal}
          </Animated.Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingHorizontal: spacing.gutter }]}
      >
        <Text style={[typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
          {t('intervention.mirror.title', { app: blockedAppName })}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {t('intervention.mirror.subtitle')}
        </Text>
      </Animated.View>

      {/* Camera / Fallback View */}
      <Animated.View
        entering={FadeIn.duration(600).delay(200)}
        style={[styles.cameraWrapper, { marginHorizontal: spacing.gutter }]}
      >
        {renderCameraView()}
      </Animated.View>

      {/* Countdown (during reflecting phase) */}
      {phase === 'reflecting' && showCountdown && (
        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={[styles.countdownContainer, { marginTop: spacing.lg }]}
        >
          <View
            style={[
              styles.countdownBadge,
              { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.full },
            ]}
          >
            <Ionicons name="time-outline" size={20} color={colors.textMuted} />
            <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
              {countdown}
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
            {t('intervention.mirror.reflectMessage')}
          </Text>
        </Animated.View>
      )}

      {/* Decision Buttons (after countdown) */}
      {phase === 'deciding' && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          exiting={FadeOut.duration(200)}
          style={[styles.buttonsContainer, { paddingHorizontal: spacing.gutter }]}
        >
          <Button
            title={t('intervention.mirror.quit')}
            onPress={handleDismiss}
            variant="primary"
            style={{ marginBottom: spacing.md }}
          />
          <Button
            title={t('intervention.mirror.proceed')}
            onPress={handleProceed}
            variant="ghost"
          />
        </Animated.View>
      )}

      {/* Skip button (during countdown) */}
      {phase === 'reflecting' && (
        <Animated.View
          entering={FadeInUp.duration(400).delay(600)}
          style={[styles.skipContainer, { marginTop: 'auto', marginBottom: spacing.lg }]}
        >
          <Pressable
            onPress={() => setPhase('deciding')}
            style={({ pressed }) => [
              styles.skipButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('intervention.mirror.skip')}
          >
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {t('intervention.mirror.skip')}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  cameraWrapper: {
    flex: 1,
    maxHeight: '50%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  goalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  goalTextCamera: {
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    padding: 24,
  },
  goalTextFallback: {
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  permissionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonsContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  skipContainer: {
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
});
