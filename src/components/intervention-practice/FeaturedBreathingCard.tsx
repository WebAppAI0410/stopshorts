import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import { t } from '../../i18n';

type FeaturedBreathingCardProps = {
  onPress: () => void;
  testID?: string;
};

// Simple Leaf Icon SVG
const LeafIllustration = () => (
  <Svg width="120" height="120" viewBox="0 0 100 100">
    <G opacity={0.3}>
      <Circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" />
      <Circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
      <Circle cx="50" cy="50" r="25" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
    </G>
    <Path
      d="M50 85 C50 85, 20 60, 20 35 C20 20, 35 10, 50 25 C65 10, 80 20, 80 35 C80 60, 50 85, 50 85 Z"
      fill="white"
      fillOpacity="0.9"
      transform="translate(5, -10)"
    />
    <Path
      d="M65 30 Q75 25, 78 20"
      stroke="white"
      strokeWidth="2"
      fill="none"
      opacity="0.8"
    />
  </Svg>
);

export const FeaturedBreathingCard = ({ onPress, testID }: FeaturedBreathingCardProps) => {
  const { borderRadius, spacing } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(800).delay(200)}>
      <Pressable onPress={onPress} testID={testID} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        <View style={[styles.container, { borderRadius: borderRadius['2xl'] }]}>
          {/* Gradient Background */}
          <LinearGradient
            colors={[palette.emerald[500], palette.teal[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Background Pattern / Illustration */}
          <View style={styles.illustrationContainer}>
            <LeafIllustration />
          </View>

          {/* Content */}
          <View style={[styles.content, { padding: spacing.gutter, paddingBottom: spacing.md }]}>
            {/* Recommended Badge */}
            <View style={[styles.badge, { paddingHorizontal: spacing.smd, paddingVertical: 6 }]}>
              <Text style={styles.badgeText}>{t('intervention.practice.recommended')}</Text>
            </View>

            {/* Title & Subtitle */}
            <View style={[styles.textSection, { marginTop: spacing.smd }]}>
              <View style={[styles.iconRow, { marginBottom: spacing.sm }]}>
                <Ionicons name="leaf" size={24} color="#FFF" />
              </View>
              <Text style={styles.title}>{t('intervention.practice.options.breathing.title')}</Text>
              <Text style={styles.tagline}>{t('intervention.practice.options.breathing.tagline')}</Text>
              <Text style={styles.description}>
                {t('intervention.practice.options.breathing.descriptionShort')}
              </Text>
            </View>

            {/* Bottom Row */}
            <View style={[styles.bottomRow, { marginTop: spacing.smd }]}>
              <View style={[styles.durationBadge, { paddingHorizontal: 10, paddingVertical: spacing.xs }]}>
                <Ionicons name="time-outline" size={12} color="#FFF" style={{ marginRight: spacing.xs }} />
                <Text style={styles.durationText}>
                  {t('intervention.practice.options.breathing.duration')}
                </Text>
              </View>

              <View style={[styles.ctaButton, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}>
                <Text style={styles.ctaText}>{t('intervention.practice.tryIt')}</Text>
                <Ionicons name="arrow-forward" size={16} color={palette.emerald[600]} style={{ marginLeft: spacing.xs }} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: palette.emerald[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  illustrationContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    // padding: spacing.gutter (20), paddingBottom: spacing.md (16) - applied via inline style
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    // paddingHorizontal: spacing.smd (12) - applied via inline style
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  textSection: {
    // marginTop: spacing.smd (12) - applied via inline style
  },
  iconRow: {
    // marginBottom: spacing.sm (8) - applied via inline style
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    // marginBottom: spacing.xs (4)
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    // marginBottom: spacing.xs (4)
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    maxWidth: '85%',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginTop: spacing.smd (12) - applied via inline style
    flexShrink: 0,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // paddingHorizontal: 10, paddingVertical: spacing.xs (4) - applied via inline style
    borderRadius: 12,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    // paddingHorizontal: spacing.md (16), paddingVertical: 10 - applied via inline style
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '45%',
    flexShrink: 0,
  },
  ctaText: {
    color: palette.emerald[600],
    fontSize: 14,
    fontWeight: '700',
  },
});
