/**
 * Training Module Type Definitions
 * Psychological training content types for habit change support
 */

/**
 * Type of training content
 * - article: Educational text content
 * - quiz: Knowledge check questions
 * - worksheet: Self-reflection prompts
 */
export type ContentType = 'article' | 'quiz' | 'worksheet';

/**
 * Training category based on psychological approach
 * - research: Science-backed habit change techniques
 * - emotional: Emotional awareness and management
 * - goal: Goal-setting and achievement strategies
 */
export type TrainingCategory = 'research' | 'emotional' | 'goal';

/**
 * A complete training topic with multiple content items
 */
export interface TrainingTopic {
  /** Unique identifier for the topic */
  id: string;
  /** i18n key for the title (e.g., 'training.topics.habitLoop.title') */
  titleKey: string;
  /** i18n key for the description */
  descriptionKey: string;
  /** Category of the topic */
  category: TrainingCategory;
  /** Estimated completion time in minutes */
  estimatedMinutes: number;
  /** List of content items within this topic */
  contents: TrainingContent[];
  /** Order for display (lower = first) */
  order: number;
  /** Whether this topic is locked (requires previous completion) */
  locked?: boolean;
  /** Topic IDs that must be completed before this one */
  prerequisites?: string[];
  /** Related app features that users can try after learning */
  relatedFeatures?: RelatedFeature[];
}

/**
 * Individual content item within a training topic
 */
export interface TrainingContent {
  /** Unique identifier for the content */
  id: string;
  /** Type of content */
  type: ContentType;
  /** i18n key for the content title */
  titleKey: string;
  /** i18n key for article body (markdown format) - only for 'article' type */
  bodyKey?: string;
  /** Quiz questions - only for 'quiz' type */
  questions?: QuizQuestion[];
  /** Worksheet prompts - only for 'worksheet' type */
  prompts?: WorksheetPrompt[];
  /** Order within the topic (lower = first) */
  order: number;
}

/**
 * Quiz question with multiple choice options
 */
export interface QuizQuestion {
  /** Unique identifier for the question */
  id: string;
  /** i18n key for the question text */
  questionKey: string;
  /** i18n keys for the answer options */
  optionKeys: string[];
  /** Index of the correct option (0-based) */
  correctIndex: number;
  /** i18n key for explanation shown after answering */
  explanationKey: string;
}

/**
 * Worksheet prompt for self-reflection
 */
export interface WorksheetPrompt {
  /** Unique identifier for the prompt */
  id: string;
  /** i18n key for the prompt text */
  promptKey: string;
  /** i18n key for placeholder text in input */
  placeholderKey: string;
  /** Minimum character length for valid response */
  minLength?: number;
  /** Maximum character length for response */
  maxLength?: number;
}

/**
 * User's progress through training content
 */
export interface TrainingProgress {
  /** ID of the topic this progress belongs to */
  topicId: string;
  /** IDs of completed content items */
  completedContents: string[];
  /** Quiz scores by content ID (percentage 0-100) */
  quizScores: Record<string, number>;
  /** Worksheet answers by prompt ID */
  worksheetAnswers: Record<string, string>;
  /** ISO date string of last access */
  lastAccessedAt: string;
  /** Whether the entire topic is completed */
  isCompleted: boolean;
  /** ISO date string when topic was completed */
  completedAt?: string;
}

/**
 * Overall training statistics for user profile
 */
export interface TrainingStats {
  /** Total number of completed topics */
  completedTopicsCount: number;
  /** Total number of completed content items */
  completedContentsCount: number;
  /** Average quiz score across all quizzes (0-100) */
  averageQuizScore: number;
  /** Total time spent on training in minutes */
  totalTimeSpentMinutes: number;
  /** Current streak in days */
  currentStreak: number;
  /** Longest streak in days */
  longestStreak: number;
  /** ISO date string of last training session */
  lastSessionAt: string | null;
}

/**
 * Related app feature that can be linked from a training topic
 */
export interface RelatedFeature {
  /** Unique identifier for the feature */
  id: string;
  /** i18n key for the feature title */
  titleKey: string;
  /** i18n key for the feature description */
  descriptionKey: string;
  /** Route to navigate to */
  route: string;
  /** Icon name from Ionicons */
  icon: string;
}

/**
 * Default training stats for new users
 */
export const DEFAULT_TRAINING_STATS: TrainingStats = {
  completedTopicsCount: 0,
  completedContentsCount: 0,
  averageQuizScore: 0,
  totalTimeSpentMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionAt: null,
};
