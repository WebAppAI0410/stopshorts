# StopShorts - MVP Issue分解

## 概要

MVP達成に必要なIssueを分解。各Issueには受け入れ条件を明記。

**MVP目標**: ショート動画アプリを5分で遮断し、リマインド文言を表示する最小機能

---

## Epic 1: プロジェクト基盤

### Issue #001: プロジェクト初期セットアップ

**ラベル**: `setup`, `foundation`
**優先度**: P0（最優先）

#### 説明
Expo + TypeScript + NativeWindでプロジェクトを初期化し、基本構成を整える。

#### タスク
- [ ] Expo SDK 52+ でプロジェクト作成
- [ ] TypeScript設定（strict mode）
- [ ] NativeWind設定
- [ ] Zustand導入
- [ ] Expo Router設定
- [ ] ESLint + Prettier設定
- [ ] 基本ディレクトリ構造作成

#### 受け入れ条件
```gherkin
Given プロジェクトがセットアップされている
When `npx expo start` を実行する
Then 開発サーバーが起動する
And 実機/シミュレータでアプリが表示される
And TypeScriptの型チェックが通る
And Lintエラーがない
```

---

### Issue #002: EAS Build設定

**ラベル**: `setup`, `eas`
**優先度**: P0

#### 説明
EAS Build/Update の設定を行い、クラウドビルドができる状態にする。

#### タスク
- [ ] eas.json作成（development/preview/production）
- [ ] Apple Developer Programとの連携設定
- [ ] 最初のdevelopment buildを作成
- [ ] Expo Orbitでの実機インストール確認

#### 受け入れ条件
```gherkin
Given EASの設定が完了している
When `eas build --profile development --platform ios` を実行する
Then ビルドがキューに追加される
And ビルドが成功する
And Expo Orbitで実機にインストールできる
```

---

### Issue #003: GitHub Actions CI設定

**ラベル**: `setup`, `ci`
**優先度**: P1

#### 説明
PR時にLint/TypeCheck/Testが自動実行されるCIを構築。

#### タスク
- [ ] .github/workflows/ci.yml作成
- [ ] Lint/TypeCheck/Testジョブ設定
- [ ] ブランチ保護ルール設定

#### 受け入れ条件
```gherkin
Given PRが作成される
When CIワークフローが実行される
Then Lintが実行される
And 型チェックが実行される
And テストが実行される（あれば）
And 結果がPRに表示される
```

---

## Epic 2: オンボーディング

### Issue #004: Welcome画面の実装

**ラベル**: `feature`, `onboarding`, `ui`
**優先度**: P0

#### 説明
アプリ起動時に表示されるWelcome画面を実装。価値提案とCTAを表示。

#### 参照
- docs/design/01_screen_design.md セクション2.1

#### タスク
- [ ] app/(onboarding)/welcome.tsx 作成
- [ ] アプリアイコン/ロゴ表示
- [ ] タイトル・サブタイトル表示
- [ ] 「始める」ボタン
- [ ] 進捗インジケーター（6ステップ中1）
- [ ] Purpose画面への遷移

#### 受け入れ条件
```gherkin
Given ユーザーが初回起動する
When Welcome画面が表示される
Then アプリ名「StopShorts」が表示される
And キャッチコピー「5分で止める、人生を取り戻す」が表示される
And 「始める」ボタンが表示される
When 「始める」をタップする
Then Purpose選択画面に遷移する
```

---

### Issue #005: Purpose選択画面の実装

**ラベル**: `feature`, `onboarding`, `ui`
**優先度**: P0

#### 説明
ユーザーの目的を選択する画面。パーソナライズの基盤となる。

#### 参照
- docs/design/01_screen_design.md セクション2.2
- docs/design/02_personalization_behavioral.md セクション2.1

#### タスク
- [ ] app/(onboarding)/purpose.tsx 作成
- [ ] 6つの目的選択肢を表示
  - 睡眠改善
  - 勉強・学習
  - 仕事効率
  - 創作・趣味
  - メンタルヘルス
  - その他
- [ ] 選択状態のUI
- [ ] Zustand storeに保存
- [ ] 次画面への遷移

