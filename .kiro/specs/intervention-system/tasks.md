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

## Phase 2: ミラー介入 ✅

### Task 2.1: カメラ機能の実装 ✅ (PR #16)
- [x] `expo-camera` のセットアップ
- [x] カメラ権限リクエスト処理
- [x] 前面カメラプレビュー表示

### Task 2.2: ミラー介入画面の実装 ✅
- [x] `MirrorIntervention.tsx` を作成
- [x] カメラ映像上に目標オーバーレイ
- [x] 確認ダイアログ
- [x] 権限なし時のフォールバックUI

### Task 2.3: Shield画面への統合 ✅
- [x] 介入タイプに応じた分岐処理
- [x] ミラー介入の呼び出し

---

## Phase 3: 介入選択システム + オンボーディング ✅

### Task 3.1: 介入タイプの管理 ✅
- [x] `InterventionType` 型定義 (`src/types/intervention.ts`)
- [x] `useAppStore` に `selectedInterventionType` 追加
- [x] 設定画面での介入方法変更UI (`intervention-settings.tsx`)

> **注記**: `InterventionType` に `'ai'` を追加済み。Phase 5完了により有効化済み。

### Task 3.2: オンボーディングフロー変更 ✅ (PR #31)
- [x] `intervention-select.tsx` 新規作成
- [x] `intervention-experience.tsx` 新規作成
- [x] 既存の `if-then.tsx` を削除 ← PR #31で削除完了
- [x] ルーティング更新（if-then.tsx からの移行）
  - `alternative.tsx` → `intervention-select.tsx` → `intervention-experience.tsx` → `how-it-works.tsx`

### Task 3.3: 介入体験フローの実装 ✅ (PR #31)
- [x] 介入練習選択画面 (`intervention-practice.tsx`) を作成
- [x] 選択した介入（呼吸ガイド / フリクション / ミラー）をフルで体験できる
- [x] 「他の方法も試す」機能（`router.back()` で intervention-select.tsx に戻る）
- [x] 体験完了後の次画面遷移（`how-it-works.tsx` へ）

### Task 3.4: 課金前プレビュー ✅
- [x] `ai-preview.tsx` 新規作成
- [x] AI・トレーニングのモックアップ表示
- [ ] 課金フローへの遷移（将来実装）

### Task 3.5: アクセス制御の実装 ✅ (→ design.md Section 10)
**依存**: Task 1.3, Task 2.2 完了後に実施

- [x] `useSubscriptionAccess()` フック作成 (→ design.md 10.2)
  - `hasFullAccess`, `isTrialing`, `isPaid`, `isExpired` の判定
  - 実装: `src/hooks/useSubscriptionAccess.ts`
- [x] `InterventionGate` コンポーネント作成 (→ design.md 10.3)
  - トライアル or 有料でのみ介入機能を表示
  - 期限切れ時は課金画面へリダイレクト
  - 実装: `src/components/interventions/InterventionGate.tsx`
- [x] 各介入画面でアクセス制御を適用
  - Shield, Training, AI タブ
- [x] 期限切れUIの実装 (→ design.md 10.4)
  - 実装: `src/components/interventions/ExpiredSubscriptionScreen.tsx`
- [x] トライアル中の全機能アクセス確認

---

## Phase 4: 心理トレーニング ✅

### Task 4.1: コンテンツ基盤 ✅ (PR #5)
- [x] `TrainingTopic`, `TrainingContent` 型定義 → `src/types/training.ts`
- [x] 初期トピックデータ作成 → `src/data/trainingTopics.ts`
- [x] コンテンツ読み込み処理

### Task 4.2: トピック選択画面 ✅ (PR #5)
- [x] `training/index.tsx` 作成 → `app/(main)/training/index.tsx`
- [x] カテゴリ別表示（研究/情緒/目標）
- [x] 進捗表示（完了済みマーク）

### Task 4.3: 記事コンテンツ ✅
- [x] 記事表示コンポーネント → `app/(main)/training/[topicId].tsx`
- [x] マークダウンレンダリング
- [x] 読了追跡

### Task 4.4: クイズ機能 ✅
- [x] クイズ表示コンポーネント
- [x] 回答チェック＆フィードバック
- [x] 正解率記録

### Task 4.5: ワークシート機能 ✅
- [x] ワークシート表示コンポーネント
- [x] 回答入力＆保存
- [x] 過去の回答参照

