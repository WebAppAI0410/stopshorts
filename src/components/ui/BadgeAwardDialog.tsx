import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import { shouldShowConfetti } from '../../services/badges';
import type { Badge } from '../../types/statistics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface BadgeAwardDialogProps {
  visible: boolean;
  badges: Badge[];
  onDismiss: () => void;
}

export const BadgeAwardDialog: React.FC<BadgeAwardDialogProps> = ({
  visible,
  badges,
  onDismiss,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const confettiRef = useRef<ConfettiCannon>(null);

  // Check if any badge should trigger confetti
  const showConfetti = badges.some((badge) => shouldShowConfetti(badge.id));

  useEffect(() => {
    if (visible && showConfetti && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [visible, showConfetti]);

  if (badges.length === 0) {
    return null;
  }

  const title =
    badges.length === 1
      ? t('statistics.badgeDialog.title')
      : t('statistics.badgeDialog.multipleTitle', { count: badges.length });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              typography.h2,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>

          <View style={styles.badgesContainer}>
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View
                  style={[
                    styles.badgeIconContainer,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.badgeName,
                    typography.body,
                    { color: colors.textPrimary },
                  ]}
                >
                  {badge.name}
                </Text>
                <Text
                  style={[
                    styles.badgeDescription,
                    typography.caption,
                    { color: colors.textSecondary },
                  ]}
                >
                  {badge.description}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onDismiss}
            style={[
              styles.dismissButton,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.xl,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('statistics.badgeDialog.dismiss')}
          >
            <Text style={[typography.button, { color: '#FFFFFF' }]}>
              {t('statistics.badgeDialog.dismiss')}
            </Text>
          </TouchableOpacity>
        </View>

        {showConfetti && (
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{ x: -10, y: 0 }}
            autoStart={false}
            fadeOut
            explosionSpeed={350}
            fallSpeed={3000}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 48,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  badgesContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 64,
  },
  badgeName: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeDescription: {
    textAlign: 'center',
  },
  dismissButton: {
    alignItems: 'center',
  },
});
