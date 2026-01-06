# Focus Timeline UI - 設計

## UIモックアップ

```
┌─────────────────────────────────────────┐
│  習慣ループを理解する                    │
│  なぜショート動画を見てしまうのか...     │
│  ⏱ 8分                                  │
├─────────────────────────────────────────┤
│                                         │
│  ✓ ── 1. 習慣の3つの要素               │  ← 完了（コンパクト）
│  │                                      │
│  │   ┌───────────────────────────┐     │
│  ●───│  📖 記事                   │     │  ← アクティブ（大きなカード）
│  │   │  習慣ループの仕組み        │     │
│  │   │  ⏱ 5分                    │     │
│  │   │                           │     │
│  │   │  [    開始する    ]       │     │
│  │   └───────────────────────────┘     │
│  │                                      │
│  🔒── 3. クイズ: 理解度チェック         │  ← ロック（コンパクト）
│  │                                      │
│  🔒── 4. ワークシート: 振り返り         │
│                                         │
└─────────────────────────────────────────┘
```

---

## コンポーネント構造

```
renderContentList()
├── ScrollView
│   ├── TopicHeader
│   │   ├── Title (h1)
│   │   ├── Description (body)
│   │   └── MetaRow (time icon + minutes)
│   │
│   └── TimelineContainer (View)
│       └── {contents.map => TimelineItem}
│           ├── TimelineLeft (View)
│           │   ├── TimelineLineTop (View, conditional)
│           │   ├── TimelineNode (View)
│           │   │   └── Icon or Number
│           │   └── TimelineLineBottom (View, conditional)
│           │
│           └── TimelineContent (View)
│               ├── [if active] ActiveCard
│               │   ├── CardHeader (icon + type)
│               │   ├── CardTitle
│               │   ├── CardMeta (time)
│               │   └── StartButton
│               │
│               └── [if completed/locked] CompactRow
│                   └── Title text
```

---

## 状態判定ロジック

```typescript
type ContentState = 'completed' | 'active' | 'locked';

function getContentState(
  content: TrainingContent,
  index: number,
  topicId: string,
  isContentCompleted: (topicId: string, contentId: string) => boolean
): ContentState {
  const completed = isContentCompleted(topicId, content.id);
  if (completed) return 'completed';

  // Find first incomplete
  const firstIncompleteIndex = topic.contents.findIndex(
    (c) => !isContentCompleted(topicId, c.id)
  );

  if (index === firstIncompleteIndex) return 'active';
  return 'locked';
}
```

---

## スタイル定義

### タイムライン左側

```typescript
timelineItem: {
  flexDirection: 'row',
  minHeight: 48,
},

timelineLeft: {
  width: 40,
  alignItems: 'center',
},

timelineLine: {
  width: 2,
  flex: 1,
  backgroundColor: colors.border,
},

timelineLineCompleted: {
  backgroundColor: colors.success,
},

timelineNode: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.surface,
  borderWidth: 2,
  borderColor: colors.border,
  alignItems: 'center',
  justifyContent: 'center',
},

timelineNodeCompleted: {
  backgroundColor: colors.success + '20',
  borderColor: colors.success,
},

timelineNodeActive: {
  backgroundColor: colors.primary + '20',
  borderColor: colors.primary,
  borderWidth: 3,
},

timelineNodeLocked: {
  backgroundColor: colors.surface,
  borderColor: colors.border,
},
```

### アクティブカード

```typescript
activeCard: {
  flex: 1,
  backgroundColor: colors.backgroundCard,
  borderRadius: borderRadius.lg,
  padding: spacing.lg,
  marginLeft: spacing.md,
  marginVertical: spacing.sm,
  // Glow effect (iOS)
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  // Android
  elevation: 8,
  // Border accent
  borderWidth: 1,
  borderColor: colors.primary + '40',
},

activeCardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: spacing.sm,
},

activeCardType: {
  fontSize: 12,
  color: colors.primary,
  marginLeft: spacing.xs,
  fontWeight: '600',
},

activeCardTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: colors.textPrimary,
  marginBottom: spacing.xs,
},

activeCardMeta: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: spacing.lg,
},

activeCardTime: {
  fontSize: 13,
  color: colors.textSecondary,
  marginLeft: 4,
},
```

### コンパクト行

```typescript
compactRow: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing.md,
  paddingLeft: spacing.md,
},

compactTitle: {
  fontSize: 14,
  color: colors.textMuted,
},

compactTitleCompleted: {
  color: colors.textSecondary,
},
```

---

## アニメーション

### 入場アニメーション
- `FadeInUp.duration(400).delay(index * 80)` - 各アイテムが順番にフェードイン

### カードプレスアニメーション
- 既存の `Button` コンポーネントのスプリングアニメーションを活用

---

## i18n追加キー

```json
{
  "training": {
    "startLearning": "開始する",
    "continueReading": "続きを読む"
  }
}
```

---

## ファイル変更一覧

| ファイル | 変更内容 |
|---------|---------|
| `app/(main)/training/[topicId].tsx` | renderContentList() を Focus Timeline に刷新 |
| `src/i18n/locales/ja.json` | 新規キー追加 |