### Task 4.6: トレーニング進捗管理 ✅ (PR #5, #20)
- [x] `useAppStore` に進捗データ追加
- [x] ダッシュボードでの進捗表示 ← PR #20

---

## Phase 5: AIチャットボット ✅

### Task 5.1: ローカルLLM調査 ✅
- [x] iOS: Core ML / Apple Intelligence 調査
- [x] Android: ML Kit / Gemini Nano 調査
- [x] React Native統合ライブラリ調査
- [x] 対応デバイス要件の確定
- [x] **調査結果ドキュメント作成** → `research-local-llm.md`
- [x] **採用モデル決定**: **Qwen 3 0.6B**（research-local-llm.md参照）
  - ⚠️ Gemma 3n E2Bは.task形式（LiteRT用）でreact-native-executorch非対応
  - ✅ Qwen 3 0.6Bは.pte形式（ExecuTorch用）で公式サポート済み

### Task 5.2: LLMエンジン実装 ✅ (PR #30)
- [x] react-native-executorch セットアップ
  - `npm install react-native-executorch`
  - `npx expo prebuild` (Development Build必須)
- [x] モデル統合（**Qwen 3 0.6B**を採用）
  - ⚠️ Gemma 3n E2Bは.task形式（LiteRT用）で非対応
  - ✅ Qwen 3 0.6Bは.pte形式（ExecuTorch用）で対応済み
- [x] 推論ラッパー作成（ExecutorchLLMService + useExecutorchLLM）
- [x] ModelDownloadCard UI実装
- [x] AIIntervention.tsxへのLLM統合
- [ ] デバイス互換性チェック（RAM ≥ 2GB）- ネイティブモジュール必要（将来実装）
- [ ] 非対応時のUI（タブ非表示/無効化）（将来実装）
> **実装ファイル**:
> - `src/services/ai/executorchLLM.ts`
> - `src/hooks/useExecutorchLLM.ts`
> - `src/components/ai/ModelDownloadCard.tsx`
> - `src/components/interventions/AIIntervention.tsx`

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
> **ステータス**: 将来の最適化として検討

### Task 5.4.3: セッション管理 ✅
- [x] セッション終了時の要約生成
- [x] 中期メモリ（SessionSummaries）への保存
- [x] 最大10セッション保持
> **実装ファイル**: `src/stores/useAIStore.ts`

### Task 5.4.4: 長期記憶管理 ✅ (PR #32)
- [x] Insight, Trigger の抽出・保存 ← `extractInsights()` 実装済み
- [x] 上限管理（各配列50件まで）
- [ ] LRU的な古いデータの削除（将来実装）
> **実装ファイル**: `src/stores/useAIStore.ts`

