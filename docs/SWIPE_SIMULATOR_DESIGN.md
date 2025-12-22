# スワイプシミュレーター設計書

> **Status**: ✅ Implemented (2025-12-23)
>
> **Implementation Files**:
> - `src/components/simulator/SwipeSimulator.tsx` - Main component
> - `src/components/simulator/FakeVideoScreen.tsx` - Video UI
> - `src/components/simulator/appThemes.ts` - Theme definitions
> - `app/(onboarding)/urge-surfing-demo.tsx` - Usage in onboarding

## 概要

オンボーディングおよび練習モードで使用する、リール系アプリのUIシミュレーター。
ユーザーが実際の介入体験を事前に理解できるようにする。

---

## 公式ブランドカラー（検証済み）

以下のカラーコードは公式ブランドガイドラインから取得:

| アプリ | Primary | Secondary | Accent | 背景 |
|--------|---------|-----------|--------|------|
| TikTok | #000000 | #FFFFFF | #FE2C55 (Razzmatazz) | #000000 |
| Instagram | #000000 | #FFFFFF | Gradient* | #000000 |
| YouTube | #0F0F0F | #FFFFFF | #FF0000 | #0F0F0F |
| X (Twitter) | #000000 | #FFFFFF | #000000 | #000000 |
| Facebook | #000000 | #FFFFFF | #1877F2 | #000000 |
| Snapchat | #000000 | #FFFFFF | #FFFC00 | #000000 |

*Instagram Gradient: `linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)`

### TikTok 追加カラー
- Splash (Cyan): #25F4EE
- Razzmatazz (Pink/Red): #FE2C55
- RGB: 254, 44, 85

### YouTube 追加カラー
- Almost Black: #282828
- Dark Background: #0F0F0F

---

## 対応アプリUI仕様

### 1. TikTok

**公式カラーテーマ** (verified from mobbin.com/colors/brand/tiktok)
- 背景: #000000 (黒)
- アクセント: #FE2C55 (Razzmatazz)
- サブアクセント: #25F4EE (Splash/Cyan)
- テキスト: #FFFFFF (白)

**サイドバーアイコンサイズ**
- プロフィール画像: 48px (丸)
- アクションアイコン: 32-36px
- カウントテキスト: 12px
- アイコン間隔: 16-20px

**レイアウト（縦1080x1920）**
```
┌────────────────────────────────┐
│ フォロー中 | おすすめ    [検索] │ ← 上部タブ (48px高)
├────────────────────────────────┤
│                                │
│                                │
│                           [👤] │ ← プロフィール画像 (48px)
│                           [❤️] │ ← いいね (36px)
│      動画エリア            [💬] │ ← コメント (36px)
│      (全画面)             [➡️] │ ← シェア (32px)
│                           [🔖] │ ← 保存 (32px)
│                           [💿] │ ← 使用楽曲 (48px, 回転)
│                                │
│ @username                      │ ← 太字 14px
│ キャプションテキスト #ハッシュ  │ ← 通常 14px
│ ♪ 楽曲名 - アーティスト         │ ← 14px + マーキー
├────────────────────────────────┤
│ 🏠  🔍  ➕  📥  👤            │ ← 下部ナビ (56px高)
└────────────────────────────────┘
```

**右サイドバーアイコン（上から順に）**
1. プロフィール画像（48px丸、+フォローボタン付き）
2. ❤️ いいね + カウント (white fill, red when active)
3. 💬 コメント + カウント
4. 🔖 保存 (bookmark-outline)
5. ➡️ シェア (arrow-redo-outline)
6. 💿 使用楽曲（48px、回転アニメーション 6s/回転）

**Ionicons マッピング**
- いいね: `heart` / `heart-outline`
- コメント: `chatbubble-ellipses` / `chatbubble-ellipses-outline`
- シェア: `arrow-redo-outline`
- 保存: `bookmark` / `bookmark-outline`
- 音楽: `musical-notes-outline` (またはカスタムディスク)

---

### 2. Instagram Reels

