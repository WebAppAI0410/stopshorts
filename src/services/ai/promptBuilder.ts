/**
 * Prompt Builder for AI Chatbot
 * Constructs system prompts, user context, and manages token budgets
 */

import type { PersonaId, LongTermMemory, Message, ConversationModeId, SessionSummary } from '../../types/ai';
import { TOKEN_BUDGET, MAX_CONTEXT_TOKENS } from '../../types/ai';
import type { TrainingProgress } from '../../types/training';
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

/no_think`;

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
 * Maximum number of recent session insights to include in context
 */
const MAX_RECENT_SESSION_INSIGHTS = 5;

/**
 * Input for buildTrainingContext to avoid circular dependencies
 * Data should be passed from the caller (store) instead of importing stores directly
 */
export interface TrainingContextInput {
  trainingProgress: Record<string, TrainingProgress>;
  completedTopicIds: string[];
  sessionSummaries: SessionSummary[];
}

/**
 * Learned concepts that can be referenced in conversations
 * Maps topic ID to key concepts the user has learned
 */
const TOPIC_CONCEPTS: Record<string, string[]> = {
  'habit-loop': [
    '習慣は「きっかけ→行動→報酬」の3ステップで形成される',
    'きっかけを特定することで習慣を変えやすくなる',
    '報酬を別の行動に置き換えることで習慣を書き換えられる',
  ],
  'if-then-plan': [
    '「もし〜したら、〜する」の形式で具体的な計画を立てる',
    '事前に決めておくことで、その場での意思決定を減らせる',
    'If-Thenプランは習慣形成に効果的',
  ],
  'urge-surfing-science': [
    '衝動は波のように上がって下がる（3-20分でピークを過ぎる）',
    '衝動に逆らわず、観察することで乗り越えられる',
    '衝動に気づいたら、呼吸に集中する',
  ],
  'brain-self-control': [
    '前頭前野が自己制御を担当している',
    '睡眠不足やストレスは自己制御力を低下させる',
    'ドーパミンは「期待」で放出され、実際の満足感は少ない',
  ],
  'cognitive-reframing': [
    '思考は事実ではなく解釈である',
    '認知の歪みに気づくことで、考え方を変えられる',
    '「〜すべき」「〜しなければ」は認知の歪みの兆候',
  ],
  'dealing-with-boredom': [
    '退屈は不快な感情だが、創造性の源にもなる',
    'スマホを見る代わりに、退屈を感じる練習をする',
    '「何もしない時間」は脳のリフレッシュに必要',
  ],
  'loneliness-and-sns': [
    'SNSの「つながり」は本当のつながりの代替にならない',
    '孤独感はSNSを見ても解消されにくい',
    '少人数との深い交流の方が満足度が高い',
  ],
  'screen-time-and-sleep': [
    'ブルーライトはメラトニン分泌を抑制する',
    '就寝1時間前はスマホを避けるのが理想',
    '睡眠不足は翌日の自己制御力を低下させる',
  ],
  'reclaiming-focus': [
    '集中力は有限のリソースで、回復が必要',
    'マルチタスクは集中力を低下させる',
    '通知をオフにするだけで集中力が向上する',
  ],
};

/**
 * Build training context from user's progress
 * Returns formatted string with completed and not-started topics,
 * plus recent insights from past sessions for AI context
 * @param input - Training progress, completed topic IDs, and session summaries (passed from stores)
 */
export function buildTrainingContext(input: TrainingContextInput): string {
  const { trainingProgress, completedTopicIds, sessionSummaries } = input;

  const completedTopics = TRAINING_TOPICS
    .filter((t) => completedTopicIds.includes(t.id))
    .map((t) => TOPIC_TITLES[t.id] || t.id);

  const notStartedTopics = TRAINING_TOPICS
    .filter((t) => !trainingProgress[t.id])
    .map((t) => TOPIC_TITLES[t.id] || t.id);

  const inProgressTopics = TRAINING_TOPICS
    .filter((t) => trainingProgress[t.id] && !completedTopicIds.includes(t.id))
    .map((t) => TOPIC_TITLES[t.id] || t.id);

  // Extract recent insights from past session summaries
  const recentInsights = extractRecentSessionInsights(sessionSummaries);

  let context = `
## ユーザーのトレーニング進捗
- 完了済み: ${completedTopics.join(', ') || 'なし'}
- 学習中: ${inProgressTopics.join(', ') || 'なし'}
- 未開始: ${notStartedTopics.join(', ') || 'なし'}
`;

  // Add recent session insights if available
  if (recentInsights.length > 0) {
    context += `
