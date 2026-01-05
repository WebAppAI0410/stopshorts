import {
  estimateTokens,
  buildSystemPrompt,
  MODE_PROMPTS,
  buildLongTermSummary,
  formatConversationHistory,
  wouldExceedContext,
} from '../promptBuilder';
import type { LongTermMemory, Message } from '../../../types/ai';
import { TOKEN_BUDGET, MAX_CONTEXT_TOKENS } from '../../../types/ai';

// Mock useAppStore to avoid Zustand store issues in tests
jest.mock('../../../stores/useAppStore', () => ({
  useAppStore: {
    getState: () => ({
      trainingProgress: {},
      getCompletedTopicIds: () => [],
    }),
  },
}));

describe('estimateTokens', () => {
  describe('basic calculations', () => {
    it('returns 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('estimates tokens for short English text', () => {
      // "hello" = 5 chars / 2.5 = 2 tokens
      expect(estimateTokens('hello')).toBe(2);
    });

    it('estimates tokens for Japanese text', () => {
      // "こんにちは" = 5 chars / 2.5 = 2 tokens
      expect(estimateTokens('こんにちは')).toBe(2);
    });
  });

  describe('scaling behavior', () => {
    it('scales linearly with text length', () => {
      const shortText = 'あ'.repeat(10); // 10 chars -> 4 tokens
      const longText = 'あ'.repeat(100); // 100 chars -> 40 tokens

      expect(estimateTokens(shortText)).toBe(4);
      expect(estimateTokens(longText)).toBe(40);
    });

    it('rounds up for fractional results', () => {
      // "ab" = 2 chars / 2.5 = 0.8 -> ceil -> 1
      expect(estimateTokens('ab')).toBe(1);
      // "abc" = 3 chars / 2.5 = 1.2 -> ceil -> 2
      expect(estimateTokens('abc')).toBe(2);
    });
  });

  describe('mixed content', () => {
    it('handles mixed Japanese and English', () => {
      // "Hello世界" = 7 chars / 2.5 = 2.8 -> 3
      expect(estimateTokens('Hello世界')).toBe(3);
    });

    it('handles text with spaces and punctuation', () => {
      // "Hello, World!" = 13 chars / 2.5 = 5.2 -> 6
      expect(estimateTokens('Hello, World!')).toBe(6);
    });

    it('handles newlines', () => {
      // "line1\nline2" = 11 chars / 2.5 = 4.4 -> 5
      expect(estimateTokens('line1\nline2')).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('handles single character', () => {
      // 1 char / 2.5 = 0.4 -> ceil -> 1
      expect(estimateTokens('a')).toBe(1);
    });

    it('handles whitespace only', () => {
      // "   " = 3 chars / 2.5 = 1.2 -> 2
      expect(estimateTokens('   ')).toBe(2);
    });

    it('handles emoji', () => {
      // Emoji may be multiple code points
      const result = estimateTokens('😀');
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('buildSystemPrompt', () => {
  it('builds prompt with supportive persona', () => {
    const prompt = buildSystemPrompt('supportive');
    expect(prompt).toContain('あなたはStopShortsアプリのAIアシスタント');
    expect(prompt).toContain('励まし型');
    expect(prompt).toContain('温かく、サポーティブ');
  });

  it('builds prompt with direct persona', () => {
    const prompt = buildSystemPrompt('direct');
    expect(prompt).toContain('あなたはStopShortsアプリのAIアシスタント');
    expect(prompt).toContain('ストレート型');
    expect(prompt).toContain('率直に、正直に');
  });

  it('includes mode prompt when specified', () => {
    const prompt = buildSystemPrompt('supportive', 'explore');
    expect(prompt).toContain('原因を探る');
  });

  it('uses free mode by default', () => {
    const prompt = buildSystemPrompt('supportive');
    expect(prompt).toContain(MODE_PROMPTS.free);
  });

  it.each(['explore', 'plan', 'training', 'reflect', 'free'] as const)(
    'includes correct mode prompt for %s',
    (mode) => {
      const prompt = buildSystemPrompt('supportive', mode);
      expect(prompt).toContain(MODE_PROMPTS[mode]);
    }
  );
});

describe('buildLongTermSummary', () => {
  it('returns empty string for null memory', () => {
    expect(buildLongTermSummary(null)).toBe('');
  });

  it('includes confirmed insights', () => {
    const memory: LongTermMemory = {
      confirmedInsights: [
        { content: '夜に開きやすい', confirmedByUser: true, createdAt: new Date().toISOString() },
      ],
      identifiedTriggers: [],
      effectiveStrategies: [],
    };

    const summary = buildLongTermSummary(memory);
    expect(summary).toContain('夜に開きやすい');
    expect(summary).toContain('確認済みの洞察');
  });

  it('excludes unconfirmed insights', () => {
    const memory: LongTermMemory = {
      confirmedInsights: [
        { content: '未確認の洞察', confirmedByUser: false, createdAt: new Date().toISOString() },
      ],
      identifiedTriggers: [],
      effectiveStrategies: [],
    };

    const summary = buildLongTermSummary(memory);
    expect(summary).not.toContain('未確認の洞察');
  });

  it('includes top triggers by frequency', () => {
    const memory: LongTermMemory = {
      confirmedInsights: [],
      identifiedTriggers: [
        { trigger: '退屈', frequency: 5, firstSeen: '', lastSeen: '' },
        { trigger: 'ストレス', frequency: 10, firstSeen: '', lastSeen: '' },
      ],
      effectiveStrategies: [],
    };

    const summary = buildLongTermSummary(memory);
    expect(summary).toContain('ストレス');
    expect(summary).toContain('開くきっかけ');
  });

  it('includes effective strategies above threshold', () => {
    const memory: LongTermMemory = {
      confirmedInsights: [],
      identifiedTriggers: [],
      effectiveStrategies: [
        { description: '深呼吸', effectiveness: 0.8, usageCount: 5 },
        { description: '散歩', effectiveness: 0.5, usageCount: 3 }, // Below threshold
      ],
    };

    const summary = buildLongTermSummary(memory);
    expect(summary).toContain('深呼吸');
    expect(summary).not.toContain('散歩');
  });

  it('returns empty string when memory has no relevant data', () => {
    const memory: LongTermMemory = {
      confirmedInsights: [],
      identifiedTriggers: [],
      effectiveStrategies: [],
    };

    expect(buildLongTermSummary(memory)).toBe('');
  });
});

describe('formatConversationHistory', () => {
  it('formats messages correctly', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'こんにちは', timestamp: Date.now() },
      { id: '2', role: 'assistant', content: 'やあ', timestamp: Date.now() },
    ];

    const formatted = formatConversationHistory(messages);
    expect(formatted).toContain('ユーザー: こんにちは');
    expect(formatted).toContain('AI: やあ');
  });

  it('returns empty string for empty messages', () => {
    expect(formatConversationHistory([])).toBe('');
  });

  it('truncates messages to fit token budget', () => {
    const longMessage = 'あ'.repeat(1000);
    const messages: Message[] = [
      { id: '1', role: 'user', content: longMessage, timestamp: Date.now() },
      { id: '2', role: 'user', content: longMessage, timestamp: Date.now() },
      { id: '3', role: 'user', content: 'recent', timestamp: Date.now() },
    ];

    // With a very small token limit, should prioritize recent messages
    const formatted = formatConversationHistory(messages, 10);
    expect(formatted).toContain('recent');
  });

  it('preserves message order (oldest first in output)', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'first', timestamp: Date.now() },
      { id: '2', role: 'assistant', content: 'second', timestamp: Date.now() },
      { id: '3', role: 'user', content: 'third', timestamp: Date.now() },
    ];

    const formatted = formatConversationHistory(messages);
    const firstIndex = formatted.indexOf('first');
    const secondIndex = formatted.indexOf('second');
    const thirdIndex = formatted.indexOf('third');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });
});

describe('wouldExceedContext', () => {
  it('returns false when within budget', () => {
    const result = wouldExceedContext(1000, 100);
    expect(result).toBe(false);
  });

  it('returns true when exceeding max context', () => {
    const result = wouldExceedContext(MAX_CONTEXT_TOKENS - 100, 500);
    expect(result).toBe(true);
  });

  it('accounts for response buffer', () => {
    // Current tokens + new message + response buffer should not exceed max
    const currentTokens = MAX_CONTEXT_TOKENS - TOKEN_BUDGET.responseBuffer - 100;
    expect(wouldExceedContext(currentTokens, 100)).toBe(false);
    expect(wouldExceedContext(currentTokens, 101)).toBe(true);
  });

  it('returns true at exact boundary', () => {
    const currentTokens = MAX_CONTEXT_TOKENS - TOKEN_BUDGET.responseBuffer;
    expect(wouldExceedContext(currentTokens, 1)).toBe(true);
  });
});
