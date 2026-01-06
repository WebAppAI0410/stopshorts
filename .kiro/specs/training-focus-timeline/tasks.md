# Focus Timeline UI - タスク分解

## 並列実行可能なタスク構成

```
         ┌─────────────────┐
         │  Task A         │
         │  タイムライン    │──────┐
         │  左側構造        │      │
         └─────────────────┘      │
                                   │
         ┌─────────────────┐      ▼
         │  Task B         │  ┌─────────────────┐
         │  アクティブ     │──│  Task D         │
         │  カード         │  │  結合 + 仕上げ  │
         └─────────────────┘  └─────────────────┘
                                   ▲
         ┌─────────────────┐      │
         │  Task C         │──────┘
         │  コンパクト行   │
         └─────────────────┘
```

**Task A, B, C は並列実行可能**（それぞれ独立したコンポーネント）
**Task D は A, B, C の完了後に実行**

---

## Task A: タイムライン左側構造

**担当ファイル**: `app/(main)/training/[topicId].tsx`

### チェックリスト
- [ ] A-1: `ContentState` 型定義を追加
- [ ] A-2: `getContentState()` 関数を実装
- [ ] A-3: `TimelineLeft` コンポーネント構造を作成
  - [ ] A-3-1: 上の縦線（timelineLineTop）
  - [ ] A-3-2: ノード（timelineNode）+ アイコン/番号
  - [ ] A-3-3: 下の縦線（timelineLineBottom）
- [ ] A-4: タイムライン関連スタイルを追加
  - timelineItem, timelineLeft, timelineLine, timelineLineCompleted
  - timelineNode, timelineNodeCompleted, timelineNodeActive, timelineNodeLocked
  - nodeNumber

### 出力物
タイムラインの左側（縦線 + ノード）が表示される状態

---

## Task B: アクティブカード

**担当ファイル**: `app/(main)/training/[topicId].tsx`

### チェックリスト
- [ ] B-1: `renderActiveCard()` 関数を作成
  - [ ] B-1-1: カードヘッダー（アイコン + タイプラベル）
  - [ ] B-1-2: タイトル
  - [ ] B-1-3: メタ情報（所要時間）
  - [ ] B-1-4: 「開始する」ボタン（Button コンポーネント使用）
- [ ] B-2: グロー効果スタイルを追加
  - shadowColor, shadowOffset, shadowOpacity, shadowRadius
  - elevation (Android)
  - borderColor アクセント
- [ ] B-3: アクティブカード関連スタイルを追加
  - activeCard, activeCardHeader, activeCardType
  - activeCardTitle, activeCardMeta, activeCardTime

### 出力物
アクティブ状態のコンテンツが大きなカード + グローで表示される

---

## Task C: コンパクト行

**担当ファイル**: `app/(main)/training/[topicId].tsx`

### チェックリスト
- [ ] C-1: `renderCompactRow()` 関数を作成
  - [ ] C-1-1: 完了状態の行（タップで再閲覧可能）
  - [ ] C-1-2: ロック状態の行（タップ不可、グレーアウト）
- [ ] C-2: コンパクト行関連スタイルを追加
  - compactRow, compactTitle, compactTitleCompleted

### 出力物
完了/ロック状態のコンテンツがコンパクトな1行で表示される

---

## Task D: 結合 + 仕上げ

**前提**: Task A, B, C 完了後

**担当ファイル**:
- `app/(main)/training/[topicId].tsx`
- `src/i18n/locales/ja.json`

### チェックリスト
- [ ] D-1: `renderContentList()` を統合
  - Task A, B, C の成果物を組み合わせ
  - 既存の `handleContentPress` ロジックを接続
- [ ] D-2: 旧スタイルを削除
  - stepList, stepItem, stepBadge, stepNumber
  - stepContent, stepHeader, stepType, stepTitle, stepStatus
- [ ] D-3: i18n キー追加
  - `training.startLearning`: "開始する"
- [ ] D-4: FadeInUp アニメーション適用
- [ ] D-5: 品質チェック
  - [ ] `npx tsc --noEmit` エラー0
  - [ ] ライトモード動作確認
  - [ ] ダークモード動作確認

### 出力物
Focus Timeline UI が完全に動作する状態

---

## 完了後のコミット

```
feat: implement Focus Timeline UI for training detail

- Add timeline with vertical line and state nodes
- Highlight active task with large card and glow effect
- Compact rows for completed and locked tasks
- Add explicit "Start" button for clear CTA

Closes #XX
```
