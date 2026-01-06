/**
 * Conversation Starters Data
 * Pre-defined prompts to help users start conversations with AI Coach
 */

import type {
  ConversationStarter,
  ConversationStarterCategory,
} from '../types/ai';

// ============================================
// Concern Category (Urge & Failure)
// ============================================

const CONCERN_STARTERS: ConversationStarter[] = [
  {
    id: 'opened',
    textKey: 'ai.starters.opened',
    category: 'concern',
  },
  {
    id: 'urge_now',
    textKey: 'ai.starters.urge_now',
    category: 'concern',
  },
  {
    id: 'urge_strong',
    textKey: 'ai.starters.urge_strong',
    category: 'concern',
  },
  {
    id: 'wasted_time',
    textKey: 'ai.starters.wasted_time',
    category: 'concern',
  },
  {
    id: 'cant_stop',
    textKey: 'ai.starters.cant_stop',
    category: 'concern',
  },
  {
    id: 'failed_goal',
    textKey: 'ai.starters.failed_goal',
    category: 'concern',
  },
];

// ============================================
// Emotional Category (Feelings & Situations)
// ============================================

const EMOTIONAL_STARTERS: ConversationStarter[] = [
  {
    id: 'bored',
    textKey: 'ai.starters.bored',
    category: 'emotional',
  },
  {
    id: 'stressed',
    textKey: 'ai.starters.stressed',
    category: 'emotional',
  },
  {
    id: 'lonely',
    textKey: 'ai.starters.lonely',
    category: 'emotional',
  },
  {
    id: 'anxious',
    textKey: 'ai.starters.anxious',
    category: 'emotional',
  },
  {
    id: 'tired',
    textKey: 'ai.starters.tired',
    category: 'emotional',
  },
  {
    id: 'before_sleep',
    textKey: 'ai.starters.before_sleep',
    category: 'emotional',
  },
];

// ============================================
// Positive Category (Success & Progress)
// ============================================

const POSITIVE_STARTERS: ConversationStarter[] = [
  {
    id: 'resisted',
    textKey: 'ai.starters.resisted',
    category: 'positive',
  },
  {
    id: 'streak',
    textKey: 'ai.starters.streak',
    category: 'positive',
  },
  {
    id: 'feeling_good',
    textKey: 'ai.starters.feeling_good',
    category: 'positive',
  },
  {
    id: 'noticed_trigger',
    textKey: 'ai.starters.noticed_trigger',
    category: 'positive',
  },
  {
    id: 'alternative_worked',
    textKey: 'ai.starters.alternative_worked',
    category: 'positive',
  },
];

// ============================================
// Question Category (Learning & Curiosity)
// ============================================

const QUESTION_STARTERS: ConversationStarter[] = [
  {
    id: 'why_addictive',
    textKey: 'ai.starters.why_addictive',
    category: 'question',
  },
  {
    id: 'how_to_stop',
    textKey: 'ai.starters.how_to_stop',
    category: 'question',
  },
  {
    id: 'what_to_do',
    textKey: 'ai.starters.what_to_do',
    category: 'question',
  },
  {
    id: 'is_progress',
    textKey: 'ai.starters.is_progress',
    category: 'question',
  },
];

// ============================================
// Training Category (Related to Training Topics)
// ============================================

const TRAINING_STARTERS: ConversationStarter[] = [
  {
    id: 'learn_habit',
    textKey: 'ai.starters.learn_habit',
    category: 'training',
    relatedTopic: 'habit-loop',
  },
  {
    id: 'learn_urge',
    textKey: 'ai.starters.learn_urge',
    category: 'training',
    relatedTopic: 'urge-surfing-science',
  },
  {
    id: 'make_plan',
    textKey: 'ai.starters.make_plan',
    category: 'training',
    relatedTopic: 'if-then-plan',
  },
];

// ============================================
// All Starters Combined
// ============================================

