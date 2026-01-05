/**
 * TrialWarningBanner Component
 * Shows warning banner when user is in trial grace period (last day)
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';

interface TrialWarningBannerProps {
  onPress?: () => void;
}

export function TrialWarningBanner({ onPress }: TrialWarningBannerProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(onboarding)/pricing');
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.warning + '15',
          borderColor: colors.warning,
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="warning-outline" size={24} color={colors.warning} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('subscription.trialWarning.title')}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t('subscription.trialWarning.message')}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={colors.warning} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});
