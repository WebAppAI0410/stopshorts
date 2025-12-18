# StopShorts - 開発ワークフロー & CI/CD設計

## 1. 開発環境概要

### 1.1 技術スタック

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React Native (Expo SDK 52+)                                │
│  TypeScript                                                 │
│  NativeWind (Tailwind CSS for RN)                          │
│  Zustand (State Management)                                 │
│  React Navigation                                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Native Layer (iOS)                       │
├─────────────────────────────────────────────────────────────┤
│  Swift                                                      │
│  Screen Time API (Managed Settings, Family Controls,        │
│                   Device Activity)                          │
│  iOS App Extensions                                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Build & Deploy                           │
├─────────────────────────────────────────────────────────────┤
│  EAS Build (クラウドビルド)                                  │
│  EAS Update (OTA更新)                                       │
│  Expo Orbit (実機配布)                                      │
│  GitHub Actions (CI/CD)                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 開発環境要件（Windows）

| 要件 | 詳細 |
|------|------|
| OS | Windows 10/11 |
| Node.js | 18.x LTS以上 |
| npm/yarn | npm 9.x / yarn 1.22.x |
| Git | 2.40以上 |
| Expo CLI | `npx expo` |
| EAS CLI | `npm install -g eas-cli` |
| Expo Orbit | Windows版インストール |
| Apple Developer Account | 有料（年間$99） |

### 1.3 必要なアカウント

| サービス | 用途 | 必要性 |
|---------|------|--------|
| Apple Developer | iOSビルド、App Store公開 | 必須 |
| Expo | EAS Build、EAS Update | 必須 |
| GitHub | ソース管理、CI/CD | 必須 |
| App Store Connect | 審査提出、配布 | 必須（公開時） |

---

## 2. プロジェクト構成

### 2.1 ディレクトリ構造

```
stopshorts/
├── app/                          # Expo Router (App Directory)
│   ├── (auth)/                   # 認証済みユーザー向け画面
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # ホーム（ダッシュボード）
│   │   ├── statistics.tsx        # 統計
│   │   └── settings/
│   │       ├── index.tsx
│   │       ├── target-apps.tsx
│   │       └── ...
│   ├── (onboarding)/             # オンボーディング
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── purpose.tsx
│   │   ├── commitment.tsx
│   │   ├── permission.tsx
│   │   ├── app-selection.tsx
│   │   └── implementation-intent.tsx
│   ├── _layout.tsx               # ルートレイアウト
│   └── index.tsx                 # エントリーポイント
│
├── components/                   # 共通コンポーネント
│   ├── ui/                       # UI基盤
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── onboarding/               # オンボーディング専用
│   ├── dashboard/                # ダッシュボード専用
│   └── shield/                   # Shield関連
│
├── lib/                          # ユーティリティ・ロジック
│   ├── store/                    # Zustand stores
│   │   ├── userStore.ts
│   │   ├── settingsStore.ts
│   │   └── statsStore.ts
│   ├── hooks/                    # カスタムフック
│   ├── utils/                    # ユーティリティ関数
│   └── constants/                # 定数
│
├── modules/                      # ネイティブモジュール
│   └── screen-time/              # Screen Time API連携
│       ├── ios/                  # Swift実装
│       │   ├── ScreenTimeModule.swift
│       │   ├── ShieldConfiguration.swift
│       │   └── DeviceActivityMonitor/  # App Extension
│       └── index.ts              # JSブリッジ
│
├── assets/                       # 静的アセット
│   ├── images/
│   ├── fonts/
│   └── animations/               # Lottie等
│
├── docs/                         # ドキュメント
│   ├── specs/
│   ├── design/
│   └── workflow/
│
├── .github/                      # GitHub設定
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── preview.yml
│   │   └── production.yml
│   └── ISSUE_TEMPLATE/
│
├── app.json                      # Expo設定
├── eas.json                      # EAS Build設定
├── package.json
├── tsconfig.json
├── tailwind.config.js            # NativeWind設定
└── metro.config.js
```

### 2.2 EAS設定（eas.json）

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "env": {
        "APP_ENV": "development"
      },
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "APP_ENV": "preview"
      },
      "channel": "preview"
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "APP_ENV": "production"
      },
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

### 2.3 iOS App Extensions設定（app.json抜粋）

