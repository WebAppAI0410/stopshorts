/**
 * AI Preview Screen (Onboarding)
 * Shows a preview of AI chat and training features before pricing
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

type FeatureItem = {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  isPremium: boolean;
};

const features: FeatureItem[] = [
  {
    icon: 'chatbubble-ellipses-outline',
    titleKey: 'onboarding.aiPreview.features.aiCoach.title',
    descriptionKey: 'onboarding.aiPreview.features.aiCoach.description',
    isPremium: true,
  },
  {
    icon: 'book-outline',
    titleKey: 'onboarding.aiPreview.features.training.title',
    descriptionKey: 'onboarding.aiPreview.features.training.description',
    isPremium: true,
  },
  {
    icon: 'bar-chart-outline',
    titleKey: 'onboarding.aiPreview.features.statistics.title',
    descriptionKey: 'onboarding.aiPreview.features.statistics.description',
    isPremium: false,
  },
  {
    icon: 'shield-checkmark-outline',
    titleKey: 'onboarding.aiPreview.features.interventions.title',
    descriptionKey: 'onboarding.aiPreview.features.interventions.description',
    isPremium: false,
  },
];

export default function AIPreviewScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const handleContinue = useCallback(() => {
    router.push('/(onboarding)/start' as Href);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
      <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

      <Header showBack variant="ghost" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            {t('onboarding.aiPreview.title')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {t('onboarding.aiPreview.subtitle')}
          </Text>
        </Animated.View>

        {/* AI Chat Preview */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          style={[
            styles.chatPreview,
            {
              backgroundColor: colors.backgroundCard,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              marginTop: spacing.xl,
            },
          ]}
        >
          <View style={styles.chatHeader}>
            <View
              style={[
                styles.aiAvatar,
                { backgroundColor: colors.accentMuted },
              ]}
            >
              <Ionicons name="sparkles" size={20} color={colors.accent} />
            </View>
            <Text style={[typography.label, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
              {t('onboarding.aiPreview.chatPreview.aiName')}
            </Text>
          </View>

          <View
            style={[
              styles.chatBubble,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[typography.body, { color: colors.textPrimary }]}>
              {t('onboarding.aiPreview.chatPreview.message')}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={[styles.quickActions, { marginTop: spacing.md }]}>
            {['exploreReasons', 'createPlan'].map((action, index) => (
              <View
                key={action}
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor: colors.primary + '15',
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    marginRight: index === 0 ? spacing.sm : 0,
                  },
                ]}
              >
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {t(`onboarding.aiPreview.chatPreview.actions.${action}`)}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Features List */}
        <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.featuresSection}>
          <Text
            style={[
              typography.label,
              { color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.xl },
            ]}
          >
            {t('onboarding.aiPreview.featuresTitle')}
          </Text>

          {features.map((feature, index) => (
            <Animated.View
              key={feature.titleKey}
              entering={FadeInRight.duration(500).delay(500 + index * 100)}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.isPremium ? colors.warning + '20' : colors.accentMuted },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={20}
                    color={feature.isPremium ? colors.warning : colors.accent}
                  />
                </View>
                <View style={styles.featureContent}>
                  <View style={styles.featureTitleRow}>
                    <Text style={[typography.h3, { color: colors.textPrimary, fontSize: 16 }]}>
                      {t(feature.titleKey)}
                    </Text>
                    {feature.isPremium && (
                      <View
                        style={[
                          styles.premiumBadge,
                          { backgroundColor: colors.warning + '20', marginLeft: spacing.xs },
                        ]}
                      >
                        <Text style={[typography.caption, { color: colors.warning, fontSize: 10 }]}>
                          {t('onboarding.aiPreview.premiumBadge')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {t(feature.descriptionKey)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(900)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        <Button title={t('common.continue')} onPress={handleContinue} size="lg" />
        <View style={{ marginTop: spacing.xl }}>
          <ProgressIndicator totalSteps={11} currentStep={10} />
        </View>
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
    paddingBottom: 24,
  },
  chatPreview: {
    // styles applied inline
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    // styles applied inline
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    // styles applied inline
  },
  featuresSection: {
    // styles applied inline
  },
  featureCard: {
    // styles applied inline
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});
