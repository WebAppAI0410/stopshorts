/**
 * FeaturedBreathingCard - Hero card for the recommended Breathing Guide intervention
 * Features gradient background with wave pattern and SVG leaf illustration
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

// SVG Leaf illustration component
const LeafIllustration: React.FC = () => (
  <Svg width={70} height={70} viewBox="0 0 70 70">
    {/* Outer glow circle */}
    <Circle cx="35" cy="35" r="30" fill="rgba(255,255,255,0.1)" />
    {/* Main leaf */}
    <G transform="translate(20, 15)">
      <Path
        d="M15 0C15 0 30 10 30 25C30 40 15 45 15 45C15 45 0 40 0 25C0 10 15 0 15 0Z"
        fill="rgba(255,255,255,0.9)"
      />
      {/* Leaf vein */}
      <Path
        d="M15 8L15 40M15 15L8 22M15 22L22 29M15 30L10 35"
        stroke={palette.teal[500]}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </G>
    {/* Small decorative circles */}
    <Circle cx="52" cy="20" r="3" fill="rgba(255,255,255,0.4)" />
    <Circle cx="58" cy="32" r="2" fill="rgba(255,255,255,0.3)" />
    <Circle cx="50" cy="50" r="2.5" fill="rgba(255,255,255,0.25)" />
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
              <Stop offset="100%" stopColor={palette.teal[500]} />
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
            d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z"
            fill="rgba(255,255,255,0.05)"
          />
          <Path
            d="M0,120 Q100,70 200,120 T400,120 L400,200 L0,200 Z"
            fill="rgba(255,255,255,0.03)"
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
    height: 200,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  wavePattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
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
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  durationBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
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
    marginLeft: 10,
  },
});
