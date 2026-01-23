/**
 * ModelDownloadCard Component
 *
 * Displays model download status and allows users to download the local LLM.
 * Shows different states: not downloaded, downloading, ready, error
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui';
import { QWEN3_CONFIG, type ModelStatus } from '../../services/ai/executorchLLM';
import { t } from '../../i18n';

interface ModelDownloadCardProps {
  /** Current model status */
  status: ModelStatus;
  /** Download progress (0-100) */
  progress: number;
  /** Error message if any */
  error?: string | null;
  /** Callback to start download */
  onDownload: () => void;
  /** Callback to retry after error */
  onRetry?: () => void;
  /** Callback when user wants to skip (use fallback) */
  onSkip?: () => void;
  /** Whether skip option is available */
  showSkip?: boolean;
}

export function ModelDownloadCard({
  status,
  progress,
  error,
  onDownload,
  onRetry,
  onSkip,
  showSkip = true,
}: ModelDownloadCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  // Format file size for display
  const formatSize = useCallback((bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }, []);

  // Get status icon and color
  const getStatusConfig = useCallback(() => {
    switch (status) {
      case 'ready':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.success,
          bgColor: colors.success + '20',
        };
      case 'downloading':
        return {
          icon: 'cloud-download' as const,
          color: colors.primary,
          bgColor: colors.primary + '20',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: colors.error,
          bgColor: colors.error + '20',
        };
      case 'unavailable':
        return {
          icon: 'warning' as const,
          color: colors.warning,
          bgColor: colors.warning + '20',
        };
      default:
        return {
          icon: 'sparkles' as const,
          color: colors.primary,
          bgColor: colors.primary + '20',
        };
    }
  }, [status, colors]);

  const statusConfig = getStatusConfig();

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case 'ready':
        return (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[typography.body, { color: colors.textPrimary }]}>
              {t('ai.model.ready')}
            </Text>
          </Animated.View>
        );

      case 'downloading':
        return (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[typography.body, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              {t('ai.model.downloading')}
            </Text>
            <ProgressBar
              progress={progress}
              height={8}
              variant="primary"
            />
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' }]}>
              {progress.toFixed(0)}%
            </Text>
          </Animated.View>
        );

      case 'error':
        return (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[typography.body, { color: colors.error, marginBottom: spacing.sm }]}>
              {error || t('ai.model.error')}
            </Text>
            <Button
              title={t('ai.model.retry')}
              onPress={onRetry || onDownload}
              variant="secondary"
              size="sm"
            />
          </Animated.View>
        );

      case 'unavailable':
        return (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              {t('ai.model.unavailable')}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              {t('ai.model.requirements', {
                ram: QWEN3_CONFIG.requirements.minRamMB / 1024,
                storage: formatSize(QWEN3_CONFIG.requirements.minStorageMB * 1024 * 1024),
              })}
            </Text>
          </Animated.View>
        );

      default:
        // not_downloaded
        return (
          <Animated.View entering={FadeInUp.duration(300)}>
            <Text style={[typography.body, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              {t('ai.model.description')}
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={16} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.xs }]}>
                {QWEN3_CONFIG.name} (~{formatSize(QWEN3_CONFIG.requirements.minStorageMB * 1024 * 1024)})
              </Text>
            </View>
            <View style={[styles.infoRow, { marginTop: spacing.xs }]}>
              <Ionicons name="hardware-chip-outline" size={16} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.xs }]}>
                {t('ai.model.requirements', {
                  ram: QWEN3_CONFIG.requirements.minRamMB / 1024,
                  storage: formatSize(QWEN3_CONFIG.requirements.minStorageMB * 1024 * 1024),
                })}
              </Text>
            </View>
            <Button
              title={t('ai.model.download')}
              onPress={onDownload}
              variant="primary"
              style={{ marginTop: spacing.lg }}
            />
            {showSkip && onSkip && (
              <Pressable
                onPress={onSkip}
                style={({ pressed }) => [
                  styles.skipButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('ai.model.skip')}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        );
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.lg,
          borderColor: colors.border,
          padding: spacing.lg,
        },
      ]}
    >
      {/* Header with icon */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: statusConfig.bgColor,
              borderRadius: borderRadius.full,
              marginRight: spacing.smd,
            },
          ]}
        >
          <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {t('ai.model.title')}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {t(`ai.model.status.${status}`)}
          </Text>
        </View>
      </View>

      {/* Content based on status */}
      <View style={{ marginTop: spacing.md }}>
        {renderContent()}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: spacing.smd (12) - applied via inline style
  },
  headerText: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipButton: {
    // marginTop: spacing.smd (12)
    marginTop: 12,
    alignItems: 'center',
    // paddingVertical: spacing.sm (8)
    paddingVertical: 8,
  },
});
