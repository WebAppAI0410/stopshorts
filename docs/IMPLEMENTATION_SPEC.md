# StopShorts 実装仕様書

## 概要

StopShortsは、ショート動画（TikTok、YouTube Shorts、Instagram Reels）の使用時間を制限し、ユーザーが時間を取り戻すことを支援するiOSアプリです。

## 技術スタック

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript (strict mode)
- **Routing**: expo-router (ファイルベース)
- **Styling**: NativeWind v4 (Tailwind CSS) + インラインスタイル
- **State**: Zustand + AsyncStorage (永続化)
- **Animation**: react-native-reanimated
- **Icons/Graphics**: react-native-svg

## デザインコンセプト: "Editorial Wellness Journal"

雑誌のような洗練されたエディトリアルデザイン。高コントラストのタイポグラフィと意図的なビジュアル言語。

---

## カラーパレット: "Ink & Paper"

### Light Theme
```typescript
const lightTheme = {
  // 背景
  background: '#FAF8F5',        // Warm paper
  backgroundCard: '#FFFFFF',
  surface: '#F5F2ED',           // Cream

  // テキスト
  textPrimary: '#0D0F14',       // Deep ink
  textSecondary: '#4A5368',
  textMuted: '#9099AB',

  // アクセント（テラコッタ）
  accent: '#C65D3B',            // Signature terracotta
  accentLight: '#E69A7C',
  accentMuted: 'rgba(198, 93, 59, 0.15)',

  // セマンティック
  success: '#5C7159',           // Sage green
  warning: '#C4944A',           // Gold
  error: '#C53030',

  // ボーダー
  border: '#E1E4EB',
  borderSubtle: 'rgba(184, 191, 204, 0.6)',
};
```

### Dark Theme
```typescript
const darkTheme = {
  background: '#0D0F14',
  backgroundCard: '#1A1D26',
  surface: '#252A36',

  textPrimary: '#FAF8F5',
  textSecondary: '#B8BFCC',
  textMuted: '#6B7689',

  accent: '#D97B5A',
  accentLight: '#F0B89E',
  accentMuted: 'rgba(217, 123, 90, 0.2)',

  success: '#9AA68F',
  warning: '#D4AA6A',
  error: '#FC8181',

  border: '#363D4D',
  borderSubtle: '#252A36',
};
```

---

## タイポグラフィ

```typescript
const typography = {
  // ヒーロー（ブランド名など）
  hero: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -4,
    lineHeight: 1,
  },

  // 見出し
  h1: { fontSize: 36, fontWeight: '800', letterSpacing: -1.5 },
  h2: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8 },
  h3: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },

  // 本文
  bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 1.7 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 1.65 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 1.6 },

  // ラベル（オールキャップス）
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // キャプション
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },

  // ボタン
  button: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};
```

---

## スペーシング

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  gutter: 20,  // 水平マージン
};
```

---

## ディレクトリ構造

```
app/
  _layout.tsx              # Root layout (ThemeProvider, SafeAreaProvider)
  index.tsx                # Redirect to appropriate screen
  (onboarding)/
    _layout.tsx            # Onboarding stack
    welcome.tsx            # Welcome screen
    purpose.tsx            # Purpose selection
    app-selection.tsx      # App selection
    implementation-intent.tsx  # Commitment screen
    permission.tsx         # Permission request
    commitment.tsx         # Final commitment
  (main)/
    _layout.tsx            # Main tab/stack layout
    index.tsx              # Dashboard
    statistics.tsx         # Statistics
    settings.tsx           # Settings

src/
  components/
    ui/
      Button.tsx           # Primary button component
      Card.tsx             # Card component
      ProgressIndicator.tsx # Step indicator
      Header.tsx           # Navigation header
      SectionMarker.tsx    # Editorial divider line
      GlowOrb.tsx          # Background glow effect
      index.ts             # Exports
  contexts/
    ThemeContext.tsx       # Theme provider
  design/
    theme.ts               # Theme definitions
  stores/
    useAppStore.ts         # Zustand store
  i18n/
    index.ts               # Translation function
    locales/
      ja.json              # Japanese translations
  types/
    index.ts               # TypeScript types
