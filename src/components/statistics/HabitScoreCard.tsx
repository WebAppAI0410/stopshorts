/**
 * HabitScoreCard - Displays the habit score with a circular gauge
 *
 * A tappable card that shows the user's habit score (0-100)
 * and navigates to the details screen when pressed.
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { CircularGauge } from './CircularGauge';

export interface HabitScoreCardProps {
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Test ID for testing */
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const HabitScoreCard: React.FC<HabitScoreCardProps> = ({ onPress, testID }) => {
  const { colors, typography, borderRadius } = useTheme();
  const getHabitScore = useStatisticsStore((state) => state.getHabitScore);

  const score = getHabitScore();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    onPress?.();
  };

  return (
    <AnimatedPressable
      testID={testID}
      style={[
        animatedStyle,
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.lg,
          borderColor: colors.border,
        },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
            fontSize: typography.caption.fontSize,
            fontWeight: typography.caption.fontWeight,
          },
        ]}
      >
        {t('statistics.habitScore')}
      </Text>

      <View style={styles.gaugeContainer}>
        <CircularGauge value={score} size={100} strokeWidth={10} />
      </View>

      {score === 0 && (
        <Text
          style={[
            styles.encouragement,
            {
              color: colors.textMuted,
              fontSize: typography.bodySmall.fontSize,
            },
          ]}
        >
          {t('statistics.habitScoreEncouragement')}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    width: 165,
    height: 180,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    textAlign: 'center',
  },
  gaugeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encouragement: {
    textAlign: 'center',
    marginTop: 8,
  },
});
