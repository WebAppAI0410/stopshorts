/**
 * ContentListItem Component
 * List item for content display in topic detail screen
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import type { TrainingContent, ContentType } from '../../types/training';

interface ContentListItemProps {
  content: TrainingContent;
  isCompleted: boolean;
  onPress: () => void;
  index?: number;
  estimatedMinutes?: number;
}

const CONTENT_TYPE_CONFIG: Record<
  ContentType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    colorKey: 'primary' | 'accent' | 'success';
  }
> = {
  article: { icon: 'book-outline', colorKey: 'primary' },
  quiz: { icon: 'flask-outline', colorKey: 'accent' },
  worksheet: { icon: 'document-text-outline', colorKey: 'success' },
};

export function ContentListItem({
  content,
  isCompleted,
  onPress,
  index = 0,
  estimatedMinutes = 3,
}: ContentListItemProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const config = CONTENT_TYPE_CONFIG[content.type];

  const getColor = () => {
    switch (config.colorKey) {
      case 'primary':
        return colors.primary;
      case 'accent':
        return colors.accent;
      case 'success':
        return colors.success;
    }
  };

  const iconColor = isCompleted ? colors.success : getColor();

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 100)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.lg,
            borderWidth: isCompleted ? 1 : 0,
            borderColor: isCompleted ? colors.success + '40' : 'transparent',
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.content, { padding: spacing.md }]}>
          {/* Completion indicator */}
          <View
            style={[
              styles.checkContainer,
              {
                backgroundColor: isCompleted ? colors.success + '20' : colors.border,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color={colors.success} />
            ) : (
              <View style={styles.emptyCircle} />
            )}
          </View>

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: iconColor + '15',
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Ionicons name={config.icon} size={20} color={iconColor} />
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text
              style={[
                typography.label,
                {
                  color: isCompleted ? colors.textSecondary : colors.textPrimary,
                  textDecorationLine: isCompleted ? 'none' : 'none',
                },
              ]}
              numberOfLines={1}
            >
              {t(content.titleKey)}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {getContentTypeLabel(content.type)}
            </Text>
          </View>

          {/* Time and arrow */}
          <View style={styles.rightContent}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {estimatedMinutes}{t('training.minutes')}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
              style={styles.chevron}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getContentTypeLabel(type: ContentType): string {
  switch (type) {
    case 'article':
      return t('training.contentTypes.article');
    case 'quiz':
      return t('training.contentTypes.quiz');
    case 'worksheet':
      return t('training.contentTypes.worksheet');
  }
}

const styles = StyleSheet.create({
  container: {
    // inline styles
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
  },
});
