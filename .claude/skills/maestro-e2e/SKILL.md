---
description: This skill should be used when the user asks to "run E2E tests", "create Maestro test", "set up Maestro", "write flow file", "debug E2E test", or works with the .maestro/ directory, Maestro Studio, or mobile app E2E testing.
---

# Maestro E2E Testing Skill

StopShortsアプリのE2Eテスト設定・実行ガイド。

---

## 1. 環境セットアップ

### 1.1 前提条件

| 要件 | 確認コマンド | 備考 |
|------|-------------|------|
| Java 17+ | `java -version` | 必須 |
| Android SDK | `adb --version` | Androidテスト用 |
| Node.js | `node --version` | Expoビルド用 |
| EAS CLI | `eas --version` | development build用 |

### 1.2 Javaインストール（未インストールの場合）

```bash
# Ubuntu/WSL2
sudo apt update
sudo apt install openjdk-17-jdk

# 確認
java -version
```

### 1.3 Maestroインストール

#### オプションA: CLI（macOS/Linux/WSL2）

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash

# シェル再起動後
maestro --version
```

#### オプションB: Maestro Studio Desktop（GUI）

| OS | ダウンロード |
|----|-------------|
| Windows | https://studio.maestro.dev/MaestroStudio.exe |
| macOS | https://studio.maestro.dev/MaestroStudio.dmg |
| Linux | https://studio.maestro.dev/MaestroStudio.AppImage |

**Maestro Studio の利点:**
- ターミナル不要
- クリックでテスト実行
- 要素インスペクター内蔵
- フロー録画機能

### 1.4 Homebrewインストール（macOS）

```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

---

## 2. アプリのビルドとインストール

### 2.1 Development Build作成（Expo/EAS）

```bash
# Android用
eas build --profile development --platform android

# iOS用（macOS必須）
eas build --profile development --platform ios
```

**重要**:
- Expo Goではネイティブモジュール（expo-camera等）が動作しない
- Maestroテストには**development build**または**release build**が必須

### 2.2 APKのインストール

```bash
# エミュレータ起動確認
adb devices

# APKインストール
adb install /path/to/app.apk

# または、エミュレータにドラッグ&ドロップ
```

### 2.3 アプリIDの確認

```bash
# StopShortsのアプリID
com.stopshorts.app

# インストール確認
adb shell pm list packages | grep stopshorts
```

---

## 3. プロジェクト構成

### 3.1 ディレクトリ構造

```
.maestro/
├── config.yaml          # ワークスペース設定
├── README.md            # テストガイド
└── flows/
    ├── onboarding-flow.yaml
    ├── intervention-select.yaml
    └── training-flow.yaml
```

### 3.2 config.yaml

```yaml
# .maestro/config.yaml
appId: com.stopshorts.app

flows:
  - flows/*.yaml

executionOrder: sequential
timeout: 30000

# プラットフォーム固有設定
ios:
  deviceName: "iPhone 15 Pro"

android:
  deviceName: "Pixel 7"

output:
  format: "junit"
  path: "./test-results"
```

### 3.3 フロー設定オプション

```yaml
# 各フローファイルの先頭
appId: com.stopshorts.app
name: "Onboarding Flow Test"
tags:
  - smoke
  - onboarding
env:
  TEST_USER: "test@example.com"
---
# テストコマンドはここから
- launchApp
```

---

## 4. フローの書き方

### 4.1 基本構造

```yaml
appId: com.stopshorts.app
---
# アプリ起動
- launchApp

# 要素タップ（テキストで指定）
- tapOn: "次へ"

# 要素タップ（testIDで指定）
- tapOn:
    id: "continue-button"

# テキスト入力
- tapOn: "メールアドレス"
- inputText: "test@example.com"
- hideKeyboard

# アサーション
- assertVisible: "ようこそ"
- assertNotVisible: "エラー"

# スクロール
- scrollUntilVisible:
    element: "利用規約に同意"
    direction: DOWN

# 待機
- extendedWaitUntil:
    visible: "完了"
    timeout: 10000
```

### 4.2 React Native / Expo での testID

```tsx
// コンポーネントに testID を追加
<Button
  testID="start-button"
  title="開始"
  onPress={handleStart}
/>

<TextInput
  testID="email-input"
  placeholder="メールアドレス"
/>
```

