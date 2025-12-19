# Gemini Implementation Prompt

## Task
React Native + Expo アプリ「StopShorts」のUI実装を行ってください。

## 現在の状態
- Expo SDK 54 プロジェクトが初期化済み
- 基本的なファイル構造とパッケージがインストール済み
- `src/i18n/locales/ja.json` に翻訳データあり
- `src/stores/useAppStore.ts` に Zustand ストアあり
- `src/types/index.ts` に型定義あり

## 実装するもの

### Phase 1: デザインシステム基盤

#### 1.1 テーマ定義 (`src/design/theme.ts`)
```typescript
// カラーパレット "Ink & Paper"
export const palette = {
  ink: {
    900: '#0D0F14',
    800: '#1A1D26',
    600: '#363D4D',
    400: '#6B7689',
    200: '#B8BFCC',
    100: '#E1E4EB',
  },
  paper: {
    warm: '#FAF8F5',
    cream: '#F5F2ED',
  },
  terracotta: {
    700: '#A84832',
    600: '#C65D3B',  // Primary accent
    400: '#E69A7C',
    200: '#F7D4C4',
  },
  sage: {
    600: '#5C7159',
    400: '#9AA68F',
  },
  gold: {
    500: '#C4944A',
    400: '#D4AA6A',
  },
};

export const lightTheme = { /* ... */ };
export const darkTheme = { /* ... */ };
export const typography = { /* ... */ };
export const spacing = { /* ... */ };
export const borderRadius = { /* ... */ };
```

#### 1.2 テーマコンテキスト (`src/contexts/ThemeContext.tsx`)
- `ThemeProvider` コンポーネント
- `useTheme()` フック
- ライト/ダーク/システム切り替え
- AsyncStorage で永続化

### Phase 2: UIコンポーネント (`src/components/ui/`)

#### 2.1 Button.tsx
```typescript
type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};
```
- Primary: 黒背景、白文字、uppercase
- アニメーション: 押下時にスケール0.97

#### 2.2 ProgressIndicator.tsx
```typescript
type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;
};
```
- ドット形式（現在のステップはバー形式で長い）
- アクセントカラーで現在位置を表示

#### 2.3 SectionMarker.tsx
```typescript
type SectionMarkerProps = {
  width?: number;
  color?: 'accent' | 'primary' | 'muted';
};
```
- 細い水平線（高さ3px）
- アニメーション: 左から伸びる

#### 2.4 GlowOrb.tsx
```typescript
type GlowOrbProps = {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'medium' | 'large' | 'xl';
  color: 'primary' | 'accent';
  intensity?: number;
};
```
- 円形のグラデーションブラー
- 背景装飾として使用

#### 2.5 Header.tsx
- 戻るボタン
- タイトル（オプション）
- 右側要素（オプション）

#### 2.6 SelectionCard.tsx
- 選択可能なカード
- チェック状態の視覚フィードバック

### Phase 3: オンボーディング画面

#### 3.1 Welcome (`app/(onboarding)/welcome.tsx`)

**構造:**
```
SafeAreaView
├── GlowOrb (top-right, accent)
├── GlowOrb (bottom-left, primary)
├── Content
│   ├── Logo Text "Stop" (black) + "Shorts" (terracotta)
│   ├── SectionMarker
│   ├── Title (h2)
│   ├── Subtitle (bodyLarge, secondary)
│   └── Stats Card (optional)
├── Button "始める"
└── ProgressIndicator (step 1 of 6)
```

#### 3.2 Purpose (`app/(onboarding)/purpose.tsx`)
- Header with back
- Title + Subtitle
- 6 SelectionCards (2 columns)
- Continue button
- ProgressIndicator (step 2 of 6)

#### 3.3 App Selection (`app/(onboarding)/app-selection.tsx`)
- Header with back
- Title + Subtitle
- 3 App cards (TikTok, YouTube Shorts, Instagram Reels)
- Multiple selection allowed
- Continue button
- ProgressIndicator (step 3 of 6)

#### 3.4 Implementation Intent (`app/(onboarding)/implementation-intent.tsx`)
- 代替行動の選択
- カスタム入力オプション
- ProgressIndicator (step 4 of 6)

#### 3.5 Permission (`app/(onboarding)/permission.tsx`)
- 通知許可リクエスト
- スキップ可能
- ProgressIndicator (step 5 of 6)

#### 3.6 Commitment (`app/(onboarding)/commitment.tsx`)
- 最終確認
- Start button
- ProgressIndicator (step 6 of 6)

### Phase 4: メイン画面

#### 4.1 Dashboard (`app/(main)/index.tsx`)
- 今日の統計
- 週間プログレス
- ストリーク

#### 4.2 Settings (`app/(main)/settings.tsx`)
- テーマ切り替え
- データリセット

### Phase 5: Root Layout

#### `app/_layout.tsx`
```typescript
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppWithStatusBar />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppWithStatusBar() {
  const { isDark } = useTheme();
  const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);
  const router = useRouter();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.replace('/(main)');
    } else {
      router.replace('/(onboarding)/welcome');
    }
  }, [hasCompletedOnboarding]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

## 重要な制約

1. **スタイリング**: `style` プロパティを使用（`className`も可だが、テーマ値は `useTheme()` から）
2. **アニメーション**: `react-native-reanimated` のみ使用
3. **ナビゲーション**: `expo-router` の `useRouter()` を使用
4. **状態**: `useAppStore()` でZustandストアにアクセス
5. **翻訳**: `t()` 関数で翻訳（`src/i18n/index.ts`）

## 実装順序

1. `src/design/theme.ts`
2. `src/contexts/ThemeContext.tsx`
3. `src/components/ui/Button.tsx`
4. `src/components/ui/ProgressIndicator.tsx`
5. `src/components/ui/SectionMarker.tsx`
6. `src/components/ui/GlowOrb.tsx`
7. `src/components/ui/index.ts`
8. `app/_layout.tsx` (更新)
9. `app/(onboarding)/_layout.tsx`
10. `app/(onboarding)/welcome.tsx`
11. 残りのオンボーディング画面
12. `app/(main)/_layout.tsx`
13. `app/(main)/index.tsx`
14. `app/(main)/settings.tsx`

## テスト確認

各画面実装後、以下を確認:
- TypeScript エラーがないこと (`npx tsc --noEmit`)
- Expo で起動できること (`npx expo start`)
- 画面が正しく表示されること
- ナビゲーションが動作すること
- テーマ切り替えが動作すること

## 参考デザイン

Welcome画面の目標デザイン:
- 背景: Warm paper (#FAF8F5)
- ロゴ: "Stop" (黒, 72px, weight 900) + "Shorts" (テラコッタ #C65D3B)
- 区切り線: テラコッタ、幅40px
- タイトル: 「5分で止める、人生を取り戻す」
- サブタイトル: 「気づいたら1時間」を終わりにする
- ボタン: 黒背景、白文字、「始める」
- プログレス: 6ドット、最初がアクティブ
