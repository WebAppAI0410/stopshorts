# 介入システム拡張 - タスク一覧

## フェーズ概要

| フェーズ | 内容 | 優先度 | 推定規模 |
|---------|------|--------|---------|
| Phase 1 | フリクション/ナッジ介入 | P0 (MVP) | Medium |
| Phase 2 | ミラー介入 | P1 | Small |
| Phase 3 | 介入選択システム + オンボーディング + 課金 | P1 | Medium |
| Phase 4 | 心理トレーニング | P2 | Large |
| Phase 5 | AIチャットボット | P2 | X-Large |
| Phase 6 | 非機能要件 (パフォーマンス/プライバシー/アクセシビリティ/E2Eテスト) | P1 | Medium |

---

## 実装順序（プラットフォーム別）

### 方針
- **Android優先**: デバッグ・テストが容易なため
- **iOS後続**: Android検証後に実装・検証

### Phase別プラットフォーム差異

| Phase | Android | iOS | 差異レベル |
|-------|---------|-----|-----------|
| Phase 1 (Friction) | ✅ React Native のみ | ✅ React Native のみ | なし |
| Phase 2 (Mirror) | ✅ expo-camera | ✅ expo-camera | なし |
| Phase 3 (Selection) | ✅ React Native のみ | ✅ React Native のみ | なし |
| Phase 4 (Training) | ✅ React Native のみ | ✅ React Native のみ | なし |
| Phase 5 (AI) | ✅ react-native-executorch | ✅ react-native-executorch | **低** (パス差異のみ) |
| Phase 6 (NFR) | ⚠️ UsageStats権限 | ⚠️ ScreenTime権限 | **中** (権限処理) |

### 各Phaseの実装フロー

```
[Android実装] → [Android検証] → [iOS実装] → [iOS検証] → [統合テスト]
     ↓               ↓               ↓              ↓
   コード作成     実機テスト      差異対応       実機テスト
```

### Phase 5 (AI) プラットフォーム固有事項

| 項目 | Android | iOS |
|------|---------|-----|
| モデル保存パス | `filesDir/models/` | `Documents/models/` |
| RAM取得方法 | `ActivityManager.memoryInfo` | `ProcessInfo.physicalMemory` |
| ストレージ確認 | `StatFs` | `FileManager.attributesOfFileSystem` |
| バックグラウンドDL | `DownloadManager` | `URLSession.downloadTask` |

---

## Phase 1: フリクション/ナッジ介入 ✅

### Task 1.1: 累積待機時間の実装 ✅
- [x] `useAppStore` に `dailyOpenCount`, `lastOpenDate` を追加
- [x] `calculateWaitTime()` 関数を実装（フィボナッチ風増加: 5→8→13→21→34→55→89秒）
- [x] 午前0時リセット機能を実装 (`shouldResetDailyCount()`)
- [x] 待機カウントダウンコンポーネントを作成 (`WaitingPhase.tsx`)

### Task 1.2: 意図入力UIの実装 ✅
- [x] `IntentionPhase` コンポーネントを作成
- [x] 選択肢の定義（DM確認、特定コンテンツ、暇つぶし、なんとなく、その他）
- [x] 「その他」の自由入力フィールド
- [x] 選択結果の統計記録 (`useStatisticsStore.recordIntention()`)

### Task 1.3: フリクション介入画面の統合 ✅
- [x] `FrictionIntervention.tsx` を作成
- [x] 3フェーズのフロー実装（待機→意図→確認）
- [x] アニメーション追加 (react-native-reanimated)
- [x] urge-surfing画面への統合（介入タイプ分岐）
- [x] 介入練習選択画面 (`intervention-practice.tsx`) を追加

### Task 1.4: 統計データの拡張 ✅
- [x] `useStatisticsStore` に `intentionHistory[]` を追加
- [x] `recordIntention()` アクションを実装
- [ ] フリクション介入の成功率追跡（Phase 3で実装予定）
- [ ] ダッシュボードでの意図別統計表示（Phase 3で実装予定）

