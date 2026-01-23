/**
 * FeatureLinkSection Component
 * Displays related app features at the end of training articles
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { RelatedFeature } from '../../types/training';

interface FeatureLinkSectionProps {
  /** List of related features to display */
  features: RelatedFeature[];
}

export function FeatureLinkSection({ features }: FeatureLinkSectionProps) {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  if (features.length === 0) {
    return null;
  }

  const handleFeaturePress = (route: string) => {
    // For urge surfing, explicitly pass practiceType to show the breathing exercise
    // (not the user's configured intervention type)
    if (route === '/(main)/urge-surfing') {
      router.push({
        pathname: '/(main)/urge-surfing',
        params: { practiceType: 'breathing', source: 'training' },
      });
    } else {
      router.push(route as Href);
    }
  };

  return (
    <View style={[styles.container, { marginTop: spacing.xl, borderTopColor: colors.border }]}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.textPrimary, marginBottom: spacing.md },
        ]}
      >
        {t('training.relatedFeatures.title')}
      </Text>

      {features.map((feature) => (
        <TouchableOpacity
          key={feature.id}
          style={[
            styles.featureCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={() => handleFeaturePress(feature.route)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.accentMuted },
            ]}
          >
            <Ionicons
              name={feature.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
              {t(feature.titleKey)}
            </Text>
            <Text
              style={[styles.featureDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {t(feature.descriptionKey)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
