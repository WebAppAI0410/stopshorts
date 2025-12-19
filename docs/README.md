# StopShorts - プロジェクトドキュメント

## プロジェクト概要

**StopShorts**は、ショート動画（TikTok / YouTube Shorts / Instagram Reels）への無意識な依存から脱却するための行動変容アプリです。

**コンセプト**: 「5分で止める、人生を取り戻す」

---

## ドキュメント構成

```
docs/
├── README.md                              # 本ドキュメント
├── requirements_implementation_matrix.md  # 要件・実装 対応表（現行実装準拠）
├── specs/                                 # 仕様書
│   ├── 01_requirements.md                 # 要件定義書
│   └── 02_pricing_monetization.md         # 料金体系・マネタイズ設計
├── design/                                # 設計書
│   ├── 01_screen_design.md                # 画面設計書・UI/UXフロー
│   └── 02_personalization_behavioral.md   # パーソナライズ・行動変容設計
├── workflow/                              # 開発プロセス
│   └── 01_development_workflow.md         # 開発ワークフロー・CI/CD設計
└── issues/                                # タスク管理
    └── mvp_issues.md                      # MVP Issue分解
```

---

## クイックスタート

### 1. ドキュメントを読む順序

1. **要件定義書** (`specs/01_requirements.md`)
   - プロダクトビジョン、ターゲットユーザー、機能要件

2. **画面設計書** (`design/01_screen_design.md`)
   - 全画面のワイヤーフレーム、遷移フロー、デザインシステム

3. **パーソナライズ設計** (`design/02_personalization_behavioral.md`)
   - 行動変容の理論的基盤、パーソナライズロジック

4. **料金体系** (`specs/02_pricing_monetization.md`)
   - プラン設計、課金フロー、審査対応

5. **開発ワークフロー** (`workflow/01_development_workflow.md`)
   - 技術スタック、開発環境、CI/CD

6. **MVP Issue分解** (`issues/mvp_issues.md`)
   - 具体的なタスク一覧、優先度、受け入れ条件

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React Native (Expo SDK 52+) |
| 言語 | TypeScript, Swift |
| スタイリング | NativeWind (Tailwind CSS) |
| 状態管理 | Zustand |
| ルーティング | Expo Router |
| ネイティブAPI | Screen Time API (iOS) |
| ビルド | EAS Build |
| CI/CD | GitHub Actions |

---

## 開発環境（Windows）

### 必要なもの

- Windows 10/11
- Node.js 18+ LTS
- Apple Developer Account（有料）
- iPhone実機

### セットアップ

```bash
# Expo CLIのインストール
npm install -g eas-cli

# Expoにログイン
eas login

# プロジェクト作成後
npm install
npx expo start
```

---

## 主要機能

### MVP（最小実行可能プロダクト）

| 機能 | 説明 |
|------|------|
| オンボーディング | 目的選択、権限取得、対象アプリ選択 |
| 5分遮断 | Screen Time APIによる強制Shield |
| パーソナライズ文言 | 目的に応じたShieldメッセージ |
| 基本統計 | 今日/今週の介入回数、節約時間 |

### v1.0（改善版）

| 機能 | 説明 |
|------|------|
| 時間カスタマイズ | 3/5/10/15分の選択 |
| 時間帯プロファイル | 時間帯別の設定 |
| 詳細統計 | 月間データ、グラフ表示 |
| 課金 | In-App Purchase |

---

## 重要な制約

### App Store審査

1. **Screen Time APIのマネタイズ禁止** (Guideline 4.10)
   - 遮断機能そのものは無料提供
   - 課金は付加価値（統計、パーソナライズ等）に限定

2. **Family Controlsエンタイトルメント**
   - 配布には専用のエンタイトルメント申請が必要
   - 開発初期から申請を開始すること

### 技術制約

1. **Windows開発**
   - iOSローカルビルド不可 → EAS Build使用
   - シミュレータ不可 → 実機テストのみ

2. **Expo + iOS拡張**
   - Managed workflowではexperimental
   - 安定性リスクを考慮

---

## 開発フロー

```
[Issue選択] → [ブランチ作成] → [実装] → [実機テスト] → [PR] → [レビュー] → [マージ]
     ↑                             ↓
     └──────── Claude Code支援 ────┘
```

### 日次サイクル

1. **Morning**: GitHub Issues確認、タスク選択
2. **Day**: Cursor + Claude Codeで実装、実機テスト
3. **Evening**: コミット、PR作成

---

## 次のアクション

### 即座に始めるべきこと

1. [ ] GitHubリポジトリ作成
2. [ ] Apple Developer Programへの登録確認
3. [ ] Family Controlsエンタイトルメント申請（P0）
4. [ ] プロジェクト初期セットアップ（Issue #001）

### 1週目の目標

- Issue #001-#003 完了（基盤構築）
- EAS Buildで実機テスト可能な状態

### 2週目の目標

- Issue #004-#009 完了（オンボーディング）
- 画面遷移が動作する状態

### 3-4週目の目標

- Issue #013-#018 完了（Shield機能）
- コア機能が動作する状態

---

## 連絡先・リソース

| リソース | URL |
|---------|-----|
| Apple Developer | https://developer.apple.com |
| Expo Documentation | https://docs.expo.dev |
| Screen Time API (WWDC21) | https://developer.apple.com/videos/play/wwdc2021/10123/ |
| App Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ |

---

## 更新履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2025-12-19 | 1.0 | 初版作成 |