export const ALL_STARTERS: ConversationStarter[] = [
  ...CONCERN_STARTERS,
  ...EMOTIONAL_STARTERS,
  ...POSITIVE_STARTERS,
  ...QUESTION_STARTERS,
  ...TRAINING_STARTERS,
];

export const STARTERS_BY_CATEGORY: Record<
  ConversationStarterCategory,
  ConversationStarter[]
> = {
  concern: CONCERN_STARTERS,
  emotional: EMOTIONAL_STARTERS,
  positive: POSITIVE_STARTERS,
  question: QUESTION_STARTERS,
  training: TRAINING_STARTERS,
};

// ============================================
// Starter Selection Logic
// ============================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface StarterContext {
  todayStats: {
    interventionCount: number;
    blockedCount: number;
  };
  trainingProgress: Record<string, { isCompleted: boolean }>;
  timeOfDay: TimeOfDay;
}

/**
 * Get time of day based on current hour
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get the next recommended training topic ID
 */
function getNextRecommendedTopicId(
  trainingProgress: Record<string, { isCompleted: boolean }>
): string | null {
  const topicOrder = [
    'habit-loop',
    'if-then-plan',
    'urge-surfing-science',
    'brain-self-control',
    'cognitive-reframing',
    'dealing-with-boredom',
    'loneliness-and-sns',
    'screen-time-and-sleep',
    'reclaiming-focus',
  ];

  for (const topicId of topicOrder) {
    const progress = trainingProgress[topicId];
    if (!progress || !progress.isCompleted) {
      return topicId;
    }
  }

  return null;
}

/**
 * Get starter by ID
 */
export function getStarterById(id: string): ConversationStarter | undefined {
  return ALL_STARTERS.find((s) => s.id === id);
}

/**
 * Get dynamically selected conversation starters based on context
 */
export function getConversationStarters(
  context: StarterContext,
  maxCount: number = 6
): ConversationStarter[] {
  const selected: ConversationStarter[] = [];
  const usedIds = new Set<string>();

  const addStarter = (starter: ConversationStarter | undefined) => {
    if (starter && !usedIds.has(starter.id)) {
      selected.push(starter);
      usedIds.add(starter.id);
    }
  };

  // 1. Context-based priority starters
  if (context.todayStats.interventionCount > 0) {
    addStarter(getStarterById('opened'));
    addStarter(getStarterById('wasted_time'));
  }

  if (context.todayStats.blockedCount > 0) {
    addStarter(getStarterById('resisted'));
  }

  // 2. Time-based starters
  if (context.timeOfDay === 'night') {
    addStarter(getStarterById('before_sleep'));
  }

  if (context.timeOfDay === 'morning') {
    addStarter(getStarterById('feeling_good'));
  }

  // 3. Training-related starters (if incomplete topics exist)
  const nextTopicId = getNextRecommendedTopicId(context.trainingProgress);
  if (nextTopicId) {
    const relatedStarter = TRAINING_STARTERS.find(
      (s) => s.relatedTopic === nextTopicId
    );
    addStarter(relatedStarter);
  }

  // 4. Fill with balanced category starters
  const categoryBalance: ConversationStarterCategory[] = [
    'concern',
    'emotional',
    'positive',
    'question',
  ];

  for (const category of categoryBalance) {
    if (selected.length >= maxCount) break;

    const categoryStarters = STARTERS_BY_CATEGORY[category];
    for (const starter of categoryStarters) {
      if (selected.length >= maxCount) break;
      addStarter(starter);
    }
  }

  return selected.slice(0, maxCount);
}

/**
 * Get default starters (for when context is not available)
 */
export function getDefaultStarters(maxCount: number = 6): ConversationStarter[] {
  return [
    getStarterById('urge_strong'),
    getStarterById('bored'),
    getStarterById('resisted'),
    getStarterById('how_to_stop'),
    getStarterById('stressed'),
    getStarterById('learn_habit'),
  ].filter((s): s is ConversationStarter => s !== undefined).slice(0, maxCount);
}
