/**
 * FeaturedBreathingCard - Hero card for the recommended Breathing Guide intervention
 * Features gradient background with wave pattern and SVG leaf illustration
 * Uses expo-linear-gradient for reliable Android rendering
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G } from 'react-native-svg';
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
    <Circle cx="45" cy="45" r="44" fill="rgba(255,255,255,0.05)" />
    <Circle cx="45" cy="45" r="36" fill="rgba(255,255,255,0.08)" />
    <Circle cx="45" cy="45" r="28" fill="rgba(255,255,255,0.12)" />

    {/* Main leaf group */}
    <G transform="translate(28, 18)">
      {/* Left leaf */}
      <Path
        d="M17 5C17 5 5 15 5 30C5 40 12 48 17 50"
        fill="rgba(255,255,255,0.95)"
      />
      {/* Right leaf */}
      <Path
        d="M17 5C17 5 29 15 29 30C29 40 22 48 17 50"
        fill="rgba(255,255,255,0.95)"
      />
      {/* Center vein */}
      <Path
        d="M17 10L17 50"
        stroke={palette.teal[500]}
        strokeWidth="2.5"
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
    <Circle cx="70" cy="22" r="4" fill="rgba(255,255,255,0.5)" />
    <Circle cx="76" cy="38" r="3" fill="rgba(255,255,255,0.4)" />
    <Circle cx="72" cy="55" r="2.5" fill="rgba(255,255,255,0.3)" />
  </Svg>
);

// Wave pattern overlay
const WavePattern: React.FC = () => (
  <Svg
    width="100%"
    height={80}
    viewBox="0 0 400 80"
    preserveAspectRatio="none"
    style={styles.wavePattern}
  >
    <Path
      d="M0,30 Q80,10 160,30 T320,30 T480,30 L480,80 L0,80 Z"
      fill="rgba(255,255,255,0.04)"
    />
    <Path
      d="M0,45 Q100,25 200,45 T400,45 L400,80 L0,80 Z"
      fill="rgba(255,255,255,0.03)"
    />
    <Path
      d="M0,60 Q120,40 240,60 T480,60 L480,80 L0,80 Z"
      fill="rgba(255,255,255,0.02)"
    />
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
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Gradient Background using expo-linear-gradient */}
        <LinearGradient
          colors={[palette.teal[400], palette.teal[500], palette.emerald[500]]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]}
        />

        {/* Wave Pattern Overlay */}
        <WavePattern />

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

          {/* Right side - Leaf illustration */}
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
    shadowColor: palette.emerald[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  wavePattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    marginTop: 4,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  durationBadge: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
