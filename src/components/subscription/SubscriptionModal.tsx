/**
 * SubscriptionModal Component
 * Modal shown when user tries to access a blocked tab (AI/Training/Profile)
 * when their subscription has expired.
 */

import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const totalInterventions = useStatisticsStore((state) => state.lifetime.totalInterventions);
  const getTotalSavedMinutes = useStatisticsStore((state) => state.getTotalSavedMinutes);
  const totalBlockedMinutes = getTotalSavedMinutes();

  const handleSubscribe = () => {
    onClose();
    router.push('/(onboarding)/pricing');
  };

  const features = [
    { key: 'interventions', icon: 'shield-checkmark-outline' as const },
    { key: 'training', icon: 'school-outline' as const },
    { key: 'statistics', icon: 'analytics-outline' as const },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="diamond" size={48} color={colors.accent} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('subscription.modal.title')}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('subscription.expired.message')}
          </Text>

          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.backgroundCard, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statsTitle, { color: colors.textMuted }]}>
              {t('subscription.modal.yourAchievements')}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {totalInterventions}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('subscription.stats.interventions')}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {totalBlockedMinutes}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('subscription.stats.timeSaved')}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.featuresTitle, { color: colors.textMuted }]}>
            {t('subscription.expired.featuresTitle')}
          </Text>

          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <View
                key={feature.key}
                style={[
                  styles.featureItem,
                  { backgroundColor: colors.backgroundCard },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: colors.accent + '15' }]}>
                  <Ionicons name={feature.icon} size={20} color={colors.accent} />
                </View>
                <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                  {t(`subscription.expired.features.${feature.key}`)}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.selectPlanText, { color: colors.textSecondary }]}>
            {t('subscription.modal.selectPlan')}
          </Text>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.subscribeButton, { backgroundColor: colors.accent }]}
            onPress={handleSubscribe}
          >
            <Text style={[styles.subscribeButtonText, { color: colors.background }]}>
              {t('subscription.expired.subscribeButton')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 48,
    marginHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 8,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectPlanText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