**公式カラーテーマ** (verified from usbrandcolors.com/instagram-colors)
- 背景: #000000 (黒)
- アクセント: グラデーション
  - #405DE6 (Royal Blue)
  - #5851DB
  - #833AB4 (Purple)
  - #C13584 (Dark Pink)
  - #E1306C (Pink)
  - #FD1D1D (Red)
  - #F56040
  - #F77737 (Orange)
- テキスト: #FFFFFF (白)
- いいね（アクティブ）: #FD1D1D

**サイドバーアイコンサイズ**
- アクションアイコン: 28-32px
- アイコン間隔: 20px
- カウントテキスト: 11px

**レイアウト**
```
┌────────────────────────────────┐
│ Reels                    [📷] │ ← 上部 (44px高)
├────────────────────────────────┤
│                                │
│                           [❤️] │ ← いいね (28px)
│      動画エリア            [💬] │ ← コメント (28px)
│      (全画面)             [➡️] │ ← シェア (28px)
│                           [⋯] │ ← その他 (28px)
│                                │
│ 👤 username       [フォロー]   │ ← プロフィール左下配置
│ キャプションテキスト...         │
│ ♪ 楽曲名                       │ ← 音楽情報
├────────────────────────────────┤
│ 🏠  🔍  ➕  🎬  👤            │ ← 下部ナビ (50px高)
└────────────────────────────────┘
```

**Ionicons マッピング**
- いいね: `heart-outline` / `heart` (filled red)
- コメント: `chatbubble-outline`
- シェア: `paper-plane-outline`
- その他: `ellipsis-horizontal`

**特徴**
- プロフィールは左下に配置（TikTokと異なる）
- 音楽情報は下部に表示
- アイコンはアウトラインスタイル（TikTokより細め）

---

### 3. YouTube Shorts

**公式カラーテーマ** (verified from usbrandcolors.com/youtube-colors)
- 背景: #0F0F0F (ダークグレー)
- アクセント: #FF0000 (YouTube Red)
- サブカラー: #282828 (Almost Black)
- テキスト: #FFFFFF (白)
- 登録ボタン: #FF0000 背景、白テキスト

**サイドバーアイコンサイズ**
- アクションアイコン: 28px
- 登録ボタン: 高さ 32px、角丸 16px
- カウントテキスト: 11px

**レイアウト**
```
┌────────────────────────────────┐
│ [🔍]                    [📷] │ ← 上部（ミニマル、40px高）
├────────────────────────────────┤
│                                │
│                           [👍] │ ← いいね (28px)
│      動画エリア            [👎] │ ← よくない (28px)
│      (全画面)             [💬] │ ← コメント (28px)
│                           [➡️] │ ← シェア (28px)
│                           [⋯] │ ← その他 (28px)
│                                │
│ 👤 チャンネル名     [登録]     │ ← 登録: 赤背景、白文字
│ 動画タイトル                   │
│ ♪ 楽曲名                       │
├────────────────────────────────┤
│ 🏠  📺  ➕  🔔  👤            │ ← 下部ナビ (56px高)
└────────────────────────────────┘
```

**Ionicons マッピング**
- いいね: `thumbs-up-outline` / `thumbs-up` (white fill)
- よくない: `thumbs-down-outline`
- コメント: `chatbubble-outline`
- シェア: `arrow-redo-outline`
- その他: `ellipsis-horizontal`

**特徴**
- いいね/よくない両方がある（YouTube独自）
- 登録ボタンが赤く目立つ
- 全体的にアウトライン（中抜き）アイコンスタイル

---

### 4. X (Twitter)

**公式カラーテーマ** (verified from usbrandcolors.com/twitter-colors)
- 背景: #000000 (黒)
- アクセント: #000000 (X rebranding後は黒ベース)
- レガシーブルー: #1DA1F2 (一部UI要素に残存)
- テキスト: #FFFFFF (白)
- いいね（アクティブ）: #F91880 (ピンク)
- リポスト（アクティブ）: #00BA7C (グリーン)