```yaml
# フローで使用
- tapOn:
    id: "start-button"

- tapOn:
    id: "email-input"
- inputText: "user@example.com"
```

### 4.3 主要コマンド一覧

| カテゴリ | コマンド | 説明 |
|---------|---------|------|
| **タップ** | `tapOn` | 要素をタップ |
| | `doubleTapOn` | ダブルタップ |
| | `longPressOn` | 長押し |
| **スクロール** | `scroll` | スクロール |
| | `scrollUntilVisible` | 要素が見えるまでスクロール |
| **入力** | `inputText` | テキスト入力 |
| | `eraseText` | テキスト削除 |
| | `hideKeyboard` | キーボード非表示 |
| **アプリ制御** | `launchApp` | アプリ起動 |
| | `killApp` | アプリ終了 |
| | `clearState` | アプリ状態クリア |
| **アサーション** | `assertVisible` | 表示確認 |
| | `assertNotVisible` | 非表示確認 |
| | `assertTrue` | 条件確認 |
| **待機** | `extendedWaitUntil` | 条件まで待機 |
| **デバイス** | `setLocation` | 位置情報設定 |
| | `setAirplaneMode` | 機内モード |

---

## 5. テスト実行

### 5.1 基本実行

```bash
# 全テスト実行
maestro test .maestro/

# 個別フロー実行
maestro test .maestro/flows/onboarding-flow.yaml

# 複数フロー指定
maestro test .maestro/flows/onboarding-flow.yaml .maestro/flows/training-flow.yaml
```

### 5.2 デバッグモード

```bash
# ステップごとに停止
maestro test --debug .maestro/flows/onboarding-flow.yaml

# 要素階層を表示
maestro hierarchy
```

### 5.3 レポート生成

```bash
# JUnit形式
maestro test --format junit --output ./test-results .maestro/

# HTML形式
maestro test --format html --output ./test-results .maestro/
```

### 5.4 Maestro Studio起動

```bash
# ブラウザベースのインタラクティブUI
maestro studio
```

---

## 6. StopShorts固有のテストパターン

### 6.1 オンボーディングフロー

```yaml
appId: com.stopshorts.app
---
- launchApp
- assertVisible: "ようこそ"
- tapOn: "始める"

# 目標選択
- assertVisible: "あなたの目標"
- tapOn: "時間の使い方を改善したい"
- tapOn: "次へ"

# 代替活動選択
- assertVisible: "代わりにすること"
- tapOn: "読書"
- tapOn: "次へ"

# 介入方法選択
- assertVisible: "介入方法"
- tapOn: "深呼吸"

# 体験
- tapOn: "体験する"
- extendedWaitUntil:
    visible: "完了"
    timeout: 30000
```

### 6.2 介入テスト

```yaml
appId: com.stopshorts.app
---
- launchApp

# 設定画面へ
- tapOn: "設定"
- scrollUntilVisible:
    element: "介入設定"
    direction: DOWN
- tapOn: "介入設定"

# ミラー介入選択
- tapOn: "ミラー"
- assertVisible:
    id: "camera-preview"
    optional: true  # カメラ権限がない場合のフォールバック
```

### 6.3 トレーニングモジュール

```yaml
appId: com.stopshorts.app
---
- launchApp
- tapOn: "学習"

# トピック選択
- assertVisible: "トレーニング"
- tapOn: "習慣ループを理解する"

# 記事閲覧
- tapOn: "記事"
- scrollUntilVisible:
    element: "次へ進む"
    direction: DOWN
- tapOn: "次へ進む"

# クイズ回答
- assertVisible: "クイズ"
- tapOn: "きっかけ・ルーティン・報酬"
- tapOn: "答え合わせ"
```

---

## 7. トラブルシューティング

### 7.1 よくある問題

| 問題 | 解決方法 |
|------|---------|
| デバイスが見つからない | `adb devices` で接続確認、エミュレータ起動確認 |
| 要素が見つからない | `maestro hierarchy` で要素構造を確認 |
| タイムアウト | `config.yaml` の `timeout` 値を増加 |
| アプリが起動しない | `adb shell pm list packages` でインストール確認 |
| testIDが認識されない | React Native の `accessibilityLabel` も試す |

### 7.2 要素階層の確認

```bash
# 現在の画面構造をダンプ
maestro hierarchy

# 特定の要素を検索
maestro hierarchy | grep "ボタン"
```

