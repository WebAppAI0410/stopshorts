import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Header } from '../../src/components/ui';
import { FeaturedInterventionCard, MiniInterventionCard } from '../../src/components/intervention-practice';
import type { InterventionType } from '../../src/components/intervention-practice';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAIStore } from '../../src/stores/useAIStore';
import { useStatisticsStore } from '../../src/stores/useStatisticsStore';
import { t } from '../../src/i18n';
import { palette } from '../../src/design/theme';

// Get recommended intervention based on success rate
const getRecommendedIntervention = (
  stats: ReturnType<typeof useStatisticsStore.getState>['getInterventionStatsByType'],
  isAIReady: boolean
): { type: InterventionType; successRate: number } => {
  const interventionStats = stats();

  // Filter out AI if not ready, and only include types with at least 1 trigger
  const validTypes: InterventionType[] = ['breathing', 'friction', 'mirror'];
  if (isAIReady) validTypes.push('ai');

  const sorted = validTypes
    .map(type => ({
      type,
      ...interventionStats[type],
    }))
    .filter(item => item.triggered > 0)
    .sort((a, b) => b.successRate - a.successRate);

  // No data: default to breathing
  if (sorted.length === 0) {
    return { type: 'breathing', successRate: 0 };
  }

  // Find all tied for top rate
  const topRate = sorted[0].successRate;
  const topTied = sorted.filter(item => item.successRate === topRate);

  // If tied, pick randomly
  const selected = topTied[Math.floor(Math.random() * topTied.length)];
  return { type: selected.type, successRate: selected.successRate };
};

export default function InterventionPracticeScreen() {
  const router = useRouter();
  const { colors, spacing, borderRadius } = useTheme();
  const modelStatus = useAIStore((state) => state.modelStatus);
  const isAIModelReady = modelStatus === 'ready';
  const getInterventionStatsByType = useStatisticsStore((state) => state.getInterventionStatsByType);

  // Memoize recommended intervention to prevent re-randomizing on every render
  const { recommendedType, successRate } = useMemo(() => {
    const result = getRecommendedIntervention(getInterventionStatsByType, isAIModelReady);
    return { recommendedType: result.type, successRate: result.successRate };
  }, [getInterventionStatsByType, isAIModelReady]);

  const handlePracticePress = (type: InterventionType) => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: type, source: 'training' },
    });
  };

  const handleBreathingPress = () => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: 'breathing', source: 'training' },
    });
  };

  const handleFrictionPress = () => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: 'friction', source: 'training' },
    });
  };

  const handleMirrorPress = () => {
    router.push({
      pathname: '/(main)/urge-surfing',
      params: { practiceType: 'mirror', source: 'training' },
    });
  };

  const handleAIPress = () => {
    if (isAIModelReady) {
      router.push({
        pathname: '/(main)/urge-surfing',
        params: { practiceType: 'ai', source: 'training' },
      });
    } else {
      // Navigate to AI setup page
      router.push('/(main)/ai');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.dark[900] }]}>

      {/* Header */}
      <Header
        title=""
        showBack
        variant="ghost"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          {/* Title Section */}
          <View style={[styles.titleSection, { marginBottom: spacing.xl }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('intervention.practice.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('intervention.practice.subtitle')}
            </Text>
          </View>

          {/* Hero Card - Personalized based on success rate */}
          <View style={{ marginBottom: spacing.xl }}>
            <FeaturedInterventionCard
              type={recommendedType}
              onPress={() => handlePracticePress(recommendedType)}
              testID="featured-intervention-card"
              successRate={successRate}
            />
          </View>

          {/* Mini Cards Grid */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('intervention.practice.otherOptions')}
            </Text>
          </View>

          <View style={[styles.grid, { gap: spacing.md }]}>
            <MiniInterventionCard
              title={t('intervention.practice.options.friction.title')}
              subtitle={t('intervention.practice.options.friction.description')}
              iconName="hourglass-outline"
              iconColor={palette.orange[500]}
              iconBgColor={palette.orange[500] + '20'}
              index={0}
              onPress={handleFrictionPress}
              testID="mini-card-friction"
            />
            <MiniInterventionCard
              title={t('intervention.practice.options.mirror.title')}
              subtitle={t('intervention.practice.options.mirror.description')}
              iconName="person-outline"
              iconColor={palette.purple[500]}
              iconBgColor={palette.purple[500] + '20'}
              index={1}
              onPress={handleMirrorPress}
              testID="mini-card-mirror"
            />
            <MiniInterventionCard
              title={t('intervention.practice.options.ai.title')}
              subtitle={isAIModelReady ? t('intervention.practice.options.ai.description') : t('intervention.practice.locked')}
              iconName="logo-android"
              iconColor={palette.emerald[500]}
              iconBgColor={palette.emerald[500] + '10'}
              index={2}
              isLocked={!isAIModelReady}
              onPress={handleAIPress}
              testID="mini-card-ai"
            />
          </View>

          {/* Footer Info */}
          <View style={[styles.footer, { marginTop: spacing['2xl'] }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {t('intervention.practice.infoSimple')}
            </Text>
          </View>

        </Animated.View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
  }
});
