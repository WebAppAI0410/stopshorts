# AI Coach Improvement - Design

## 1. UI設計

### 1.1 空状態UI（会話なし時）

```
┌──────────────────────────────────────┐
│  [Header: AIコーチ]                   │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐   │
│  │  💡 状況ベース提案カード      │   │ ← 動的提案（0-2個）
│  │  「今日2回ブロックしました!  │   │
│  │   振り返りませんか?」        │   │
│  │           [振り返る]          │   │
│  └──────────────────────────────┘   │
│                                      │
│  ── クイックアクション ──           │ ← 常設4ボタン
│  [🔍探る] [📝計画] [📚学習] [🌙振返] │
│                                      │
│  ── よくある悩み ──                 │ ← 会話スターター
│  ┌──────────┐  ┌──────────┐        │
│  │つい開いた │  │衝動が...  │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │暇で...   │  │今日は成功! │        │
│  └──────────┘  └──────────┘        │
│                                      │
├──────────────────────────────────────┤
│  [Input: 何でも聞いてください...]    │
└──────────────────────────────────────┘
```

### 1.2 会話中UI

```
┌──────────────────────────────────────┐
│  [Header: AIコーチ]                   │
├──────────────────────────────────────┤
│  [AI Message]                        │
│  [User Message]                      │
│  [AI Message]                        │
│  ┌──────────────────────────────┐   │ ← インライン推奨
│  │  📚 関連トレーニング          │   │
│  │  「衝動サーフィンの科学」     │   │
│  │           [見てみる]          │   │
│  └──────────────────────────────┘   │
│  [User Message]                      │
├──────────────────────────────────────┤
│  [Input]                             │
└──────────────────────────────────────┘
```

### 1.3 ガイド付き会話UI

```
┌──────────────────────────────────────┐
│  [Header: If-Then計画作成]           │
│  ステップ 2/4                        │
├──────────────────────────────────────┤
│                                      │
│  どんな時に見たくなりますか？         │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │  暇な時   │  │ストレス時│        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │  寝る前   │  │ 電車の中 │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────────────────────┐      │
│  │ その他（自由入力）...     │      │
│  └──────────────────────────┘      │
│                                      │
│  ● ● ○ ○                            │ ← 進捗インジケーター
│                                      │
│  [戻る]              [次へ]          │
├──────────────────────────────────────┤
│  [Input: または自由に入力...]        │
└──────────────────────────────────────┘
```

---

## 2. コンポーネント構成

### 2.1 新規コンポーネント一覧

| ファイル | 役割 |
|----------|------|
| `src/components/ai/EmptyStateView.tsx` | 空状態UI統合 |
| `src/components/ai/SuggestionCard.tsx` | 状況ベース提案カード |
| `src/components/ai/QuickActionsBar.tsx` | クイックアクション4ボタン |
| `src/components/ai/ConversationStarters.tsx` | 会話スターター一覧 |
| `src/components/ai/GuidedConversation.tsx` | ガイド付き会話UI |
| `src/components/ai/GuidedStepIndicator.tsx` | ステップ進捗表示 |
| `src/components/ai/TrainingRecommendationCard.tsx` | インライン推奨カード |

### 2.2 コンポーネント階層

```
AIScreen (ai.tsx)
├── Header
├── ModelDownloadCard (条件付き)
├── ScrollView
│   ├── EmptyStateView (会話なし時)
│   │   ├── SuggestionCard (0-2個)
│   │   ├── QuickActionsBar
│   │   └── ConversationStarters
│   │
│   ├── ChatMessages (会話中)
│   │   ├── ChatMessage (複数)
│   │   └── TrainingRecommendationCard (条件付き)
│   │
│   └── GuidedConversation (ガイド付き時)
│       └── GuidedStepIndicator
│
└── InputArea
```

---

## 3. データ構造

### 3.1 新規型定義 (src/types/ai.ts)

```typescript
// 会話スターター
export interface ConversationStarter {
  id: string;
  textKey: string;          // i18n key
  category: 'concern' | 'emotional' | 'positive' | 'question' | 'training';
  relatedTopic?: string;    // training関連の場合のトピックID
}

// 状況ベース提案
export interface ContextualSuggestion {
  id: string;
  titleKey: string;
  descriptionKey: string;
  action: SuggestionAction;
  priority: number;
  category: 'progress' | 'concern' | 'learning' | 'routine';
}

export type SuggestionAction =
  | { type: 'start_mode'; modeId: ConversationModeId }
  | { type: 'start_guided'; templateId: string }
  | { type: 'navigate'; route: string }
  | { type: 'free_chat' };

// ガイド付き会話
export interface GuidedConversationTemplate {
  id: string;
  titleKey: string;
  descriptionKey: string;
  steps: GuidedStep[];
}

export interface GuidedStep {
  id: string;
  promptKey: string;
  options?: GuidedOption[];
  allowFreeInput: boolean;
  saveToStore?: {
    store: 'appStore' | 'aiStore';
    field: string;
  };
}

export interface GuidedOption {
  textKey: string;
  value: string;
}

// ガイド付き会話状態
export interface GuidedConversationState {
  templateId: string;
  currentStepIndex: number;
  responses: Record<string, string>;  // stepId -> response
  isActive: boolean;
  startedAt: number;
}
```

