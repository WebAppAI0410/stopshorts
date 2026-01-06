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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Score100CelebrationDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export const Score100CelebrationDialog: React.FC<Score100CelebrationDialogProps> = ({
  visible,
  onDismiss,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (visible && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [visible]);

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
          {/* Trophy icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={styles.icon}>🏆</Text>
          </View>

          <Text
            style={[
              styles.title,
              typography.h2,
              { color: colors.primary },
            ]}
          >
            {t('statistics.score100Celebration.title')}
          </Text>

          <Text
            style={[
              styles.message,
              typography.body,
              { color: colors.textSecondary },
            ]}
          >
            {t('statistics.score100Celebration.message')}
          </Text>

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
            accessibilityLabel={t('statistics.score100Celebration.dismiss')}
          >
            <Text style={[typography.button, { color: '#FFFFFF' }]}>
              {t('statistics.score100Celebration.dismiss')}
            </Text>
          </TouchableOpacity>
        </View>

        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
        />
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
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  dismissButton: {
    alignItems: 'center',
  },
});