```json
{
  "expo": {
    "name": "StopShorts",
    "slug": "stopshorts",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.stopshorts",
      "supportsTablet": false,
      "infoPlist": {
        "NSUserTrackingUsageDescription": "習慣改善の進捗を追跡するために使用します"
      }
    },
    "extra": {
      "eas": {
        "build": {
          "experimental": {
            "ios": {
              "appExtensions": [
                {
                  "targetName": "DeviceActivityMonitor",
                  "bundleIdentifier": "com.yourcompany.stopshorts.DeviceActivityMonitor",
                  "entitlements": {
                    "com.apple.developer.family-controls": true
                  }
                },
                {
                  "targetName": "ShieldConfiguration",
                  "bundleIdentifier": "com.yourcompany.stopshorts.ShieldConfiguration",
                  "entitlements": {
                    "com.apple.developer.family-controls": true
                  }
                }
              ]
            }
          }
        }
      }
    },
    "plugins": [
      "./modules/screen-time"
    ]
  }
}
```

---

## 3. 開発フロー

### 3.1 日次開発サイクル

```
┌─────────────────────────────────────────────────────────────┐
│                    日次開発サイクル                          │
└─────────────────────────────────────────────────────────────┘

[Morning] 計画・準備
│
├── GitHub Issues確認
├── 今日のタスク選択（MVP Issueから）
└── ブランチ作成: feature/<issue-id>-<title>

[Day] 実装
│
├── Cursor + Claude Code で実装
│   └── コード編集、AI支援、エラー対応
│
├── ローカル開発サーバー起動
│   └── npx expo start
│
├── 実機テスト（開発中）
│   ├── iPhoneでExpo Goアプリ起動
│   ├── QRコードスキャン
│   └── Fast Refreshでリアルタイム確認
│
└── ネイティブ変更がある場合
    └── EAS Build (development) をトリガー

[Evening] レビュー・整理
│
├── コミット（Claude Code支援）
├── PR作成（必要に応じて）
└── 翌日の準備
```

### 3.2 実機テストフロー（Windows環境）

#### 3.2.1 JS/UI変更のみの場合（高速）

```bash
# 1. 開発サーバー起動（Windows Terminal）
npx expo start

# 2. iPhoneで確認
#    - Expo Goアプリを起動
#    - 同一Wi-Fiに接続
#    - QRコードをスキャン
#    - Fast Refreshで即座に反映

# 3. UI調整
#    - Cursorで編集
#    - 保存 → 自動反映
```

#### 3.2.2 ネイティブ変更がある場合（ビルド必要）

```bash
# 1. EASでdevelopment buildをトリガー
eas build --profile development --platform ios

# 2. ビルド完了を待つ（10-20分）

# 3. Expo Orbitで実機にインストール
#    - Windows版Expo Orbitを起動
#    - iPhoneをUSB接続
#    - ビルド選択 → インストール

# 4. development clientで起動
#    - アプリを開く
#    - 開発サーバーに接続
```

#### 3.2.3 テスターへの配布（週次）

```bash
# 1. preview buildを作成
eas build --profile preview --platform ios

# 2. 内部配布設定（初回のみ）
#    - テスターのUDID登録: eas device:create
#    - プロビジョニングプロファイル更新

# 3. 配布
#    - Expo Dashboard → Builds → Share
#    - リンクをテスターに送付
```

### 3.3 OTA更新フロー（v1.0以降）

```bash
# JS/スタイル/画像の更新のみの場合
# ネイティブ変更がないことを確認

# 1. 更新を公開
eas update --branch preview --message "UI調整: ホーム画面のレイアウト改善"

# 2. テスターは次回アプリ起動時に自動更新
#    （ネイティブビルド不要）
```

---

## 4. ブランチ戦略

### 4.1 ブランチ構成

```
main ─────────────────────────────────────────────────────────>
  │                                                    ↑
  │                                                    │ merge
  └──> develop ────────────────────────────────────────┤
         │                                             │
         ├──> feature/001-onboarding ──────────> PR ──┤
         │                                             │
         ├──> feature/002-shield-implementation ──────┤
         │                                             │
         └──> hotfix/crash-on-launch ─────────────────┘

main:     本番リリース用（常に安定）
develop:  開発統合用（任意、小規模なら省略可）
feature/* 機能開発用
hotfix/*  緊急修正用
```

