# StopShorts - 実装ロードマップ v2.0

## 現在のステータス

| 項目 | 状態 |
|------|------|
| 基本UI | ✅ 完了 |
| オンボーディング（基本） | ✅ 完了 |
| テーマシステム | ✅ 完了 |
| 状態管理（Zustand） | ✅ 完了 |
| EAS Build設定 | ✅ 完了 |
| Development Build | ✅ 完了 |

---

## フェーズ別実装計画

### Phase 1: コア機能完成（2-3週間）

**目標**: App Storeに提出可能な最小限の機能を実装

#### 1.1 Screen Time API統合
```
優先度: ★★★ 最高
依存: Family Controls Entitlement承認

タスク:
□ react-native-device-activity インストール
□ Family Controls権限リクエスト実装
□ DeviceActivityMonitor設定
□ Shield UIカスタマイズ
□ 遮断ロジック実装（5分閾値）
```

#### 1.2 RevenueCat統合
```
優先度: ★★★ 最高
依存: App Store Connect設定

タスク:
□ RevenueCatアカウント作成
□ App Store Connect連携
□ 商品登録（3日トライアル、30日、90日、年間）
□ react-native-purchases インストール
□ 購入フロー実装
□ 購入復元実装
□ Entitlement確認ロジック
```

#### 1.3 iCloud CloudKit統合
```
優先度: ★★☆ 高
依存: なし

タスク:
□ react-native-cloud-store インストール
□ iCloud Capability追加（EAS設定）
□ データスキーマ実装
□ 同期ロジック実装
□ オフライン対応
```

#### 1.4 オンボーディング拡張
```
優先度: ★★☆ 高
依存: なし

タスク:
□ 使用状況ヒアリング画面
□ インパクト計算・表示画面（人生損失時間）
□ 目標設定画面（代替活動）
□ プラン選択画面（3日トライアルデフォルト）
□ インタラクティブチュートリアル（TikTok UI再現）
```

---

### Phase 2: 価値向上機能（1-2週間）

**目標**: ユーザー継続率を高める機能を追加

#### 2.1 日次チェックイン
```
優先度: ★★☆ 高

タスク:
□ チェックイン画面実装
□ 代替活動の達成確認
□ 気分トラッキング
□ 簡易振り返り入力
□ 夜の通知設定
```

#### 2.2 統計・可視化強化
```
優先度: ★★☆ 高

タスク:
□ 週間/月間グラフ
□ アプリ別統計
□ 節約時間の累計表示
□ ストリーク計算（実データ）
□ 達成バッジシステム
```

#### 2.3 コーチングコンテンツ
```
優先度: ★☆☆ 中

タスク:
□ コンテンツ一覧画面
□ コンテンツ詳細画面
□ 読了トラッキング
□ トリガーベース表示ロジック
□ 全コンテンツ執筆（10記事）
```

---

### Phase 3: 品質向上（1週間）

**目標**: App Store審査対応、品質向上

#### 3.1 App Store対応
```
タスク:
□ プライバシーポリシー作成
□ 利用規約作成
□ App Store説明文作成
□ スクリーンショット作成
□ レビューノート作成（課金説明）
```

#### 3.2 テスト・品質保証
```
タスク:
□ 全画面の動作確認
□ 課金フローテスト（サンドボックス）
□ iCloud同期テスト
□ Screen Time動作確認
□ クラッシュ対応
□ パフォーマンス最適化
```

#### 3.3 SNSシェア機能
```
タスク:
□ シェアカード生成
□ React Native Share実装
□ ディープリンク設定
```

---

## 技術スタック確定版

