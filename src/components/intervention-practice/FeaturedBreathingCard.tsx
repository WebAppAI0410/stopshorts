import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { palette, typography } from '../../design/theme';
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
  const { borderRadius, spacing, colors } = useTheme();

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
          <View style={styles.content}>
            {/* Recommended Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('intervention.practice.recommended')}</Text>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.textSection}>
              <View style={styles.iconRow}>
                <Ionicons name="leaf" size={24} color="#FFF" />
              </View>
              <Text style={styles.title}>{t('intervention.practice.options.breathing.title')}</Text>
              <Text style={styles.tagline}>{t('intervention.practice.options.breathing.tagline')}</Text>
              <Text style={styles.description}>
                {t('intervention.practice.options.breathing.descriptionShort')}
              </Text>
            </View>

            {/* Bottom Row */}
            <View style={styles.bottomRow}>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.durationText}>
                  {t('intervention.practice.options.breathing.duration')}
                </Text>
              </View>

              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{t('intervention.practice.tryIt')}</Text>
                <Ionicons name="arrow-forward" size={16} color={palette.emerald[600]} style={{ marginLeft: 4 }} />
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
    padding: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    marginTop: 12,
  },
  iconRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
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
    marginTop: 12,
    flexShrink: 0,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
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
