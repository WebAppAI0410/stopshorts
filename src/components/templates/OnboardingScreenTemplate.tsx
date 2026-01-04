/**
 * OnboardingScreenTemplate
 * Shared template for onboarding screens to reduce code duplication
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button, ProgressIndicator, Header } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

export interface OnboardingScreenTemplateProps {
  /** Title text (already translated) */
  title: string;
  /** Subtitle text (already translated) */
  subtitle?: string;
  /** Main content area */
  children: ReactNode;
  /** Current step for progress indicator (1-based) */
  currentStep: number;
  /** Total steps for progress indicator */
  totalSteps?: number;
  /** Primary button text */
  buttonText: string;
  /** Primary button press handler */
  onButtonPress: () => void;
  /** Whether the primary button is disabled */
  buttonDisabled?: boolean;
  /** Secondary button text (optional) */
  secondaryButtonText?: string;
  /** Secondary button press handler */
  onSecondaryButtonPress?: () => void;
  /** Whether to show back button in header */
  showBack?: boolean;
  /** Custom header right element */
  headerRight?: ReactNode;
  /** Additional content to render in footer (above buttons) */
  footerTopContent?: ReactNode;
  /** Additional padding bottom for scroll content */
  scrollContentPaddingBottom?: number;
  /** Custom content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Whether to hide progress indicator */
  hideProgress?: boolean;
  /** Animation delay offset for title (default: 100) */
  titleAnimationDelay?: number;
  /** Animation delay offset for footer (default: 800) */
  footerAnimationDelay?: number;
}

export function OnboardingScreenTemplate({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps = 11,
  buttonText,
  onButtonPress,
  buttonDisabled = false,
  secondaryButtonText,
  onSecondaryButtonPress,
  showBack = true,
  headerRight,
  footerTopContent,
  scrollContentPaddingBottom = 24,
  contentContainerStyle,
  hideProgress = false,
  titleAnimationDelay = 100,
  footerAnimationDelay = 800,
}: OnboardingScreenTemplateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack={showBack} rightElement={headerRight} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.gutter, paddingBottom: scrollContentPaddingBottom },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title and Subtitle */}
        <Animated.View entering={FadeInUp.duration(600).delay(titleAnimationDelay)}>
          <Text
            style={[
              typography.h1,
              {
                color: colors.textPrimary,
                marginBottom: subtitle ? spacing.sm : spacing.xl,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                typography.bodyLarge,
                {
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </Animated.View>

        {/* Main Content */}
        {children}
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(footerAnimationDelay)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        {footerTopContent}

        <Button
          title={buttonText}
          onPress={onButtonPress}
          disabled={buttonDisabled}
          size="lg"
        />

        {secondaryButtonText && onSecondaryButtonPress && (
          <Button
            title={secondaryButtonText}
            onPress={onSecondaryButtonPress}
            variant="ghost"
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        )}

        {!hideProgress && (
          <View style={{ marginTop: spacing.xl }}>
            <ProgressIndicator totalSteps={totalSteps} currentStep={currentStep} />
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});