```
┌─────────────────────────────────────────────────────────────┐
│                    StopShorts Tech Stack                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  フロントエンド                                               │
│  ├── React Native + Expo SDK 54                             │
│  ├── TypeScript (strict mode)                               │
│  ├── expo-router (ファイルベースルーティング)                 │
│  ├── NativeWind v4 + インラインスタイル                      │
│  ├── react-native-reanimated (アニメーション)                │
│  └── react-native-svg (グラフィックス)                       │
│                                                             │
│  状態管理                                                    │
│  ├── Zustand + persist middleware                           │
│  └── AsyncStorage (ローカルキャッシュ)                       │
│                                                             │
│  バックエンド（サーバーレス）                                 │
│  ├── RevenueCat (課金管理)                                   │
│  ├── iCloud CloudKit (データ同期)                            │
│  └── Screen Time API (iOS Native)                           │
│                                                             │
│  ビルド・配布                                                │
│  ├── EAS Build (iOS)                                        │
│  └── EAS Update (OTA更新)                                   │
│                                                             │
│  開発ツール                                                  │
│  ├── ESLint + TypeScript ESLint                             │
│  ├── Expo Dev Client                                        │
│  └── Expo Go (開発時)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## オンボーディングフロー（確定版）

```
┌─────────────────────────────────────────────────────────────┐
│                  Onboarding Flow v2.0                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Welcome                                                 │
│     └── アプリ紹介、価値提案                                 │
│                                                             │
│  2. Usage Assessment ← NEW                                  │
│     └── 現在の使用状況ヒアリング                             │
│         - 1日の使用時間                                      │
│         - 開く回数                                          │
│         - やめようとした回数                                 │
│                                                             │
│  3. Impact Display ← NEW                                    │
│     └── 「人生で○○年分失う」表示                            │
│         - 年間損失時間                                       │
│         - 具体的な換算（本、映画、旅行）                      │
│                                                             │
│  4. Purpose Selection                                       │
│     └── なぜ時間を取り戻したいか                             │
│                                                             │
│  5. Purpose Detail                                          │
│     └── 目的別の詳細設定（睡眠時間など）                     │
│                                                             │
│  6. Goal Setting ← NEW                                      │
│     └── 空いた時間で何をするか                               │
│         - 代替活動の選択                                     │
│         - 具体的な目標設定                                   │
│                                                             │
│  7. App Selection                                           │
│     └── 制限するアプリを選択                                 │
│                                                             │
│  8. Tutorial ← NEW                                          │
│     └── インタラクティブチュートリアル                       │
│         - TikTok UIを再現                                    │
│         - Shield表示を体験                                   │
│                                                             │
│  9. Implementation Intent                                   │
│     └── 「Shield出たら○○する」を設定                        │
│                                                             │
│  10. Pricing ← UPDATED                                      │
│      └── プラン選択                                          │
│          - 3日トライアル（デフォルト）                        │
│          - コミットメント効果の説明                          │
│          - 30日 / 90日 / 年間プラン                          │
│                                                             │
│  11. Permission                                             │
│      └── Screen Time権限リクエスト                           │
│                                                             │
│  12. Commitment                                             │
│      └── 最終確認、開始                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 画面一覧（全画面）

### オンボーディング (`app/(onboarding)/`)

| # | ファイル | 画面名 | 状態 |
|---|---------|--------|------|
| 1 | `welcome.tsx` | ウェルカム | ✅ 実装済 |
| 2 | `usage-assessment.tsx` | 使用状況ヒアリング | ⬜ 未実装 |
| 3 | `impact.tsx` | インパクト表示 | ⬜ 未実装 |
| 4 | `purpose.tsx` | 目的選択 | ✅ 実装済 |
| 5 | `purpose-detail.tsx` | 目的詳細 | ✅ 実装済 |
| 6 | `goal-setting.tsx` | 目標設定 | ⬜ 未実装 |
| 7 | `app-selection.tsx` | アプリ選択 | ✅ 実装済 |
| 8 | `tutorial.tsx` | チュートリアル | ⬜ 未実装 |
| 9 | `implementation-intent.tsx` | 実装意図 | ✅ 実装済 |
| 10 | `pricing.tsx` | プラン選択 | ⬜ 未実装 |
| 11 | `permission.tsx` | 権限リクエスト | ✅ 実装済 |
| 12 | `commitment.tsx` | コミットメント | ✅ 実装済 |

### メイン (`app/(main)/`)

| # | ファイル | 画面名 | 状態 |
|---|---------|--------|------|
| 1 | `index.tsx` | ダッシュボード | ✅ 実装済 |
| 2 | `statistics.tsx` | 統計 | ✅ 実装済 |
| 3 | `settings.tsx` | 設定 | ✅ 実装済 |
| 4 | `check-in.tsx` | チェックイン | ⬜ 未実装 |
| 5 | `journal.tsx` | 日誌一覧 | ⬜ 未実装 |
| 6 | `coaching.tsx` | コーチング一覧 | ⬜ 未実装 |
| 7 | `coaching/[id].tsx` | コーチング詳細 | ⬜ 未実装 |

---

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| `docs/specs/01_requirements.md` | 要件定義書 |
| `docs/specs/02_pricing_monetization.md` | 料金・マネタイズ設計 |
| `docs/specs/03_internationalization.md` | 国際化仕様 |
| `docs/specs/04_backend_architecture.md` | バックエンド構成 ← NEW |
| `docs/specs/05_new_features_v2.md` | 新機能仕様 ← NEW |
| `docs/design/01_screen_design.md` | 画面デザイン |
| `docs/design/02_personalization_behavioral.md` | パーソナライズ設計 |
| `docs/IMPLEMENTATION_SPEC.md` | 実装仕様書 |
| `docs/ROADMAP.md` | 実装ロードマップ ← NEW |

---

## 次のアクション

### 即座に実行可能
1. [ ] RevenueCatアカウント作成
2. [ ] 使用状況ヒアリング画面の実装
3. [ ] インパクト表示画面の実装

### Apple対応待ち
4. [ ] Family Controls Entitlement申請（法人アカウント取得後）
5. [ ] Screen Time API統合

### 並行作業可能
6. [ ] コーチングコンテンツ執筆
7. [ ] インタラクティブチュートリアルのTikTok UI作成
