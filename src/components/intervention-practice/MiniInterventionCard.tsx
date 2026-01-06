/**
 * MiniInterventionCard - Small card for secondary intervention options
 * Used in the 3-column grid layout for Friction, Mirror, and AI Coach
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export interface MiniInterventionCardProps {
  type: 'friction' | 'mirror' | 'ai';
  title: string;
  subtitle?: string;
  locked?: boolean;
  lockedLabel?: string;
  onPress: () => void;
  index: number;
  testID?: string;
}

const CARD_CONFIG = {
  friction: {
    emoji: '\u23F3', // hourglass
    color: palette.orange[500],
    backgroundColor: `${palette.orange[500]}26`, // 15% opacity
  },
  mirror: {
    emoji: '\uD83D\uDC64', // bust in silhouette
    color: palette.purple[500],
    backgroundColor: `${palette.purple[500]}26`, // 15% opacity
  },
  ai: {
    emoji: '\uD83E\uDD16', // robot
    color: palette.emerald[500],
    backgroundColor: `${palette.emerald[500]}1A`, // 10% opacity
  },
};

export const MiniInterventionCard: React.FC<MiniInterventionCardProps> = ({
  type,
  title,
  subtitle,
  locked = false,
  lockedLabel,
  onPress,
  index,
  testID,
}) => {
  const { colors, borderRadius, spacing } = useTheme();
  const config = CARD_CONFIG[type];

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
      <Pressable
        onPress={onPress}
        disabled={locked}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: locked }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            opacity: locked ? 0.6 : pressed ? 0.8 : 1,
          },
        ]}
      >
        {locked && (
          <View
            style={[
              styles.lockedBadge,
              {
                backgroundColor: colors.backgroundCard,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
            {lockedLabel && (
              <Text style={[styles.lockedText, { color: colors.textMuted }]}>
                {lockedLabel}
              </Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: config.backgroundColor,
            },
          ]}
        >
          <Text style={[styles.emoji, { opacity: locked ? 0.5 : 1 }]}>
            {config.emoji}
          </Text>
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.textPrimary, marginTop: spacing.sm },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[styles.subtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 110,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 2,
  },
  lockedText: {
    fontSize: 8,
    fontWeight: '600',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});