#### 受け入れ条件
```gherkin
Given Welcome画面から遷移してきた
When Purpose選択画面が表示される
Then 6つの目的選択肢が表示される
When いずれかの目的をタップする
Then 選択状態がハイライトされる
And Commitment画面に遷移する
And 選択した目的がストアに保存される
```

---

### Issue #006: Commitment画面の実装

**ラベル**: `feature`, `onboarding`, `ui`
**優先度**: P1

#### 説明
コミットメントを促し、プラン選択への導線を提供。

#### 参照
- docs/design/01_screen_design.md セクション2.3
- docs/specs/02_pricing_monetization.md

#### タスク
- [ ] app/(onboarding)/commitment.tsx 作成
- [ ] プラン選択UI（30日/90日/無料トライアル）
- [ ] 価格表示（日割り計算含む）
- [ ] 「まずは無料で試す」オプション
- [ ] 次画面への遷移

#### 受け入れ条件
```gherkin
Given Purpose画面から遷移してきた
When Commitment画面が表示される
Then 3つのプラン選択肢が表示される
And 各プランの価格が表示される
When いずれかのプランを選択する
Then Permission画面に遷移する
```

**Note**: MVP段階ではIAP実装は後回し。選択結果のみ保存。

---

### Issue #007: Permission画面の実装

**ラベル**: `feature`, `onboarding`, `native`
**優先度**: P0

#### 説明
Screen Time権限の取得を促す画面。

#### 参照
- docs/design/01_screen_design.md セクション2.4

#### タスク
- [ ] app/(onboarding)/permission.tsx 作成
- [ ] 権限が必要な理由の説明
- [ ] 「権限を許可する」ボタン
- [ ] Family Controls認可フローの呼び出し
- [ ] 権限拒否時のフォールバックUI
- [ ] 権限取得成功時、次画面へ遷移

#### 受け入れ条件
```gherkin
Given Commitment画面から遷移してきた
When Permission画面が表示される
Then Screen Time権限の説明が表示される
And 「権限を許可する」ボタンが表示される
When ボタンをタップする
Then iOS標準の認可ダイアログが表示される
When ユーザーが許可する
Then App Selection画面に遷移する
When ユーザーが拒否する
Then フォールバックUIが表示される
And 「設定を開く」ボタンが表示される
```

---

### Issue #008: App Selection画面の実装

**ラベル**: `feature`, `onboarding`, `native`
**優先度**: P0

#### 説明
制限対象アプリを選択する画面。Family Controls Pickerを使用。

#### 参照
- docs/design/01_screen_design.md セクション2.5

#### タスク
- [ ] app/(onboarding)/app-selection.tsx 作成
- [ ] よく選ばれるアプリのサジェスト表示
- [ ] Family Controls Picker起動ボタン
- [ ] 選択結果の表示
- [ ] 選択アプリ数の表示
- [ ] 次画面への遷移

#### 受け入れ条件
```gherkin
Given Permission画面から遷移してきた
When App Selection画面が表示される
Then 「その他のアプリを選ぶ」ボタンが表示される
When ボタンをタップする
Then Family Controls Pickerが表示される
When アプリを選択する
Then 選択されたアプリ数が表示される
And 「次へ」ボタンが有効になる
When 「次へ」をタップする
Then Implementation Intent画面に遷移する
```

---

### Issue #009: Implementation Intent画面の実装

**ラベル**: `feature`, `onboarding`, `ui`
**優先度**: P0

#### 説明
「Shieldが出たら何をするか」を設定する画面。

#### 参照
- docs/design/01_screen_design.md セクション2.6
- docs/design/02_personalization_behavioral.md セクション4.3

#### タスク
- [ ] app/(onboarding)/implementation-intent.tsx 作成
- [ ] 5つの選択肢を表示
  - 深呼吸して閉じる
  - 立ち上がって伸びをする
  - 水を飲む
  - やるべきことを確認する
  - 自分で決める（自由入力）
- [ ] 選択状態のUI
- [ ] Zustand storeに保存
- [ ] オンボーディング完了、Home画面へ遷移

#### 受け入れ条件
```gherkin
Given App Selection画面から遷移してきた
When Implementation Intent画面が表示される
Then 5つの選択肢が表示される
When いずれかを選択する
Then 選択状態がハイライトされる
When 「設定を完了する」をタップする
Then Home画面に遷移する
And オンボーディング完了フラグが設定される
```