```

---

## 画面仕様

### 1. Welcome Screen (`app/(onboarding)/welcome.tsx`)

**レイアウト:**
```
┌─────────────────────────────┐
│                             │
│     [GlowOrb top-right]     │
│                             │
│          Stop               │  ← Hero text (black)
│          Shorts             │  ← Hero text (terracotta)
│                             │
│        ────────             │  ← SectionMarker (40px, terracotta)
│                             │
│    5分で止める、人生を取り戻す    │  ← h2, textPrimary
│                             │
│    「気づいたら1時間」を終わりにする │  ← bodyLarge, textSecondary
│    ショート動画から解放されよう     │
│                             │
│    ┌─────────────────────┐   │
│    │ 6h/day │ Average... │   │  ← Stats card (optional)
│    └─────────────────────┘   │
│                             │
│    ┌─────────────────────┐   │
│    │       始める         │   │  ← Primary button (black bg, white text)
│    └─────────────────────┘   │
│                             │
│      ● ○ ○ ○ ○ ○            │  ← ProgressIndicator (6 steps)
│                             │
│     [GlowOrb bottom-left]   │
└─────────────────────────────┘
```

**コンポーネント仕様:**

```typescript
// GlowOrb - 背景のグローエフェクト
type GlowOrbProps = {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'medium' | 'large' | 'xl';
  color: 'primary' | 'accent';
  intensity?: number;  // 0.1-0.3
};

// SectionMarker - エディトリアル区切り線
type SectionMarkerProps = {
  width?: number;      // default 40
  color?: 'accent' | 'primary' | 'muted';
};

// ProgressIndicator - ステップインジケーター
type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;  // 1-indexed
};

// Button
type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
};
```

### 2. Purpose Screen (`app/(onboarding)/purpose.tsx`)

目的選択画面。6つのオプションから選択。

**オプション:**
- 睡眠を改善したい
- 勉強・読書に集中したい
- 仕事の生産性を上げたい
- クリエイティブな活動をしたい
- メンタルヘルスを改善したい
- その他

**レイアウト:**
- Header with back button
- Title: "なぜ時間を取り戻したい？"
- 6 selection cards (2 columns, 3 rows)
- Continue button (disabled until selection)
- ProgressIndicator

### 3. App Selection Screen (`app/(onboarding)/app-selection.tsx`)

制限するアプリを選択。複数選択可能。

**オプション:**
- TikTok (icon + name)
- YouTube Shorts (icon + name)
- Instagram Reels (icon + name)

**レイアウト:**
- Header with back button
- Title: "どのアプリを制限する？"
- 3 app cards with checkboxes
- Continue button
- ProgressIndicator

### 4. Implementation Intent Screen (`app/(onboarding)/implementation-intent.tsx`)

代替行動の選択。

**オプション:**
- 深呼吸をする
- ストレッチをする
- 水を飲む
- やることリストを確認する
- カスタム入力

### 5. Permission Screen (`app/(onboarding)/permission.tsx`)

通知許可のリクエスト画面。

### 6. Commitment Screen (`app/(onboarding)/commitment.tsx`)

最終確認・コミットメント画面。

### 7. Dashboard (`app/(main)/index.tsx`)

メインダッシュボード。

**要素:**
- 今日の統計（介入回数、節約時間）
- 週間プログレス
- ストリーク表示
- Implementation intentの表示

### 8. Statistics (`app/(main)/statistics.tsx`)

詳細統計画面。

### 9. Settings (`app/(main)/settings.tsx`)

設定画面。テーマ切り替え、データリセットなど。

---

## 追加する型定義 (`src/types/index.ts` に追加)

```typescript
// Implementation Intent Types
export type IntentType = 'breathe' | 'stretch' | 'water' | 'checklist' | 'custom';

export interface ImplementationIntentConfig {
  type: IntentType;
  customText?: string;
}
```

## Zustand Store 更新 (`src/stores/useAppStore.ts`)

既存のストアに以下を追加:

```typescript
interface AppState {
  // ... existing fields ...