### 追加タスク（UXフィードバック対応） ✅
- [x] 「やめる」ボタンをprimary、「誘惑に負けて続ける」ボタンをghostに変更
- [x] 介入練習選択画面を追加（呼吸ガイド / フリクションから選択）
- [x] ダッシュボードの「練習する」ボタンから介入選択画面へ遷移

---

## Phase 2: ミラー介入

### Task 2.1: カメラ機能の実装
- [ ] `expo-camera` のセットアップ
- [ ] カメラ権限リクエスト処理
- [ ] 前面カメラプレビュー表示

### Task 2.2: ミラー介入画面の実装
- [ ] `MirrorIntervention.tsx` を作成
- [ ] カメラ映像上に目標オーバーレイ
- [ ] 確認ダイアログ
- [ ] 権限なし時のフォールバックUI

### Task 2.3: Shield画面への統合
- [ ] 介入タイプに応じた分岐処理
- [ ] ミラー介入の呼び出し

---

## Phase 3: 介入選択システム + オンボーディング

### Task 3.1: 介入タイプの管理 ✅
- [x] `InterventionType` 型定義 (`src/types/intervention.ts`)
- [x] `useAppStore` に `selectedInterventionType` 追加
- [x] 設定画面での介入方法変更UI (`intervention-settings.tsx`)

> **注記**: Phase 3時点では `InterventionType` に `'ai'` を追加するが「準備中」として無効化。Phase 5完了後に有効化する。

### Task 3.2: オンボーディングフロー変更 ✅
- [x] `intervention-select.tsx` 新規作成
- [x] `intervention-experience.tsx` 新規作成
- [ ] 既存の `if-then.tsx` を削除または無効化
- [ ] ルーティング更新（if-then.tsx からの移行）

### Task 3.3: 介入体験フローの実装（部分実装）
- [x] 介入練習選択画面 (`intervention-practice.tsx`) を作成
- [x] 選択した介入（呼吸ガイド / フリクション）をフルで体験できる
- [ ] 「他の方法も試す」機能（オンボーディング用、未実装）
- [ ] 体験完了後の次画面遷移（オンボーディング用、未実装）

### Task 3.4: 課金前プレビュー（部分実装）
- [x] `ai-preview.tsx` 新規作成
- [ ] AI・トレーニングのモックアップ表示（改善が必要）
- [ ] 課金フローへの遷移

### Task 3.5: アクセス制御の実装 (→ design.md Section 10)（部分実装）
**依存**: Task 1.3, Task 2.2 完了後に実施

- [x] `useSubscriptionAccess()` フック作成 (→ design.md 10.2)
  - `hasFullAccess`, `isTrialing`, `isPaid`, `isExpired` の判定
  - 実装: `src/hooks/useSubscriptionAccess.ts`
- [x] `InterventionGate` コンポーネント作成 (→ design.md 10.3)
  - トライアル or 有料でのみ介入機能を表示
  - 期限切れ時は課金画面へリダイレクト
  - 実装: `src/components/interventions/InterventionGate.tsx`
- [ ] 各介入画面でアクセス制御を適用
  - Shield, Training, AI タブ
- [x] 期限切れUIの実装 (→ design.md 10.4)
  - 実装: `src/components/interventions/ExpiredSubscriptionScreen.tsx`
- [ ] トライアル中の全機能アクセス確認

---

## Phase 4: 心理トレーニング

### Task 4.1: コンテンツ基盤
- [ ] `TrainingTopic`, `TrainingContent` 型定義
- [ ] 初期トピックデータ作成
- [ ] コンテンツ読み込み処理

### Task 4.2: トピック選択画面
- [ ] `training/index.tsx` 作成
- [ ] カテゴリ別表示（研究/情緒/目標）
- [ ] 進捗表示（完了済みマーク）

### Task 4.3: 記事コンテンツ
- [ ] 記事表示コンポーネント
- [ ] マークダウンレンダリング
- [ ] 読了追跡

### Task 4.4: クイズ機能
- [ ] クイズ表示コンポーネント
- [ ] 回答チェック＆フィードバック
- [ ] 正解率記録

