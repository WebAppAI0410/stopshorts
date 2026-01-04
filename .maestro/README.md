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

| フロー | 説明 |
|--------|------|
| `onboarding-flow.yaml` | ウェルカム画面から初回設定完了まで |
| `intervention-select.yaml` | 介入方法の選択と設定 |
| `training-flow.yaml` | トレーニングモジュールの操作 |

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

`config.yaml`の`timeout`値を調整してください。
