/**
 * AI Store Helpers
 * Utility functions used across AI slices
 */

import type { Message, SessionSummary, PersonaId, LongTermMemory } from '../../types/ai';
import { extractInsights } from '../../services/ai/insightExtractor';
import { handleCrisisIfDetected } from '../../services/ai/mentalHealthHandler';
import { buildTrainingContext, type TrainingContextInput } from '../../services/ai/promptBuilder';
import { useAppStore } from '../useAppStore';
import type { IfThenPlan, IfThenAction } from '../../types';

// ============================================
// ID Generation
// ============================================

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Token Estimation
// ============================================

/**
 * Estimate token count (rough: 1 token ~ 4 chars for English, ~2 chars for Japanese)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 2.5);
}

// ============================================
// Storage Keys
// ============================================

export const AI_MEMORY_KEY = 'stopshorts-ai-memory';
export const AI_SESSIONS_KEY = 'stopshorts-ai-sessions';

// ============================================
// Response Generation (Placeholder)
// ============================================

/**
 * Generate AI response (placeholder - will be replaced with actual LLM integration)
 */
export async function generateAIResponse(
  messages: Message[],
  _personaId: PersonaId,
  _longTermMemory: LongTermMemory | null,
  sessionSummaries: SessionSummary[]
): Promise<string> {
  const { trainingProgress, getCompletedTopicIds } = useAppStore.getState();
  const trainingContextInput: TrainingContextInput = {
    trainingProgress,
    completedTopicIds: getCompletedTopicIds(),
    sessionSummaries,
  };
  const trainingContext = buildTrainingContext(trainingContextInput);

  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content || '';
  const contentLower = content.toLowerCase();

  // Check for mental health crisis keywords first
  const crisisResponse = handleCrisisIfDetected(content);
  if (crisisResponse) {
    return crisisResponse;
  }

  if (__DEV__) {
    console.log('[AIStore] Training context:', trainingContext);
  }

  // Simple pattern matching for demo purposes
  if (contentLower.includes('つらい') || contentLower.includes('難しい')) {
    return 'その気持ち、よく分かります。少しずつでいいんですよ。今日、何か小さな一歩を踏み出せたことはありますか？';
  }

  if (contentLower.includes('開いて') || contentLower.includes('見てしまった')) {
    return 'なるほど、開いてしまったんですね。でも、こうして話してくれていること自体が大きな一歩です。何がきっかけで開きたくなりましたか？';
  }

  if (contentLower.includes('できた') || contentLower.includes('成功')) {
    return 'すごい！その調子です。小さな成功を積み重ねることが大切ですね。どんな気持ちですか？';
  }

  if (content.includes('トレーニング') || content.includes('学習') || content.includes('勉強')) {
    const hasNotStarted =
      trainingContext.includes('完了済み: なし') && trainingContext.includes('学習中: なし');
    if (hasNotStarted) {
      return '習慣改善のトレーニングをまだ始めていないようですね。「習慣ループの理解」から始めてみませんか？自分の行動パターンを理解することが第一歩です。';
    }
    return 'トレーニングを進めているんですね！学んだことを日常に活かせていますか？';
  }

  const supportiveResponses = [
    'もう少し教えてもらえますか？',
    'その気持ち、大切にしてくださいね。',
    '一緒に考えていきましょう。',
    'それは大変でしたね。どうしたいですか？',
  ];

  return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
}

/**
 * Generate session summary (placeholder - will use LLM)
 */
export async function generateSessionSummary(messages: Message[]): Promise<string> {
  const messageCount = messages.length;
  const firstTopic = messages[0]?.content.slice(0, 50) || '';
  return `${messageCount}回のやりとり。話題: ${firstTopic}...`;
}

/**
 * Get default error response
 */
export function getDefaultErrorResponse(): string {
  const responses = [
    'すみません、少し考えが詰まってしまいました。もう一度お話しいただけますか？',
    '申し訳ありません、うまく処理できませんでした。別の言い方で教えていただけますか？',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================
// If-Then Plan Mapping
// ============================================

/**
 * Map alternative action text from guided conversation to IfThenPlan
 */
export function mapAlternativeToIfThenPlan(alternative: string): IfThenPlan | null {
  if (!alternative) return null;

  const actionMapping: Record<string, IfThenAction> = {
    '深呼吸する': 'breathe',
    '水を飲む': 'water',
    '散歩する': 'short_walk',
    '本を読む': 'read_page',
    'ストレッチする': 'stretch',
    '外の景色を見る': 'look_outside',
  };

  const mappedAction = actionMapping[alternative];

  if (mappedAction) {
    return { action: mappedAction };
  }

  return {
    action: 'custom',
    customAction: alternative,
  };
}

// ============================================
// Insight Extraction
// ============================================

export { extractInsights };
