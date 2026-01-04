# Maestro E2E Tests

StopShortsアプリのE2Eテストスイート。

## セットアップ

### Maestroのインストール

```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash

# 確認
maestro --version
```

### アプリのビルド

```bash
# 開発ビルド作成
eas build --profile development --platform android
# または
eas build --profile development --platform ios
```

## テスト実行

### 全テスト実行

```bash
maestro test .maestro/
```

### 個別フロー実行

```bash
# オンボーディングフロー
maestro test .maestro/flows/onboarding-flow.yaml

# 介入設定フロー
maestro test .maestro/flows/intervention-select.yaml

# トレーニングフロー
maestro test .maestro/flows/training-flow.yaml
```

### デバッグモード

```bash
maestro test --debug .maestro/flows/onboarding-flow.yaml
```

### CI/CD統合

```bash
# JUnit形式で結果出力
maestro test .maestro/ --format junit --output ./test-results
```

### Maestro Cloud (GitHub Actions)

PRごとに自動でE2Eテストを実行します。

#### 必要なシークレット

| シークレット名 | 説明 | 取得方法 |
|---------------|------|----------|
| `MAESTRO_CLOUD_API_KEY` | APIキー | [console.mobile.dev](https://console.mobile.dev) |
| `MAESTRO_CLOUD_PROJECT_ID` | プロジェクトID | console.mobile.dev |
| `EXPO_TOKEN` | EASビルド用 | [expo.dev](https://expo.dev/settings/access-tokens) |

#### 手動実行

Actions → Maestro Cloud E2E Tests → Run workflow

#### 料金

無料枠: 月60分 / 詳細: [maestro.dev/pricing](https://maestro.dev/pricing)

## テストフロー

| フロー | 説明 | カバレッジ |
|--------|------|----------|
| `onboarding-flow.yaml` | ウェルカム画面から初回設定 | Welcome → User Setup → (Demo skip) |
| `intervention-select.yaml` | 介入設定画面での操作 | 全介入タイプの選択・保存 |
| `training-flow.yaml` | トレーニングモジュール完全フロー | 記事 → クイズ → ワークシート → 完了 |

## 設定

### 環境変数

`config.yaml`で定義された環境変数：

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `TEST_USER_NAME` | テストユーザー名 | `TestUser` |
| `DEMO_MODE` | デモモードフラグ | `true` |

### エラー時の動作

- 失敗時に自動スクリーンショット取得（`error_screenshot`）
- フレーキーテストの自動リトライ（1回）

## 制限事項

### Android権限

Android端末では使用状況アクセス権限がシステム設定画面で手動操作を必要とするため、
オンボーディングフローの完全自動化は困難です。テストではデモモードスキップを使用しています。

### 日本語入力

Maestroは日本語入力を完全にサポートしていません。
入力が必要な箇所ではASCII文字を使用しています。

## トラブルシューティング

### アプリが起動しない

```bash
# アプリIDを確認
maestro hierarchy
```

### 要素が見つからない

```bash
# 画面階層をダンプ
maestro hierarchy
```

### タイムアウト

`config.yaml`の`timeout`値を調整してください（デフォルト: 30000ms）。

### テストがフレーキー

1. `waitForAnimationToEnd`を追加
2. `scrollUntilVisible`のタイムアウトを延長
3. `retries`設定でリトライを有効化（デフォルト: 1回）

## スクリーンショット

テスト実行中に以下のスクリーンショットが取得されます：

| フロー | スクリーンショット |
|--------|-------------------|
| onboarding | `permission_screen`, `onboarding_complete` |
| intervention | `intervention_settings_complete` |
| training | `training_list`, `topic_detail`, `quiz_results`, `topic_complete`, `training_flow_complete` |

スクリーンショットは`./test-results/`ディレクトリに保存されます。
