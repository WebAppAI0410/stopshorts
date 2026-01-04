# StopShorts - プロジェクトドキュメント

## プロジェクト概要

**StopShorts**は、ショート動画（TikTok / YouTube Shorts / Instagram Reels）への無意識な依存から脱却するための行動変容アプリです。

**コンセプト**: 「5分で止める、人生を取り戻す」

**対応プラットフォーム**: iOS / Android

**プロジェクト進捗**: 直近の実装状況は `AGENT.md` を参照（リポジトリ直下）

---

## ドキュメント構成

### 📌 Core Documents（最優先で参照）

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `IMPLEMENTATION_SPEC.md` | 技術実装仕様（デザインシステム、コンポーネント） | ✅ Current |
| `ONBOARDING_FLOW.md` | オンボーディングフロー v4（10ステップ） | ✅ Current |
| `ROADMAP.md` | 実装ロードマップ v2.0 | ✅ Current |
| `HABIT_COACHING_FEATURE.md` | 習慣化コーチング機能設計 v3.0 | ✅ Current |
| `INTERVENTION_AND_METRICS_PLAN.md` | 介入システム・統計指標 実装計画 | 🔄 Planning |
| `SWIPE_SIMULATOR_DESIGN.md` | スワイプシミュレーター設計・実装 | ✅ Implemented |
| `URGE_SURFING_RESEARCH.md` | Urge Surfing心理学的根拠 | ✅ Current |
| `TESTING.md` | テスト方針・実行方法 | ✅ Current |

### 📱 Platform-Specific Documents

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `ANDROID_IMPLEMENTATION_PLAN.md` | Android版アーキテクチャ（UsageStats + Overlay） | ✅ Current |
| `ANDROID_INTEGRATION_PLAN.md` | Android統計・介入統合計画 | ✅ Current |
| `PLAY_CONSOLE_SUBMISSION_FLOW.md` | Google Play提出チェックリスト | ✅ Current |
| `DEEP_LINKING.md` | ディープリンク設定 | ✅ Current |

### 📋 Specifications

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `specs/02_pricing_monetization.md` | 料金体系・マネタイズ設計 | ✅ Current |
| `specs/03_internationalization.md` | 国際化要件 | 📝 Reference |
| `specs/04_backend_architecture.md` | バックエンド構成（RevenueCat, CloudKit） | ✅ Current |
| `specs/05_new_features_v2.md` | v2機能仕様（将来） | 📝 Future |
| `specs/APPLE_SUBSCRIPTION_PLAN.md` | Apple IAP実装計画 | 🔄 In Progress |

### 🎨 Design Documents

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `design/01_screen_design.md` | 画面設計・UIフロー | ✅ Current |
| `design/02_personalization_behavioral.md` | パーソナライズ・行動変容設計 | ✅ Current |

### 🔍 Reviews & Tracking

| ドキュメント | 説明 | 状態 |
|-------------|------|------|
| `reviews/README.md` | レビュー一覧 | ✅ Current |
| `reviews/2025-12-21_review.md` | アーキテクチャレビュー | ✅ Current |
| `reviews/2025-12-21_tasks.md` | タスクリスト | ✅ Current |
| `requirements_implementation_matrix.md` | 要件・実装対応表 | ✅ Current |
| `issues/mvp_issues.md` | MVPタスク分解 | ✅ Current |

### 📁 ディレクトリ構造

```
docs/
├── README.md                              # 本ドキュメント（エントリーポイント）
├── IMPLEMENTATION_SPEC.md                 # 技術実装仕様
├── ONBOARDING_FLOW.md                     # オンボーディング v4
├── ROADMAP.md                             # ロードマップ
├── HABIT_COACHING_FEATURE.md              # 習慣化コーチング設計
├── INTERVENTION_AND_METRICS_PLAN.md       # 介入・統計指標計画
├── SWIPE_SIMULATOR_DESIGN.md              # スワイプシミュレーター設計
├── URGE_SURFING_RESEARCH.md               # Urge Surfing研究
├── TESTING.md                             # テスト方針・実行方法
├── ANDROID_IMPLEMENTATION_PLAN.md         # Androidアーキテクチャ
├── ANDROID_INTEGRATION_PLAN.md            # Android統計統合計画
├── PLAY_CONSOLE_SUBMISSION_FLOW.md        # Play Store提出フロー
├── DEEP_LINKING.md                        # ディープリンク設定
├── requirements_implementation_matrix.md  # 要件・実装対応表
├── specs/                                 # 仕様書
│   ├── 02_pricing_monetization.md         # 料金設計
│   ├── 03_internationalization.md         # i18n
│   ├── 04_backend_architecture.md         # バックエンド
│   ├── 05_new_features_v2.md              # v2機能
│   └── APPLE_SUBSCRIPTION_PLAN.md         # Apple IAP
├── design/                                # 設計書
│   ├── 01_screen_design.md                # 画面設計
│   └── 02_personalization_behavioral.md   # 行動設計
├── reviews/                               # レビュー
│   ├── README.md                          # レビュー一覧
│   ├── 2025-12-21_review.md               # アーキテクチャレビュー
│   └── 2025-12-21_tasks.md                # タスクリスト
├── issues/                                # タスク管理
│   └── mvp_issues.md                      # MVP Issue分解
└── mockups/                               # HTMLモックアップ
    ├── index.html                         # モックアップ一覧
    ├── onboarding-flow.html               # オンボーディング詳細モック
    └── wave_mockup.html                   # 波アニメーションモックアップ
```

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React Native (Expo SDK 54) |
| 言語 | TypeScript, Swift, Kotlin |
| スタイリング | NativeWind v4 (Tailwind CSS) |
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
| オンボーディング | 10ステップのセットアップフロー | ✅ 実装済 |
| 介入システム | アプリ使用時のUrge Surfing | 🔄 改善中 |
| 統計・分析 | 使用時間の可視化、減少率表示 | 🔄 改善中 |
| Urge Surfing | 衝動をやり過ごす30秒/60秒エクササイズ | ✅ 実装済 |
| スワイプシミュレーター | TikTok/Instagram/YouTube風UIでの介入デモ | ✅ 実装済 |
| 波アニメーション | 呼吸連動の海波アニメーション | ✅ 実装済 |

### 計画中の機能

| 機能 | 説明 | ドキュメント |
|------|------|-------------|
| 介入タイミング設定 | 即時 or 時間経過後を選択可能 | `INTERVENTION_AND_METRICS_PLAN.md` |
| 新統計指標 | 減少率、達成日数、Habit Score | `INTERVENTION_AND_METRICS_PLAN.md` |
| 課金機能 | サブスクリプション | `specs/APPLE_SUBSCRIPTION_PLAN.md` |

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
| 2025-12-23 | 2.2 | スワイプシミュレーター・波アニメーション完成、プロフィール統合 |
