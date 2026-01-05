# Training UI Refresh - Tasks

## Phase 1: コンポーネント作成（P0）

### Task 1.1: ProgressRing コンポーネント
- [ ] 円形プログレス表示
- [ ] 完了数/総数の中央表示
- [ ] アニメーション対応

> **実装ファイル**:
> - `src/components/training/ProgressRing.tsx` (新規)

### Task 1.2: FeatureTopicCard コンポーネント
- [ ] 「次におすすめ」用の大きなカード
- [ ] アイコン、タイトル、説明、進捗バー
- [ ] CTAボタン（続きを学ぶ / 学習を始める）
- [ ] 完了状態の表示

> **実装ファイル**:
> - `src/components/training/FeatureTopicCard.tsx` (新規)

### Task 1.3: TopicGridCard コンポーネント
- [ ] グリッド表示用の小さなカード
- [ ] アイコン、タイトル、進捗バー、ステータス
- [ ] 状態別のスタイル（未開始/進行中/完了）

> **実装ファイル**:
> - `src/components/training/TopicGridCard.tsx` (新規)

### Task 1.4: ContentListItem コンポーネント
- [ ] コンテンツ一覧用のリストアイテム
- [ ] タイプ別アイコン（記事/クイズ/ワークシート）
- [ ] 完了チェックマーク
- [ ] 所要時間表示

> **実装ファイル**:
> - `src/components/training/ContentListItem.tsx` (新規)

---

## Phase 2: トピック一覧画面リデザイン（P0）

### Task 2.1: 全体進捗セクション
- [ ] ProgressRing を使用した進捗表示
- [ ] 完了数/総数の表示

### Task 2.2: 「次におすすめ」セクション
- [ ] 未完了で最も進捗が高いトピックを選出
- [ ] FeatureTopicCard で表示
- [ ] 全完了時は非表示

### Task 2.3: トピックグリッド
- [ ] TopicGridCard を使用
- [ ] 2列グリッドレイアウト
- [ ] カテゴリヘッダー削除（シンプル化）

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
- [ ] 順序付きリスト表示
- [ ] 完了/未完了の視覚的区別

> **実装ファイル**:
> - `app/(main)/training/[topicId].tsx`

---

## Phase 4: i18n 更新（P0）

### Task 4.1: 新規キー追加
- [ ] `training.recommended` - 「次におすすめ」
- [ ] `training.allTopics` - 「すべてのトピック」
- [ ] `training.continueLearning` - 「続きを学ぶ」
- [ ] `training.startLearning` - 「学習を始める」
- [ ] `training.review` - 「復習する」
- [ ] `training.notStarted` - 「未開始」
- [ ] `training.inProgress` - 「学習中」
- [ ] `training.completed` - 「完了」

> **実装ファイル**:
> - `src/i18n/locales/ja.json`

---

## Phase 5: アニメーション（P2）

### Task 5.1: トピック完了アニメーション
- [ ] チェックマークポップイン
- [ ] 背景色フェード
- [ ] Haptic フィードバック

### Task 5.2: コンテンツ完了アニメーション
- [ ] チェックマークスライドイン
- [ ] 次コンテンツのアンロック表示

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
Task 1.1 ─┐
Task 1.2 ─┼─→ Task 2.1 → Task 2.2 → Task 2.3
Task 1.3 ─┘
Task 1.4 ────→ Task 3.1 → Task 3.2

Task 4.1 (並行可能)

Task 5.1, 5.2 (Phase 2-3 完了後)
```