**サイドバーアイコンサイズ**
- アクションアイコン: 24px
- アイコン間隔: 24px

**レイアウト**
```
┌────────────────────────────────┐
│ [←]                      [⋯] │ ← 上部 (44px高)
├────────────────────────────────┤
│                                │
│                           [❤️] │ ← いいね (24px)
│      動画エリア            [💬] │ ← リプライ (24px)
│      (全画面)             [🔁] │ ← リポスト (24px)
│                           [🔖] │ ← ブックマーク (24px)
│                           [➡️] │ ← シェア (24px)
│                                │
│ 👤 ユーザー名 @handle          │
│ ポストテキスト                 │
│                                │
├────────────────────────────────┤
│ 🏠  🔍  🎬  🔔  ✉️            │ ← 下部ナビ (50px高)
└────────────────────────────────┘
```

**Ionicons マッピング**
- いいね: `heart-outline` / `heart` (pink #F91880)
- リプライ: `chatbubble-outline`
- リポスト: `repeat-outline` / `repeat` (green #00BA7C)
- ブックマーク: `bookmark-outline` / `bookmark`
- シェア: `share-outline`

---

### 5. Facebook Reels

**公式カラーテーマ** (verified from colorlib.com/brand/facebook)
- 背景: #000000 (黒)
- アクセント: #1877F2 (Facebook Blue)
- テキスト: #FFFFFF (白)

**レイアウト**
```
┌────────────────────────────────┐
│ Reels                    [📷] │ ← 上部 (44px高)
├────────────────────────────────┤
│                                │
│                           [❤️] │ ← いいね (28px)
│      動画エリア            [💬] │ ← コメント (28px)
│      (全画面)             [➡️] │ ← シェア (28px)
│                           [⋯] │ ← その他 (28px)
│                                │
│ 👤 ユーザー名       [フォロー] │
│ キャプション                   │
│ ♪ 楽曲名                       │
├────────────────────────────────┤
│ 🏠  📺  ➕  🔔  ☰            │ ← 下部ナビ (56px高)
└────────────────────────────────┘
```

---

### 6. Snapchat Spotlight

**公式カラーテーマ** (verified from usbrandcolors.com/snapchat-colors)
- 背景: #000000 (黒)
- アクセント: #FFFC00 (Snapchat Yellow)
- サブカラー: #030303 (Black)
- テキスト: #FFFFFF (白)

**レイアウト**
```
┌────────────────────────────────┐
│ [←]                      [⋯] │ ← 上部 (44px高)
├────────────────────────────────┤
│                                │
│                           [❤️] │ ← いいね (28px)
│      動画エリア            [💬] │ ← コメント (28px)
│      (全画面)             [➡️] │ ← シェア (28px)
│                           [♪] │ ← 音楽 (28px)
│                                │
│ 👤 ユーザー名                  │
│ キャプション                   │
│                                │
├────────────────────────────────┤
│ 💬  📍  📷  💬  👤            │ ← 下部ナビ (56px高)
└────────────────────────────────┘
```

---

## シミュレーター実装仕様

### TypeScript 型定義

```typescript
// Target App IDs
type TargetAppId =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'x'
  | 'facebook'
  | 'snapchat';

// アプリテーマ定義
interface AppTheme {
  id: TargetAppId;
  name: string;
  displayName: string;           // UI表示用の名前
  backgroundColor: string;
  accentColor: string;
  secondaryAccent?: string;      // TikTokのCyan等
  textColor: string;
  likeActiveColor: string;       // いいね時のカラー
  gradient?: string[];           // Instagram用グラデーション
  sidebarIcons: SidebarIcon[];
  bottomNavIcons: BottomNavIcon[];
  hasTopTabs: boolean;
  topTabLabels?: string[];
  iconStyle: 'filled' | 'outline'; // アイコンスタイル
  iconSize: {
    sidebar: number;
    bottomNav: number;
    profile: number;
  };
}

interface SidebarIcon {
  id: string;
  ionicon: string;              // Ionicons name
  ioniconActive?: string;       // アクティブ時のアイコン
  activeColor?: string;         // アクティブ時のカラー
  label?: string;               // カウント表示用
  hasCount: boolean;
  size?: number;                // デフォルトサイズの上書き
}

interface BottomNavIcon {
  id: string;
  ionicon: string;
  isCenter?: boolean;           // 作成ボタン用（+ボタン）
  size?: number;
}

// フェイクビデオコンテンツ
interface FakeVideoContent {
  id: string;
  username: string;
  caption: string;
  hashtags: string[];
  musicName?: string;
  artistName?: string;
  likeCount: string;            // "1.2K" format
  commentCount: string;
  gradient: string[];           // 背景グラデーション
}
```

### アプリテーマ定義（appThemes.ts）

```typescript
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
    iconSize: { sidebar: 36, bottomNav: 28, profile: 48 },
    hasTopTabs: true,
    topTabLabels: ['フォロー中', 'おすすめ'],
    sidebarIcons: [
      { id: 'profile', ionicon: 'person-circle', hasCount: false, size: 48 },
      { id: 'like', ionicon: 'heart', ioniconActive: 'heart', activeColor: '#FE2C55', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-ellipses', hasCount: true },
      { id: 'bookmark', ionicon: 'bookmark-outline', hasCount: false },
      { id: 'share', ionicon: 'arrow-redo', hasCount: false },
      { id: 'music', ionicon: 'disc', hasCount: false, size: 48 },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home' },
      { id: 'discover', ionicon: 'search' },
      { id: 'create', ionicon: 'add', isCenter: true },
      { id: 'inbox', ionicon: 'chatbubbles-outline' },
      { id: 'profile', ionicon: 'person' },
    ],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    displayName: 'Reels',
    backgroundColor: '#000000',
    accentColor: '#E1306C',
    textColor: '#FFFFFF',
    likeActiveColor: '#FD1D1D',
    gradient: ['#405DE6', '#5851DB', '#833AB4', '#C13584', '#E1306C', '#FD1D1D'],
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 26, profile: 32 },
    hasTopTabs: false,
    sidebarIcons: [
      { id: 'like', ionicon: 'heart-outline', ioniconActive: 'heart', activeColor: '#FD1D1D', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'share', ionicon: 'paper-plane-outline', hasCount: false },
      { id: 'more', ionicon: 'ellipsis-horizontal', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline' },
      { id: 'search', ionicon: 'search-outline' },
      { id: 'create', ionicon: 'add-circle-outline', isCenter: true },
      { id: 'reels', ionicon: 'play-circle-outline' },
      { id: 'profile', ionicon: 'person-circle-outline' },
    ],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    displayName: 'Shorts',
    backgroundColor: '#0F0F0F',
    accentColor: '#FF0000',
    textColor: '#FFFFFF',
    likeActiveColor: '#FFFFFF',
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 26, profile: 36 },
    hasTopTabs: false,
    sidebarIcons: [
      { id: 'like', ionicon: 'thumbs-up-outline', ioniconActive: 'thumbs-up', hasCount: true },
      { id: 'dislike', ionicon: 'thumbs-down-outline', hasCount: false },
      { id: 'comment', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'share', ionicon: 'arrow-redo-outline', hasCount: false },
      { id: 'more', ionicon: 'ellipsis-horizontal', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline' },
      { id: 'shorts', ionicon: 'flash-outline' },
      { id: 'create', ionicon: 'add-circle', isCenter: true },
      { id: 'subscriptions', ionicon: 'albums-outline' },
      { id: 'library', ionicon: 'person-outline' },
    ],
  },
  x: {
    id: 'x',
    name: 'X',
    displayName: 'X',
    backgroundColor: '#000000',
    accentColor: '#000000',
    textColor: '#FFFFFF',
    likeActiveColor: '#F91880',
    iconStyle: 'outline',
    iconSize: { sidebar: 24, bottomNav: 24, profile: 32 },
    hasTopTabs: false,
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
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    displayName: 'Reels',
    backgroundColor: '#000000',
    accentColor: '#1877F2',
    textColor: '#FFFFFF',
    likeActiveColor: '#1877F2',
    iconStyle: 'outline',
    iconSize: { sidebar: 28, bottomNav: 26, profile: 32 },
    hasTopTabs: false,
    sidebarIcons: [
      { id: 'like', ionicon: 'heart-outline', ioniconActive: 'heart', hasCount: true },
      { id: 'comment', ionicon: 'chatbubble-outline', hasCount: true },
      { id: 'share', ionicon: 'paper-plane-outline', hasCount: false },
      { id: 'more', ionicon: 'ellipsis-horizontal', hasCount: false },
    ],
    bottomNavIcons: [
      { id: 'home', ionicon: 'home-outline' },
      { id: 'watch', ionicon: 'tv-outline' },
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
```

### フェイク動画コンテンツ

シミュレーター用のプレースホルダー：
- ぼかしたグラデーション背景（アプリのアクセントカラーを使用）
- フェイクのユーザー名とキャプション
- 「スワイプして次へ」のヒント表示

```typescript
export const FAKE_VIDEOS: FakeVideoContent[] = [
  {
    id: '1',
    username: 'example_user',
    caption: 'これは表示用サンプルです',
    hashtags: ['sample', 'demo'],
    musicName: 'Sample Song',
    artistName: 'Demo Artist',
    likeCount: '1.2K',
    commentCount: '234',
    gradient: ['#667eea', '#764ba2'],
  },
  // ... more fake videos
];
```

### インタラクション

1. **縦スワイプ**: 次の動画へ（アニメーション付き）
   - GestureHandler + Reanimated で実装
   - スワイプ速度に応じたスナップ

2. **スワイプ回数カウント**: 3〜5回で介入発生

3. **介入画面への遷移**: フェードイン

### 介入発生タイミング

```typescript
const INTERVENTION_AFTER_SWIPES = 3; // 3回スワイプ後に介入

// オンボーディング時: 固定で3回
// 練習モード: 設定に応じて変更可能
```

---

## ファイル構成

```
src/components/simulator/
├── index.ts                    # エクスポート
├── AppSelector.tsx             # アプリ選択画面
├── SwipeSimulator.tsx          # シミュレーター本体
├── FakeVideoScreen.tsx         # フェイク動画画面
├── SidebarIcons.tsx            # 右サイドバー
├── BottomNavBar.tsx            # 下部ナビ
├── TopBar.tsx                  # 上部バー
├── InterventionOverlay.tsx     # 介入オーバーレイ
└── appThemes.ts                # アプリテーマ定義

app/(onboarding)/
├── urge-surfing-intro.tsx      # 概念説明
└── urge-surfing-demo.tsx       # シミュレーター体験
```

---

## 参考資料

### 公式ブランドリソース
- [TikTok Brand Colors - Mobbin](https://mobbin.com/colors/brand/tiktok)
- [Instagram Colors - US Brand Colors](https://usbrandcolors.com/instagram-colors/)
- [YouTube Colors - US Brand Colors](https://usbrandcolors.com/youtube-colors/)
- [X/Twitter Colors - US Brand Colors](https://usbrandcolors.com/twitter-colors/)
- [Facebook Colors - Colorlib](https://colorlib.com/brand/facebook/)
- [Snapchat Colors - US Brand Colors](https://usbrandcolors.com/snapchat-colors/)

### UI/UXリファレンス
- [TikTok UI 2024 - Figma](https://www.figma.com/community/file/1181613055862447288/tiktok-ui-2024)
- [expo-instagram-reels - GitHub](https://github.com/kartikeyvaish/expo-instagram-reels)
- [kirkwat/tiktok - GitHub](https://github.com/kirkwat/tiktok)
- [react-native-shorts-example - GitHub](https://github.com/hyochan/react-native-shorts-example)

### 動画仕様
- Instagram Reels: 1080x1920 (9:16)、セーフゾーン: 中央1080x1350 (4:5)
- YouTube Shorts: 1080x1920 (9:16)
- TikTok: 1080x1920 (9:16)