### Task 5.5: メモリシステム実装 ✅ (PR #17)
- [x] `useAIStore` 作成（Zustand）
- [x] 短期メモリ（Working Memory）
- [x] 中期メモリ（Session Summaries）→ AsyncStorage
- [x] 長期メモリ（Insights, Patterns）→ セキュアストレージ (PR #17)
> **実装ファイル**: `src/stores/useAIStore.ts`, `src/utils/secureStorage.ts`

### Task 5.6: アプリ互換性
- [ ] スキーマバージョニング実装
- [ ] マイグレーション関数レジストリ
- [ ] 起動時マイグレーション実行
- [ ] データ復旧機能
> **ステータス**: 将来の安定化フェーズで実装予定

### Task 5.7: チャットUI実装 ✅ (PR #23)
- [x] メッセージリスト表示
- [x] クイックアクションボタン ← PR #23で実装
- [x] 入力フィールド
- [x] 送信＆応答
> **実装ファイル**: `src/components/interventions/AIIntervention.tsx`

### Task 5.8: AIタブ実装 ✅ (PR #18)
- [x] ボトムナビにAIタブ追加 ← PR #18
- [x] 初回アクセス時ダウンロード画面
- [x] ダウンロード進捗表示
- [ ] バックグラウンドダウンロード（将来実装）
> **実装ファイル**: `app/(main)/(tabs)/ai.tsx`

### Task 5.9: 介入中AI ✅
- [x] Shield画面にAI選択肢追加
- [x] 介入モードのチャットUI
- [x] 「やめる」「開く」ボタン統合
> **実装ファイル**: `app/(main)/urge-surfing.tsx`, `app/(main)/intervention-settings.tsx`

### Task 5.10: ペルソナ設定
- [ ] オンボーディングでの設定UI（将来実装）
- [ ] 設定画面での変更機能（将来実装）

### Task 5.11: メンタルヘルス対応 ✅ (PR #26)
- [x] 危機的キーワード検知関数の実装 → `mentalHealthHandler.ts`
- [x] 緩和ケア応答テンプレート作成
- [x] システムプロンプトへのガイドライン追加
- [x] 相談窓口情報の表示コンポーネント
> **実装ファイル**: `src/services/ai/mentalHealthHandler.ts`

### Task 5.12: 会話開始トリガー ✅ (PR #25)
- [x] AI提案通知の条件ロジック実装
  - 1時間に3回以上開こうとした場合
  - 長時間ブロック成功後の励まし
  - 新規トレーニングコンテンツ利用可能時
- [x] expo-notifications連携
- [ ] 毎日チェックイン通知（将来実装）
- [ ] 通知設定のUI（将来実装）

### Task 5.13: セッション管理
- [ ] セッション終了検知（AppState監視）
- [ ] 自動保存メカニズム（30秒ごと）
- [ ] 中断セッションの復元機能
- [ ] 非アクティブタイムアウト（5分）
> **ステータス**: 基本実装済み、詳細は将来実装

### Task 5.14: 既存タスク（欠番なし確認用）
（予約済み - 将来の拡張用）

### Task 5.15: クイックアクション実装 ✅ (PR #23)
- [x] 「原因を探る」モード実装 (explore)
- [x] 「プラン作成」モード実装 (plan)
- [x] 「トレーニング誘導」モード実装 (training)
- [x] 「今日を振り返る」モード実装 (reflect)
> **実装ファイル**: `src/types/ai.ts` (ConversationModeId), `src/services/ai/promptBuilder.ts`

---

## Phase 6: 非機能要件 ✅

### Task 6.1: パフォーマンス (NFR-1) ✅ (PR #21)
- [x] 介入画面の表示速度測定（500ms以内目標）
- [x] カメラ起動時間の最適化（1秒以内目標）
- [x] ローカルLLM応答速度の検証（3秒以内目標）
- [x] パフォーマンス監視の導入 ← PR #21
> **実装ファイル**: パフォーマンスモニタリング追加

### Task 6.2: プライバシー (NFR-2) ✅
- [x] カメラ映像の端末内処理確認 ← ローカル処理のみ
- [x] AI対話ログの外部送信なし確認 ← セキュアストレージ使用 (PR #17)
- [ ] プライバシーポリシー更新（将来実装）

### Task 6.3: アクセシビリティ (NFR-3) ✅ (PR #19)
- [x] 介入方法説明のスクリーンリーダー対応 ← PR #19
- [x] カメラ不使用時の代替手段確認
- [x] フォントサイズ・コントラスト確認
> **実装ファイル**: 各コンポーネントにaccessibilityLabel追加

### Task 6.4: 多言語対応 (NFR-4) ✅ (PR #10)
- [x] `src/i18n/locales/ja.json` に介入関連キーを追加
  - `intervention.friction.*` (待機、意図確認、確認ダイアログ)
  - `intervention.mirror.*` (カメラUI、目標表示)
  - `intervention.selection.*` (介入方法選択)
  - `intervention.ai.*` (チャットUI、クイックアクション)
  - `training.*` (トピック、クイズ、ワークシート)
- [x] ハードコード文字列の検出・置換 ← PR #10
- [ ] i18nキーの命名規則ドキュメント化（将来実装）

### Task 6.5: テスト ✅ (PR #33, PR #14)

**ユニットテスト** ✅ (PR #33):
- [x] `mentalHealthHandler.ts` ユニットテスト作成
- [x] `promptBuilder.ts` ユニットテスト作成
- [x] 介入ロジックのユニットテスト（calculateWaitTime等）

**E2Eテスト** ✅ (PR #14):
- [x] Maestro Cloud APIキー取得
- [x] `.maestro/` ディレクトリ作成
- [x] スモークテスト作成 (`onboarding-smoke.yaml`)
- [x] GitHub Actionsワークフロー作成 ← PR #14

**⚠️ 注意: 現環境（Windows + WSL2）ではローカルE2Eテストのリスクが高い**
- Maestro Cloudでの実行を推奨

---

## 技術調査タスク

### Research 1: ローカルLLM ✅
- [x] 各プラットフォームの対応状況
- [x] 必要なモデルサイズ
- [x] メモリ/ストレージ要件
- [x] 応答速度ベンチマーク
- [x] **結果**: **Qwen 3 0.6B** 採用（Gemma 3n E2Bは非対応）

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