### 3.2 AIState拡張 (useAIStore.ts)

```typescript
interface AIState {
  // ... 既存フィールド

  // ガイド付き会話
  guidedConversation: GuidedConversationState | null;

  // 推奨履歴（重複防止）
  recentRecommendations: Array<{
    topicId: string;
    recommendedAt: number;
  }>;
}

interface AIActions {
  // ... 既存アクション

  // ガイド付き会話
  startGuidedConversation: (templateId: string) => void;
  advanceGuidedStep: (response: string) => void;
  completeGuidedConversation: () => void;
  cancelGuidedConversation: () => void;

  // 推奨
  addRecommendation: (topicId: string) => void;
}
```

---

## 4. 状況ベース提案ロジック

### 4.1 条件一覧（優先度順）

| 優先度 | ID | 条件 | アクション |
|--------|-----|------|-----------|
| 100 | if-then-needed | If-Thenプラン未設定 & オンボーディング3日以上 | ガイド付き: if-then |
| 95 | today-exceeded | 今日の使用時間 > 目標の150% | モード: reflect |
| 90 | weekly-increase | 週間使用時間が前週比120%以上 | モード: explore |
| 85 | tough-day | 今日の介入 >= 3回 & ブロック成功 0回 | 自由会話 |
| 80 | good-blocks | 今日のブロック成功 >= 2回 | モード: reflect |
| 75 | week-streak | 連続達成日数 >= 7日 | 自由会話 |
| 70 | short-streak | 連続達成日数 >= 3日 | モード: reflect |
| 65 | night-review | 夜22時以降 & 今日の介入あり | モード: reflect |
| 60 | training-continue | トレーニング進行中 | ナビ: training/{topicId} |
| 55 | training-start | トレーニング未開始 | ナビ: training/habit-loop |
| 50 | urge-practice | 衝動サーフィン未体験 & トピック完了 | ナビ: urge-surfing |
| 45 | long-absence | 前回セッションから7日以上 | 自由会話 |
| 40 | morning-review | 朝6-9時 & 昨日の統計あり | モード: reflect |

### 4.2 判定ロジック

```typescript
// src/services/ai/suggestionEngine.ts

export function getTopSuggestions(context: SuggestionContext): Suggestion[] {
  const matched = SUGGESTION_CONDITIONS
    .filter(cond => cond.check(context))
    .sort((a, b) => b.priority - a.priority);

  // 最大2個、カテゴリ重複防止
  const selected: Suggestion[] = [];
  const usedCategories = new Set<string>();

  for (const cond of matched) {
    if (!usedCategories.has(cond.category) && selected.length < 2) {
      selected.push(cond.suggestion);
      usedCategories.add(cond.category);
    }
  }

  return selected;
}
```

---

## 5. 会話スターター

### 5.1 カテゴリ別一覧

**concern (衝動・失敗)**
- opened: つい開いちゃった...
- urge_now: 今まさに見たい衝動がある
- urge_strong: 衝動が抑えられない
- wasted_time: また時間を無駄にした
- cant_stop: 一度開くと止められない
- failed_goal: 今日の目標を達成できなかった

**emotional (感情・状況)**
- bored: 暇で何もやることがない
- stressed: ストレスが溜まっている
- lonely: 寂しい気持ちになる
- anxious: 不安な気持ちを紛らわしたい
- tired: 疲れていて何も考えたくない
- before_sleep: 寝る前についスマホを見てしまう

**positive (成功)**
- resisted: 今日は我慢できた!
- streak: 連続で達成できている
- feeling_good: 最近調子がいい
- noticed_trigger: 自分のパターンに気づいた
- alternative_worked: 代わりの行動がうまくいった

**question (質問)**
- why_addictive: なぜこんなにハマるの?
- how_to_stop: どうすれば見なくなれる?
- what_to_do: 見たくなったら何をすればいい?
- is_progress: 自分は進歩している?

**training (トレーニング関連)**
- learn_habit: 習慣の仕組みを知りたい (habit-loop)
- learn_urge: 衝動との付き合い方を学びたい (urge-surfing-science)
- make_plan: 具体的な対策を立てたい (if-then-plan)

### 5.2 動的選択ロジック