### 4.2 ブランチルール

| ブランチ | 保護ルール |
|---------|-----------|
| main | PRマージのみ、CI通過必須、1人以上のレビュー必須 |
| develop | PRマージのみ、CI通過必須 |
| feature/* | 自由（コミット直接可） |

### 4.3 コミットメッセージ規約

```
<type>(<scope>): <subject>

<body>

<footer>

Types:
- feat:     新機能
- fix:      バグ修正
- docs:     ドキュメント
- style:    フォーマット（コードの意味に影響しない）
- refactor: リファクタリング
- test:     テスト
- chore:    ビルド、補助ツール

Examples:
feat(onboarding): 目的選択画面を実装
fix(shield): 5分経過後にShieldが表示されない問題を修正
docs: 画面設計書を更新
```

---

## 5. GitHub Actions CI/CD

### 5.1 CI（Pull Request時）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm run test

  preview-build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build preview
        run: eas build --profile preview --platform ios --non-interactive
```

### 5.2 Preview Deploy（develop merge時）

```yaml
# .github/workflows/preview.yml
name: Preview Deploy

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Deploy update
        run: eas update --branch preview --message "${{ github.event.head_commit.message }}"
```

### 5.3 Production Release（main merge時）

```yaml
# .github/workflows/production.yml
name: Production Release

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  build-and-submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: eas build --profile production --platform ios --non-interactive --auto-submit
```

---

## 6. Claude Code統合

### 6.1 Claude Codeの活用場面

| 場面 | 活用方法 |
|------|---------|
| 実装 | コード生成、型定義、ロジック実装 |
| デバッグ | エラー分析、修正提案 |
| レビュー | PRレビュー支援、改善提案 |
| ドキュメント | README、コメント生成 |
| コミット | コミットメッセージ生成 |

### 6.2 推奨ワークフロー

```bash
# 1. Issue選択後、Claude Codeで計画
claude "Issue #001: オンボーディング画面の実装について、
      画面設計書を参照して実装計画を立てて"

# 2. コンポーネント実装
claude "Purpose選択画面を実装して。
      画面設計書の2.2節を参照して、
      NativeWind + TypeScriptで実装"

# 3. テスト後、コミット
claude "変更内容を確認して、適切なコミットメッセージを提案して"

# 4. PR作成
claude "このブランチの変更をまとめて、PR descriptionを作成して"
```

### 6.3 CLAUDE.md設定

```markdown
# CLAUDE.md

## プロジェクト概要
StopShorts - ショート動画視聴抑制アプリ（iOS）

## 技術スタック
- React Native (Expo SDK 52+)
- TypeScript
- NativeWind (Tailwind CSS)
- Zustand
- EAS Build/Update

## コーディング規約
- TypeScript strict mode
- コンポーネント: 関数コンポーネント + hooks
- スタイリング: NativeWind (className)
- 状態管理: Zustand (大域) / useState (ローカル)

## ディレクトリ構造
- app/: 画面（Expo Router）
- components/: 共通コンポーネント
- lib/: ユーティリティ
- modules/: ネイティブモジュール

## 重要なドキュメント
- docs/specs/01_requirements.md: 要件定義
- docs/design/01_screen_design.md: 画面設計
- docs/design/02_personalization_behavioral.md: パーソナライズ設計

## コマンド
- npm run start: 開発サーバー起動
- npm run lint: Lint実行
- npm run typecheck: 型チェック
- eas build --profile development: 開発ビルド
```

---

## 7. テスト戦略

### 7.1 テストピラミッド

```
                    ┌───────────┐
                    │   E2E     │  Detox / Maestro
                    │  (少数)   │  - クリティカルパス
                    ├───────────┤
                    │ Integration│  React Native Testing Library
                    │  (中程度)  │  - 画面単位
                    ├───────────┤
                    │   Unit    │  Jest
                    │  (多数)   │  - ロジック、ユーティリティ
                    └───────────┘
```

### 7.2 テスト対象

| レイヤー | ツール | 対象 |
|---------|--------|------|
| Unit | Jest | lib/utils/*, lib/store/* |
| Integration | RNTL | components/*, app/* |
| E2E | Maestro | クリティカルパス（オンボーディング等） |

### 7.3 テストコマンド

```bash
# Unit + Integration
npm run test

# E2E（Maestro）
maestro test e2e/onboarding.yaml
```

---

## 8. リリースプロセス

### 8.1 MVP → App Store公開

```
Phase 1: 内部テスト（TestFlight Internal）
│
├── EAS Build (production)
├── App Store Connect へアップロード
├── 内部テスター（自分 + 少数）で検証
└── 重大なバグがないことを確認

Phase 2: 外部ベータ（TestFlight External）
│
├── App Review（ベータ版の審査）
├── 外部テスター（10-100人）招待
├── フィードバック収集
└── 必要な修正

Phase 3: App Store 公開
│
├── App Review（本審査）
├── 審査ノート準備
│   ├── Screen Time権限の説明
│   ├── 課金の説明（4.10準拠）
│   └── デモ動画/スクリーンショット
├── 承認後、段階的リリース
│   └── 1% → 10% → 50% → 100%
└── 公開
```

### 8.2 審査チェックリスト

- [ ] App Review Guidelines 全項目確認
- [ ] Screen Time関連の説明文準備
- [ ] 課金がAPI自体を有料化していないことの説明
- [ ] プライバシーポリシーURL設定
- [ ] サポートURL設定
- [ ] スクリーンショット準備（6.5", 5.5"）
- [ ] App Preview動画（任意）
- [ ] アプリ説明文（多言語）

---

## 9. 監視・運用（公開後）

### 9.1 監視ツール

| ツール | 用途 |
|--------|------|
| Sentry | クラッシュレポート、エラー監視 |
| Expo Dashboard | OTA更新状況、ビルド状況 |
| App Store Connect | レビュー、ダウンロード数 |

### 9.2 インシデント対応

```
Severity 1（即時対応）:
- アプリがクラッシュして起動しない
- 遮断機能が完全に動作しない

対応:
1. hotfixブランチ作成
2. 修正 → テスト
3. EAS Build (production)
4. App Store Connect → 緊急審査依頼

Severity 2（1日以内）:
- 特定条件でのクラッシュ
- UI崩れ

対応:
1. OTA更新で対応可能か確認
2. 可能なら eas update
3. 不可能なら通常リリースフロー
```

---

## 付録A: よく使うコマンド一覧

```bash
# 開発
npx expo start                    # 開発サーバー起動
npx expo start --clear            # キャッシュクリアして起動

# ビルド
eas build --profile development --platform ios   # 開発ビルド
eas build --profile preview --platform ios       # プレビュービルド
eas build --profile production --platform ios    # 本番ビルド

# OTA更新
eas update --branch development --message "..."  # 開発チャンネル更新
eas update --branch preview --message "..."      # プレビューチャンネル更新

# デバイス管理
eas device:create                 # 新規デバイス登録
eas device:list                   # 登録デバイス一覧

# 認証
eas login                         # Expoにログイン
eas whoami                        # 現在のユーザー確認

# 診断
npx expo-doctor                   # 設定診断
eas build:inspect                 # ビルド設定確認
```

## 付録B: トラブルシューティング

### B.1 EAS Buildが失敗する

```
原因1: エンタイトルメント不足
→ Apple Developer Programでcapabilityを追加

原因2: プロビジョニングプロファイルの問題
→ eas credentials でリセット

原因3: ネイティブモジュールのビルドエラー
→ EASのビルドログを確認し、Swift/Xcodeエラーを特定
```

### B.2 実機でアプリが起動しない

```
原因1: development clientがインストールされていない
→ eas build --profile development を実行

原因2: 署名の問題
→ eas device:list でUDIDが登録されているか確認
→ 登録されていなければ eas device:create

原因3: ネットワークの問題
→ iPhoneとPCが同一Wi-Fiか確認
→ ファイアウォール設定を確認
```

### B.3 Screen Time APIが動作しない

```
原因1: エンタイトルメントがない
→ Family Controlsの配布用エンタイトルメントを申請

原因2: ユーザーが権限を拒否した
→ アプリ内で「設定を開く」導線を提供

原因3: App Extensionが正しくビルドされていない
→ app.jsonのextensions設定を確認
→ EASビルドログでextensionのビルド状況を確認
```
