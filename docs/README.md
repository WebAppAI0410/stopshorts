# StopShorts - プロジェクトドキュメント

## プロジェクト概要

**StopShorts**は、ショート動画（TikTok / YouTube Shorts / Instagram Reels）への無意識な依存から脱却するための行動変容アプリです。

**コンセプト**: 「5分で止める、人生を取り戻す」

**対応プラットフォーム**: iOS / Android

**プロジェクト進捗**: 直近の実装状況は `AGENTS.md` を参照（リポジトリ直下）

---

## 仕様駆動開発 (SDD)

本プロジェクトは `.kiro/specs/` で仕様を管理しています。

| 仕様 | パス | 状態 |
|------|------|------|
| 介入システム | `.kiro/specs/intervention-system/` | 実装済 |
| サブスクリプション | `.kiro/specs/subscription-flow/` | 実装済 |
| トレーニングUI | `.kiro/specs/training-ui/` | 実装済 |

詳細は各ディレクトリの `requirements.md`, `design.md`, `tasks.md` を参照してください。

---

## ドキュメント構成

### Core Documents（最優先で参照）

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `IMPLEMENTATION_SPEC.md` | 技術実装仕様（デザインシステム、コンポーネント） | Current |
| `ONBOARDING_FLOW.md` | オンボーディングフロー v4（10ステップ） | Current |
| `ROADMAP.md` | 実装ロードマップ v2.0 | Current |
| `HABIT_COACHING_FEATURE.md` | 習慣化コーチング機能設計 v3.0 | Current |
| `URGE_SURFING_RESEARCH.md` | Urge Surfing心理学的根拠 | Current |
| `TESTING.md` | テスト方針・実行方法 | Current |

### Platform-Specific Documents

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `ANDROID_IMPLEMENTATION_PLAN.md` | Android版アーキテクチャ（UsageStats + Overlay） | Current |
| `ANDROID_INTEGRATION_PLAN.md` | Android統計・介入統合計画 | Current |
| `PLAY_CONSOLE_SUBMISSION_FLOW.md` | Google Play提出チェックリスト | Current |
| `DEEP_LINKING.md` | ディープリンク設定 | Current |

### Specifications

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `specs/02_pricing_monetization.md` | 料金体系・マネタイズ設計 | Current |
| `specs/03_internationalization.md` | 国際化要件 | Reference |
| `specs/04_backend_architecture.md` | バックエンド構成（RevenueCat, CloudKit） | Current |
| `specs/05_new_features_v2.md` | v2機能仕様（将来） | Future |
| `specs/07_ios_shortcuts.md` | iOSショートカット統合 | In Progress |
| `specs/08_user_display_name.md` | ユーザー表示名仕様 | Current |
| `specs/09_storybook_and_gesture_handler.md` | Storybook設定 | Current |

### Design Documents

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `design/01_screen_design.md` | 画面設計・UIフロー | Current |
| `design/02_personalization_behavioral.md` | パーソナライズ・行動変容設計 | Current |

### Reviews

| ドキュメント | 説明 |
|-------------|------|
| `reviews/2026-01-03_project_review.md` | 最新プロジェクトレビュー |
| `reviews/2026-01-03_e2e_test_issues.md` | E2Eテスト課題 |

### Development Tools

| ドキュメント | 説明 |
|-------------|------|
| `CLOUD_AGENT_PROMPTS.md` | クラウドClaude Code用プロンプト集 |
| `requirements_implementation_matrix.md` | 要件・実装対応表 |

---

## ディレクトリ構造

```
docs/
├── README.md                              # 本ドキュメント
├── IMPLEMENTATION_SPEC.md                 # 技術実装仕様
├── ONBOARDING_FLOW.md                     # オンボーディング
├── ROADMAP.md                             # ロードマップ
├── HABIT_COACHING_FEATURE.md              # 習慣化コーチング
├── URGE_SURFING_RESEARCH.md               # Urge Surfing研究
├── TESTING.md                             # テスト方針
├── ANDROID_IMPLEMENTATION_PLAN.md         # Androidアーキテクチャ
├── ANDROID_INTEGRATION_PLAN.md            # Android統計統合
├── PLAY_CONSOLE_SUBMISSION_FLOW.md        # Play Store提出
├── DEEP_LINKING.md                        # ディープリンク
├── CLOUD_AGENT_PROMPTS.md                 # AIエージェント用
├── requirements_implementation_matrix.md  # 要件対応表
├── specs/                                 # 仕様書
│   ├── 02_pricing_monetization.md
│   ├── 03_internationalization.md
│   ├── 04_backend_architecture.md
│   ├── 05_new_features_v2.md
│   ├── 07_ios_shortcuts.md
│   ├── 08_user_display_name.md
│   └── 09_storybook_and_gesture_handler.md
├── design/                                # 設計書
│   ├── 01_screen_design.md
│   └── 02_personalization_behavioral.md
└── reviews/                               # レビュー（最新のみ）
    ├── 2026-01-03_project_review.md
    └── 2026-01-03_e2e_test_issues.md
```

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React Native (Expo SDK 54) |
| 言語 | TypeScript, Swift, Kotlin |
| スタイリング | インラインスタイル (useTheme()) |
| 状態管理 | Zustand + AsyncStorage |
| ルーティング | Expo Router |
| アニメーション | React Native Reanimated |
| ネイティブAPI (iOS) | Screen Time API (Family Controls) |
| ネイティブAPI (Android) | UsageStatsManager + Overlay |
| ビルド | EAS Build |

---

## 主要機能

### コア機能

| 機能 | 説明 | 状態 |
|------|------|------|
| オンボーディング | 11ステップのセットアップフロー | 実装済 |
| 介入システム | フリクション/ナッジ/ミラー介入 | 実装済 |
| 統計・分析 | 使用時間の可視化、減少率表示 | 実装済 |
| Urge Surfing | 衝動をやり過ごす30秒/60秒エクササイズ | 実装済 |
| 波アニメーション | 呼吸連動の海波アニメーション | 実装済 |
| AIチャットボット | ローカルLLM (Qwen 3 0.6B) によるコーチング | 実装済 |
| 心理トレーニング | 記事/クイズ/ワークシート形式の学習 | 実装済 |
| サブスクリプション | RevenueCat統合による課金管理 | 実装済 |

---

## 開発環境

### 必要なもの

- Node.js 18+ LTS
- Expo CLI (`npm install -g eas-cli`)
- Android Studio (Android開発用)
- Apple Developer Account (iOS開発用)

### セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npx expo start

# Android ビルド
npx eas build --platform android --profile development

# TypeScript チェック
npx tsc --noEmit
```

---

## 更新履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2025-12-19 | 1.0 | 初版作成 |
| 2025-12-21 | 2.0 | ドキュメント構成を更新、Android関連ドキュメント追加 |
| 2025-12-22 | 2.1 | ドキュメント整理、不要ファイル削除、介入・統計計画追加 |
| 2025-12-23 | 2.2 | スワイプシミュレーター・波アニメーション完成 |
| 2026-01-06 | 3.0 | ドキュメント大規模整理、SDD移行反映、重複削除 |