```typescript
function getConversationStarters(context: StarterContext): ConversationStarter[] {
  const starters: ConversationStarter[] = [];

  // 1. 今日の状況に応じた優先スターター
  if (context.todayStats.interventionCount > 0) {
    starters.push(STARTERS.opened, STARTERS.wasted_time);
  }
  if (context.todayStats.blockedCount > 0) {
    starters.push(STARTERS.resisted);
  }

  // 2. 時間帯に応じたスターター
  if (context.timeOfDay === 'night') {
    starters.push(STARTERS.before_sleep);
  }

  // 3. トレーニング関連（未完了トピックがある場合）
  const nextTopic = getNextRecommendedTopic(context.trainingProgress);
  if (nextTopic) {
    const related = TRAINING_STARTERS.find(s => s.relatedTopic === nextTopic.id);
    if (related) starters.push(related);
  }

  // 4. カテゴリバランスで残りを埋める
  fillWithBalancedStarters(starters, 6);

  return dedupeAndLimit(starters, 6);
}
```

---

## 6. ガイド付き会話テンプレート

### 6.1 If-Then計画作成

```typescript
const IF_THEN_TEMPLATE: GuidedConversationTemplate = {
  id: 'if-then',
  titleKey: 'ai.guided.ifThen.title',
  descriptionKey: 'ai.guided.ifThen.description',
  steps: [
    {
      id: 'trigger',
      promptKey: 'ai.guided.ifThen.step1',
      options: [
        { textKey: 'ai.guided.ifThen.opt.bored', value: '暇な時' },
        { textKey: 'ai.guided.ifThen.opt.stressed', value: 'ストレスを感じた時' },
        { textKey: 'ai.guided.ifThen.opt.beforeSleep', value: '寝る前' },
        { textKey: 'ai.guided.ifThen.opt.commute', value: '電車の中' },
        { textKey: 'ai.guided.ifThen.opt.eating', value: '食事中' },
      ],
      allowFreeInput: true,
    },
    {
      id: 'detail',
      promptKey: 'ai.guided.ifThen.step2',
      allowFreeInput: true,
    },
    {
      id: 'alternative',
      promptKey: 'ai.guided.ifThen.step3',
      options: [
        { textKey: 'ai.guided.ifThen.alt.breathe', value: '深呼吸する' },
        { textKey: 'ai.guided.ifThen.alt.water', value: '水を飲む' },
        { textKey: 'ai.guided.ifThen.alt.walk', value: '散歩する' },
        { textKey: 'ai.guided.ifThen.alt.read', value: '本を読む' },
        { textKey: 'ai.guided.ifThen.alt.music', value: '音楽を聴く' },
      ],
      allowFreeInput: true,
    },
    {
      id: 'confirm',
      promptKey: 'ai.guided.ifThen.step4',
      options: [
        { textKey: 'ai.guided.ifThen.confirm.yes', value: 'complete' },
        { textKey: 'ai.guided.ifThen.confirm.edit', value: 'edit' },
      ],
      allowFreeInput: true,
      saveToStore: { store: 'appStore', field: 'ifThenPlan' },
    },
  ],
};
```

### 6.2 トリガー分析

```typescript
const TRIGGER_ANALYSIS_TEMPLATE: GuidedConversationTemplate = {
  id: 'trigger-analysis',
  titleKey: 'ai.guided.trigger.title',
  descriptionKey: 'ai.guided.trigger.description',
  steps: [
    {
      id: 'cue',
      promptKey: 'ai.guided.trigger.step1',
      options: [
        { textKey: 'ai.guided.trigger.cue.notification', value: '通知が来た' },
        { textKey: 'ai.guided.trigger.cue.bored', value: '暇だった' },
        { textKey: 'ai.guided.trigger.cue.stressed', value: 'ストレスを感じた' },
        { textKey: 'ai.guided.trigger.cue.habit', value: '習慣的に' },
        { textKey: 'ai.guided.trigger.cue.social', value: '誰かが見ていた' },
        { textKey: 'ai.guided.trigger.cue.random', value: 'なんとなく' },
      ],
      allowFreeInput: true,
    },
    {
      id: 'emotion',
      promptKey: 'ai.guided.trigger.step2',
      options: [
        { textKey: 'ai.guided.trigger.emo.tired', value: '疲れていた' },
        { textKey: 'ai.guided.trigger.emo.bored', value: '退屈だった' },
        { textKey: 'ai.guided.trigger.emo.anxious', value: '不安だった' },
        { textKey: 'ai.guided.trigger.emo.irritated', value: 'イライラしていた' },
        { textKey: 'ai.guided.trigger.emo.nothing', value: '特に何も感じなかった' },
      ],
      allowFreeInput: true,
    },
    {
      id: 'context',
      promptKey: 'ai.guided.trigger.step3',
      options: [
        { textKey: 'ai.guided.trigger.ctx.work', value: '仕事・勉強' },
        { textKey: 'ai.guided.trigger.ctx.meal', value: '食事' },
        { textKey: 'ai.guided.trigger.ctx.commute', value: '移動中' },
        { textKey: 'ai.guided.trigger.ctx.break', value: '休憩中' },
        { textKey: 'ai.guided.trigger.ctx.bedtime', value: '寝る準備' },
        { textKey: 'ai.guided.trigger.ctx.sns', value: 'SNSを見ていた' },
      ],
      allowFreeInput: true,
    },
    {
      id: 'reflection',
      promptKey: 'ai.guided.trigger.step4',
      allowFreeInput: true,
      saveToStore: { store: 'aiStore', field: 'triggers' },
    },
  ],
};
```

