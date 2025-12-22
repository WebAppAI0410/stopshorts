/**
 * App Themes for Swipe Simulator
 * Verified brand colors from official sources
 */

import type { TargetAppId } from '../../types';

export interface SidebarIconConfig {
  id: string;
  ionicon: string;
  ioniconActive?: string;
  activeColor?: string;
  hasCount: boolean;
  size?: number;
}

export interface BottomNavIconConfig {
  id: string;
  ionicon: string;
  isCenter?: boolean;
  size?: number;
  label?: string;
}

export interface AppTheme {
  id: TargetAppId;
  name: string;
  displayName: string;
  backgroundColor: string;
  accentColor: string;
  secondaryAccent?: string;
  textColor: string;
  likeActiveColor: string;
  gradient?: string[];
  iconStyle: 'filled' | 'outline';
  iconSize: {
    sidebar: number;
    bottomNav: number;
    profile: number;
  };
  hasTopTabs: boolean;
  topTabLabels?: string[];
  /** Whether to show bottom navigation bar (false for full-screen Reels experience) */
  hasBottomNav: boolean;
  sidebarIcons: SidebarIconConfig[];
  bottomNavIcons: BottomNavIconConfig[];
}

/**
 * Verified brand colors from official sources:
 * - TikTok: mobbin.com/colors/brand/tiktok
 * - Instagram: usbrandcolors.com/instagram-colors
 * - YouTube: usbrandcolors.com/youtube-colors
 * - X/Twitter: usbrandcolors.com/twitter-colors
 * - Facebook: colorlib.com/brand/facebook
 * - Snapchat: usbrandcolors.com/snapchat-colors
 */
export const APP_THEMES: Record<TargetAppId, AppTheme> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    displayName: 'TikTok',
    backgroundColor: '#000000',
    accentColor: '#FE2C55',
    secondaryAccent: '#25F4EE',
    textColor: '#FFFFFF',
    likeActiveColor: '#FE2C55',
    iconStyle: 'filled',
    iconSize: { sidebar: 32, bottomNav: 22, profile: 48 },
    hasTopTabs: true,
    topTabLabels: ['友達', 'フォロー中', 'おすすめ'],
    hasBottomNav: true,
    sidebarIcons: [
      { id: 'profile', ionicon: 'person-circle', hasCount: false, size: 48 },
      { id: 'like', ionicon: 'heart', ioniconActive: 'heart', activeColor: '#FE2C55', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-ellipses', hasCount: true },
      { id: 'bookmark', ionicon: 'bookmark', hasCount: true },
      { id: 'share', ionicon: 'arrow-redo', hasCount: true },
      { id: 'music', ionicon: 'disc', hasCount: false, size: 48 },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home', label: 'ホーム' },
      { id: 'discover', ionicon: 'apps-outline', label: '探す' },
      { id: 'create', ionicon: 'add', isCenter: true },
      { id: 'inbox', ionicon: 'chatbubble-outline', label: 'メッセージ' },
      { id: 'profile', ionicon: 'person-outline', label: 'プロフィール' },
    ],
  },
  instagramReels: {
    id: 'instagramReels',
    name: 'Instagram',
    displayName: 'Reels',
    backgroundColor: '#000000',
    accentColor: '#E1306C',
    textColor: '#FFFFFF',
    likeActiveColor: '#FD1D1D',
    gradient: ['#405DE6', '#5851DB', '#833AB4', '#C13584', '#E1306C', '#FD1D1D'],
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 24, profile: 32 },
    hasTopTabs: true,
    topTabLabels: ['リール', '友達'],
    hasBottomNav: true,
    sidebarIcons: [
      { id: 'like', ionicon: 'heart-outline', ioniconActive: 'heart', activeColor: '#FD1D1D', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'remix', ionicon: 'git-compare-outline', hasCount: true },
      { id: 'share', ionicon: 'paper-plane-outline', hasCount: true },
      { id: 'more', ionicon: 'ellipsis-horizontal', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline' },
      { id: 'reels', ionicon: 'play-circle' },
      { id: 'create', ionicon: 'paper-plane-outline', isCenter: true },
      { id: 'search', ionicon: 'search-outline' },
      { id: 'profile', ionicon: 'person-circle-outline' },
    ],
  },
  youtubeShorts: {
    id: 'youtubeShorts',
    name: 'YouTube',
    displayName: 'Shorts',
    backgroundColor: '#0F0F0F',
    accentColor: '#FF0000',
    textColor: '#FFFFFF',
    likeActiveColor: '#FFFFFF',
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 22, profile: 36 },
    hasTopTabs: false,
    hasBottomNav: true,
    sidebarIcons: [
      { id: 'like', ionicon: 'thumbs-up-outline', ioniconActive: 'thumbs-up', hasCount: true },
      { id: 'dislike', ionicon: 'thumbs-down-outline', hasCount: false },
      { id: 'comment', ionicon: 'chatbox-outline', hasCount: true },
      { id: 'share', ionicon: 'arrow-redo-outline', hasCount: false },
      { id: 'remix', ionicon: 'cut-outline', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline', label: 'ホーム' },
      { id: 'shorts', ionicon: 'flash', label: 'ショート' },
      { id: 'create', ionicon: 'add-circle-outline', isCenter: true },
      { id: 'subscriptions', ionicon: 'play-circle-outline', label: '登録チャンネル' },
      { id: 'profile', ionicon: 'person-circle-outline', label: 'マイページ' },
    ],
  },
  twitter: {
    id: 'twitter',
    name: 'X',
    displayName: 'X',
    backgroundColor: '#000000',
    accentColor: '#000000',
    textColor: '#FFFFFF',
    likeActiveColor: '#F91880',
    iconStyle: 'outline',
    iconSize: { sidebar: 24, bottomNav: 24, profile: 32 },
    hasTopTabs: false,
    hasBottomNav: true,
    sidebarIcons: [
      { id: 'like', ionicon: 'heart-outline', ioniconActive: 'heart', activeColor: '#F91880', hasCount: true },
      { id: 'reply', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'repost', ionicon: 'repeat-outline', ioniconActive: 'repeat', activeColor: '#00BA7C', hasCount: true },
      { id: 'bookmark', ionicon: 'bookmark-outline', hasCount: false },
      { id: 'share', ionicon: 'share-outline', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline' },
      { id: 'search', ionicon: 'search-outline' },
      { id: 'video', ionicon: 'videocam-outline' },
      { id: 'notifications', ionicon: 'notifications-outline' },
      { id: 'messages', ionicon: 'mail-outline' },
    ],
  },
  facebookReels: {
    id: 'facebookReels',
    name: 'Facebook',
    displayName: 'Reels',
    backgroundColor: '#000000',
    accentColor: '#1877F2',
    textColor: '#FFFFFF',
    likeActiveColor: '#1877F2',
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 22, profile: 32 },
    hasTopTabs: false,
    hasBottomNav: true,
    sidebarIcons: [
      { id: 'like', ionicon: 'heart-outline', ioniconActive: 'heart', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'share', ionicon: 'paper-plane-outline', hasCount: true },
      { id: 'more', ionicon: 'ellipsis-horizontal', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline' },
      { id: 'watch', ionicon: 'play-circle-outline' },
      { id: 'create', ionicon: 'add-circle-outline', isCenter: true },
      { id: 'notifications', ionicon: 'notifications-outline' },
      { id: 'menu', ionicon: 'menu-outline' },
    ],
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    displayName: 'Spotlight',
    backgroundColor: '#000000',
    accentColor: '#FFFC00',
    textColor: '#FFFFFF',
    likeActiveColor: '#FFFC00',
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 26, profile: 32 },
    hasTopTabs: false,
    hasBottomNav: true,
    sidebarIcons: [
      { id: 'like', ionicon: 'heart-outline', ioniconActive: 'heart', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'share', ionicon: 'paper-plane-outline', hasCount: false },
      { id: 'music', ionicon: 'musical-notes-outline', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'chat', ionicon: 'chatbubble-outline' },
      { id: 'map', ionicon: 'location-outline' },
      { id: 'camera', ionicon: 'camera', isCenter: true },
      { id: 'stories', ionicon: 'people-outline' },
      { id: 'spotlight', ionicon: 'play-circle-outline' },
    ],
  },
};

