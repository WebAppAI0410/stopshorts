# CLAUDE.md - StopShorts プロジェクト設定

## 言語設定
- **日本語で応答してください**
- コード内のコメントは英語でも可

## プロジェクト概要
StopShortsは、ショート動画（TikTok、YouTube Shorts、Instagram Reels）の使用時間を制限し、ユーザーが時間を取り戻すことを支援するモバイルアプリです。

**対応プラットフォーム**: iOS / Android（Android優先で開発）

## 技術スタック

### コア
- React Native 0.81 + Expo SDK 54
- TypeScript
- expo-router v6 (ファイルベースルーティング、タブナビ)
- Zustand v5 (状態管理 + AsyncStorage永続化)

### UI/アニメーション
- react-native-reanimated v4 (アニメーション)
- react-native-svg (SVGグラフィックス)
- インラインスタイル（NativeWindは未使用）

### AI機能
- react-native-executorch (ローカルLLM)
- Qwen3 0.6B モデル

### ネイティブモジュール
- `@stopshorts/screen-time-android` - Android UsageStats API
- `modules/screen-time` - iOS ScreenTime API（未実装）

## デザインシステム

### テーマ (`src/design/theme.ts`)
- **ライトテーマ**: Ink & Paper（温かみのある紙色ベース）
- **ダークテーマ**: Dark Glassmorphism
- **アクセントカラー**: エメラルドグリーン (#10B981 / #059669)
- ライト/ダークモード対応

### カラー参照
```typescript
// ダークモード
accent: '#10B981'  // エメラルド
background: '#0D1117'
backgroundCard: '#161B22'

// ライトモード
accent: '#059669'  // エメラルド（やや濃い）
background: '#FAFAFA'
backgroundCard: '#F5F5F4'
```

## ディレクトリ構造
```
app/
  (onboarding)/       # オンボーディング (15画面)
  (main)/             # メインアプリ
    index.tsx         # ホーム/ダッシュボード
    statistics.tsx    # 統計
    ai.tsx            # AIチャット
    training/         # 心理トレーニング
    settings.tsx      # 設定
    profile.tsx       # プロフィール
    urge-surfing.tsx  # 衝動サーフィング介入
    shield.tsx        # Shield画面
src/
  components/         # UIコンポーネント
    ui/               # 汎用UI (Button, Card, Header等)
    interventions/    # 介入系コンポーネント
    training/         # トレーニング系コンポーネント
  contexts/           # React Context (ThemeContext)
  design/             # テーマ定義 (theme.ts)
  stores/             # Zustand ストア
    useAppStore.ts    # メインストア
    useAIStore.ts     # AI機能ストア
    useStatisticsStore.ts  # 統計ストア
  services/           # ビジネスロジック
    ai/               # AI関連サービス
  hooks/              # カスタムフック
  i18n/               # 国際化 (日本語)
  types/              # TypeScript型定義
  data/               # 静的データ (トレーニングトピック等)
modules/              # ネイティブモジュール
  screen-time-android/  # Android UsageStats
.kiro/specs/          # SDD仕様書
docs/                 # ドキュメント
```

## タブナビゲーション (6タブ)

| タブ | 画面 | アイコン |
|------|------|---------|
| Home | index.tsx | home |
| Stats | statistics.tsx | stats-chart |
| AI | ai.tsx | chatbubble-ellipses |
| Training | training/ | book |
| Settings | settings.tsx | settings |
| Profile | profile.tsx | person |

## コーディング規約
- 関数コンポーネントのみ使用
- TypeScriptの型を明示的に定義
- `useTheme()` フックでテーマカラーを取得
- **インラインスタイル**を使用（className/NativeWind不使用）
- React Hooksのルールを厳守

## 仕様駆動開発 (SDD)

### ワークフロー
```
Requirements → Design → Tasks → Implementation
```

### ディレクトリ
- `.kiro/specs/` - 機能別仕様書
- `.kiro/specs/intervention-system/` - 介入システム仕様
- `.kiro/specs/subscription-flow/` - 課金フロー仕様
- `.kiro/specs/training-ui/` - トレーニングUI仕様

### 延期項目
- `.kiro/specs/intervention-system/FUTURE_IMPROVEMENTS.md`

## 品質基準

### Warning/Error 0 ポリシー
```bash
npx tsc --noEmit  # エラー 0 必須
npm test -- --passWithNoTests  # テスト全パス
```

### 禁止事項

| 禁止 | 代替 |
|------|------|
| `// @ts-ignore` | 適切な型定義 |
| `any` 型 | `unknown` + narrowing |
| ハードコード日本語 | `t('key')` を使用 |
| `console.log` 残存 | 削除 or `__DEV__` ガード |
| 未使用 import | 削除 |

### AI行動制限

**重要**: 以下の行動は明示的な指示なしに禁止

| 禁止行動 | 説明 |
|----------|------|
| モック実装の作成 | 仕様書にない機能のモック・スタブ実装は禁止 |
| 未実装の宣言 | できていないことを「完了」と報告禁止 |
| 仕様外の機能追加 | `.kiro/specs/`の仕様書にない機能の追加禁止 |
| プレースホルダー導入 | `// TODO`だけ残して中身がない実装の禁止 |

**許可される行動**:
- 仕様書に記載された機能の実装
- バグ修正
- リファクタリング（動作変更なし）
- 明示的に指示されたモック/スタブ実装

## i18n

- 全UI文字列は `src/i18n/locales/ja.json` に追加
- `t('namespace.key')` で文字列取得
- ハードコード日本語禁止

## プラットフォーム対応

- **Android優先**: デバッグ容易なためAndroidで先に実装・検証
- **iOS後続**: Android検証後に実装
- `Platform.OS` 分岐は最小限に

## 主要な依存関係

| パッケージ | 用途 |
|-----------|------|
| expo-router | ルーティング |
| zustand | 状態管理 |
| react-native-reanimated | アニメーション |
| react-native-executorch | ローカルLLM |
| expo-camera | カメラ（ミラー介入） |
| expo-notifications | プッシュ通知 |
