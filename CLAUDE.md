# CLAUDE.md - StopShorts プロジェクト設定

## 言語設定
- **日本語で応答してください**
- コード内のコメントは英語でも可

---

## ⚠️ CLAUDE.md運用ルール（重要）

### 常に最新状態を保つ
- CLAUDE.mdの内容が実際のプロジェクトと乖離していないか定期的に確認する
- 新機能追加・技術変更時は必ずCLAUDE.mdも更新する
- 不明な点があれば**推測せずコードを確認**する

### 教訓の記録
過去のインシデントから学んだ教訓をここに記録する：

| 日付 | インシデント | 教訓 |
|------|-------------|------|
| 2026-01-06 | アクセントカラーをテラコッタと誤記（実際はエメラルド） | 古い情報を鵜呑みにせず、`theme.ts`等のソースを確認する |
| 2026-01-06 | ボトムナビが存在しないと誤答 | `app/(main)/_layout.tsx`を確認すれば6タブ構成が分かった |
| 2026-01-06 | NativeWind使用と誤記（実際は未使用） | `className`のgrepで0件なら使用していない |
| 2026-01-06 | トライアル期間を1日と誤記（実際は3日） | `ja.json`や`types/index.ts`で`trial_3day`を確認すれば分かった |
| 2026-01-19 | Ghosttyの`working-directory`オプションを推測で試行錯誤 | context7 MCPで公式ドキュメントを確認すれば一発で解決できた |
| 2026-01-24 | `/verify`をスキップしてコミット・PR作成（Lintエラー30件見逃し） | **コミット前に必ず`/verify`を実行**。部分的な検証（tsc, test）だけで満足しない |
| 2026-01-24 | iOS Screen Time Extensionsがビルドに含まれていないと気づかず「テスト完了」と誤報告 | ローカルビルドでは`ENABLE_FAMILY_CONTROLS=true`が必須。health-checkテストはUIスモークテストのみで、ネイティブ機能はテストしていない |

### AIへの注意
- **エアプ禁止**: 既存実装を確認せずに推測で回答しない
- **存在確認**: ファイル・機能の有無は必ずコードベースで確認
- **CLAUDE.md優先**: CLAUDE.mdに書かれた内容が古い可能性を常に疑う
- **context7 MCP活用**: 外部ライブラリ・ツールの使い方は推測せず、context7 MCPで公式ドキュメントを確認してから回答する

### ⛔ 絶対にスキップしてはいけないステップ

**コミット・PR作成前に以下を必ず実行すること：**

```bash
/verify   # 全検証チェック（tsc, lint, test, build）
```

**禁止事項:**
- 「tscとtestが通ったから大丈夫」と判断してlint/buildをスキップ
- 「時間がないから」と検証を省略
- 部分的な手動チェックで `/verify` の代用とすること

**理由:** 2026-01-24にこのルールを破り、Lintエラー30件を見逃したままPRを作成してしまった

### Context7 MCP使用ルール（強制）

**以下の場合は必ずContext7 MCPを使用すること：**

1. **パッケージのインストール方法を調べる時**
   - `npm install`, `pod install`, `brew install` 等
   - 例: CocoaPods, Maestro, EAS CLI

2. **ライブラリのAPI使用方法を調べる時**
   - 関数の引数、オプション、戻り値
   - 例: Expo Router, Zustand, Reanimated

3. **設定ファイルの書き方を調べる時**
   - `eas.json`, `app.json`, `Podfile` 等
   - 例: EAS Build profiles, Expo config plugins

4. **エラーのトラブルシューティング**
   - 外部ツール起因のエラー解決時

**使用手順:**
```
1. mcp__context7__resolve-library-id でライブラリIDを取得
2. mcp__context7__query-docs で具体的な使い方を検索
3. 公式ドキュメントに基づいて回答
```

**専用エージェント**: 複雑な調査が必要な場合は `docs-lookup` サブエージェントを使用

---

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
- `modules/screen-time` - iOS Screen Time API (Family Controls) ※実機テスト未完了

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

---

## 開発ワークフロー（Boris Cherny流）

> "give Claude a way to verify its work. If Claude has that feedback loop, it will 2-3x the quality of the final result." - Boris Cherny

### シンプルな場合（バグ修正、単純な変更）

```
実装 → /verify → (/simplify) → /commit-push-pr
```

### 複雑な場合（新機能、アーキテクチャ変更）

```
┌────────────────────────────────────────────────────────────┐
│  1. Plan Mode (Shift+Tab × 2)                              │
│     └─ 計画を反復・ブラッシュアップ                         │
│                                                            │
│  2. 仕様駆動開発 (SDD)                                      │
│     /kiro:spec-init → requirements → design → tasks        │
│                                                            │
│  3. 実装ループ                                              │
│     /impl-loop <feature> [tasks]                           │
│     ├─ TDD実装 (RED → GREEN → REFACTOR)                    │
│     ├─ 品質チェック (tsc, test)                             │
│     ├─ レビュー (code-reviewer)                            │
│     └─ 検証 (/kiro:validate-impl)                          │
│                                                            │
│  4. 検証・簡潔化                                            │
│     /verify → /simplify                                    │
│                                                            │
│  5. コミット・PR                                            │
│     /commit-push-pr                                        │
└────────────────────────────────────────────────────────────┘
```

### コマンド一覧

#### 開発ワークフロー

