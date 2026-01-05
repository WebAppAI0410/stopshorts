/**
 * Prompt Builder for AI Chatbot
 * Constructs system prompts, user context, and manages token budgets
 */

import type { PersonaId, LongTermMemory, Message, ConversationModeId } from '../../types/ai';
import { TOKEN_BUDGET, MAX_CONTEXT_TOKENS } from '../../types/ai';
import { useAppStore } from '../../stores/useAppStore';
import { TRAINING_TOPICS } from '../../data/trainingTopics';

// ============================================
// System Prompts
// ============================================

/**
 * Base system prompt (fixed for KV cache efficiency)
 */
const SYSTEM_PROMPT_BASE = `あなたはStopShortsアプリのAIアシスタントです。

## 役割
ユーザーがショート動画（TikTok, YouTube Shorts, Instagram Reels）の
使用を減らす手助けをします。

## ガイドライン
- 共感的に傾聴する
- 責めない、批判しない
- 小さな進歩も認める
- 具体的な行動を提案する
- 統計データを参照して励ます

## 応答スタイル
- 短く、会話的に（1-3文）
- 絵文字は控えめに
- 質問で深掘りする

## 境界
- 医療アドバイスはしない
- 危機的状況では専門家を勧める
`;

/**
 * Mode-specific prompt additions for quick actions
 */
export const MODE_PROMPTS: Record<ConversationModeId, string> = {
  explore: `
## 現在のモード: 原因を探る
ユーザーがショート動画を見たくなる原因を一緒に探りましょう。
- 何がきっかけでアプリを開きたくなるのか深掘りする
- 感情や状況のパターンを見つける手助けをする
- 判断せず、共感的に傾聴する
- 具体的な例を聞いて、トリガーを特定する
`,
  plan: `
## 現在のモード: If-Then計画を作成
ユーザーと一緒にIf-Then計画を作成しましょう。
- 「もし〇〇したくなったら、△△する」の形式で計画を立てる
- ユーザーの生活スタイルに合った代替行動を提案する
- 実行可能で具体的な計画になるよう導く
- 作成した計画を確認し、必要なら調整する
`,
  training: `
## 現在のモード: トレーニング誘導
適切なトレーニングトピックを提案しましょう。
- ユーザーの現状に合ったトピックを勧める
- 習慣ループ、衝動サーフィング、認知再構成などのコンセプトを簡潔に説明
- 学習への意欲を高める
- トレーニング画面への移動を促す
`,
  reflect: `
## 現在のモード: 今日を振り返る
ユーザーの今日一日を振り返る手助けをしましょう。
- 今日のショート動画との付き合い方を振り返る
- 良かった点、改善できる点を一緒に考える
- 小さな進歩も認め、励ます
- 明日に向けた前向きな気持ちを育む
`,
  free: `
## 現在のモード: 自由会話
ユーザーの話を自由に聞き、サポートしましょう。
`,
};

/**
 * Persona-specific prompt additions
 */
const PERSONAS: Record<PersonaId, string> = {
  supportive: `
## あなたのトーン: 励まし型
- 温かく、サポーティブ
- 小さな成功も大きく称える
- 「すごいね！」「頑張ってるね！」を使う
`,
  direct: `
## あなたのトーン: ストレート型
- 率直に、正直に
- 事実をそのまま伝える
- 甘やかさないが、攻撃的にもならない
`,
};

// ============================================
// Token Estimation
// ============================================

/**
 * Estimate token count for text
 * Japanese text uses more tokens than English
 */
export function estimateTokens(text: string): number {
  // Rough heuristic: 1 token ~ 2.5 chars for mixed Japanese/English
  return Math.ceil(text.length / 2.5);
}

// ============================================
// Prompt Builders
// ============================================

/**
 * Build the full system prompt
 */
export function buildSystemPrompt(
  personaId: PersonaId,
  modeId: ConversationModeId = 'free'
): string {
  return SYSTEM_PROMPT_BASE + PERSONAS[personaId] + MODE_PROMPTS[modeId];
}

// Topic ID to Japanese title mapping for AI context
const TOPIC_TITLES: Record<string, string> = {
  'habit-loop': '習慣ループの理解',
  'if-then-plan': 'If-Thenプランニング',
  'urge-surfing-science': '衝動サーフィンの科学',
  'brain-self-control': '脳と自己制御',
  'cognitive-reframing': '認知リフレーミング',
  'dealing-with-boredom': '退屈への対処',
  'loneliness-and-sns': '孤独感とSNS',
  'screen-time-and-sleep': 'スクリーンタイムと睡眠',
  'reclaiming-focus': '集中力の回復',
};

/**
 * Build training context from user's progress
 * Returns formatted string with completed and not-started topics
 */
export function buildTrainingContext(): string {
  const { trainingProgress, getCompletedTopicIds } = useAppStore.getState();
  const completedIds = getCompletedTopicIds();

  const completedTopics = TRAINING_TOPICS
    .filter((t) => completedIds.includes(t.id))
    .map((t) => TOPIC_TITLES[t.id] || t.id);

  const notStartedTopics = TRAINING_TOPICS
    .filter((t) => !trainingProgress[t.id])
    .map((t) => TOPIC_TITLES[t.id] || t.id);

  const inProgressTopics = TRAINING_TOPICS
    .filter((t) => trainingProgress[t.id] && !completedIds.includes(t.id))
    .map((t) => TOPIC_TITLES[t.id] || t.id);

  return `
## ユーザーのトレーニング進捗
- 完了済み: ${completedTopics.join(', ') || 'なし'}
- 学習中: ${inProgressTopics.join(', ') || 'なし'}
- 未開始: ${notStartedTopics.join(', ') || 'なし'}
`;
}

