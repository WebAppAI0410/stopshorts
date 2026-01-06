/**
 * FeaturedBreathingCard - Hero card for the recommended Breathing Guide intervention
 * Features gradient background, SVG pattern, and prominent CTA
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import { t } from '../../i18n';

export interface FeaturedBreathingCardProps {
  onPress: () => void;
  testID?: string;
}

export const FeaturedBreathingCard: React.FC<FeaturedBreathingCardProps> = ({
  onPress,
  testID,
}) => {
  const { borderRadius, spacing } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={t('intervention.practice.options.breathing.title')}
        style={({ pressed }) => [
          styles.card,
          {
            borderRadius: borderRadius.xl,
            shadowColor: palette.emerald[500],
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Gradient Background */}
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="cardGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={palette.emerald[500]} />
              <Stop offset="100%" stopColor={palette.teal[600]} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#cardGradient)"
            rx={borderRadius.xl}
          />
        </Svg>

        {/* Concentric Circles Pattern */}
        <Svg style={styles.pattern} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" opacity={0.15} />
          <Circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1" fill="none" opacity={0.12} />
          <Circle cx="50" cy="50" r="25" stroke="white" strokeWidth="1.5" fill="none" opacity={0.08} />
          <Circle cx="50" cy="50" r="15" stroke="white" strokeWidth="2" fill="none" opacity={0.05} />
        </Svg>

        {/* Content */}
        <View style={styles.content}>
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t('intervention.practice.recommended')}
            </Text>
          </View>

          {/* Leaf Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.leafIcon}>{'\uD83C\uDF3F'}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {t('intervention.practice.options.breathing.title')}
          </Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            {t('intervention.practice.options.breathing.tagline')}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {t('intervention.practice.options.breathing.description')}
          </Text>

          {/* Bottom Row: Duration + CTA */}
          <View style={styles.bottomRow}>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {'\u23F1\uFE0F'} {t('intervention.practice.options.breathing.duration')}
              </Text>
            </View>

            <View style={[styles.ctaButton, { borderRadius: borderRadius.md }]}>
              <Text style={[styles.ctaText, { color: palette.emerald[600] }]}>
                {t('intervention.practice.tryIt')} {'\u2192'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 220,
    overflow: 'hidden',
    // shadowColor is set inline with palette.emerald[500]
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
  },
  pattern: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 180,
    height: 180,
    opacity: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  leafIcon: {
    fontSize: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    maxWidth: '80%',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: {
    // color is set inline with palette.emerald[600]
    fontSize: 14,
    fontWeight: '700',
  },
});