---

## 7. トレーニング連携

### 7.1 プロンプト拡張

```typescript
// src/services/ai/promptBuilder.ts

// ワークシート回答の注入
export function buildWorksheetContext(
  trainingProgress: Record<string, TrainingProgress>
): string {
  const entries: string[] = [];

  for (const [topicId, progress] of Object.entries(trainingProgress)) {
    for (const [promptId, answer] of Object.entries(progress.worksheetAnswers)) {
      if (answer && answer.trim().length > 10) {
        const label = PROMPT_LABELS[promptId] || promptId;
        entries.push(`- ${label}: ${answer.slice(0, 80)}...`);
      }
    }
  }

  if (entries.length === 0) return '';

  return `
## ユーザーの自己分析（ワークシート回答）
${entries.slice(0, 3).join('\n')}
`;
}

// 学習済み概念の注入
export function buildTrainingKnowledge(completedTopicIds: string[]): string {
  if (completedTopicIds.length === 0) return '';

  const concepts = completedTopicIds
    .map(id => TOPIC_CONCEPTS[id])
    .filter(Boolean);

  return `
## ユーザーが学んだ概念
${concepts.map(c => `- ${c}`).join('\n')}

これらの概念を会話で自然に参照してください。
`;
}
```

### 7.2 トレーニング推奨

```typescript
// src/services/ai/trainingRecommender.ts

const KEYWORD_MAPPING = [
  { keywords: ['衝動', '我慢できない', '止められない'], topicId: 'urge-surfing-science' },
  { keywords: ['習慣', '癖', 'パターン', '無意識'], topicId: 'habit-loop' },
  { keywords: ['代わり', '計画', '対策'], topicId: 'if-then-plan' },
  { keywords: ['退屈', '暇', 'つまらない'], topicId: 'dealing-with-boredom' },
  { keywords: ['孤独', '寂しい', '一人'], topicId: 'loneliness-and-sns' },
  { keywords: ['眠れない', '寝る前', '睡眠'], topicId: 'screen-time-and-sleep' },
  { keywords: ['集中', '注意', '気が散る'], topicId: 'reclaiming-focus' },
];

export function recommendTraining(
  messages: Message[],
  completedTopicIds: string[]
): TrainingRecommendation | null {
  const recentText = messages
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content)
    .join(' ');

  for (const mapping of KEYWORD_MAPPING) {
    if (mapping.keywords.some(kw => recentText.includes(kw))) {
      const isCompleted = completedTopicIds.includes(mapping.topicId);
      return {
        topicId: mapping.topicId,
        topicTitle: TOPIC_TITLES[mapping.topicId],
        isCompleted,
        route: `/(main)/training/${mapping.topicId}`,
      };
    }
  }

  return null;
}
```

---

## 8. 実装ファイル一覧

### 新規ファイル

| ファイル | 説明 |
|----------|------|
| `src/components/ai/EmptyStateView.tsx` | 空状態UI統合 |
| `src/components/ai/SuggestionCard.tsx` | 状況ベース提案カード |
| `src/components/ai/QuickActionsBar.tsx` | クイックアクション4ボタン |
| `src/components/ai/ConversationStarters.tsx` | 会話スターター一覧 |
| `src/components/ai/GuidedConversation.tsx` | ガイド付き会話UI |
| `src/components/ai/GuidedStepIndicator.tsx` | ステップ進捗表示 |
| `src/components/ai/TrainingRecommendationCard.tsx` | インライン推奨カード |
| `src/services/ai/suggestionEngine.ts` | 提案エンジン |
| `src/services/ai/trainingRecommender.ts` | トレーニング推奨 |
| `src/data/guidedConversations.ts` | ガイド付き会話テンプレート |
| `src/data/conversationStarters.ts` | 会話スターターデータ |

### 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `app/(main)/ai.tsx` | EmptyStateView統合、UI刷新 |
| `src/types/ai.ts` | 新規型定義追加 |
| `src/stores/useAIStore.ts` | ガイド付き会話アクション追加 |
| `src/services/ai/promptBuilder.ts` | ワークシート・学習概念注入 |
| `src/i18n/locales/ja.json` | 新規文字列追加 |