### 7.3 WSL2特有の問題

```bash
# Windows側のADBをWSL2から使用
export ADB_SERVER_SOCKET=tcp:host.docker.internal:5037

# または、WSL2にADBをインストール
sudo apt install adb
```

---

## 8. CI/CD統合

### 8.1 GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install Maestro
        run: |
          curl -fsSL "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Start Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          script: |
            adb install app.apk
            maestro test .maestro/ --format junit --output ./test-results

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: e2e-results
          path: test-results/
```

---

## 9. ベストプラクティス

### 9.1 フロー設計

- **独立性**: 各フローは他に依存せず単独実行可能に
- **アトミック**: 1フロー = 1機能のテスト
- **リカバリー**: `launchApp` で毎回クリーンな状態から開始

### 9.2 セレクター優先順位

1. `testID` (最も安定)
2. `accessibilityLabel`
3. テキストマッチング
4. インデックス（最後の手段）

### 9.3 待機戦略

```yaml
# 悪い例：固定待機
- runScript:
    script: |
      sleep(5000)

# 良い例：条件待機
- extendedWaitUntil:
    visible: "完了"
    timeout: 10000
```

---

## 10. クイックリファレンス

### 10.1 インストールチェックリスト

```bash
# 1. Java確認
java -version  # 17以上

# 2. Maestroインストール
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 3. シェル再起動
exec $SHELL

# 4. 確認
maestro --version

# 5. デバイス接続
adb devices

# 6. アプリインストール
adb install path/to/app.apk

# 7. テスト実行
maestro test .maestro/
```

### 10.2 よく使うコマンド

```bash
maestro test .maestro/                    # 全テスト
maestro test --debug flow.yaml            # デバッグモード
maestro hierarchy                          # 要素確認
maestro studio                             # Studio起動
maestro test --format junit .maestro/     # JUnitレポート
maestro test --continuous .maestro/       # 継続モード（ファイル変更監視）
```

---

## 11. Continuous Mode（継続モード）

### 11.1 基本的な使い方

```bash
# フロー変更を監視して自動再実行
maestro test --continuous .maestro/flows/onboarding-flow.yaml

# 複数フローの監視
maestro test --continuous .maestro/
```

**利点:**
- フローファイル保存時に自動再実行
- デバッグサイクルの高速化
- リアルタイムフィードバック

### 11.2 効果的なワークフロー

```bash
# ターミナル1: continuous mode
maestro test --continuous .maestro/flows/my-flow.yaml

# ターミナル2: フローファイルを編集
# 保存するたびに自動実行される
```

---

## 12. 日本語・Unicode対応

### 12.1 Android制限事項

**重要**: MaestroはAndroidでUnicode入力をサポートしていません（GitHub issue #146）。

```yaml
# ❌ Androidで失敗する
- inputText: "テストユーザー"

# ✅ ASCII文字のみ使用
- inputText: "TestUser"
```

### 12.2 日本語テキスト要素のタップ

日本語テキストの**表示・検索・タップ**は可能です：

```yaml
# ✅ 日本語テキストのタップは動作する
- tapOn: "始める"
- tapOn: "次へ"
- assertVisible: "設定"

# ✅ 正規表現も使用可能
- tapOn:
    text: ".*スキップ.*"
```

### 12.3 日本語入力が必要な場合のワークアラウンド

```yaml
# 方法1: テキストフィールドを座標でタップし、ASCII入力
- tapOn:
    point: "50%,30%"
- inputText: "TestName"

# 方法2: testIDを使用してフィールド特定
- tapOn:
    id: "name-input"
- inputText: "TestName"
```

---

## 13. 条件付きフロー（Conditional Flows）

### 13.1 runFlow with when

特定の条件でのみ実行するフローブロック：

```yaml
# オンボーディング画面が表示されている場合のみ実行
- runFlow:
    when:
      visible: "始める"
    commands:
      - tapOn: "始める"
      - waitForAnimationToEnd
```

### 13.2 複数条件の処理

```yaml
# 条件1: オンボーディング画面ならスキップ
- runFlow:
    when:
      visible: "デモモードでスキップ"
    commands:
      - tapOn:
          text: ".*デモモードでスキップ.*"
      - waitForAnimationToEnd:
          timeout: 3000

# 条件2: メイン画面なら続行
- runFlow:
    when:
      visible: "ダッシュボード"
    commands:
      - assertVisible: "今日の使用時間"
