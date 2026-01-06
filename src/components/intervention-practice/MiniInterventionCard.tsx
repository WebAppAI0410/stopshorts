/**
 * MiniInterventionCard - Glassmorphism card for secondary intervention options
 * Used in the 3-column grid layout for Friction, Mirror, and AI Coach
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
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
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      d="M6 2L6 6L6 6C6 8.21 7.79 10 10 10L14 10C16.21 10 18 8.21 18 6L18 2L6 2Z"
      fill={color}
      opacity={0.3}
    />
    <Path
      d="M6 22L6 18L6 18C6 15.79 7.79 14 10 14L14 14C16.21 14 18 15.79 18 18L18 22L6 22Z"
      fill={color}
    />
    <Path
      d="M12 10L12 14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Rect x="5" y="2" width="14" height="2" rx="1" fill={color} />
    <Rect x="5" y="20" width="14" height="2" rx="1" fill={color} />
  </Svg>
);

// Person with water drops icon for Mirror
const MirrorIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    {/* Person silhouette */}
    <Circle cx="12" cy="7" r="4" fill={color} />
    <Path
      d="M12 14C8 14 4 16 4 20L20 20C20 16 16 14 12 14Z"
      fill={color}
    />
    {/* Water drops */}
    <Path
      d="M19 4C19 4 21 6.5 21 8C21 9.1 20.1 10 19 10C17.9 10 17 9.1 17 8C17 6.5 19 4 19 4Z"
      fill={color}
      opacity={0.6}
    />
    <Path
      d="M22 10C22 10 23 11.5 23 12.5C23 13.3 22.3 14 21.5 14C20.7 14 20 13.3 20 12.5C20 11.5 22 10 22 10Z"
      fill={color}
      opacity={0.4}
    />
  </Svg>
);

// Robot icon for AI Coach
const RobotIcon: React.FC<{ color: string; locked?: boolean }> = ({ color, locked }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    {/* Robot head */}
    <Rect x="5" y="6" width="14" height="12" rx="3" fill={color} opacity={locked ? 0.5 : 1} />
    {/* Antenna */}
    <Circle cx="12" cy="3" r="2" fill={color} opacity={locked ? 0.5 : 1} />
    <Rect x="11" y="3" width="2" height="4" fill={color} opacity={locked ? 0.5 : 1} />
    {/* Eyes */}
    <Circle cx="9" cy="11" r="1.5" fill="white" />
    <Circle cx="15" cy="11" r="1.5" fill="white" />
    {/* Mouth */}
    <Rect x="9" y="14" width="6" height="2" rx="1" fill="white" opacity={0.8} />
    {/* Ears */}
    <Rect x="2" y="9" width="3" height="4" rx="1" fill={color} opacity={locked ? 0.3 : 0.6} />
    <Rect x="19" y="9" width="3" height="4" rx="1" fill={color} opacity={locked ? 0.3 : 0.6} />
  </Svg>
);

const CARD_CONFIG = {
  friction: {
    Icon: HourglassIcon,
    color: palette.orange[500],
    gradientStart: palette.orange[500],
    gradientEnd: palette.orange[400],
  },
  mirror: {
    Icon: MirrorIcon,
    color: palette.purple[500],
    gradientStart: palette.purple[500],
    gradientEnd: palette.purple[400],
  },
  ai: {
    Icon: RobotIcon,
    color: palette.emerald[500],
    gradientStart: palette.emerald[500],
    gradientEnd: palette.emerald[400],
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
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.03)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.08)',
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
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.08)',
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text style={[styles.lockedText, { color: colors.textMuted }]}>
              {t('intervention.practice.locked')}
            </Text>
          </View>
        )}

        {/* Icon Container with gradient background */}
        <View style={[styles.iconContainer, { borderRadius: borderRadius.md }]}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={`iconGradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={config.gradientStart} stopOpacity={0.2} />
                <Stop offset="100%" stopColor={config.gradientEnd} stopOpacity={0.1} />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={`url(#iconGradient-${type})`}
              rx={borderRadius.md}
            />
          </Svg>
          <IconComponent color={config.color} locked={locked} />
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
    height: 120,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
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
  },
  iconContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
});