// Fake video content for the simulator
export interface FakeVideoContent {
  id: string;
  username: string;
  caption: string;
  hashtags: string[];
  musicName?: string;
  artistName?: string;
  likeCount: string;
  commentCount: string;
  gradient: [string, string];
}

export const FAKE_VIDEOS: FakeVideoContent[] = [
  {
    id: '1',
    username: 'sample_user',
    caption: 'これはサンプル動画です',
    hashtags: ['sample', 'demo'],
    musicName: 'Popular Song',
    artistName: 'Famous Artist',
    likeCount: '12.3K',
    commentCount: '456',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    username: 'creative_creator',
    caption: 'おもしろい動画をお届け',
    hashtags: ['funny', 'trend'],
    musicName: 'Trending Sound',
    artistName: 'TikTok Artist',
    likeCount: '8.9K',
    commentCount: '234',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    username: 'daily_life',
    caption: '日常のひとコマ',
    hashtags: ['daily', 'life'],
    musicName: 'Chill Vibes',
    artistName: 'Lo-Fi Beats',
    likeCount: '5.6K',
    commentCount: '123',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    username: 'food_lover',
    caption: '今日のランチ',
    hashtags: ['food', 'lunch'],
    musicName: 'Happy Tune',
    artistName: 'BGM Master',
    likeCount: '3.2K',
    commentCount: '89',
    gradient: ['#fa709a', '#fee140'],
  },
  {
    id: '5',
    username: 'travel_diary',
    caption: '旅の思い出',
    hashtags: ['travel', 'vacation'],
    musicName: 'Adventure Theme',
    artistName: 'World Music',
    likeCount: '15.7K',
    commentCount: '678',
    gradient: ['#a8edea', '#fed6e3'],
  },
];

// Get the default selected apps for the simulator
export function getDefaultSimulatorApps(): TargetAppId[] {
  return ['tiktok', 'instagramReels', 'youtubeShorts'];
}

// Get app display name with platform
export function getAppDisplayName(appId: TargetAppId): string {
  const theme = APP_THEMES[appId];
  if (theme.name === theme.displayName) {
    return theme.name;
  }
  return `${theme.name} ${theme.displayName}`;
}