---

## Epic 3: メイン画面

### Issue #010: Home画面（ダッシュボード）の実装

**ラベル**: `feature`, `main`, `ui`
**優先度**: P0

#### 説明
メインのダッシュボード画面。保護状態、今日の介入回数、ストリークを表示。

#### 参照
- docs/design/01_screen_design.md セクション3.1

#### タスク
- [ ] app/(auth)/index.tsx 作成
- [ ] ヘッダー（ハンバーガーメニュー、設定アイコン）
- [ ] 保護状態カード（🛡️ 保護中）
- [ ] 今日の介入回数表示
- [ ] 取り戻した時間表示
- [ ] ストリーク表示
- [ ] 週間カレンダー（簡易版）
- [ ] 今日のヒント表示
- [ ] 設定画面への遷移

#### 受け入れ条件
```gherkin
Given オンボーディングが完了している
When Home画面が表示される
Then 「保護中」ステータスが表示される
And 今日の介入回数が表示される（初期値0）
And 取り戻した時間が表示される（初期値0分）
And ストリーク表示がある
When 設定アイコンをタップする
Then Settings画面に遷移する
```

---

### Issue #011: Statistics画面の実装

**ラベル**: `feature`, `main`, `ui`
**優先度**: P1

#### 説明
詳細な統計を表示する画面。

#### 参照
- docs/design/01_screen_design.md セクション3.2

#### タスク
- [ ] app/(auth)/statistics.tsx 作成
- [ ] タブ切り替え（今日/週間/月間）
- [ ] 取り戻した時間のグラフ（棒グラフ）
- [ ] 介入回数の表示
- [ ] 成功率（閉じた率）の円グラフ

#### 受け入れ条件
```gherkin
Given Home画面から遷移してきた
When Statistics画面が表示される
Then 「今日」「週間」「月間」のタブがある
And 取り戻した時間が表示される
And 介入回数が表示される
When タブを切り替える
Then 表示期間に応じたデータが表示される
```

---

### Issue #012: Settings画面の実装

**ラベル**: `feature`, `settings`, `ui`
**優先度**: P1

#### 説明
設定一覧画面。

#### 参照
- docs/design/01_screen_design.md セクション5.1

#### タスク
- [ ] app/(auth)/settings/index.tsx 作成
- [ ] 遮断設定セクション（対象アプリ、遮断時間、時間帯）
- [ ] メッセージセクション（Shield文言、実装意図）
- [ ] アカウントセクション（プラン、通知）
- [ ] その他セクション（ヘルプ、利用規約、バージョン）
- [ ] 各項目への遷移

#### 受け入れ条件
```gherkin
Given Home画面から遷移してきた
When Settings画面が表示される
Then 遮断設定セクションが表示される
And アカウントセクションが表示される
When 各項目をタップする
Then 対応する詳細画面に遷移する
```

---

## Epic 4: Shield機能（コア）

### Issue #013: Screen Timeネイティブモジュールの基盤作成

**ラベル**: `feature`, `native`, `core`
**優先度**: P0

#### 説明
Swift + React NativeブリッジでScreen Time APIを呼び出す基盤を作成。

#### タスク
- [ ] modules/screen-time/ios/ ディレクトリ作成
- [ ] ScreenTimeModule.swift 作成
- [ ] React Nativeブリッジ設定
- [ ] JSからの呼び出しインターフェース定義
- [ ] modules/screen-time/index.ts 作成

#### 受け入れ条件
```gherkin
Given ネイティブモジュールが設定されている
When JS側からモジュールをimportする
Then エラーなくimportできる
And 基本的なメソッド呼び出しが可能
```

---

### Issue #014: Family Controls認可フローの実装

**ラベル**: `feature`, `native`, `core`
**優先度**: P0

#### 説明
Family Controlsの認可リクエストを実装。

#### タスク
- [ ] AuthorizationCenter.shared.requestAuthorization() の呼び出し
- [ ] 認可状態の取得
- [ ] JS側への結果返却
- [ ] 認可失敗時のエラーハンドリング