| コマンド | 用途 |
|---------|------|
| `/impl-loop` | TDD + レビューループ（仕様に基づく実装） |
| `/verify` | 全検証チェック（tsc, lint, test, build） |
| `/simplify` | 最近変更したコードを簡潔化 |
| `/commit-push-pr` | コミット → プッシュ → PR作成 |

#### 仕様駆動開発（SDD）

| コマンド | 用途 |
|---------|------|
| `/kiro:spec-init` | 仕様書初期化 |
| `/kiro:spec-requirements` | 要件定義 |
| `/kiro:spec-design` | 技術設計 |
| `/kiro:spec-tasks` | タスク分解 |
| `/kiro:validate-impl` | 仕様適合性検証 |

#### ビルド・配信

| コマンド | 用途 |
|---------|------|
| `/dev` | Expo 開発サーバー起動 |
| `/build-dev` | Development Build 作成（実機テスト用） |
| `/build-preview` | Preview Build 作成（内部配信用 APK） |
| `/build-prod` | Production Build 作成（ストア提出用 AAB） |
| `/prebuild` | Expo prebuild（ネイティブプロジェクト再生成） |
| `/submit-testflight` | TestFlight にビルド提出 |
| `/submit-playstore` | Play Store にビルド提出 |

### スキル一覧

| スキル | 用途 |
|--------|------|
| `store-screenshots` | ストア用スクリーンショット自動生成 |
| `video-debug` | 動画録画によるデバッグ・ドキュメンテーション |
| `maestro-e2e` | Maestro E2E テスト |
| `quality-check` | 品質検証（tsc, lint, test） |
| `expo-deployment` | EAS Build & Store 提出 |
| `upgrading-expo` | Expo SDK アップグレード |

---

## Codex CLI レビューワークフロー

OpenAI Codex CLIを使用した自動レビュー機能です。SDDワークフローと並列実行が可能です。

### 基本コマンド

```bash
# 未コミット変更をレビュー
codex review --uncommitted

# mainブランチとの差分をレビュー
codex review --base main

# 特定コミットをレビュー
codex review --commit <SHA>

# 非インタラクティブ実行（CI/CD向け）
codex exec "Review src/components/ for React best practices"
```

### 並列レビューエージェント（AGENTS.md定義済み）

| エージェント | 対象 |
|-------------|------|
| Code Review Agent | 型エラー、未使用コード、Hooks違反、i18n |
| UI Consistency Agent | デザインシステム準拠 |
| Architecture Review Agent | ファイル構造、状態管理、循環参照 |
| Security Review Agent | シークレット漏洩、脆弱性 |
| Test Coverage Agent | テストカバレッジ |

### SDD統合ワークフロー

```
┌─────────────────────────────────────────────────────────────┐
│  /impl-loop <feature> [tasks]                               │
│  ├─ TDD実装 (rn-expert)                                     │
│  ├─ 品質チェック (tsc, test)                                │
│  ├─ Claude レビュー (code-reviewer, ui-reviewer)            │
│  │                                                          │
│  │  【並列実行】Codex レビュー                               │
│  │  ├─ codex exec "Code Review: type errors, any usage..."  │
│  │  ├─ codex exec "UI Consistency: theme compliance..."     │
│  │  └─ codex exec "Security: console.log guards..."         │
│  │                                                          │
│  └─ /kiro:validate-impl                                     │
└─────────────────────────────────────────────────────────────┘
```

### Pre-PRレビュー（推奨）

PR作成前に以下を並列実行:

```bash
# Terminal 1: Code Review
codex exec "Code Review: 1) Run 'npx tsc --noEmit' 2) Find any type usages 3) Check React Hooks violations"

# Terminal 2: UI Consistency
codex exec "UI Consistency: Check components against src/design/theme.ts"

# Terminal 3: Security
codex exec "Security Review: Check console.log guards and exposed secrets"
```

---

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

---

## ⚠️ ビルドポリシー（重要）

### ローカルビルドのみ使用

**EAS Cloud Build は使用しない。すべてローカルビルドで行う。**

| ビルド方法 | 使用 | 備考 |
|-----------|------|------|
| ローカル (gradlew/xcodebuild) | ✅ 使用 | CI/CDでも使用 |
| EAS Cloud Build | ❌ 禁止 | 使用しない |

### iOS ビルド時の注意（Family Controls）

iOSビルドでは**必ず**`ENABLE_FAMILY_CONTROLS=true`を設定すること。
これがないとScreen Time Extensions（DeviceActivityMonitor, ShieldConfig, ShieldAction）が生成されない。

```bash
# ✅ 正しい
ENABLE_FAMILY_CONTROLS=true npx expo prebuild --platform ios --clean

# ❌ 間違い（Extensions が含まれない）
npx expo prebuild --platform ios --clean
```

### CI設定

`.github/workflows/maestro-e2e.yml` では自動的に`ENABLE_FAMILY_CONTROLS=true`が設定される。

### Screen Time Extensions 構成

| Extension | 用途 |
|-----------|------|
| ScreenTimeMonitor | DeviceActivityMonitor - 使用状況監視 |
| ScreenTimeShieldConfig | ShieldConfiguration - Shield UI設定 |
| ScreenTimeShieldAction | ShieldAction - Shieldボタン操作ハンドラ |

生成場所: `ios/ScreenTimeExtensions/`

## 主要な依存関係

| パッケージ | 用途 |
|-----------|------|
| expo-router | ルーティング |
| zustand | 状態管理 |
| react-native-reanimated | アニメーション |
| react-native-executorch | ローカルLLM |
| expo-camera | カメラ（ミラー介入） |
| expo-notifications | プッシュ通知 |
