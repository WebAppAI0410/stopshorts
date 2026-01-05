/**
 * ResubscribeBanner Component
 * Shows banner when subscription has expired, prompting user to resubscribe
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';

interface ResubscribeBannerProps {
  onPress?: () => void;
}

export function ResubscribeBanner({ onPress }: ResubscribeBannerProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const totalInterventions = useStatisticsStore((state) => state.lifetime.totalInterventions);
  const getTotalSavedMinutes = useStatisticsStore((state) => state.getTotalSavedMinutes);
  const totalBlockedMinutes = getTotalSavedMinutes();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(onboarding)/pricing');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name="diamond-outline" size={24} color={colors.accent} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('subscription.resubscribe.title')}
        </Text>
      </View>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t('subscription.resubscribe.message')}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {totalInterventions}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t('subscription.stats.interventions')}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {totalBlockedMinutes}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t('subscription.stats.timeSaved')}
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={handlePress}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {t('subscription.resubscribe.button')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
