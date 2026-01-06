# AI Coach Improvement - Tasks

## Phase 1: 基盤整備（型定義・データ）

### Task 1.1: 型定義の追加
- [ ] `ConversationStarter` 型定義
- [ ] `ContextualSuggestion` 型定義
- [ ] `SuggestionAction` 型定義
- [ ] `GuidedConversationTemplate` 型定義
- [ ] `GuidedStep` 型定義
- [ ] `GuidedConversationState` 型定義

> **実装ファイル**:
> - `src/types/ai.ts`

### Task 1.2: 会話スターターデータ
- [ ] concern カテゴリ（6個）
- [ ] emotional カテゴリ（6個）
- [ ] positive カテゴリ（5個）
- [ ] question カテゴリ（4個）
- [ ] training カテゴリ（3個）
- [ ] 動的選択ヘルパー関数

> **実装ファイル**:
> - `src/data/conversationStarters.ts` (新規)

### Task 1.3: ガイド付き会話テンプレート
- [ ] If-Then計画作成テンプレート（4ステップ）
- [ ] トリガー分析テンプレート（4ステップ）
- [ ] 各ステップの選択肢データ

> **実装ファイル**:
> - `src/data/guidedConversations.ts` (新規)

### Task 1.4: i18n文字列追加
- [ ] 状況ベース提案（13条件分）
- [ ] 会話スターター（24個分）
- [ ] ガイド付き会話（2テンプレート分）
- [ ] UI文字列（ヘッダー、ボタン等）

> **実装ファイル**:
> - `src/i18n/locales/ja.json`

---

## Phase 2: サービス層

### Task 2.1: 提案エンジン
- [ ] `SuggestionCondition` インターフェース実装
- [ ] 13条件の判定関数実装
- [ ] `getTopSuggestions()` 関数実装
- [ ] カテゴリ重複防止ロジック

> **実装ファイル**:
> - `src/services/ai/suggestionEngine.ts` (新規)

### Task 2.2: トレーニング推奨
- [ ] キーワード→トピックマッピング定義
- [ ] `recommendTraining()` 関数実装
- [ ] 推奨重複防止ロジック

> **実装ファイル**:
> - `src/services/ai/trainingRecommender.ts` (新規)

### Task 2.3: プロンプト拡張
- [ ] `buildWorksheetContext()` 関数実装
- [ ] `buildTrainingKnowledge()` 関数実装
- [ ] `PROMPT_LABELS` マッピング定義
- [ ] `TOPIC_CONCEPTS` マッピング定義
- [ ] `buildFullPrompt()` への統合

> **実装ファイル**:
> - `src/services/ai/promptBuilder.ts`

---

## Phase 3: Store拡張

### Task 3.1: useAIStore拡張
- [ ] `guidedConversation` 状態追加
- [ ] `recentRecommendations` 状態追加
- [ ] `startGuidedConversation()` アクション
- [ ] `advanceGuidedStep()` アクション
- [ ] `completeGuidedConversation()` アクション
- [ ] `cancelGuidedConversation()` アクション
- [ ] `addRecommendation()` アクション

> **実装ファイル**:
> - `src/stores/useAIStore.ts`

---

## Phase 4: UIコンポーネント

### Task 4.1: SuggestionCard
- [ ] カードレイアウト（タイトル、説明、ボタン）
- [ ] アクション実行ハンドラ
- [ ] テーマ対応スタイル
- [ ] FadeInアニメーション

> **実装ファイル**:
> - `src/components/ai/SuggestionCard.tsx` (新規)

### Task 4.2: QuickActionsBar
- [ ] 4ボタンレイアウト（横並び）
- [ ] 各ボタンのアイコン・ラベル
- [ ] タップでモード開始
- [ ] AIIntervention.tsxからロジック移植

> **実装ファイル**:
> - `src/components/ai/QuickActionsBar.tsx` (新規)

### Task 4.3: ConversationStarters
- [ ] 2列グリッドレイアウト（最大6個）
- [ ] スターターアイテムUI
- [ ] タップでメッセージ送信
- [ ] 動的スターター取得

> **実装ファイル**:
> - `src/components/ai/ConversationStarters.tsx` (新規)

### Task 4.4: GuidedStepIndicator
- [ ] ステップ数表示（● ○ 形式）
- [ ] 現在ステップのハイライト
- [ ] アニメーション対応

> **実装ファイル**:
> - `src/components/ai/GuidedStepIndicator.tsx` (新規)

### Task 4.5: GuidedConversation
- [ ] ステップごとの質問表示
- [ ] 選択肢ボタングリッド
- [ ] 自由入力フィールド
- [ ] 戻る/次へボタン
- [ ] 進捗インジケーター統合
- [ ] 完了処理（ストア保存）
- [ ] 中断確認ダイアログ

> **実装ファイル**:
> - `src/components/ai/GuidedConversation.tsx` (新規)

### Task 4.6: TrainingRecommendationCard
- [ ] インライン表示用コンパクトカード
- [ ] トピックタイトル表示
- [ ] 「見てみる」ボタン
- [ ] 遷移処理

> **実装ファイル**:
> - `src/components/ai/TrainingRecommendationCard.tsx` (新規)

### Task 4.7: EmptyStateView
- [ ] SuggestionCard（0-2個）統合
- [ ] QuickActionsBar統合
- [ ] ConversationStarters統合
- [ ] レイアウト調整

> **実装ファイル**:
> - `src/components/ai/EmptyStateView.tsx` (新規)

---

## Phase 5: AI画面統合

### Task 5.1: ai.tsx リファクタリング
- [ ] 状態管理（空状態/会話中/ガイド付き）
- [ ] EmptyStateView条件付きレンダリング
- [ ] GuidedConversation条件付きレンダリング
- [ ] TrainingRecommendationCard統合
- [ ] トレーニング推奨ロジック統合
- [ ] 状態遷移アニメーション

> **実装ファイル**:
> - `app/(main)/ai.tsx`

---

## Phase 6: 検証

### Task 6.1: TypeScript検証
- [ ] `npx tsc --noEmit` エラー0確認
- [ ] 型エラー修正

### Task 6.2: 動作テスト
- [ ] 空状態UI表示確認
- [ ] 状況ベース提案表示確認
- [ ] 会話スターター動作確認
- [ ] クイックアクション動作確認
- [ ] ガイド付き会話（If-Then）動作確認
- [ ] ガイド付き会話（トリガー分析）動作確認
- [ ] トレーニング推奨表示確認
- [ ] 会話→空状態の遷移確認

---

## 依存関係

```text
Phase 1 (基盤整備)
    ↓
Phase 2 (サービス層) ← Phase 1完了後
    ↓
Phase 3 (Store拡張) ← Phase 1, 2完了後
    ↓
Phase 4 (UIコンポーネント) ← Phase 1, 2, 3完了後
    ↓
Phase 5 (画面統合) ← Phase 4完了後
    ↓
Phase 6 (検証) ← 全Phase完了後
```

---

## 品質チェック

```bash
# TypeScript検証
npx tsc --noEmit

# テスト（テストファイルがある場合）
npm test -- --passWithNoTests
```

---

## 見積もり

| Phase | タスク数 | 想定工数 |
|-------|---------|---------|
| Phase 1 | 4 | 中 |
| Phase 2 | 3 | 中 |
| Phase 3 | 1 | 小 |
| Phase 4 | 7 | 大 |
| Phase 5 | 1 | 中 |
| Phase 6 | 2 | 小 |
| **合計** | **18** | - |
