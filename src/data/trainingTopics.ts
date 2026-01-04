/**
 * Training Topics Data
 * Psychological training content for habit change support
 */

import type { TrainingTopic } from '../types/training';

/**
 * All available training topics
 * Organized by category: research, emotional, goal
 */
export const TRAINING_TOPICS: TrainingTopic[] = [
  // ============================================
  // RESEARCH-BASED TOPICS
  // ============================================

  {
    id: 'habit-loop',
    titleKey: 'training.topics.habitLoop.title',
    descriptionKey: 'training.topics.habitLoop.description',
    category: 'research',
    estimatedMinutes: 8,
    order: 1,
    contents: [
      {
        id: 'habit-loop-article',
        type: 'article',
        titleKey: 'training.topics.habitLoop.article.title',
        bodyKey: 'training.topics.habitLoop.article.body',
        order: 1,
      },
      {
        id: 'habit-loop-quiz',
        type: 'quiz',
        titleKey: 'training.topics.habitLoop.quiz.title',
        order: 2,
        questions: [
          {
            id: 'habit-loop-q1',
            questionKey: 'training.topics.habitLoop.quiz.q1.question',
            optionKeys: [
              'training.topics.habitLoop.quiz.q1.option1',
              'training.topics.habitLoop.quiz.q1.option2',
              'training.topics.habitLoop.quiz.q1.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.habitLoop.quiz.q1.explanation',
          },
          {
            id: 'habit-loop-q2',
            questionKey: 'training.topics.habitLoop.quiz.q2.question',
            optionKeys: [
              'training.topics.habitLoop.quiz.q2.option1',
              'training.topics.habitLoop.quiz.q2.option2',
              'training.topics.habitLoop.quiz.q2.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.habitLoop.quiz.q2.explanation',
          },
        ],
      },
      {
        id: 'habit-loop-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.habitLoop.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'habit-loop-prompt1',
            promptKey: 'training.topics.habitLoop.worksheet.prompt1',
            placeholderKey: 'training.topics.habitLoop.worksheet.placeholder1',
            minLength: 10,
          },
        ],
      },
    ],
  },

  {
    id: 'if-then-plan',
    titleKey: 'training.topics.ifThenPlan.title',
    descriptionKey: 'training.topics.ifThenPlan.description',
    category: 'research',
    estimatedMinutes: 7,
    order: 2,
    contents: [
      {
        id: 'if-then-plan-article',
        type: 'article',
        titleKey: 'training.topics.ifThenPlan.article.title',
        bodyKey: 'training.topics.ifThenPlan.article.body',
        order: 1,
      },
      {
        id: 'if-then-plan-quiz',
        type: 'quiz',
        titleKey: 'training.topics.ifThenPlan.quiz.title',
        order: 2,
        questions: [
          {
            id: 'if-then-q1',
            questionKey: 'training.topics.ifThenPlan.quiz.q1.question',
            optionKeys: [
              'training.topics.ifThenPlan.quiz.q1.option1',
              'training.topics.ifThenPlan.quiz.q1.option2',
              'training.topics.ifThenPlan.quiz.q1.option3',
            ],
            correctIndex: 2,
            explanationKey: 'training.topics.ifThenPlan.quiz.q1.explanation',
          },
          {
            id: 'if-then-q2',
            questionKey: 'training.topics.ifThenPlan.quiz.q2.question',
            optionKeys: [
              'training.topics.ifThenPlan.quiz.q2.option1',
              'training.topics.ifThenPlan.quiz.q2.option2',
              'training.topics.ifThenPlan.quiz.q2.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.ifThenPlan.quiz.q2.explanation',
          },
        ],
      },
      {
        id: 'if-then-plan-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.ifThenPlan.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'if-then-prompt1',
            promptKey: 'training.topics.ifThenPlan.worksheet.prompt1',
            placeholderKey: 'training.topics.ifThenPlan.worksheet.placeholder1',
            minLength: 15,
          },
        ],
      },
    ],
  },

  {
    id: 'urge-surfing-science',
    titleKey: 'training.topics.urgeSurfingScience.title',
    descriptionKey: 'training.topics.urgeSurfingScience.description',
    category: 'research',
    estimatedMinutes: 10,
    order: 3,
    contents: [
      {
        id: 'urge-surfing-article',
        type: 'article',
        titleKey: 'training.topics.urgeSurfingScience.article.title',
        bodyKey: 'training.topics.urgeSurfingScience.article.body',
        order: 1,
      },
      {
        id: 'urge-surfing-quiz',
        type: 'quiz',
        titleKey: 'training.topics.urgeSurfingScience.quiz.title',
        order: 2,
        questions: [
          {
            id: 'urge-surfing-q1',
            questionKey: 'training.topics.urgeSurfingScience.quiz.q1.question',
            optionKeys: [
              'training.topics.urgeSurfingScience.quiz.q1.option1',
              'training.topics.urgeSurfingScience.quiz.q1.option2',
              'training.topics.urgeSurfingScience.quiz.q1.option3',
            ],
            correctIndex: 2,
            explanationKey: 'training.topics.urgeSurfingScience.quiz.q1.explanation',
          },
          {
            id: 'urge-surfing-q2',
            questionKey: 'training.topics.urgeSurfingScience.quiz.q2.question',
            optionKeys: [
              'training.topics.urgeSurfingScience.quiz.q2.option1',
              'training.topics.urgeSurfingScience.quiz.q2.option2',
              'training.topics.urgeSurfingScience.quiz.q2.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.urgeSurfingScience.quiz.q2.explanation',
          },
          {
            id: 'urge-surfing-q3',
            questionKey: 'training.topics.urgeSurfingScience.quiz.q3.question',
            optionKeys: [
              'training.topics.urgeSurfingScience.quiz.q3.option1',
              'training.topics.urgeSurfingScience.quiz.q3.option2',
              'training.topics.urgeSurfingScience.quiz.q3.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.urgeSurfingScience.quiz.q3.explanation',
          },
        ],
      },
      {
        id: 'urge-surfing-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.urgeSurfingScience.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'urge-surfing-prompt1',
            promptKey: 'training.topics.urgeSurfingScience.worksheet.prompt1',
            placeholderKey: 'training.topics.urgeSurfingScience.worksheet.placeholder1',
            minLength: 10,
          },
        ],
      },
    ],
  },

  {
    id: 'brain-self-control',
    titleKey: 'training.topics.brainSelfControl.title',
    descriptionKey: 'training.topics.brainSelfControl.description',
    category: 'research',
    estimatedMinutes: 9,
    order: 4,
    contents: [
      {
        id: 'brain-self-control-article',
        type: 'article',
        titleKey: 'training.topics.brainSelfControl.article.title',
        bodyKey: 'training.topics.brainSelfControl.article.body',
        order: 1,
      },
      {
        id: 'brain-self-control-quiz',
        type: 'quiz',
        titleKey: 'training.topics.brainSelfControl.quiz.title',
        order: 2,
        questions: [
          {
            id: 'brain-q1',
            questionKey: 'training.topics.brainSelfControl.quiz.q1.question',
            optionKeys: [
              'training.topics.brainSelfControl.quiz.q1.option1',
              'training.topics.brainSelfControl.quiz.q1.option2',
              'training.topics.brainSelfControl.quiz.q1.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.brainSelfControl.quiz.q1.explanation',
          },
          {
            id: 'brain-q2',
            questionKey: 'training.topics.brainSelfControl.quiz.q2.question',
            optionKeys: [
              'training.topics.brainSelfControl.quiz.q2.option1',
              'training.topics.brainSelfControl.quiz.q2.option2',
              'training.topics.brainSelfControl.quiz.q2.option3',
            ],
            correctIndex: 2,
            explanationKey: 'training.topics.brainSelfControl.quiz.q2.explanation',
          },
        ],
      },
      {
        id: 'brain-self-control-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.brainSelfControl.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'brain-prompt1',
            promptKey: 'training.topics.brainSelfControl.worksheet.prompt1',
            placeholderKey: 'training.topics.brainSelfControl.worksheet.placeholder1',
            minLength: 10,
          },
        ],
      },
    ],
  },

  {
    id: 'cognitive-reframing',
    titleKey: 'training.topics.cognitiveReframing.title',
    descriptionKey: 'training.topics.cognitiveReframing.description',
    category: 'research',
    estimatedMinutes: 8,
    order: 5,
    contents: [
      {
        id: 'cognitive-reframing-article',
        type: 'article',
        titleKey: 'training.topics.cognitiveReframing.article.title',
        bodyKey: 'training.topics.cognitiveReframing.article.body',
        order: 1,
      },
      {
        id: 'cognitive-reframing-quiz',
        type: 'quiz',
        titleKey: 'training.topics.cognitiveReframing.quiz.title',
        order: 2,
        questions: [
          {
            id: 'reframe-q1',
            questionKey: 'training.topics.cognitiveReframing.quiz.q1.question',
            optionKeys: [
              'training.topics.cognitiveReframing.quiz.q1.option1',
              'training.topics.cognitiveReframing.quiz.q1.option2',
              'training.topics.cognitiveReframing.quiz.q1.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.cognitiveReframing.quiz.q1.explanation',
          },
          {
            id: 'reframe-q2',
            questionKey: 'training.topics.cognitiveReframing.quiz.q2.question',
            optionKeys: [
              'training.topics.cognitiveReframing.quiz.q2.option1',
              'training.topics.cognitiveReframing.quiz.q2.option2',
              'training.topics.cognitiveReframing.quiz.q2.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.cognitiveReframing.quiz.q2.explanation',
          },
        ],
      },
      {
        id: 'cognitive-reframing-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.cognitiveReframing.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'reframe-prompt1',
            promptKey: 'training.topics.cognitiveReframing.worksheet.prompt1',
            placeholderKey: 'training.topics.cognitiveReframing.worksheet.placeholder1',
            minLength: 15,
          },
        ],
      },
    ],
  },

  // ============================================
  // EMOTIONAL-BASED TOPICS
  // ============================================

  {
    id: 'dealing-with-boredom',
    titleKey: 'training.topics.dealingWithBoredom.title',
    descriptionKey: 'training.topics.dealingWithBoredom.description',
    category: 'emotional',
    estimatedMinutes: 7,
    order: 6,
    contents: [
      {
        id: 'boredom-article',
        type: 'article',
        titleKey: 'training.topics.dealingWithBoredom.article.title',
        bodyKey: 'training.topics.dealingWithBoredom.article.body',
        order: 1,
      },
      {
        id: 'boredom-quiz',
        type: 'quiz',
        titleKey: 'training.topics.dealingWithBoredom.quiz.title',
        order: 2,
        questions: [
          {
            id: 'boredom-q1',
            questionKey: 'training.topics.dealingWithBoredom.quiz.q1.question',
            optionKeys: [
              'training.topics.dealingWithBoredom.quiz.q1.option1',
              'training.topics.dealingWithBoredom.quiz.q1.option2',
              'training.topics.dealingWithBoredom.quiz.q1.option3',
            ],
            correctIndex: 2,
            explanationKey: 'training.topics.dealingWithBoredom.quiz.q1.explanation',
          },
          {
            id: 'boredom-q2',
            questionKey: 'training.topics.dealingWithBoredom.quiz.q2.question',
            optionKeys: [
              'training.topics.dealingWithBoredom.quiz.q2.option1',
              'training.topics.dealingWithBoredom.quiz.q2.option2',
              'training.topics.dealingWithBoredom.quiz.q2.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.dealingWithBoredom.quiz.q2.explanation',
          },
        ],
      },
      {
        id: 'boredom-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.dealingWithBoredom.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'boredom-prompt1',
            promptKey: 'training.topics.dealingWithBoredom.worksheet.prompt1',
            placeholderKey: 'training.topics.dealingWithBoredom.worksheet.placeholder1',
            minLength: 10,
          },
        ],
      },
    ],
  },

  {
    id: 'loneliness-and-sns',
    titleKey: 'training.topics.lonelinessAndSns.title',
    descriptionKey: 'training.topics.lonelinessAndSns.description',
    category: 'emotional',
    estimatedMinutes: 9,
    order: 7,
    contents: [
      {
        id: 'loneliness-article',
        type: 'article',
        titleKey: 'training.topics.lonelinessAndSns.article.title',
        bodyKey: 'training.topics.lonelinessAndSns.article.body',
        order: 1,
      },
      {
        id: 'loneliness-quiz',
        type: 'quiz',
        titleKey: 'training.topics.lonelinessAndSns.quiz.title',
        order: 2,
        questions: [
          {
            id: 'loneliness-q1',
            questionKey: 'training.topics.lonelinessAndSns.quiz.q1.question',
            optionKeys: [
              'training.topics.lonelinessAndSns.quiz.q1.option1',
              'training.topics.lonelinessAndSns.quiz.q1.option2',
              'training.topics.lonelinessAndSns.quiz.q1.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.lonelinessAndSns.quiz.q1.explanation',
          },
          {
            id: 'loneliness-q2',
            questionKey: 'training.topics.lonelinessAndSns.quiz.q2.question',
            optionKeys: [
              'training.topics.lonelinessAndSns.quiz.q2.option1',
              'training.topics.lonelinessAndSns.quiz.q2.option2',
              'training.topics.lonelinessAndSns.quiz.q2.option3',
            ],
            correctIndex: 2,
            explanationKey: 'training.topics.lonelinessAndSns.quiz.q2.explanation',
          },
          {
            id: 'loneliness-q3',
            questionKey: 'training.topics.lonelinessAndSns.quiz.q3.question',
            optionKeys: [
              'training.topics.lonelinessAndSns.quiz.q3.option1',
              'training.topics.lonelinessAndSns.quiz.q3.option2',
              'training.topics.lonelinessAndSns.quiz.q3.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.lonelinessAndSns.quiz.q3.explanation',
          },
        ],
      },
      {
        id: 'loneliness-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.lonelinessAndSns.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'loneliness-prompt1',
            promptKey: 'training.topics.lonelinessAndSns.worksheet.prompt1',
            placeholderKey: 'training.topics.lonelinessAndSns.worksheet.placeholder1',
            minLength: 15,
          },
        ],
      },
    ],
  },

  // ============================================
  // GOAL-BASED TOPICS
  // ============================================

  {
    id: 'screen-time-and-sleep',
    titleKey: 'training.topics.screenTimeAndSleep.title',
    descriptionKey: 'training.topics.screenTimeAndSleep.description',
    category: 'goal',
    estimatedMinutes: 8,
    order: 8,
    contents: [
      {
        id: 'sleep-article',
        type: 'article',
        titleKey: 'training.topics.screenTimeAndSleep.article.title',
        bodyKey: 'training.topics.screenTimeAndSleep.article.body',
        order: 1,
      },
      {
        id: 'sleep-quiz',
        type: 'quiz',
        titleKey: 'training.topics.screenTimeAndSleep.quiz.title',
        order: 2,
        questions: [
          {
            id: 'sleep-q1',
            questionKey: 'training.topics.screenTimeAndSleep.quiz.q1.question',
            optionKeys: [
              'training.topics.screenTimeAndSleep.quiz.q1.option1',
              'training.topics.screenTimeAndSleep.quiz.q1.option2',
              'training.topics.screenTimeAndSleep.quiz.q1.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.screenTimeAndSleep.quiz.q1.explanation',
          },
          {
            id: 'sleep-q2',
            questionKey: 'training.topics.screenTimeAndSleep.quiz.q2.question',
            optionKeys: [
              'training.topics.screenTimeAndSleep.quiz.q2.option1',
              'training.topics.screenTimeAndSleep.quiz.q2.option2',
              'training.topics.screenTimeAndSleep.quiz.q2.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.screenTimeAndSleep.quiz.q2.explanation',
          },
        ],
      },
      {
        id: 'sleep-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.screenTimeAndSleep.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'sleep-prompt1',
            promptKey: 'training.topics.screenTimeAndSleep.worksheet.prompt1',
            placeholderKey: 'training.topics.screenTimeAndSleep.worksheet.placeholder1',
            minLength: 10,
          },
        ],
      },
    ],
  },

  {
    id: 'reclaiming-focus',
    titleKey: 'training.topics.reclaimingFocus.title',
    descriptionKey: 'training.topics.reclaimingFocus.description',
    category: 'goal',
    estimatedMinutes: 10,
    order: 9,
    contents: [
      {
        id: 'focus-article',
        type: 'article',
        titleKey: 'training.topics.reclaimingFocus.article.title',
        bodyKey: 'training.topics.reclaimingFocus.article.body',
        order: 1,
      },
      {
        id: 'focus-quiz',
        type: 'quiz',
        titleKey: 'training.topics.reclaimingFocus.quiz.title',
        order: 2,
        questions: [
          {
            id: 'focus-q1',
            questionKey: 'training.topics.reclaimingFocus.quiz.q1.question',
            optionKeys: [
              'training.topics.reclaimingFocus.quiz.q1.option1',
              'training.topics.reclaimingFocus.quiz.q1.option2',
              'training.topics.reclaimingFocus.quiz.q1.option3',
            ],
            correctIndex: 2,
            explanationKey: 'training.topics.reclaimingFocus.quiz.q1.explanation',
          },
          {
            id: 'focus-q2',
            questionKey: 'training.topics.reclaimingFocus.quiz.q2.question',
            optionKeys: [
              'training.topics.reclaimingFocus.quiz.q2.option1',
              'training.topics.reclaimingFocus.quiz.q2.option2',
              'training.topics.reclaimingFocus.quiz.q2.option3',
            ],
            correctIndex: 1,
            explanationKey: 'training.topics.reclaimingFocus.quiz.q2.explanation',
          },
          {
            id: 'focus-q3',
            questionKey: 'training.topics.reclaimingFocus.quiz.q3.question',
            optionKeys: [
              'training.topics.reclaimingFocus.quiz.q3.option1',
              'training.topics.reclaimingFocus.quiz.q3.option2',
              'training.topics.reclaimingFocus.quiz.q3.option3',
            ],
            correctIndex: 0,
            explanationKey: 'training.topics.reclaimingFocus.quiz.q3.explanation',
          },
        ],
      },
      {
        id: 'focus-worksheet',
        type: 'worksheet',
        titleKey: 'training.topics.reclaimingFocus.worksheet.title',
        order: 3,
        prompts: [
          {
            id: 'focus-prompt1',
            promptKey: 'training.topics.reclaimingFocus.worksheet.prompt1',
            placeholderKey: 'training.topics.reclaimingFocus.worksheet.placeholder1',
            minLength: 15,
          },
        ],
      },
    ],
  },
];

/**
 * Get topics by category
 */
export function getTopicsByCategory(
  category: 'research' | 'emotional' | 'goal'
): TrainingTopic[] {
  return TRAINING_TOPICS.filter((topic) => topic.category === category).sort(
    (a, b) => a.order - b.order
  );
}

/**
 * Get a single topic by ID
 */
export function getTopicById(topicId: string): TrainingTopic | undefined {
  return TRAINING_TOPICS.find((topic) => topic.id === topicId);
}

/**
 * Get total estimated time for all topics
 */
export function getTotalTrainingTime(): number {
  return TRAINING_TOPICS.reduce((sum, topic) => sum + topic.estimatedMinutes, 0);
}

/**
 * Get count of topics per category
 */
export function getTopicCountByCategory(): Record<string, number> {
  return {
    research: TRAINING_TOPICS.filter((t) => t.category === 'research').length,
    emotional: TRAINING_TOPICS.filter((t) => t.category === 'emotional').length,
    goal: TRAINING_TOPICS.filter((t) => t.category === 'goal').length,
  };
}
