/**
 * Suggestion Engine for AI Coach
 * Generates contextual suggestions based on user statistics and training progress
 */

import type {
  ContextualSuggestion,
  SuggestionContext,
  SuggestionAction,
  SuggestionCategory,
} from '../../types/ai';

// ============================================
// Suggestion Condition Types
// ============================================

interface SuggestionCondition {
  id: string;
  priority: number;
  category: SuggestionCategory;
  check: (context: SuggestionContext) => boolean;
  suggestion: Omit<ContextualSuggestion, 'id' | 'priority' | 'category'>;
}

// ============================================
// Suggestion Conditions (Priority-ordered)
// ============================================

const SUGGESTION_CONDITIONS: SuggestionCondition[] = [
  // Priority 100: If-Then plan not set after 3+ days from onboarding
  {
    id: 'make_plan',
    priority: 100,
    category: 'learning',
    check: (ctx) => {
      if (ctx.ifThenPlan) return false;
      if (!ctx.onboardingCompletedAt) return false;
      const onboardingDate = new Date(ctx.onboardingCompletedAt);
      const daysSinceOnboarding = Math.floor(
        (Date.now() - onboardingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceOnboarding >= 3;
    },
    suggestion: {
      titleKey: 'ai.suggestions.makePlan.title',
      descriptionKey: 'ai.suggestions.makePlan.description',
      action: { type: 'start_guided', templateId: 'if-then' },
    },
  },

  // Priority 95: Over 150% of goal usage today
  {
    id: 'over_usage',
    priority: 95,
    category: 'concern',
    check: (ctx) => {
      if (ctx.todayStats.goalMinutes <= 0) return false;
      return ctx.todayStats.totalMinutes > ctx.todayStats.goalMinutes * 1.5;
    },
    suggestion: {
      titleKey: 'ai.suggestions.overUsage.title',
      descriptionKey: 'ai.suggestions.overUsage.description',
      action: { type: 'start_mode', modeId: 'reflect' },
    },
  },

  // Priority 90: Weekly usage increased by 20%+
  {
    id: 'weekly_increase',
    priority: 90,
    category: 'concern',
    check: (ctx) => {
      if (ctx.weeklyStats.previousWeekMinutes <= 0) return false;
      return (
        ctx.weeklyStats.totalMinutes >=
        ctx.weeklyStats.previousWeekMinutes * 1.2
      );
    },
    suggestion: {
      titleKey: 'ai.suggestions.weeklyIncrease.title',
      descriptionKey: 'ai.suggestions.weeklyIncrease.description',
      action: { type: 'start_mode', modeId: 'explore' },
    },
  },

  // Priority 85: 3+ interventions today with 0 blocks
  {
    id: 'tough_day',
    priority: 85,
    category: 'concern',
    check: (ctx) =>
      ctx.todayStats.interventionCount >= 3 && ctx.todayStats.blockedCount === 0,
    suggestion: {
      titleKey: 'ai.suggestions.toughDay.title',
      descriptionKey: 'ai.suggestions.toughDay.description',
      action: { type: 'free_chat' },
    },
  },

  // Priority 80: 2+ blocks today (success!)
  {
    id: 'good_job',
    priority: 80,
    category: 'progress',
    check: (ctx) => ctx.todayStats.blockedCount >= 2,
    suggestion: {
      titleKey: 'ai.suggestions.goodJob.title',
      descriptionKey: 'ai.suggestions.goodJob.description',
      action: { type: 'start_mode', modeId: 'reflect' },
    },
  },

  // Priority 75: 7+ day streak
  {
    id: 'great_streak',
    priority: 75,
    category: 'progress',
    check: (ctx) => ctx.streakDays >= 7,
    suggestion: {
      titleKey: 'ai.suggestions.greatStreak.title',
      descriptionKey: 'ai.suggestions.greatStreak.description',
      action: { type: 'free_chat' },
    },
  },

  // Priority 70: 3+ day streak
  {
    id: 'keep_it_up',
    priority: 70,
    category: 'progress',
    check: (ctx) => ctx.streakDays >= 3 && ctx.streakDays < 7,
    suggestion: {
      titleKey: 'ai.suggestions.keepItUp.title',
      descriptionKey: 'ai.suggestions.keepItUp.description',
      action: { type: 'start_mode', modeId: 'reflect' },
    },
  },

  // Priority 65: Night time (22:00+) with intervention today
  {
    id: 'night_reflect',
    priority: 65,
    category: 'routine',
    check: (ctx) =>
      ctx.currentHour >= 22 && ctx.todayStats.interventionCount > 0,
    suggestion: {
      titleKey: 'ai.suggestions.nightReflect.title',
      descriptionKey: 'ai.suggestions.nightReflect.description',
      action: { type: 'start_mode', modeId: 'reflect' },
    },
  },

  // Priority 60: Training in progress (has incomplete topics)
  {
    id: 'continue_training',
    priority: 60,
    category: 'learning',
    check: (ctx) => {
      const topics = Object.entries(ctx.trainingProgress);
      return topics.some(
        ([, progress]) =>
          progress.completedContents.length > 0 && !progress.isCompleted
      );
    },
    suggestion: {
      titleKey: 'ai.suggestions.continueTraining.title',
      descriptionKey: 'ai.suggestions.continueTraining.description',
      action: { type: 'navigate', route: '/(main)/training' },
    },
  },

  // Priority 55: Training not started
  {
    id: 'start_training',
    priority: 55,
    category: 'learning',
    check: (ctx) => Object.keys(ctx.trainingProgress).length === 0,
    suggestion: {
      titleKey: 'ai.suggestions.startTraining.title',
      descriptionKey: 'ai.suggestions.startTraining.description',
      action: { type: 'navigate', route: '/(main)/training/habit-loop' },
    },
  },

  // Priority 50: Urge surfing completed but not tried
  {
    id: 'try_urge_surfing',
    priority: 50,
    category: 'learning',
    check: (ctx) => {
      const urgeSurfingProgress = ctx.trainingProgress['urge-surfing-science'];
      return urgeSurfingProgress?.isCompleted === true;
    },
    suggestion: {
      titleKey: 'ai.suggestions.tryUrgeSurfing.title',
      descriptionKey: 'ai.suggestions.tryUrgeSurfing.description',
      action: { type: 'navigate', route: '/(main)/urge-surfing' },
    },
  },

  // Priority 45: 7+ days since last session
  {
    id: 'welcome_back',
    priority: 45,
    category: 'routine',
    check: (ctx) => {
      if (!ctx.lastSessionDate) return false;
      const lastDate = new Date(ctx.lastSessionDate);
      const daysSinceSession = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceSession >= 7;
    },
    suggestion: {
      titleKey: 'ai.suggestions.welcomeBack.title',
      descriptionKey: 'ai.suggestions.welcomeBack.description',
      action: { type: 'free_chat' },
    },
  },

  // Priority 40: Morning (6-9) with yesterday stats
  {
    id: 'morning_reflect',
    priority: 40,
    category: 'routine',
    check: (ctx) => ctx.currentHour >= 6 && ctx.currentHour < 9,
    suggestion: {
      titleKey: 'ai.suggestions.morningReflect.title',
      descriptionKey: 'ai.suggestions.morningReflect.description',
      action: { type: 'start_mode', modeId: 'reflect' },
    },
  },
];

// ============================================
// Main Functions
// ============================================

/**
 * Get the next recommended training topic ID
 */
export function getNextRecommendedTopicId(
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
 * Get top contextual suggestions based on user's current situation
 * Returns up to maxCount suggestions with different categories
 */
export function getContextualSuggestions(
  context: SuggestionContext,
  maxCount: number = 2
): ContextualSuggestion[] {
  // Filter conditions that match the current context
  const matched = SUGGESTION_CONDITIONS.filter((cond) => cond.check(context))
    .sort((a, b) => b.priority - a.priority);

  // Select suggestions ensuring category diversity
  const selected: ContextualSuggestion[] = [];
  const usedCategories = new Set<SuggestionCategory>();

  for (const cond of matched) {
    if (selected.length >= maxCount) break;

    // Skip if we already have a suggestion from this category
    if (usedCategories.has(cond.category)) continue;

    selected.push({
      id: cond.id,
      priority: cond.priority,
      category: cond.category,
      ...cond.suggestion,
    });
    usedCategories.add(cond.category);
  }

  return selected;
}

/**
 * Build suggestion context from app state
 * Helper function to create context from various stores
 */
export function buildSuggestionContext(params: {
  todayStats: {
    interventionCount: number;
    blockedCount: number;
    totalMinutes: number;
    goalMinutes: number;
  };
  weeklyStats: {
    totalMinutes: number;
    previousWeekMinutes: number;
  };
  trainingProgress: Record<string, { isCompleted: boolean; completedContents: string[] }>;
  ifThenPlan: string | null;
  lastSessionDate: string | null;
  onboardingCompletedAt: string | null;
  streakDays: number;
}): SuggestionContext {
  return {
    todayStats: params.todayStats,
    weeklyStats: params.weeklyStats,
    trainingProgress: params.trainingProgress,
    ifThenPlan: params.ifThenPlan,
    lastSessionDate: params.lastSessionDate,
    onboardingCompletedAt: params.onboardingCompletedAt,
    currentHour: new Date().getHours(),
    streakDays: params.streakDays,
  };
}

/**
 * Get action handler for a suggestion action
 * Returns a function that can be executed to perform the action
 */
export function getSuggestionActionHandler(
  action: SuggestionAction,
  callbacks: {
    startMode: (modeId: string) => void;
    startGuided: (templateId: string) => void;
    navigate: (route: string) => void;
    startFreeChat: () => void;
  }
): () => void {
  switch (action.type) {
    case 'start_mode':
      return () => callbacks.startMode(action.modeId);
    case 'start_guided':
      return () => callbacks.startGuided(action.templateId);
    case 'navigate':
      return () => callbacks.navigate(action.route);
    case 'free_chat':
      return () => callbacks.startFreeChat();
  }
}