```

### 13.3 オプショナルアサーション

```yaml
# 権限画面が出るかもしれない場合
- assertVisible:
    text: "使用状況へのアクセスを許可"
    optional: true

# オプショナル要素のタップ
- tapOn:
    text: "許可する"
    optional: true
```

---

## 14. アニメーション・タイミング対応

### 14.1 waitForAnimationToEnd

React Native Reanimatedのアニメーション完了を待つ：

```yaml
- tapOn: "始める"
- waitForAnimationToEnd

# タイムアウト指定
- waitForAnimationToEnd:
    timeout: 5000
```

### 14.2 extendedWaitUntil vs waitForAnimationToEnd

| コマンド | 用途 |
|---------|------|
| `waitForAnimationToEnd` | UIアニメーション完了待ち |
| `extendedWaitUntil` | 特定要素の出現待ち |

```yaml
# アニメーション後に要素を待つパターン
- tapOn: "次へ"
- waitForAnimationToEnd
- extendedWaitUntil:
    visible: "設定完了"
    timeout: 10000
```

### 14.3 フレーキーテスト対策

```yaml
# repeat でリトライ
- repeat:
    times: 3
    commands:
      - tapOn:
          text: "保存"
          optional: true
      - waitForAnimationToEnd

# スクロールの速度調整
- scrollUntilVisible:
    element: "介入設定"
    direction: DOWN
    speed: 30        # 0-100、低いほど遅い
    timeout: 15000
```

---

## 15. 要素選択の優先順位

### 15.1 推奨される順序

1. **testID** - 最も安定（コード変更が必要）
2. **accessibilityLabel** - Buttonコンポーネントは自動設定済み
3. **テキストマッチング** - i18n変更で壊れやすい
4. **座標タップ** - 最後の手段（画面サイズ依存）

### 15.2 StopShortsのButtonコンポーネント

`src/components/ui/Button.tsx`は既に設定済み：

```tsx
<AnimatedTouchableOpacity
    testID={testID}
    accessibilityLabel={title}  // ← タイトルテキストで検索可能
    accessibilityRole="button"
    ...
>
```

そのため、ボタンはテキストで直接タップ可能：

```yaml
# ButtonコンポーネントはaccessibilityLabel設定済み
- tapOn: "始める"    # ✅ 動作する
- tapOn: "次へ"      # ✅ 動作する
```

### 15.3 座標タップが必要な場合

```yaml
# 画面下部中央のボタン（80%下、50%中央）
- tapOn:
    point: "50%,85%"

# 右下のタブ
- tapOn:
    point: "83%,96%"
```

---

## 16. デバッグテクニック

### 16.1 hierarchy コマンド

```bash
# 現在の画面要素を全て表示
maestro hierarchy

# 特定テキストを検索
maestro hierarchy | grep -i "設定"

# JSONで出力
maestro hierarchy --format json > hierarchy.json
```

### 16.2 スクリーンショット取得

```yaml
# フロー内でスクリーンショット
- takeScreenshot: "step1_welcome"
- tapOn: "始める"
- takeScreenshot: "step2_after_start"
```

### 16.3 デバッグ出力の確認

```bash
# テスト実行後、デバッグ出力のパスが表示される
# ==== Debug output (logs & screenshots) ====
# /home/user/.maestro/tests/2026-01-03_123456/

# スクリーンショットを確認
ls ~/.maestro/tests/*/screenshots/
```

---

## 17. StopShorts テストフロー例

### 17.1 完全なオンボーディングスキップ

```yaml
appId: com.stopshorts.app
---
- launchApp:
    clearState: true

- waitForAnimationToEnd

# デモモードでスキップ（存在する場合）
- runFlow:
    when:
      visible: "始める"
    commands:
      - tapOn:
          text: ".*デモモードでスキップ.*"
      - waitForAnimationToEnd:
          timeout: 3000

# メイン画面に到達確認
- assertVisible:
    text: "ダッシュボード"
    optional: true
```

### 17.2 設定画面アクセス

```yaml
# ボトムナビゲーションで設定タブをタップ
# 設定は右端（約83%の位置）
- tapOn:
    point: "83%,96%"

- waitForAnimationToEnd

- scrollUntilVisible:
    element: "介入設定"
    direction: DOWN
    speed: 30
    timeout: 15000
```