#### 受け入れ条件
```gherkin
Given アプリが起動している
When JS側から認可リクエストを呼び出す
Then iOS標準の認可ダイアログが表示される
When ユーザーが許可する
Then 認可成功がJS側に返却される
When ユーザーが拒否する
Then 認可失敗がJS側に返却される
```

---

### Issue #015: 対象アプリ選択（Family Controls Picker）の実装

**ラベル**: `feature`, `native`, `core`
**優先度**: P0

#### 説明
Family Controls Pickerを表示し、選択結果をトークンとして保存。

#### タスク
- [ ] FamilyActivityPicker の表示
- [ ] 選択結果（ApplicationToken）の取得
- [ ] トークンの永続化（UserDefaults）
- [ ] JS側への選択完了通知

#### 受け入れ条件
```gherkin
Given Family Controls認可が完了している
When JS側からPicker表示を呼び出す
Then Family Controls Pickerが表示される
When ユーザーがアプリを選択して完了する
Then 選択されたアプリのトークンが保存される
And JS側に選択完了が通知される
```

---

### Issue #016: DeviceActivityMonitor Extension作成

**ラベル**: `feature`, `native`, `core`
**優先度**: P0

#### 説明
DeviceActivityMonitor App Extensionを作成。5分到達を検知。

#### タスク
- [ ] DeviceActivityMonitor拡張ターゲット作成
- [ ] intervalDidStart() の実装
- [ ] intervalDidEnd() の実装（5分到達）
- [ ] Shield起動のトリガー

#### 受け入れ条件
```gherkin
Given 対象アプリが選択されている
And DeviceActivityMonitorがスケジュールされている
When 対象アプリの使用が5分に達する
Then intervalDidEnd() が呼び出される
And Shield表示がトリガーされる
```

---

### Issue #017: ShieldConfiguration Extension作成

**ラベル**: `feature`, `native`, `core`
**優先度**: P0

#### 説明
ShieldConfiguration App Extensionを作成。Shield画面のカスタマイズ。

#### タスク
- [ ] ShieldConfiguration拡張ターゲット作成
- [ ] configuration(shielding:) の実装
- [ ] カスタムタイトル設定
- [ ] カスタムメッセージ設定（パーソナライズ文言）
- [ ] ボタンラベル設定（「閉じる」等）

#### 受け入れ条件
```gherkin
Given Shield表示がトリガーされている
When ShieldConfigurationが呼び出される
Then カスタムタイトルが設定される
And パーソナライズされたメッセージが設定される
And 「閉じる」ボタンが設定される
```

---

### Issue #018: Shield表示とアクション処理

**ラベル**: `feature`, `native`, `core`
**優先度**: P0

#### 説明
Shieldのボタンアクション（閉じる、あと5分）を処理。

#### タスク
- [ ] ShieldActionExtension の作成
- [ ] primaryButtonTapped() の実装（閉じる）
- [ ] secondaryButtonTapped() の実装（あと5分）
- [ ] アクションのログ記録
- [ ] 介入カウントの更新

#### 受け入れ条件
```gherkin
Given Shield画面が表示されている
When ユーザーが「閉じる」をタップする
Then 対象アプリが閉じられる
And 介入成功としてログに記録される
When ユーザーが「あと5分」をタップする
Then Shieldが一時的に解除される
And 5分後に再度Shieldが表示される
```

---

## Epic 5: データ永続化

### Issue #019: ローカルストレージ設計と実装

**ラベル**: `feature`, `data`
**優先度**: P0

#### 説明
AsyncStorage / SecureStore を使ったデータ永続化。

#### タスク
- [ ] Zustand + persist middleware設定
- [ ] userStore（プロフィール、目的、実装意図）
- [ ] settingsStore（対象アプリ、遮断時間）
- [ ] statsStore（介入回数、成功回数、日次データ）

#### 受け入れ条件
```gherkin
Given アプリでデータを設定する
When アプリを終了して再起動する
Then 設定したデータが復元される
And ストアの状態が維持される
```

---

### Issue #020: 統計データの記録ロジック

**ラベル**: `feature`, `data`
**優先度**: P1

#### 説明
介入回数、成功回数、節約時間を記録するロジック。

