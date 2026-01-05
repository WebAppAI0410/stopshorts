# Training UI Refresh - Tasks

## Phase 1: コンポーネント作成（P0）

### Task 1.1: ProgressRing コンポーネント
- [ ] 円形プログレス表示（SVG）
- [ ] 完了数/総数の中央表示
- [ ] アニメーション対応

> **実装ファイル**:
> - `src/components/training/ProgressRing.tsx` (新規)

### Task 1.2: FeatureTopicCard コンポーネント
- [ ] 「次におすすめ」用の大きなカード
- [ ] アイコン、タイトル、説明、進捗バー
- [ ] CTAボタン（続きを学ぶ / 学習を始める / 復習する）
- [ ] 完了状態の表示
- [ ] 所要時間表示

> **実装ファイル**:
> - `src/components/training/FeatureTopicCard.tsx` (新規)

### Task 1.3: TopicGridCard コンポーネント
- [ ] グリッド表示用の小さなカード
- [ ] アイコン、タイトル、進捗バー、ステータス
- [ ] 状態別のスタイル（未開始/進行中/完了）
- [ ] 所要時間表示

> **実装ファイル**:
> - `src/components/training/TopicGridCard.tsx` (新規)

### Task 1.4: ContentListItem コンポーネント
- [ ] コンテンツ一覧用のリストアイテム
- [ ] タイプ別アイコン（記事/クイズ/ワークシート）
- [ ] 完了チェックマーク
- [ ] 所要時間表示

> **実装ファイル**:
> - `src/components/training/ContentListItem.tsx` (新規)

### Task 1.5: CategorySection コンポーネント
- [ ] カテゴリヘッダー（アイコン+タイトル）
- [ ] 2列グリッドでトピックカードを配置

> **実装ファイル**:
> - `src/components/training/CategorySection.tsx` (新規)

---

## Phase 2: トピック一覧画面リデザイン（P0）

### Task 2.1: 全体進捗セクション
- [ ] ProgressRing を使用した進捗表示
- [ ] 完了数/総数の表示

### Task 2.2: 「次におすすめ」セクション
- [ ] 未完了で最も進捗が高いトピックを選出
- [ ] FeatureTopicCard で表示
- [ ] 全完了時は非表示

### Task 2.3: カテゴリ別トピックグリッド
- [ ] CategorySection を使用
- [ ] カテゴリごとにグループ化
- [ ] 2列グリッドレイアウト

> **実装ファイル**:
> - `app/(main)/training/index.tsx`

---

## Phase 3: トピック詳細画面リデザイン（P0）

### Task 3.1: ヘッダーセクション
- [ ] トピックアイコン（大）
- [ ] タイトル、説明
- [ ] 進捗バー + 完了数表示

### Task 3.2: コンテンツリスト
- [ ] ContentListItem を使用
- [ ] タイプ別アイコン表示
- [ ] 完了/未完了の視覚的区別
- [ ] コンテンツは全てアクセス可能（ロックなし）

> **実装ファイル**:
> - `app/(main)/training/[topicId].tsx`

---

## Phase 4: コンテンツ完了ロジック（P0）

### Task 4.1: 記事完了
- [ ] 記事末尾に「読んだ」ボタン追加
- [ ] ボタン押下で完了状態を保存

### Task 4.2: クイズ完了
- [ ] 全問正解で完了
- [ ] 不正解時は即時フィードバック表示
- [ ] 正解するまで再回答可能

### Task 4.3: ワークシート完了
- [ ] 入力フォームUI
- [ ] 「完了」ボタン追加
- [ ] 入力内容をストアに保存
- [ ] 復習時に過去の入力を表示

> **実装ファイル**:
> - `app/(main)/training/content/[contentId].tsx`
> - `src/stores/useTrainingStore.ts`

---

## Phase 5: 復習・リセット機能（P0-P1）

### Task 5.1: 復習機能
- [ ] 完了済みトピックの閲覧可能
- [ ] 完了済みカードに「復習する」ボタン
- [ ] ワークシートで過去の入力を表示

### Task 5.2: 進捗リセット
- [ ] 設定画面に「トレーニング進捗リセット」追加
- [ ] 確認ダイアログ表示
- [ ] リセット時にワークシート入力内容も削除

> **実装ファイル**:
> - `app/(main)/settings.tsx`
> - `src/stores/useTrainingStore.ts`

---

## Phase 6: 全トピック完了時（P1）

### Task 6.1: 完了検知
- [ ] 全トピック完了時の検知ロジック

### Task 6.2: 祝福表示
- [ ] 祝福メッセージ表示
- [ ] アニメーション（オプション）
- [ ] 進捗リング100%表示

> **実装ファイル**:
> - `src/components/training/CompletionCelebration.tsx` (新規)
> - `app/(main)/training/index.tsx`

---

## Phase 7: i18n 更新（P0）

### Task 7.1: 新規キー追加
- [ ] `training.recommended` - 「次におすすめ」
- [ ] `training.allTopics` - 「すべてのトピック」
- [ ] `training.continueLearning` - 「続きを学ぶ」
- [ ] `training.startLearning` - 「学習を始める」
- [ ] `training.review` - 「復習する」
- [ ] `training.notStarted` - 「未開始」
- [ ] `training.inProgress` - 「学習中」
- [ ] `training.completed` - 「完了」
- [ ] `training.markAsRead` - 「読んだ」
- [ ] `training.complete` - 「完了する」
- [ ] `training.resetProgress` - 「進捗をリセット」
- [ ] `training.resetConfirm` - 「本当にリセットしますか？」
- [ ] `training.congratulations` - 「おめでとうございます！」

> **実装ファイル**:
> - `src/i18n/locales/ja.json`

---

## Phase 8: アニメーション（P2）

### Task 8.1: トピック完了アニメーション
- [ ] チェックマークポップイン
- [ ] 背景色フェード
- [ ] Haptic フィードバック

### Task 8.2: コンテンツ完了アニメーション
- [ ] チェックマークスライドイン

> **実装ファイル**:
> - `src/components/training/FeatureTopicCard.tsx`
> - `src/components/training/ContentListItem.tsx`

---

## 品質チェック

```bash
npx tsc --noEmit  # エラー 0
npm test -- --passWithNoTests  # テストパス
```

---

## 依存関係

```
Phase 1 (コンポーネント作成)
    ↓
Phase 2 (トピック一覧) ← Phase 7 (i18n) 並行可能
    ↓
Phase 3 (トピック詳細)
    ↓
Phase 4 (コンテンツ完了ロジック)
    ↓
Phase 5 (復習・リセット)
    ↓
Phase 6 (全完了時)
    ↓
Phase 8 (アニメーション)
```