### Task 4.5: ワークシート機能
- [ ] ワークシート表示コンポーネント
- [ ] 回答入力＆保存
- [ ] 過去の回答参照

### Task 4.6: トレーニング進捗管理
- [ ] `useAppStore` に進捗データ追加
- [ ] ダッシュボードでの進捗表示

---

## Phase 5: AIチャットボット (部分実装済み)

### Task 5.1: ローカルLLM調査 ✅
- [x] iOS: Core ML / Apple Intelligence 調査
- [x] Android: ML Kit / Gemini Nano 調査
- [x] React Native統合ライブラリ調査
- [x] 対応デバイス要件の確定
- [x] **調査結果ドキュメント作成** → `research-local-llm.md`
- [x] **採用モデル決定**: Qwen 3 0.6B（2026-01-04 改訂）
  - ⚠️ Gemma 3n E2Bは.task形式のため非採用（react-native-executorchは.pte必須）
  - Qwen 3 0.6Bは公式.pteファイル提供済み

### Task 5.2: LLMエンジン実装 ✅
- [x] react-native-executorch セットアップ
  - `npm install react-native-executorch` (v0.6.0)
  - `npx expo prebuild` (Development Build必須)
- [x] Qwen 3 0.6B モデル統合
  - モデル: [software-mansion/react-native-executorch-qwen-3](https://huggingface.co/software-mansion/react-native-executorch-qwen-3)
  - モデル設定: `QWEN_3_CONFIG` (`src/services/ai/executorchLLM.ts`)
- [x] デバイス互換性チェック（RAM ≥ 2GB, Storage ≥ 500MB）
  - `DEVICE_REQUIREMENTS` 定数で定義
- [x] 推論実装（React Hook経由）
  - **重要**: react-native-executorchは`useLLM` Reactフックのみ提供
  - `AIIntervention.tsx`で`useLLM`フックを直接使用
  - サービスクラス(`ExecutorchLLMService`)は設定のみ提供
  - `useExecutorchLLM.ts`ラッパーフック（アプリ固有の統合用）
- [x] モデルダウンロードUI
  - `ModelDownloadCard` コンポーネント (`src/components/ai/ModelDownloadCard.tsx`)
  - コンパクト版とフルカード版を提供
  - ダウンロード進捗バー表示
- [ ] 非対応時のUI（タブ非表示/無効化）→ 画面統合時に対応
> **更新日**: 2026-01-05 (useLLMフック直接使用に変更)

### Task 5.3: システムプロンプト設計 ✅
- [x] 固定システムプロンプト作成（動的要素なし）
- [x] ペルソナ定義（励まし型/ストレート型）
- [x] ユーザーコンテキスト構築関数
> **実装ファイル**: `src/services/ai/promptBuilder.ts`

### Task 5.4: コンテキストエンジニアリング基盤 ✅
**詳細**: [context-engineering.md](./context-engineering.md)

- [x] Message型・Conversation型定義
- [x] ConversationManager基本実装
> **実装ファイル**: `src/types/ai.ts`, `src/stores/useAIStore.ts`

### Task 5.4.1: トークン予算管理 ✅
- [x] トークン計算関数（日本語対応）
- [x] 予算配分ロジック（~4K tokens）
- [x] 動的配分（ユーザー入力長に応じた調整）
> **実装ファイル**: `src/types/ai.ts` (TOKEN_BUDGET定数)

### Task 5.4.2: 会話圧縮
- [ ] 圧縮トリガー判定（履歴が予算の80%超過時）
- [ ] 古いメッセージの要約生成
- [ ] 圧縮後の履歴再構築
> **ステータス**: 後続フェーズで実装予定

### Task 5.4.3: セッション管理 ✅
- [x] セッション終了時の要約生成
- [x] 中期メモリ（SessionSummaries）への保存
- [x] 最大10セッション保持
> **実装ファイル**: `src/stores/useAIStore.ts`

### Task 5.4.4: 長期記憶管理
- [ ] Insight, Trigger の抽出・保存
- [ ] 上限管理（各配列50件まで）
- [ ] LRU的な古いデータの削除
> **ステータス**: 後続フェーズで実装予定

### Task 5.5: メモリシステム実装 ✅
- [x] `useAIStore` 作成（Zustand）
- [x] 短期メモリ（Working Memory）
- [x] 中期メモリ（Session Summaries）→ AsyncStorage
- [ ] 長期メモリ（Insights, Patterns）→ AsyncStorage（後続で実装）
> **実装ファイル**: `src/stores/useAIStore.ts`

### Task 5.6: アプリ互換性
- [ ] スキーマバージョニング実装
- [ ] マイグレーション関数レジストリ
- [ ] 起動時マイグレーション実行
- [ ] データ復旧機能
> **ステータス**: 後続フェーズで実装予定

### Task 5.7: チャットUI実装 ✅
- [x] メッセージリスト表示
- [ ] クイックアクションボタン（後続で実装）
- [x] 入力フィールド
- [x] 送信＆応答（useLLMフック経由で実LLM推論）
> **実装ファイル**: `src/components/interventions/AIIntervention.tsx`
> **更新日**: 2026-01-05 (プレースホルダーから実LLM推論に変更)

### Task 5.8: AIタブ実装
- [ ] ボトムナビにAIタブ追加
- [ ] 初回アクセス時ダウンロード画面
- [ ] ダウンロード進捗表示
- [ ] バックグラウンドダウンロード
> **ステータス**: AIタブはPhase 5完了時に実装予定

### Task 5.9: 介入中AI ✅
- [x] Shield画面にAI選択肢追加
- [x] 介入モードのチャットUI
- [x] 「やめる」「開く」ボタン統合
> **実装ファイル**: `app/(main)/urge-surfing.tsx`, `app/(main)/intervention-settings.tsx`

### Task 5.10: ペルソナ設定
- [ ] オンボーディングでの設定UI
- [ ] 設定画面での変更機能

### Task 5.11: メンタルヘルス対応
- [ ] 危機的キーワード検知関数の実装
- [ ] 緩和ケア応答テンプレート作成
- [ ] システムプロンプトへのガイドライン追加
- [ ] 相談窓口情報の表示コンポーネント

### Task 5.12: 会話開始トリガー
- [ ] AI提案通知の条件ロジック実装
  - 1時間に3回以上開こうとした場合
  - 長時間ブロック成功後の励まし
  - 新規トレーニングコンテンツ利用可能時
- [ ] expo-notifications連携
- [ ] 毎日チェックイン通知（オプトイン）
- [ ] 通知設定のUI（設定画面）

### Task 5.13: セッション管理
- [ ] セッション終了検知（AppState監視）
- [ ] 自動保存メカニズム（30秒ごと）
- [ ] 中断セッションの復元機能
- [ ] 非アクティブタイムアウト（5分）

### Task 5.14: 既存タスク（欠番なし確認用）
（予約済み - 将来の拡張用）

### Task 5.15: クイックアクション実装
- [ ] 「原因を探る」モード実装
- [ ] 「プラン作成」モード実装
- [ ] 「トレーニング誘導」モード実装
- [ ] 「今日を振り返る」モード実装

---

## Phase 6: 非機能要件

### Task 6.1: パフォーマンス (NFR-1) - P2
- [ ] 介入画面の表示速度測定（500ms以内目標）
- [ ] カメラ起動時間の最適化（1秒以内目標）
- [ ] ローカルLLM応答速度の検証（3秒以内目標）
- [ ] パフォーマンス監視の導入

### Task 6.2: プライバシー (NFR-2) - P0
- [ ] カメラ映像の端末内処理確認
- [ ] AI対話ログの外部送信なし確認
- [ ] プライバシーポリシー更新

### Task 6.3: アクセシビリティ (NFR-3) - P1
- [ ] 介入方法説明のスクリーンリーダー対応
- [ ] カメラ不使用時の代替手段確認
- [ ] フォントサイズ・コントラスト確認

### Task 6.4: 多言語対応 (NFR-4) - P0
- [ ] `src/i18n/locales/ja.json` に介入関連キーを追加
  - `intervention.friction.*` (待機、意図確認、確認ダイアログ)
  - `intervention.mirror.*` (カメラUI、目標表示)
  - `intervention.selection.*` (介入方法選択)
  - `intervention.ai.*` (チャットUI、クイックアクション)
  - `training.*` (トピック、クイズ、ワークシート)
- [ ] ハードコード文字列の検出・置換
- [ ] i18nキーの命名規則ドキュメント化

### Task 6.5: E2Eテスト (→ design.md 8.3) - P2 ⚠️ 優先度低

**⚠️ 注意: 現環境（Windows + WSL2）ではE2Eテストのリスクが高い**
- Maestro/Detox共にWindows環境で問題多数
- react-native-reanimatedとの相性問題
- テストが数時間完了しないケースあり
- 詳細は design.md 8.3.2〜8.3.9 を参照

**推奨アプローチ（リスク順）**:

| 優先度 | 方法 | リスク |
|--------|------|--------|
| 1 | ユニットテスト | 低 |
| 2 | 手動テストチェックリスト | 低 |
| 3 | Maestro Cloud (有料) | 中 |
| 4 | ローカルE2E | 高 |

**Phase 1: 代替テスト（推奨）**:
- [ ] `useSubscriptionAccess()` ユニットテスト作成
- [ ] 介入ロジックのユニットテスト（calculateWaitTime等）
- [ ] 手動テストチェックリスト作成
  - オンボーディングフロー
  - 介入フロー（各タイプ）
  - アクセス制御（期限切れ）

**Phase 2: Maestro Cloud（任意・有料）**:
- [ ] Maestro Cloud APIキー取得
- [ ] `.maestro/` ディレクトリ作成
- [ ] スモークテスト作成 (`onboarding-smoke.yaml`)
- [ ] GitHub Actionsワークフロー作成

**Phase 3: ローカルE2E（非推奨）**:
- [ ] macOS環境を用意できる場合のみ実施
- [ ] Windows環境では実施しないこと

---

## 技術調査タスク

### Research 1: ローカルLLM ✅
- [x] 各プラットフォームの対応状況
- [x] 必要なモデルサイズ
- [x] メモリ/ストレージ要件
- [x] 応答速度ベンチマーク
- [x] **結果**: Qwen 3 0.6B 採用（2026-01-04 改訂）
  - Gemma 3n E2Bは.task形式で提供されており、react-native-executorchでは使用不可
  - Qwen 3 0.6Bは公式.pte提供、119言語対応、70-80%のデバイスで動作

### Research 2: AIペルソナ 🔄 (基本設計済み)
- [x] 基本ペルソナ定義（励まし型 / ストレート型）→ design.md 4.5
- [x] システムプロンプト設計 → design.md 4.5
- [ ] 既存サービスのペルソナ調査（追加バリエーション用）
- [ ] 追加ペルソナの設計（必要に応じて）

---

## 依存関係

```
Phase 1 (Friction) ─────┐
                        ├──▶ Phase 3 (Selection + 課金)
Phase 2 (Mirror) ───────┘           │
                                    ▼
                        Phase 4 (Training) ◀──┐
                                    │         │
                                    ▼         │
                        Phase 5 (AI) ─────────┘
                        (AI参照: Training進捗)

Phase 6 (非機能要件) ──▶ 全Phaseに並行して適用
```

---

## チェックリスト（実装開始前）

- [ ] requirements.md のレビュー完了
- [ ] design.md のレビュー完了
- [x] ローカルLLM調査完了 → Task 5.1, research-local-llm.md
- [x] AIペルソナ基本設計完了 → design.md 4.5 (追加調査は任意)
- [x] E2Eテスト戦略決定 → ローカルE2E非推奨、代替テスト優先 (design.md 8.3)
- [ ] ユニットテスト作成（useSubscriptionAccess, 介入ロジック）
- [ ] UI/UXモックアップ作成
- [ ] 既存コードへの影響分析
