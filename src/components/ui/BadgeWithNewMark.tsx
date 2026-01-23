import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { Badge } from '../../types/statistics';

export interface BadgeWithNewMarkProps {
  badge: Badge;
  size?: number;
  showName?: boolean;
}

/**
 * Check if a badge was earned within the last 24 hours
 */
function isNewlyEarned(badge: Badge): boolean {
  if (!badge.earnedAt) {
    return false;
  }
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  return badge.earnedAt > oneDayAgo;
}

export const BadgeWithNewMark: React.FC<BadgeWithNewMarkProps> = ({
  badge,
  size = 64,
  showName = true,
}) => {
  const { colors, typography, borderRadius } = useTheme();
  const isNew = isNewlyEarned(badge);
  const isEarned = badge.earnedAt !== null;

  return (
    <View style={styles.container}>
      <View style={styles.badgeWrapper}>
        <View
          style={[
            styles.badgeContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surface,
              opacity: isEarned ? 1 : 0.4,
            },
          ]}
        >
          <Text style={[styles.icon, { fontSize: size * 0.5 }]}>
            {badge.icon}
          </Text>
        </View>

        {isNew && (
          <View
            style={[
              styles.newMark,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text style={styles.newMarkText}>NEW</Text>
          </View>
        )}
      </View>

      {showName && (
        <Text
          style={[
            styles.name,
            typography.caption,
            {
              color: isEarned ? colors.textPrimary : colors.textSecondary,
            },
          ]}
          numberOfLines={2}
        >
          {badge.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  badgeWrapper: {
    position: 'relative',
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  newMark: {
    position: 'absolute',
    top: -4,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newMarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    textAlign: 'center',
    marginTop: 8,
  },
});