#### タスク
- [ ] 介入イベントの記録
- [ ] 日次/週次/月次の集計ロジック
- [ ] 節約時間の計算（介入1回 = 15分節約と仮定）
- [ ] ストリーク計算ロジック

#### 受け入れ条件
```gherkin
Given Shieldが表示され「閉じる」が選択される
When 介入イベントが記録される
Then 今日の介入回数が+1される
And 今日の成功回数が+1される
And 節約時間が+15分される
And ストリークが更新される
```

---

## Epic 6: 審査準備

### Issue #021: App Store審査用説明文の作成

**ラベル**: `docs`, `appstore`
**優先度**: P1

#### 説明
App Storeに提出する説明文、スクリーンショット、レビューノートを準備。

#### タスク
- [ ] アプリ説明文（日本語/英語）
- [ ] キーワード設定
- [ ] スクリーンショット準備（6画面以上）
- [ ] レビューノート（Screen Time/課金の説明）
- [ ] プライバシーポリシーURL
- [ ] サポートURL

#### 受け入れ条件
```gherkin
Given 審査用資料が準備されている
When App Store Connectに入力する
Then 全ての必須フィールドが埋まる
And レビューノートにScreen Time使用理由が記載されている
And 課金が規約4.10に違反していないことが説明されている
```

---

### Issue #022: Family Controlsエンタイトルメント申請

**ラベル**: `setup`, `appstore`
**優先度**: P0

#### 説明
Family Controls配布用エンタイトルメントをAppleに申請。

#### タスク
- [ ] Apple Developer Programでの申請フォーム提出
- [ ] 申請理由の説明文作成
- [ ] 承認待ち → 承認後の設定更新

#### 受け入れ条件
```gherkin
Given エンタイトルメント申請が完了している
When Appleから承認される
Then 配布用プロファイルでScreen Time APIが使用可能になる
And TestFlight / App Storeでの配布が可能になる
```

---

## 優先度サマリー

### P0（MVP必須、ブロッカー）

| Issue | タイトル |
|-------|---------|
| #001 | プロジェクト初期セットアップ |
| #002 | EAS Build設定 |
| #004 | Welcome画面 |
| #005 | Purpose選択画面 |
| #007 | Permission画面 |
| #008 | App Selection画面 |
| #009 | Implementation Intent画面 |
| #010 | Home画面 |
| #013 | Screen Timeネイティブモジュール基盤 |
| #014 | Family Controls認可フロー |
| #015 | 対象アプリ選択 |
| #016 | DeviceActivityMonitor Extension |
| #017 | ShieldConfiguration Extension |
| #018 | Shield表示とアクション処理 |
| #019 | ローカルストレージ設計 |
| #022 | Family Controlsエンタイトルメント申請 |

### P1（MVP完成後、v1.0向け）

| Issue | タイトル |
|-------|---------|
| #003 | GitHub Actions CI設定 |
| #006 | Commitment画面 |
| #011 | Statistics画面 |
| #012 | Settings画面 |
| #020 | 統計データの記録ロジック |
| #021 | App Store審査用説明文 |

---

## GitHub Issue作成用テンプレート

```markdown
---
name: Feature Request
about: MVP機能の実装
title: '[MVP] <タイトル>'
labels: mvp, feature
assignees: ''
---

## 概要
<!-- 何を実装するか -->

## 参照ドキュメント
<!-- 関連するdocsのパス -->
- docs/design/01_screen_design.md セクション X.X

## タスク
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

## 受け入れ条件
```gherkin
Given ...
When ...
Then ...
```

## 技術的考慮事項
<!-- 実装上の注意点があれば -->

## スクリーンショット/モックアップ
<!-- 必要であれば -->
```

---

## マイルストーン案

### Milestone 1: 基盤構築
- #001, #002, #003
- 目標: 開発環境が整い、ビルド・実機テストが可能

### Milestone 2: オンボーディング完成
- #004, #005, #006, #007, #008, #009
- 目標: 初回起動からHome画面までの導線が完成

### Milestone 3: コア機能（Shield）
- #013, #014, #015, #016, #017, #018, #019
- 目標: 5分で遮断する機能が動作

### Milestone 4: MVP完成
- #010, #020, #021, #022
- 目標: App Store提出可能な状態
