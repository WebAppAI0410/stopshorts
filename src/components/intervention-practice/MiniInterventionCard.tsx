/**
 * MiniInterventionCard - Glassmorphism card for secondary intervention options
 * Used in the 3-column grid layout for Friction, Mirror, and AI Coach
 * Uses expo-linear-gradient for reliable Android rendering
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export interface MiniInterventionCardProps {
  type: 'friction' | 'mirror' | 'ai';
  title: string;
  locked?: boolean;
  onPress: () => void;
  index: number;
  testID?: string;
}

// Hourglass icon for Friction
const HourglassIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Rect x="5" y="2" width="14" height="2.5" rx="1" fill={color} />
    <Path
      d="M6.5 4.5L6.5 7C6.5 9 8 11 12 11C16 11 17.5 9 17.5 7L17.5 4.5"
      fill={color}
      opacity={0.5}
    />
    <Path
      d="M8 5L8 6.5C8 7.5 9 9 12 9C15 9 16 7.5 16 6.5L16 5"
      fill={color}
      opacity={0.3}
    />
    <Path
      d="M6.5 19.5L6.5 17C6.5 15 8 13 12 13C16 13 17.5 15 17.5 17L17.5 19.5"
      fill={color}
    />
    <Path
      d="M10.5 11L10.5 13M13.5 11L13.5 13"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Rect x="5" y="19.5" width="14" height="2.5" rx="1" fill={color} />
  </Svg>
);

// Person with water drops icon for Mirror
const MirrorIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Circle cx="10" cy="7" r="4" fill={color} />
    <Path
      d="M10 13C5 13 2 16 2 20L18 20C18 16 15 13 10 13Z"
      fill={color}
    />
    <Path
      d="M19 3C19 3 21.5 6 21.5 8C21.5 9.4 20.4 10.5 19 10.5C17.6 10.5 16.5 9.4 16.5 8C16.5 6 19 3 19 3Z"
      fill={color}
      opacity={0.8}
    />
    <Path
      d="M22 11C22 11 23.5 13 23.5 14.2C23.5 15.2 22.7 16 21.7 16C20.7 16 20 15.2 20 14.2C20 13 22 11 22 11Z"
      fill={color}
      opacity={0.5}
    />
  </Svg>
);

// Robot icon for AI Coach
const RobotIcon: React.FC<{ color: string; locked?: boolean }> = ({ color, locked }) => {
  const opacity = locked ? 0.4 : 1;

  return (
    <Svg width={32} height={32} viewBox="0 0 24 24">
      <Circle cx="12" cy="2.5" r="2" fill={color} opacity={opacity} />
      <Rect x="11" y="3.5" width="2" height="3" fill={color} opacity={opacity} />
      <Rect x="5" y="6.5" width="14" height="11" rx="3" fill={color} opacity={opacity} />
      <Circle cx="9" cy="11" r="2" fill="white" opacity={locked ? 0.3 : 0.9} />
      <Circle cx="15" cy="11" r="2" fill="white" opacity={locked ? 0.3 : 0.9} />
      <Rect x="9" y="14.5" width="6" height="1.5" rx="0.75" fill="white" opacity={locked ? 0.2 : 0.7} />
      <Rect x="2" y="9" width="3" height="5" rx="1" fill={color} opacity={opacity * 0.7} />
      <Rect x="19" y="9" width="3" height="5" rx="1" fill={color} opacity={opacity * 0.7} />
      {locked && (
        <>
          <Rect x="9" y="19" width="6" height="5" rx="1" fill="#6B7280" />
          <Circle cx="12" cy="18" r="3" stroke="#6B7280" strokeWidth="2" fill="none" />
        </>
      )}
    </Svg>
  );
};

const CARD_CONFIG = {
  friction: {
    Icon: HourglassIcon,
    color: palette.orange[400],
    gradientColors: [palette.orange[500], palette.orange[400]] as const,
  },
  mirror: {
    Icon: MirrorIcon,
    color: palette.purple[400],
    gradientColors: [palette.purple[500], palette.purple[400]] as const,
  },
  ai: {
    Icon: RobotIcon,
    color: palette.emerald[400],
    gradientColors: [palette.emerald[500], palette.emerald[400]] as const,
  },
};

export const MiniInterventionCard: React.FC<MiniInterventionCardProps> = ({
  type,
  title,
  locked = false,
  onPress,
  index,
  testID,
}) => {
  const { colors, borderRadius, isDark } = useTheme();
  const config = CARD_CONFIG[type];
  const IconComponent = config.Icon;

  // More visible dark glassmorphism background
  const cardBackgroundColor = isDark
    ? 'rgba(45, 55, 72, 0.9)'  // Lighter slate for visibility
    : 'rgba(255, 255, 255, 0.9)';

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.15)'  // More visible border
    : 'rgba(0, 0, 0, 0.1)';

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200 + index * 80)}>
      <Pressable
        onPress={onPress}
        disabled={locked && type === 'ai'}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: locked }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: cardBackgroundColor,
            borderColor: borderColor,
            borderRadius: borderRadius.lg,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {/* Locked Badge */}
        {locked && (
          <View
            style={[
              styles.lockedBadge,
              {
                backgroundColor: 'rgba(107, 114, 128, 0.7)',
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text style={styles.lockedText}>
              {t('intervention.practice.locked')}
            </Text>
          </View>
        )}

        {/* Icon Container with gradient background */}
        <View style={[styles.iconContainer, { borderRadius: borderRadius.md }]}>
          <LinearGradient
            colors={locked
              ? ['rgba(107, 114, 128, 0.3)', 'rgba(107, 114, 128, 0.2)']
              : config.gradientColors
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md }]}
          />
          <IconComponent color={locked ? '#6B7280' : config.color} locked={locked} />
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: locked ? colors.textMuted : colors.textPrimary,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 130,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    position: 'relative',
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
});
