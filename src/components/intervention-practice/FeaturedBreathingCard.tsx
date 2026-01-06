/**
 * FeaturedBreathingCard - Hero card for the recommended Breathing Guide intervention
 * Features gradient background with wave pattern and SVG leaf illustration
 * Matches the mockup design with emerald/teal gradient and circular glow effect
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop, Rect, Path, G } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import { t } from '../../i18n';

export interface FeaturedBreathingCardProps {
  onPress: () => void;
  testID?: string;
}

// SVG Leaf illustration component with circular glow effect
const LeafIllustration: React.FC = () => (
  <Svg width={90} height={90} viewBox="0 0 90 90">
    {/* Outer glow circles - concentric rings */}
    <Circle cx="45" cy="45" r="44" fill="rgba(255,255,255,0.03)" />
    <Circle cx="45" cy="45" r="38" fill="rgba(255,255,255,0.05)" />
    <Circle cx="45" cy="45" r="32" fill="rgba(255,255,255,0.07)" />

    {/* Main leaf group */}
    <G transform="translate(28, 18)">
      {/* Left leaf */}
      <Path
        d="M17 5C17 5 5 15 5 30C5 40 12 48 17 50"
        fill="rgba(255,255,255,0.9)"
      />
      {/* Right leaf */}
      <Path
        d="M17 5C17 5 29 15 29 30C29 40 22 48 17 50"
        fill="rgba(255,255,255,0.9)"
      />
      {/* Center vein */}
      <Path
        d="M17 10L17 50"
        stroke={palette.teal[500]}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left veins */}
      <Path
        d="M17 18L10 26M17 28L8 36M17 38L11 44"
        stroke={palette.teal[500]}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right veins */}
      <Path
        d="M17 18L24 26M17 28L26 36M17 38L23 44"
        stroke={palette.teal[500]}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </G>

    {/* Small decorative water drops */}
    <Circle cx="68" cy="25" r="4" fill="rgba(255,255,255,0.4)" />
    <Circle cx="75" cy="40" r="3" fill="rgba(255,255,255,0.3)" />
    <Circle cx="70" cy="60" r="2.5" fill="rgba(255,255,255,0.25)" />
  </Svg>
);

export const FeaturedBreathingCard: React.FC<FeaturedBreathingCardProps> = ({
  onPress,
  testID,
}) => {
  const { borderRadius } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(100)}>
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
              <Stop offset="50%" stopColor={palette.teal[500]} />
              <Stop offset="100%" stopColor={palette.teal[400]} />
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

        {/* Wave Pattern Background */}
        <Svg style={styles.wavePattern} viewBox="0 0 400 200" preserveAspectRatio="none">
          <Path
            d="M0,80 Q80,40 160,80 T320,80 T480,80 L480,200 L0,200 Z"
            fill="rgba(255,255,255,0.04)"
          />
          <Path
            d="M0,100 Q100,60 200,100 T400,100 L400,200 L0,200 Z"
            fill="rgba(255,255,255,0.03)"
          />
          <Path
            d="M0,130 Q120,90 240,130 T480,130 L480,200 L0,200 Z"
            fill="rgba(255,255,255,0.02)"
          />
        </Svg>

        {/* Content */}
        <View style={styles.content}>
          {/* Left side content */}
          <View style={styles.leftContent}>
            {/* Recommended Badge */}
            <View style={[styles.badge, { borderRadius: borderRadius.full }]}>
              <Text style={styles.badgeText}>
                {t('intervention.practice.recommended')}
              </Text>
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
              {t('intervention.practice.options.breathing.descriptionShort')}
            </Text>

            {/* Bottom Row: Duration + CTA */}
            <View style={styles.bottomRow}>
              <View style={[styles.durationBadge, { borderRadius: borderRadius.full }]}>
                <Text style={styles.durationText}>
                  {t('intervention.practice.options.breathing.duration')}
                </Text>
              </View>

              <View style={[styles.ctaButton, { borderRadius: borderRadius.full }]}>
                <Text style={[styles.ctaText, { color: palette.emerald[600] }]}>
                  {t('intervention.practice.tryIt')} →
                </Text>
              </View>
            </View>
          </View>

          {/* Right side - Leaf illustration with circular glow */}
          <View style={styles.illustrationContainer}>
            <LeafIllustration />
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  wavePattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  durationBadge: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