  // 追加するフィールド
  implementationIntent: ImplementationIntentConfig | null;
  dailyGoalMinutes: number;

  // 追加するアクション
  setImplementationIntent: (intent: ImplementationIntentConfig) => void;
  setDailyGoal: (minutes: number) => void;
}

// initialState に追加
const initialState = {
  // ... existing ...
  implementationIntent: null,
  dailyGoalMinutes: 60,
};

// アクション追加
setImplementationIntent: (intent) => set({ implementationIntent: intent }),
setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),
```

---

## 翻訳 (ja.json)

```json
{
  "onboarding": {
    "welcome": {
      "title": "5分で止める、人生を取り戻す",
      "subtitle": "「気づいたら1時間」を終わりにする\nショート動画から解放されよう",
      "start": "始める",
      "existingUser": "アカウントをお持ちの方"
    },
    "purpose": {
      "title": "なぜ時間を取り戻したい？",
      "subtitle": "あなたの目標を教えてください",
      "options": {
        "sleep": "睡眠を改善したい",
        "study": "勉強・読書に集中したい",
        "work": "仕事の生産性を上げたい",
        "creative": "クリエイティブな活動をしたい",
        "mental": "メンタルヘルスを改善したい",
        "other": "その他"
      }
    },
    "appSelection": {
      "title": "どのアプリを制限する？",
      "subtitle": "複数選択できます"
    },
    "intent": {
      "title": "スマホを置いたら何をする？",
      "subtitle": "代わりの行動を決めておこう",
      "options": {
        "breathe": "深呼吸をする",
        "stretch": "ストレッチをする",
        "water": "水を飲む",
        "checklist": "やることリストを確認する"
      },
      "customPlaceholder": "自分で決める..."
    },
    "commitment": {
      "title": "準備完了",
      "subtitle": "さあ、時間を取り戻そう"
    }
  },
  "home": {
    "greeting": "おかえりなさい",
    "dashboard": "ダッシュボード",
    "todaySaved": "今日の節約時間",
    "weekProgress": "今週の進捗",
    "streak": "ストリーク"
  },
  "settings": {
    "title": "設定",
    "theme": {
      "title": "テーマ",
      "light": "ライト",
      "dark": "ダーク",
      "system": "システム"
    },
    "data": {
      "title": "データ",
      "reset": "データをリセット"
    }
  },
  "common": {
    "continue": "続ける",
    "back": "戻る",
    "cancel": "キャンセル",
    "confirm": "確認"
  }
}
```

---

## 実装の注意点

### 1. スタイリング
- `className` (NativeWind) と `style` (インライン) の両方を使用可能
- テーマカラーは `useTheme()` フックから取得
- アニメーションは `react-native-reanimated` を使用

### 2. ルーティング
- expo-router のファイルベースルーティングを使用
- `(onboarding)` と `(main)` はグループ（URLに含まれない）
- `router.replace()` でオンボーディング完了後にメインへ遷移

### 3. 状態管理
- Zustand + `persist` middleware で AsyncStorage に永続化
- `hasCompletedOnboarding` でオンボーディング完了を判定

### 4. テーマ
- ThemeContext でライト/ダーク/システムを管理
- `useColorScheme()` でシステム設定を取得

### 5. アニメーション
- 画面遷移: `FadeIn`, `FadeInUp`, `FadeInDown` など
- ボタン押下: `withSpring` でスケールアニメーション
- プログレス: `withTiming` で幅のアニメーション

---

## テスト要件

各画面・コンポーネントに対して以下をテスト：

1. **レンダリングテスト**: 正しくレンダリングされるか
2. **インタラクションテスト**: ボタン押下、選択が動作するか
3. **状態テスト**: Zustand の状態が正しく更新されるか
4. **ナビゲーションテスト**: 画面遷移が正しく動作するか

---

## 優先順位

1. ThemeContext + theme.ts（デザインシステムの基盤）
2. 基本UIコンポーネント（Button, Card, ProgressIndicator）
3. Welcome画面（見た目の確認）
4. オンボーディングフロー全体
5. ダッシュボード
6. 設定画面
7. 統計画面
