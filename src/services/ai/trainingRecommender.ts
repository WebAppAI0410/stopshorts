/**
 * Training Recommender for AI Coach
 * Recommends training topics based on conversation content using keyword matching
 */

import type { TrainingRecommendation } from '../../types/ai';
import type { TrainingProgress } from '../../types/training';

// ============================================
// Keyword Mapping
// ============================================

/**
 * Keywords that trigger specific training topic recommendations
 */
const KEYWORD_TOPIC_MAP: Array<{
  keywords: string[];
  topicId: string;
  topicTitle: string;
  reason: string;
}> = [
  {
    keywords: [
      '衝動',
      '我慢できない',
      '止められない',
      '抑えられない',
      '見たい',
      '見てしまう',
      'やめられない',
    ],
    topicId: 'urge-surfing-science',
    topicTitle: '衝動サーフィンの科学',
    reason: '衝動との付き合い方を学べます',
  },
  {
    keywords: [
      '習慣',
      '癖',
      'パターン',
      '無意識',
      '自動的',
      'つい',
      'いつの間にか',
    ],
    topicId: 'habit-loop',
    topicTitle: '習慣ループの理解',
    reason: '習慣の仕組みを理解できます',
  },
  {
    keywords: [
      '代わり',
      '計画',
      '対策',
      'プラン',
      '代替',
      'もし',
      'したら',
    ],
    topicId: 'if-then-plan',
    topicTitle: 'If-Thenプランニング',
    reason: '具体的な行動計画の立て方を学べます',
  },
  {
    keywords: [
      '退屈',
      '暇',
      'つまらない',
      'やることない',
      '手持ち無沙汰',
    ],
    topicId: 'dealing-with-boredom',
    topicTitle: '退屈への対処',
    reason: '退屈な時間の過ごし方を学べます',
  },
  {
    keywords: [
      '眠れない',
      '寝る前',
      '睡眠',
      '夜更かし',
      'ベッド',
      '布団',
    ],
    topicId: 'screen-time-and-sleep',
    topicTitle: 'スクリーンタイムと睡眠',
    reason: '睡眠とスマホの関係を学べます',
  },
  {
    keywords: [
      '寂しい',
      '孤独',
      '一人',
      'つながり',
      '友達',
      '誰か',
    ],
    topicId: 'loneliness-and-sns',
    topicTitle: '孤独感とSNS',
    reason: '孤独感への健全な対処法を学べます',
  },
  {
    keywords: [
      '集中',
      '注意力',
      '気が散る',
      '仕事',
      '勉強',
      '作業',
      'フォーカス',
    ],
    topicId: 'reclaiming-focus',
    topicTitle: '集中力の回復',
    reason: '集中力を取り戻す方法を学べます',
  },
  {
    keywords: [
      '脳',
      '意志力',
      '自制',
      'コントロール',
      '前頭葉',
      'ドーパミン',
    ],
    topicId: 'brain-self-control',
    topicTitle: '脳と自己制御',
    reason: '脳の仕組みと自己制御を理解できます',
  },
  {
    keywords: [
      '考え方',
      '捉え方',
      '思い込み',
      '認知',
      '視点',
      '見方',
    ],
    topicId: 'cognitive-reframing',
    topicTitle: '認知リフレーミング',
    reason: '考え方を変える技術を学べます',
  },
];

// ============================================
// Recommendation Functions
// ============================================

/**
 * Find matching keywords in text
 */
function findMatchingKeywords(text: string): Set<string> {
  const matches = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const mapping of KEYWORD_TOPIC_MAP) {
    for (const keyword of mapping.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matches.add(mapping.topicId);
        break; // One match per topic is enough
      }
    }
  }

  return matches;
}

/**
 * Get training recommendations based on conversation messages
 * Analyzes recent messages for keywords and returns relevant training topics
 *
 * @param messages - Array of message contents to analyze
 * @param trainingProgress - User's current training progress
 * @param maxRecommendations - Maximum number of recommendations to return
 * @returns Array of training recommendations
 */
export function getTrainingRecommendations(
  messages: string[],
  trainingProgress: Record<string, TrainingProgress>,
  maxRecommendations: number = 1
): TrainingRecommendation[] {
  // Analyze all messages for keywords
  const matchedTopicIds = new Set<string>();

  for (const message of messages) {
    const matches = findMatchingKeywords(message);
    matches.forEach((id) => matchedTopicIds.add(id));
  }

  // Convert to recommendations, prioritizing incomplete topics
  const recommendations: TrainingRecommendation[] = [];

  for (const topicId of matchedTopicIds) {
    if (recommendations.length >= maxRecommendations) break;

    const mapping = KEYWORD_TOPIC_MAP.find((m) => m.topicId === topicId);
    if (!mapping) continue;

    const progress = trainingProgress[topicId];
    const isCompleted = progress?.isCompleted ?? false;

    // Prioritize incomplete topics
    recommendations.push({
      topicId: mapping.topicId,
      topicTitle: mapping.topicTitle,
      reason: mapping.reason,
      isCompleted,
      route: `/(main)/training/${mapping.topicId}`,
    });
  }

  // Sort: incomplete first, then by keyword match order
  recommendations.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return 0;
  });

  return recommendations.slice(0, maxRecommendations);
}

/**
 * Get a single most relevant training recommendation for the current conversation
 * Returns null if no relevant topic found or all relevant topics are completed
 *
 * @param recentMessages - Recent conversation messages (last 5-10)
 * @param trainingProgress - User's current training progress
 * @param recentRecommendations - Topics recently recommended (to avoid repetition)
 * @returns Single recommendation or null
 */
export function getInlineRecommendation(
  recentMessages: string[],
  trainingProgress: Record<string, TrainingProgress>,
  recentRecommendations: string[] = []
): TrainingRecommendation | null {
  // Get recommendations
  const recommendations = getTrainingRecommendations(
    recentMessages,
    trainingProgress,
    3 // Get top 3 to have fallbacks
  );

  // Filter out recently recommended topics
  const filtered = recommendations.filter(
    (r) => !recentRecommendations.includes(r.topicId)
  );

  // Prefer incomplete topics
  const incomplete = filtered.find((r) => !r.isCompleted);
  if (incomplete) return incomplete;

  // Fall back to any topic not recently recommended
  return filtered[0] || null;
}

/**
 * Check if a message contains keywords related to any training topic
 * Used to decide whether to show inline recommendation
 */
export function messageHasTrainingKeywords(message: string): boolean {
  return findMatchingKeywords(message).size > 0;
}

/**
 * Get all topic IDs that match keywords in a message
 * Useful for analytics or debugging
 */
export function getMatchingTopicIds(message: string): string[] {
  return Array.from(findMatchingKeywords(message));
}
