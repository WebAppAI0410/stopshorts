/**
 * FakeVideoScreen Component
 * Displays a fake video with gradient background and app-specific UI elements
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { AppTheme, FakeVideoContent, SidebarIconConfig } from './appThemes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FakeVideoScreenProps {
  theme: AppTheme;
  video: FakeVideoContent;
  showSwipeHint?: boolean;
  /** Hide top bar (when rendered separately as fixed overlay) */
  hideTopBar?: boolean;
  /** Hide bottom nav bar (when rendered separately as fixed overlay) */
  hideBottomNav?: boolean;
  /** Bottom inset for safe area (to position elements above bottom nav) */
  bottomInset?: number;
}

// Sidebar icon component
function SidebarIcon({
  config,
  theme,
  count,
}: {
  config: SidebarIconConfig;
  theme: AppTheme;
  count?: string;
}) {
  const size = config.size || theme.iconSize.sidebar;
  const iconName = config.ionicon as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.sidebarIconContainer}>
      <View style={[styles.iconWrapper, { width: size + 8, height: size + 8 }]}>
        <Ionicons name={iconName} size={size} color={theme.textColor} />
      </View>
      {config.hasCount && count && (
        <Text style={[styles.iconCount, { color: theme.textColor }]}>{count}</Text>
      )}
    </View>
  );
}

// Profile icon with follow button (for TikTok style)
function ProfileIcon({ theme }: { theme: AppTheme }) {
  const showFollowButton = theme.id === 'tiktok';

  return (
    <View style={styles.profileContainer}>
      <View
        style={[
          styles.profileImage,
          {
            width: theme.iconSize.profile,
            height: theme.iconSize.profile,
            borderColor: theme.textColor,
          },
        ]}
      >
        <Ionicons name="person" size={theme.iconSize.profile * 0.6} color={theme.textColor} />
      </View>
      {showFollowButton && (
        <View style={[styles.followButton, { backgroundColor: theme.accentColor }]}>
          <Ionicons name="add" size={14} color={theme.textColor} />
        </View>
      )}
    </View>
  );
}

// Music disc icon (for TikTok style)
function MusicDisc({ theme }: { theme: AppTheme }) {
  return (
    <View style={styles.musicDiscContainer}>
      <View style={[styles.musicDisc, { borderColor: theme.textColor }]}>
        <View style={[styles.musicDiscInner, { backgroundColor: theme.accentColor }]} />
      </View>
    </View>
  );
}

