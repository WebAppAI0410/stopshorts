import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { palette } from '../../design/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

type MiniInterventionCardProps = {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  onPress: () => void;
  index: number;
  isLocked?: boolean;
};

export const MiniInterventionCard = ({
  title,
  subtitle,
  iconName,
  iconColor,
  iconBgColor,
  onPress,
  index,
  isLocked = false,
}: MiniInterventionCardProps) => {
  const { colors, borderRadius, spacing } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 100).duration(600)}
      style={styles.container}
    >
      <Pressable
        onPress={onPress}
        disabled={isLocked}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.backgroundCard + 'CC', // Slightly transparent for glass effect
            borderColor: colors.borderSubtle,
            borderWidth: 1,
            borderRadius: borderRadius.lg,
            opacity: isLocked ? 0.6 : (pressed ? 0.8 : 1),
          },
        ]}
      >
        {/* Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        {/* Text Contnet */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>

        {/* Lock Badge */}
        {isLocked && (
          <View style={[styles.lockBadge, { backgroundColor: palette.dark[500] }]}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
            <Text style={[styles.lockText, { color: colors.textMuted }]}>
              Locked
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '30%', // Ensure 3 items fit in a row with some spacing logic handling
    maxWidth: '32%',
    aspectRatio: 0.85,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  lockText: {
    fontSize: 9,
    fontWeight: '600',
  }
});