/**
 * User statistics for context
 */
export interface UserStats {
  todayOpens: number;
  todayBlocked: number;
  weeklyTrend: 'improving' | 'stable' | 'declining';
  streakDays: number;
}

/**
 * User goals for context
 */
export interface UserGoals {
  primary: string;
  purpose: string;
}

/**
 * Training progress for context
 */
export interface TrainingProgress {
  completedTopics: string[];
  currentLevel: number;
}

/**
 * Describe today's status in natural language
 */
function describeToday(stats: UserStats): string {
  if (stats.todayOpens === 0) {
    return 'まだ今日は開いていません';
  }

  const successRate = Math.round((stats.todayBlocked / stats.todayOpens) * 100);

  if (successRate >= 80) {
    return `${stats.todayOpens}回中${stats.todayBlocked}回成功（素晴らしい！）`;
  } else if (successRate >= 50) {
    return `${stats.todayOpens}回中${stats.todayBlocked}回成功`;
  } else {
    return `${stats.todayOpens}回中${stats.todayBlocked}回成功（まだ改善の余地あり）`;
  }
}

/**
 * Describe weekly trend in natural language
 */
function describeWeeklyTrend(trend: UserStats['weeklyTrend']): string {
  switch (trend) {
    case 'improving':
      return '良くなっています';
    case 'stable':
      return '安定しています';
    case 'declining':
      return '少し増えています';
  }
}

/**
 * Build user context section
 */
export function buildUserContext(
  stats: UserStats,
  goals: UserGoals,
  training: TrainingProgress,
  longTermMemory: LongTermMemory | null
): string {
  const recentInsights =
    longTermMemory?.confirmedInsights
      .filter((i) => i.confirmedByUser)
      .slice(-3)
      .map((i) => `- ${i.content}`)
      .join('\n') || '- まだ発見されていません';

  const completedTopicsStr =
    training.completedTopics.length > 0
      ? training.completedTopics.map((t) => `- ${t}`).join('\n')
      : '- まだ開始していません';

  return `
## ユーザー情報
- 目標: ${goals.primary}（${goals.purpose}）
- 今日の状況: ${describeToday(stats)}
- 週間トレンド: ${describeWeeklyTrend(stats.weeklyTrend)}
${stats.streakDays > 0 ? `- 連続達成日数: ${stats.streakDays}日` : ''}

## 学習済みトピック
${completedTopicsStr}

## 過去の洞察
${recentInsights}

## 今日の統計
開こうとした回数: ${stats.todayOpens}
ブロック成功: ${stats.todayBlocked}
${stats.todayOpens > 0 ? `成功率: ${Math.round((stats.todayBlocked / stats.todayOpens) * 100)}%` : ''}
`;
}

/**
 * Summarize long-term memory for context
 */
export function buildLongTermSummary(
  memory: LongTermMemory | null
): string {
  if (!memory) return '';

  const parts: string[] = [];

  // Add confirmed insights
  const confirmedInsights = memory.confirmedInsights
    .filter((i) => i.confirmedByUser)
    .slice(-2);

  if (confirmedInsights.length > 0) {
    parts.push(
      '確認済みの洞察: ' +
        confirmedInsights.map((i) => i.content).join('、')
    );
  }

  // Add identified triggers
  const topTriggers = memory.identifiedTriggers
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 2);

  if (topTriggers.length > 0) {
    parts.push(
      '開くきっかけ: ' + topTriggers.map((t) => t.trigger).join('、')
    );
  }

  // Add effective strategies
  const effectiveStrategies = memory.effectiveStrategies
    .filter((s) => s.effectiveness > 0.7)
    .slice(0, 2);

  if (effectiveStrategies.length > 0) {
    parts.push(
      '効果的な対策: ' +
        effectiveStrategies.map((s) => s.description).join('、')
    );
  }

  return parts.length > 0 ? parts.join('\n') : '';
}

/**
 * Format conversation history for context
 */
export function formatConversationHistory(
  messages: Message[],
  maxTokens: number = TOKEN_BUDGET.conversationHistory
): string {
  const formatted: string[] = [];
  let tokenCount = 0;

  // Process messages from newest to oldest
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const line = `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`;
    const lineTokens = estimateTokens(line);

    if (tokenCount + lineTokens > maxTokens) {
      break;
    }

    formatted.unshift(line);
    tokenCount += lineTokens;
  }

  return formatted.join('\n');
}

/**
 * Build the full prompt for LLM
 */
export interface FullPromptResult {
  systemPrompt: string;
  userContext: string;
  longTermSummary: string;
  conversationHistory: string;
  totalTokens: number;
}

export function buildFullPrompt(
  personaId: PersonaId,
  messages: Message[],
  stats: UserStats,
  goals: UserGoals,
  training: TrainingProgress,
  longTermMemory: LongTermMemory | null
): FullPromptResult {
  const systemPrompt = buildSystemPrompt(personaId);
  const userContext = buildUserContext(stats, goals, training, longTermMemory);
  const longTermSummary = buildLongTermSummary(longTermMemory);
  const conversationHistory = formatConversationHistory(messages);

  const totalTokens =
    estimateTokens(systemPrompt) +
    estimateTokens(userContext) +
    estimateTokens(longTermSummary) +
    estimateTokens(conversationHistory);

  return {
    systemPrompt,
    userContext,
    longTermSummary,
    conversationHistory,
    totalTokens,
  };
}

/**
 * Check if adding a new message would exceed context window
 */
export function wouldExceedContext(
  currentTokens: number,
  newMessageTokens: number
): boolean {
  const totalWithResponse =
    currentTokens + newMessageTokens + TOKEN_BUDGET.responseBuffer;
  return totalWithResponse > MAX_CONTEXT_TOKENS;
}
