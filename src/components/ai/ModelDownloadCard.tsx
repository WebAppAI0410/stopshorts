/**
 * ModelDownloadCard Component
 * Displays LLM model download status and allows users to download/manage the model
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAIStore } from '../../stores/useAIStore';
import { MODEL_INFO } from '../../services/ai';
import { t } from '../../i18n';
import { Button } from '../ui';

interface ModelDownloadCardProps {
  /** Show compact version */
  compact?: boolean;
  /** Callback when model becomes ready */
  onReady?: () => void;
}

export function ModelDownloadCard({
  compact = false,
  onReady,
}: ModelDownloadCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  // AI Store
  const modelStatus = useAIStore((state) => state.modelStatus);
  const downloadProgress = useAIStore((state) => state.downloadProgress);
  const modelError = useAIStore((state) => state.modelError);
  const downloadModel = useAIStore((state) => state.downloadModel);
  const checkModelStatus = useAIStore((state) => state.checkModelStatus);

  // Progress animation
  const progressWidth = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Update progress animation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are designed to be mutable
    progressWidth.value = withTiming(downloadProgress, { duration: 300 });
  }, [downloadProgress, progressWidth]);

  // Check model status on mount
  useEffect(() => {
    checkModelStatus();
  }, [checkModelStatus]);

  // Notify when model becomes ready
  useEffect(() => {
    if (modelStatus === 'ready' && onReady) {
      onReady();
    }
  }, [modelStatus, onReady]);

  // Handle download
  const handleDownload = useCallback(() => {
    downloadModel();
  }, [downloadModel]);

  // Handle retry
  const handleRetry = useCallback(() => {
    checkModelStatus();
  }, [checkModelStatus]);

  // Format file size
  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  // Get status icon
  const getStatusIcon = (): { name: string; color: string } => {
    switch (modelStatus) {
      case 'ready':
        return { name: 'checkmark-circle', color: colors.success };
      case 'downloading':
      case 'loading':
        return { name: 'cloud-download-outline', color: colors.primary };
      case 'error':
        return { name: 'alert-circle', color: colors.error };
      case 'unavailable':
        return { name: 'close-circle', color: colors.error };
      default:
        return { name: 'cloud-download-outline', color: colors.textMuted };
    }
  };

  // Get status text
  const getStatusText = (): string => {
    switch (modelStatus) {
      case 'ready':
        return t('ai.model.statusReady');
      case 'downloading':
        return t('ai.model.statusDownloading', { progress: downloadProgress });
      case 'loading':
        return t('ai.model.statusLoading');
      case 'error':
        return modelError || t('ai.model.statusError');
      case 'unavailable':
        return t('ai.model.statusUnavailable');
      default:
        return t('ai.model.statusNotDownloaded');
    }
  };

  const statusIcon = getStatusIcon();
  const statusText = getStatusText();

  // Compact version for inline display
  if (compact) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.compactContainer,
          {
            backgroundColor: colors.backgroundCard,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
          },
        ]}
      >
        <Ionicons
          name={statusIcon.name as keyof typeof Ionicons.glyphMap}
          size={20}
          color={statusIcon.color}
        />
        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, marginLeft: spacing.xs, flex: 1 },
          ]}
          numberOfLines={1}
        >
          {statusText}
        </Text>
        {modelStatus === 'not_downloaded' && (
          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.compactButton,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.sm,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[typography.caption, { color: '#FFFFFF' }]}>
              {t('ai.model.download')}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }

  // Full card version
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: statusIcon.color + '15',
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons
            name={statusIcon.name as keyof typeof Ionicons.glyphMap}
            size={24}
            color={statusIcon.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {t('ai.model.title')}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {MODEL_INFO.name} ({formatSize(MODEL_INFO.sizeBytes)})
          </Text>
        </View>
      </View>

      {/* Status */}
      <View style={[styles.statusContainer, { marginTop: spacing.md }]}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {statusText}
        </Text>
      </View>

      {/* Progress Bar (when downloading) */}
      {modelStatus === 'downloading' && (
        <View
          style={[
            styles.progressContainer,
            {
              backgroundColor: colors.border,
              borderRadius: borderRadius.full,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.full,
              },
              progressStyle,
            ]}
          />
        </View>
      )}

      {/* Action Button */}
      <View style={[styles.actionContainer, { marginTop: spacing.md }]}>
        {modelStatus === 'not_downloaded' && (
          <Button
            title={t('ai.model.download')}
            onPress={handleDownload}
            variant="primary"
          />
        )}

        {modelStatus === 'downloading' && (
          <Button
            title={t('ai.model.downloading')}
            onPress={() => {}}
            variant="secondary"
            disabled
            loading
          />
        )}

        {modelStatus === 'loading' && (
          <Button
            title={t('ai.model.loading')}
            onPress={() => {}}
            variant="secondary"
            disabled
            loading
          />
        )}

        {modelStatus === 'error' && (
          <Button
            title={t('ai.model.retry')}
            onPress={handleRetry}
            variant="secondary"
          />
        )}

        {modelStatus === 'ready' && (
          <View style={styles.readyContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
            <Text
              style={[
                typography.body,
                { color: colors.success, marginLeft: spacing.xs },
              ]}
            >
              {t('ai.model.ready')}
            </Text>
          </View>
        )}

        {modelStatus === 'unavailable' && (
          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
            {t('ai.model.unavailableDescription')}
          </Text>
        )}
      </View>

      {/* Model Info */}
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: colors.background,
            borderRadius: borderRadius.md,
            marginTop: spacing.md,
            padding: spacing.sm,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {t('ai.model.description')}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  progressContainer: {
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  actionContainer: {
    alignItems: 'stretch',
  },
  readyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  infoContainer: {
    alignItems: 'flex-start',
  },
});
