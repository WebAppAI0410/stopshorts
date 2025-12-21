/**
 * AppSelectionModal Component
 *
 * A modal for selecting installed apps to add to the monitoring list.
 * Android only - iOS requires Family Controls Entitlement (pending approval).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { screenTimeService, InstalledApp } from '../native/ScreenTimeModule';

interface AppSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (app: InstalledApp) => void;
  excludePackages?: string[];
}

export function AppSelectionModal({
  visible,
  onClose,
  onSelect,
  excludePackages = [],
}: AppSelectionModalProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appIcons, setAppIcons] = useState<Record<string, string>>({});

  const loadApps = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setError('この機能はAndroidでのみ利用可能です。iOSは準備中です。');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const installedApps = await screenTimeService.getInstalledApps();
      setApps(installedApps);

      // Fetch icons in background (don't block UI)
      const fetchIcons = async () => {
        const icons: Record<string, string> = {};
        for (const app of installedApps) {
          try {
            const icon = await screenTimeService.getAppIcon(app.packageName);
            if (icon) {
              icons[app.packageName] = icon;
            }
          } catch {
            // Ignore errors, will use fallback icon
          }
        }
        setAppIcons(icons);
      };
      fetchIcons();
    } catch (err) {
      console.error('[AppSelectionModal] Failed to load apps:', err);
      setError('アプリ一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadApps();
      setSearchQuery('');
    }
  }, [visible, loadApps]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = apps.filter(
      (app) =>
        !excludePackages.includes(app.packageName) &&
        (app.appName.toLowerCase().includes(query) ||
          app.packageName.toLowerCase().includes(query))
    );
    setFilteredApps(filtered);
  }, [apps, searchQuery, excludePackages]);

  const handleSelect = (app: InstalledApp) => {
    onSelect(app);
    onClose();
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'SOCIAL':
        return 'people-outline';
      case 'VIDEO':
        return 'videocam-outline';
      case 'GAME':
        return 'game-controller-outline';
      case 'IMAGE':
        return 'image-outline';
      case 'AUDIO':
        return 'musical-notes-outline';
      case 'NEWS':
        return 'newspaper-outline';
      case 'PRODUCTIVITY':
        return 'briefcase-outline';
      default:
        return 'apps-outline';
    }
  };

  const renderApp = ({ item }: { item: InstalledApp }) => (
    <TouchableOpacity
      style={[
        styles.appItem,
        {
          backgroundColor: colors.backgroundCard,
          borderRadius: borderRadius.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.appIcon,
          {
            backgroundColor: colors.accentMuted,
            borderRadius: borderRadius.md,
            overflow: 'hidden',
          },
        ]}
      >
        {appIcons[item.packageName] ? (
          <Image
            source={{ uri: `data:image/png;base64,${appIcons[item.packageName]}` }}
            style={{ width: 36, height: 36, borderRadius: 8 }}
          />
        ) : (
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={24}
            color={colors.accent}
          />
        )}
      </View>
      <View style={styles.appInfo}>
        <Text
          style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}
          numberOfLines={1}
        >
          {item.appName}
        </Text>
        <Text
          style={[typography.caption, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {item.packageName}
        </Text>
      </View>
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.sm,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return null;

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[typography.body, { color: colors.error, marginTop: spacing.md, textAlign: 'center' }]}>
            {error}
          </Text>
        </View>
      );
    }

    if (searchQuery && filteredApps.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
            「{searchQuery}」に一致するアプリが見つかりません
          </Text>
        </View>
      );
    }

    if (apps.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="apps-outline" size={48} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
            インストール済みのアプリがありません
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
            アプリを選択
          </Text>
          <View style={styles.closeButton} />
        </View>

        {/* iOS Notice */}
        {Platform.OS === 'ios' && (
          <View
            style={[
              styles.noticeContainer,
              {
                backgroundColor: colors.warning + '20',
                borderRadius: borderRadius.md,
                margin: spacing.md,
                padding: spacing.md,
              },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={[typography.caption, { color: colors.warning, marginLeft: spacing.sm, flex: 1 }]}>
              iOSでのカスタムアプリ選択は、Family Controls Entitlement の承認待ちです。
            </Text>
          </View>
        )}

        {/* Search Input */}
        <View style={[styles.searchContainer, { paddingHorizontal: spacing.md }]}>
          <View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[
                styles.searchInput,
                typography.body,
                { color: colors.textPrimary },
              ]}
              placeholder="アプリを検索..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* App Count */}
        {!loading && !error && (
          <View style={[styles.countContainer, { paddingHorizontal: spacing.md }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {filteredApps.length}件のアプリ
              {excludePackages.length > 0 && ` (${excludePackages.length}件は既に追加済み)`}
            </Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
              アプリ一覧を読み込み中...
            </Text>
          </View>
        )}

        {/* App List */}
        {!loading && (
          <FlatList
            data={filteredApps}
            keyExtractor={(item) => item.packageName}
            renderItem={renderApp}
            contentContainerStyle={[
              styles.listContent,
              { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  countContainer: {
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
});

export default AppSelectionModal;
