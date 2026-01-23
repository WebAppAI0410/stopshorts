import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import { t } from '../../i18n';

export type InterventionType = 'breathing' | 'friction' | 'mirror' | 'ai';

type FeaturedInterventionCardProps = {
  type: InterventionType;
  onPress: () => void;
  testID?: string;
  successRate?: number;
};

// Leaf illustration for breathing
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

// Hourglass illustration for friction
const HourglassIllustration = () => (
  <Svg width="120" height="120" viewBox="0 0 100 100">
    <G opacity={0.3}>
      <Circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" />
      <Circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
    </G>
    <Path
      d="M30 20 L70 20 L70 25 L55 45 L55 55 L70 75 L70 80 L30 80 L30 75 L45 55 L45 45 L30 25 Z"
      fill="white"
      fillOpacity="0.9"
    />
  </Svg>
);

// Mirror illustration
const MirrorIllustration = () => (
  <Svg width="120" height="120" viewBox="0 0 100 100">
    <G opacity={0.3}>
      <Circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" />
      <Circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
    </G>
    <Circle cx="50" cy="40" r="18" fill="white" fillOpacity="0.9" />
    <Path
      d="M30 70 Q30 55, 50 55 Q70 55, 70 70 L70 80 L30 80 Z"
      fill="white"
      fillOpacity="0.9"
    />
  </Svg>
);

// AI illustration
const AIIllustration = () => (
  <Svg width="120" height="120" viewBox="0 0 100 100">
    <G opacity={0.3}>
      <Circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" />
      <Circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
    </G>
    <Rect x="30" y="30" width="40" height="35" rx="8" fill="white" fillOpacity="0.9" />
    <Circle cx="40" cy="45" r="4" fill="white" fillOpacity="0.5" />
    <Circle cx="60" cy="45" r="4" fill="white" fillOpacity="0.5" />
    <Path d="M40 55 Q50 60 60 55" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
    <Path d="M35 70 L40 65 L60 65 L65 70 L65 80 L35 80 Z" fill="white" fillOpacity="0.9" />
  </Svg>
);

const INTERVENTION_CONFIG: Record<InterventionType, {
  gradient: readonly [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  illustration: React.ReactNode;
  ctaColor: string;
  shadowColor: string;
  titleKey: string;
  taglineKey: string;
  descriptionKey: string;
  durationKey: string;
}> = {
  breathing: {
    gradient: [palette.emerald[500], palette.teal[600]] as const,
    icon: 'leaf',
    illustration: <LeafIllustration />,
    ctaColor: palette.emerald[600],
    shadowColor: palette.emerald[500],
    titleKey: 'intervention.practice.options.breathing.title',
    taglineKey: 'intervention.practice.options.breathing.tagline',
    descriptionKey: 'intervention.practice.options.breathing.descriptionShort',
    durationKey: 'intervention.practice.options.breathing.duration',
  },
  friction: {
    gradient: [palette.orange[500], palette.orange[600]] as const,
    icon: 'hourglass-outline',
    illustration: <HourglassIllustration />,
    ctaColor: palette.orange[600],
    shadowColor: palette.orange[500],
    titleKey: 'intervention.practice.options.friction.title',
    taglineKey: 'intervention.practice.options.friction.description',
    descriptionKey: 'intervention.practice.options.friction.description',
    durationKey: 'intervention.practice.options.breathing.duration',
  },
  mirror: {
    gradient: [palette.purple[500], palette.purple[300]] as const,
    icon: 'person-outline',
    illustration: <MirrorIllustration />,
    ctaColor: palette.purple[500],
    shadowColor: palette.purple[500],
    titleKey: 'intervention.practice.options.mirror.title',
    taglineKey: 'intervention.practice.options.mirror.description',
    descriptionKey: 'intervention.practice.options.mirror.description',
    durationKey: 'intervention.practice.options.breathing.duration',
  },
  ai: {
    gradient: [palette.teal[500], palette.teal[600]] as const,
    icon: 'chatbubble-ellipses',
    illustration: <AIIllustration />,
    ctaColor: palette.teal[600],
    shadowColor: palette.teal[500],
    titleKey: 'intervention.practice.options.ai.title',
    taglineKey: 'intervention.practice.options.ai.description',
    descriptionKey: 'intervention.practice.options.ai.description',
    durationKey: 'intervention.practice.options.breathing.duration',
  },
};

export const FeaturedInterventionCard = ({
  type,
  onPress,
  testID,
  successRate,
}: FeaturedInterventionCardProps) => {
  const { borderRadius } = useTheme();
  const config = INTERVENTION_CONFIG[type];

  return (
    <Animated.View entering={FadeInDown.duration(800).delay(200)}>
      <Pressable onPress={onPress} testID={testID} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        <View style={[styles.container, { borderRadius: borderRadius['2xl'], shadowColor: config.shadowColor }]}>
          <LinearGradient
            colors={config.gradient as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.illustrationContainer}>
            {config.illustration}
          </View>

          <View style={styles.content}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('intervention.practice.recommended')}</Text>
            </View>

            <View style={styles.textSection}>
              <View style={styles.iconRow}>
                <Ionicons name={config.icon} size={24} color="#FFF" />
              </View>
              <Text style={styles.title}>{t(config.titleKey)}</Text>
              <Text style={styles.tagline}>{t(config.taglineKey)}</Text>
              {successRate !== undefined && successRate > 0 && (
                <Text style={styles.successRate}>
                  {t('intervention.practice.basedOnSuccess', { rate: Math.round(successRate * 100) })}
                </Text>
              )}
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.durationText}>
                  {t(config.durationKey)}
                </Text>
              </View>

              <View style={[styles.ctaButton]}>
                <Text style={[styles.ctaText, { color: config.ctaColor }]}>{t('intervention.practice.tryIt')}</Text>
                <Ionicons name="arrow-forward" size={16} color={config.ctaColor} style={{ marginLeft: 4 }} />
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
  successRate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
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
    fontSize: 14,
    fontWeight: '700',
  },
});