## 過去の会話で発見したこと
${recentInsights.map((insight) => `- ${insight}`).join('\n')}
`;
  }

  return context;
}

/**
 * Build learned concepts context from completed training topics
 * Returns formatted string with key concepts the user has learned
 */
export function buildLearnedConceptsContext(
  completedTopicIds: string[]
): string {
  if (completedTopicIds.length === 0) {
    return '';
  }

  const concepts: string[] = [];

  for (const topicId of completedTopicIds) {
    const topicConcepts = TOPIC_CONCEPTS[topicId];
    if (topicConcepts) {
      // Take first 2 concepts from each topic to keep context manageable
      concepts.push(...topicConcepts.slice(0, 2));
    }
  }

  if (concepts.length === 0) {
    return '';
  }

  return `
## ユーザーが学んだ概念
${concepts.map((c) => `- ${c}`).join('\n')}

これらの概念を会話で自然に参照してください。
`;
}

/**
 * Build worksheet answers context for AI reference
 * Returns formatted string with user's self-reflection answers
 */
export function buildWorksheetContext(
  trainingProgress: Record<string, TrainingProgress>
): string {
  const worksheetSummaries: string[] = [];

  // Extract key worksheet answers from each topic
  for (const [topicId, progress] of Object.entries(trainingProgress)) {
    const answers = progress.worksheetAnswers;
    if (!answers || Object.keys(answers).length === 0) continue;

    const topicTitle = TOPIC_TITLES[topicId] || topicId;

    // Get meaningful answers (non-empty)
    const meaningfulAnswers = Object.entries(answers)
      .filter(([, answer]) => answer && answer.length > 0)
      .slice(0, 2); // Limit to 2 answers per topic

    if (meaningfulAnswers.length > 0) {
      const answerTexts = meaningfulAnswers
        .map(([, answer]) => truncateText(answer, 100))
        .join('、');
      worksheetSummaries.push(`- ${topicTitle}: ${answerTexts}`);
    }
  }

  if (worksheetSummaries.length === 0) {
    return '';
  }

  return `
## ユーザーの自己分析（ワークシート回答）
${worksheetSummaries.join('\n')}
`;
}

/**
 * Truncate text to specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Build If-Then plan context for AI reference
 */
export function buildIfThenPlanContext(ifThenPlan: string | null): string {
  if (!ifThenPlan) {
    return '';
  }

  return `
## ユーザーのIf-Thenプラン
${ifThenPlan}

このプランを会話で参照し、実践を励ましてください。
`;
}

/**
 * Build enhanced user context with all learning data
 * Combines training progress, learned concepts, worksheet answers, and If-Then plan
 */
export interface EnhancedContextInput {
  trainingProgress: Record<string, TrainingProgress>;
  completedTopicIds: string[];
  sessionSummaries: SessionSummary[];
  ifThenPlan: string | null;
}

export function buildEnhancedTrainingContext(
  input: EnhancedContextInput
): string {
  const baseContext = buildTrainingContext({
    trainingProgress: input.trainingProgress,
    completedTopicIds: input.completedTopicIds,
    sessionSummaries: input.sessionSummaries,
  });

  const learnedConcepts = buildLearnedConceptsContext(input.completedTopicIds);
  const worksheetContext = buildWorksheetContext(input.trainingProgress);
  const ifThenContext = buildIfThenPlanContext(input.ifThenPlan);

  return [baseContext, learnedConcepts, worksheetContext, ifThenContext]
    .filter((s) => s.length > 0)
    .join('\n');
}

/**
 * Extract recent insights from session summaries
 * Returns the most recent unique insights from past sessions
 *
 * @param sessionSummaries - Array of past session summaries
 * @returns Array of insight strings (max MAX_RECENT_SESSION_INSIGHTS)
 */
function extractRecentSessionInsights(
  sessionSummaries: Array<{ insights: string[] }>
): string[] {
  const seenInsights = new Set<string>();
  const insights: string[] = [];

  // Process from most recent to oldest
  for (let i = sessionSummaries.length - 1; i >= 0; i--) {
    const session = sessionSummaries[i];
    for (const insight of session.insights) {
      if (!seenInsights.has(insight)) {
        seenInsights.add(insight);
        insights.push(insight);

        if (insights.length >= MAX_RECENT_SESSION_INSIGHTS) {
          return insights;
        }
      }
    }
  }

  return insights;
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
 * Training progress for user context display
 */
export interface TrainingProgressContext {
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
  training: TrainingProgressContext,
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
  training: TrainingProgressContext,
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
