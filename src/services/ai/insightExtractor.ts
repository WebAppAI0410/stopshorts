/**
 * Insight Extractor
 * Rule-based extraction of user insights from conversation messages
 */

import type { Message } from '../../types/ai';

/**
 * Insight extraction patterns for rule-based analysis
 * Each pattern has a regex and a template for extracting the insight
 */
interface InsightPattern {
  regex: RegExp;
  template: (match: RegExpMatchArray, content: string) => string | null;
}

/**
 * Japanese keyword patterns to detect user insights
 */
const INSIGHT_PATTERNS: InsightPattern[] = [
  // Pattern: "〜だと気づいた" / "〜ことに気づいた" / "〜に気づきました"
  {
    regex: /(.{3,30})(だと|ことに|って|に)気[づつ](い|き)(た|ました)/,
    template: (match) => match[1]?.trim() || null,
  },
  // Pattern: "〜だとわかった" / "〜ことがわかった"
  {
    regex: /(.{3,30})(だと|ことが|って)わか(った|りました)/,
    template: (match) => match[1]?.trim() || null,
  },
  // Pattern: "〜かもしれない" (self-reflection)
  {
    regex: /(.{5,40})かもしれない/,
    template: (match) => match[1]?.trim() || null,
  },
  // Pattern: "〜だから〜してしまう" (cause-effect realization)
  {
    regex: /(.{2,25})だから(.{2,25})(してしまう|しちゃう|なる|なっちゃう|開いてしまう)/,
    template: (match) => `${match[1]}だから${match[2]}${match[3]}`,
  },
  // Pattern: "〜が原因" / "〜が理由"
  {
    regex: /(.{3,30})が(原因|理由)(だ|です|かも)/,
    template: (match) => `${match[1]}が${match[2]}`,
  },
  // Pattern: "〜するとき/時に〜したくなる" (trigger identification)
  {
    regex: /(.{2,20})(している|してる|する|した|の|って|てる)(とき|時|後|前)に?(.{2,25})(したくなる|見たくなる|開きたくなる)/,
    template: (match) =>
      `${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}`,
  },
  // Pattern: "〜と思う" / "〜と思った" (self-analysis)
  {
    regex: /(.{5,40})と思(う|った|います|いました)/,
    template: (match, content) => {
      // Only extract if content contains insight-related keywords
      const insightKeywords = ['原因', '理由', 'から', 'ため', '癖', '習慣', 'パターン'];
      if (insightKeywords.some((k) => content.includes(k))) {
        return match[1]?.trim() || null;
      }
      return null;
    },
  },
  // Pattern: "実は〜" (honest self-disclosure)
  {
    regex: /実は(.{10,40})/,
    template: (match) => match[1]?.trim() || null,
  },
  // Pattern: "本当は〜" (true feelings)
  {
    regex: /本当は(.{10,40})/,
    template: (match) => match[1]?.trim() || null,
  },
];

/**
 * Maximum number of insights to return per session
 */
export const MAX_INSIGHTS = 5;

/**
 * Minimum insight length to be considered valid
 */
export const MIN_INSIGHT_LENGTH = 8;

/**
 * Extract insights from messages using rule-based pattern matching
 * Analyzes user messages for self-realizations, trigger identifications,
 * and behavioral patterns.
 *
 * @param messages - Array of conversation messages
 * @returns Array of extracted insight strings (max 5)
 */
export function extractInsights(messages: Message[]): string[] {
  const insights: string[] = [];
  const seenInsights = new Set<string>();

  // Only analyze user messages (not AI responses)
  const userMessages = messages.filter((m) => m.role === 'user');

  for (const message of userMessages) {
    const content = message.content;

    for (const pattern of INSIGHT_PATTERNS) {
      const match = content.match(pattern.regex);
      if (match) {
        const insight = pattern.template(match, content);

        if (
          insight &&
          insight.length >= MIN_INSIGHT_LENGTH &&
          !seenInsights.has(insight)
        ) {
          seenInsights.add(insight);
          insights.push(insight);

          // Stop if we've reached the maximum
          if (insights.length >= MAX_INSIGHTS) {
            return insights;
          }
        }
      }
    }
  }

  return insights;
}

// Export the patterns for testing purposes
export const _testExports = {
  INSIGHT_PATTERNS,
};
