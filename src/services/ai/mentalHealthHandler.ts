/**
 * Mental Health Crisis Detection Handler
 * Detects crisis keywords and provides appropriate responses with professional resources
 */

import i18n from '../../i18n';

/**
 * Crisis keywords that indicate potential mental health emergency
 * These are commonly used expressions in Japanese that may indicate suicidal ideation or severe distress
 * Includes both kanji and hiragana representations to catch all variations (Codex P1 fix)
 */
const CRISIS_KEYWORDS = [
  // Kanji representations
  '死にたい',
  '自殺',
  '消えたい',
  'もう無理',
  '生きていたくない',
  '楽になりたい',
  '終わりにしたい',
  '生きる意味',
  '死んでしまいたい',
  '自分を傷つけたい',
  // Hiragana representations for comprehensive detection
  'しにたい',
  'じさつ',
  'きえたい',
  'もうむり',
  'いきていたくない',
  'らくになりたい',
  'おわりにしたい',
  'いきるいみ',
  'しんでしまいたい',
  'じぶんをきずつけたい',
] as const;

/**
 * Crisis detection result
 */
export interface CrisisDetectionResult {
  /** Whether a crisis keyword was detected */
  isCrisis: boolean;
  /** The matched keyword if detected */
  matchedKeyword?: string;
}

/**
 * Detects crisis keywords in user message
 * @param message - The user's message to check
 * @returns Detection result indicating if crisis keywords were found
 */
export function detectCrisisKeywords(message: string): CrisisDetectionResult {
  const normalizedMessage = message.toLowerCase();

  for (const keyword of CRISIS_KEYWORDS) {
    if (normalizedMessage.includes(keyword)) {
      return {
        isCrisis: true,
        matchedKeyword: keyword,
      };
    }
  }

  return {
    isCrisis: false,
  };
}

/**
 * Gets the crisis response message with professional resources
 * Uses i18n for localized response
 * @returns The crisis response message
 */
export function getCrisisResponse(): string {
  return i18n.t('ai.crisis.response');
}

/**
 * Checks if a message indicates crisis and returns appropriate response
 * @param message - The user's message
 * @returns Crisis response if detected, undefined otherwise
 */
export function handleCrisisIfDetected(message: string): string | undefined {
  const result = detectCrisisKeywords(message);

  if (result.isCrisis) {
    return getCrisisResponse();
  }

  return undefined;
}