// Top bar component
function TopBar({ theme }: { theme: AppTheme }) {
  if (theme.hasTopTabs && theme.topTabLabels) {
    // TikTok/Instagram style with tabs
    const activeIndex = theme.topTabLabels.length - 1; // Last tab active (おすすめ/リール)
    return (
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <View style={styles.topBarTabs}>
          {theme.topTabLabels.map((label, index) => (
            <View key={label} style={styles.topBarTab}>
              <Text
                style={[
                  styles.topBarTabText,
                  { color: theme.textColor },
                  index === activeIndex && styles.topBarTabTextActive,
                ]}
              >
                {label}
              </Text>
              {/* Always render indicator space for consistent alignment */}
              <View
                style={[
                  styles.tabIndicator,
                  {
                    backgroundColor: index === activeIndex ? theme.textColor : 'transparent',
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.topBarSpacer}>
          <Ionicons name="search" size={24} color={theme.textColor} />
        </View>
      </View>
    );
  }

  // YouTube Shorts style - search and more icons
  if (theme.id === 'youtubeShorts') {
    return (
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <View style={styles.topBarSpacer} />
        <View style={[styles.topBarSpacer, styles.topBarRightIcons]}>
          <Ionicons name="search" size={24} color={theme.textColor} />
          <Ionicons name="ellipsis-vertical" size={24} color={theme.textColor} style={{ marginLeft: 16 }} />
        </View>
      </View>
    );
  }

  // Minimal top bar for other apps
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSpacer} />
      <Text style={[styles.topBarTitle, { color: theme.textColor }]}>{theme.displayName}</Text>
      <View style={styles.topBarSpacer}>
        <Ionicons name="camera-outline" size={24} color={theme.textColor} />
      </View>
    </View>
  );
}

// Bottom navigation bar
function BottomNavBar({ theme, bottomInset = 0 }: { theme: AppTheme; bottomInset?: number }) {
  const showLabels = theme.id === 'tiktok' || theme.id === 'youtubeShorts';

  return (
    <View style={[styles.bottomNavWrapper, { paddingBottom: bottomInset }]}>
      <View style={[styles.bottomNav, { backgroundColor: theme.backgroundColor }]}>
        {theme.bottomNavIcons.map((icon) => {
          const iconName = icon.ionicon as keyof typeof Ionicons.glyphMap;
          const size = icon.size || theme.iconSize.bottomNav;

          if (icon.isCenter) {
            // Center create button
            return (
              <View
                key={icon.id}
                style={[
                  styles.centerButton,
                  theme.id === 'tiktok' && {
                    backgroundColor: theme.textColor,
                    borderRadius: 8,
                  },
                ]}
              >
                {theme.id === 'tiktok' ? (
                  <View style={styles.tiktokCreateButton}>
                    <View
                      style={[styles.tiktokCreateButtonLeft, { backgroundColor: theme.secondaryAccent }]}
                    />
                    <View
                      style={[styles.tiktokCreateButtonRight, { backgroundColor: theme.accentColor }]}
                    />
                    <View style={[styles.tiktokCreateButtonCenter, { backgroundColor: theme.textColor }]}>
                      <Ionicons name="add" size={24} color={theme.backgroundColor} />
                    </View>
                  </View>
                ) : (
                  <Ionicons name={iconName} size={size + 8} color={theme.textColor} />
                )}
              </View>
            );
          }

          return (
            <View key={icon.id} style={styles.navIconContainer}>
              <Ionicons name={iconName} size={size} color={theme.textColor} />
              {showLabels && icon.label && (
                <Text style={[styles.navLabel, { color: theme.textColor }]}>{icon.label}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// User info section content (without positioning - handled by parent)
function UserInfoContent({ theme, video }: { theme: AppTheme; video: FakeVideoContent }) {
  const showProfileLeft = theme.id !== 'tiktok';

  return (
    <>
      {showProfileLeft && (
        <View style={styles.userInfoRow}>
          <View style={[styles.smallProfileImage, { borderColor: theme.textColor }]}>
            <Ionicons name="person" size={14} color={theme.textColor} />
          </View>
          <Text style={[styles.username, { color: theme.textColor }]}>{video.username}</Text>
          {theme.id === 'instagramReels' && (
            <View style={[styles.followBadge, { borderColor: theme.textColor }]}>
              <Text style={[styles.followBadgeText, { color: theme.textColor }]}>フォロー</Text>
            </View>
          )}
        </View>
      )}
      {!showProfileLeft && (
        <Text style={[styles.username, { color: theme.textColor }]}>@{video.username}</Text>
      )}
      <Text style={[styles.caption, { color: theme.textColor }]} numberOfLines={2}>
        {video.caption} {video.hashtags.map((tag) => `#${tag}`).join(' ')}
      </Text>
      {video.musicName && (
        <View style={styles.musicInfo}>
          <Ionicons name="musical-notes" size={12} color={theme.textColor} />
          <Text style={[styles.musicText, { color: theme.textColor }]} numberOfLines={1}>
            {video.musicName} - {video.artistName}
          </Text>
        </View>
      )}
    </>
  );
}

export function FakeVideoScreen({
  theme,
  video,
  showSwipeHint = true,
  hideTopBar = false,
  hideBottomNav = false,
  bottomInset = 0,
}: FakeVideoScreenProps) {
  // Filter icons for sidebar
  // - Exclude profile and music for ALL apps (they're rendered as separate components for TikTok)
  const sidebarIcons = theme.sidebarIcons.filter((icon) => {
    if (icon.id === 'profile') return false;
    if (icon.id === 'music') return false;
    return true;
  });

  // Calculate bottom offset for elements
  // - Apps with bottom nav: content above the fixed 50px nav bar + safe area
  // - Apps without bottom nav: content just above safe area
  const bottomNavHeight = 50;
  const hasAppBottomNav = theme.hasBottomNav;
  const baseOffset = bottomInset + (hasAppBottomNav ? bottomNavHeight : 0);

  const contentBottom = baseOffset + 16;
  const sidebarBottom = baseOffset + 70;
  const swipeHintBottom = baseOffset + 90;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={video.gradient as [string, string]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Blur overlay */}
      <View style={styles.blurOverlay} />

      {/* Top bar - only if not hidden */}
      {!hideTopBar && <TopBar theme={theme} />}

      {/* Sidebar */}
      <View style={[styles.sidebar, { bottom: sidebarBottom }]}>
        {theme.id === 'tiktok' && <ProfileIcon theme={theme} />}
        {sidebarIcons.map((icon) => (
          <SidebarIcon
            key={icon.id}
            config={icon}
            theme={theme}
            count={icon.id === 'like' ? video.likeCount : icon.id === 'comment' ? video.commentCount : undefined}
          />
        ))}
        {theme.id === 'tiktok' && <MusicDisc theme={theme} />}
      </View>

      {/* User info */}
      <View style={[styles.userInfo, { bottom: contentBottom }]}>
        <UserInfoContent theme={theme} video={video} />
      </View>

      {/* Swipe hint */}
      {showSwipeHint && (
        <Animated.View entering={FadeIn.delay(500)} style={[styles.swipeHint, { bottom: swipeHintBottom }]}>
          <Ionicons name="chevron-up" size={24} color={theme.textColor} />
          <Text style={[styles.swipeHintText, { color: theme.textColor }]}>
            上にスワイプして次へ
          </Text>
        </Animated.View>
      )}

      {/* Bottom nav - only if not hidden AND app has bottom nav */}
      {!hideBottomNav && theme.hasBottomNav && <BottomNavBar theme={theme} bottomInset={0} />}
    </View>
  );
}

// Export TopBar and BottomNavBar for use as fixed overlay
export { TopBar, BottomNavBar };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Top bar
  topBar: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarSpacer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  topBarTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  topBarTab: {
    alignItems: 'center',
  },
  topBarTabText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.6,
  },
  topBarTabTextActive: {
    opacity: 1,
    fontWeight: '700',
  },
  tabIndicator: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  topBarRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Sidebar
  sidebar: {
    position: 'absolute',
    right: 12,
    alignItems: 'center',
    gap: 20,
  },
  sidebarIconContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCount: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Profile
  profileContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  profileImage: {
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallProfileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Music disc
  musicDiscContainer: {
    marginTop: 8,
  },
  musicDisc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 8,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  musicDiscInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // User info
  userInfo: {
    position: 'absolute',
    left: 12,
    right: 80,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  followBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  followBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  musicText: {
    fontSize: 13,
    flex: 1,
  },

  // Swipe hint
  swipeHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Bottom nav
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomNav: {
    minHeight: 50,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 4,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
  },

  // TikTok create button
  tiktokCreateButton: {
    width: 44,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  tiktokCreateButtonLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderRadius: 8,
  },
  tiktokCreateButtonRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderRadius: 8,
  },
  tiktokCreateButtonCenter: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 0,
    bottom: 0,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FakeVideoScreen;
