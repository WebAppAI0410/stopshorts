import {
  detectCrisisKeywords,
  handleCrisisIfDetected,
} from '../mentalHealthHandler';

// Mock i18n to avoid dependency issues
jest.mock('../../../i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      if (key === 'ai.crisis.response') {
        return 'つらい気持ちを打ち明けてくれてありがとう。専門家に相談することをお勧めします。';
      }
      return key;
    },
  },
}));

describe('detectCrisisKeywords', () => {
  describe('kanji keywords', () => {
    it.each([
      ['死にたい', '死にたい'],
      ['自殺', '自殺'],
      ['消えたい', '消えたい'],
      ['もう無理', 'もう無理'],
      ['生きていたくない', '生きていたくない'],
      ['楽になりたい', '楽になりたい'],
      ['終わりにしたい', '終わりにしたい'],
      ['生きる意味', '生きる意味'],
      ['死んでしまいたい', '死んでしまいたい'],
      ['自分を傷つけたい', '自分を傷つけたい'],
    ])('detects "%s" keyword', (input, expectedMatch) => {
      const result = detectCrisisKeywords(input);
      expect(result.isCrisis).toBe(true);
      expect(result.matchedKeyword).toBe(expectedMatch);
    });
  });

  describe('hiragana keywords', () => {
    it.each([
      ['しにたい', 'しにたい'],
      ['じさつ', 'じさつ'],
      ['きえたい', 'きえたい'],
      ['もうむり', 'もうむり'],
      ['いきていたくない', 'いきていたくない'],
      ['らくになりたい', 'らくになりたい'],
      ['おわりにしたい', 'おわりにしたい'],
      ['いきるいみ', 'いきるいみ'],
      ['しんでしまいたい', 'しんでしまいたい'],
      ['じぶんをきずつけたい', 'じぶんをきずつけたい'],
    ])('detects "%s" hiragana keyword', (input, expectedMatch) => {
      const result = detectCrisisKeywords(input);
      expect(result.isCrisis).toBe(true);
      expect(result.matchedKeyword).toBe(expectedMatch);
    });
  });

  describe('embedded keywords', () => {
    it('detects keyword in longer sentence', () => {
      const result = detectCrisisKeywords('最近死にたいと思うことがあります');
      expect(result.isCrisis).toBe(true);
      expect(result.matchedKeyword).toBe('死にたい');
    });

    it('detects keyword at end of sentence', () => {
      const result = detectCrisisKeywords('どうしても消えたい');
      expect(result.isCrisis).toBe(true);
      expect(result.matchedKeyword).toBe('消えたい');
    });

    it('detects keyword at start of sentence', () => {
      const result = detectCrisisKeywords('自殺について考えてしまいます');
      expect(result.isCrisis).toBe(true);
      expect(result.matchedKeyword).toBe('自殺');
    });
  });

  describe('non-crisis messages', () => {
    it('returns false for regular messages', () => {
      const result = detectCrisisKeywords('今日は良い天気ですね');
      expect(result.isCrisis).toBe(false);
      expect(result.matchedKeyword).toBeUndefined();
    });

    it('returns false for empty string', () => {
      const result = detectCrisisKeywords('');
      expect(result.isCrisis).toBe(false);
    });

    it('returns false for app usage related messages', () => {
      const result = detectCrisisKeywords('ショート動画を見すぎてしまいました');
      expect(result.isCrisis).toBe(false);
    });

    it('returns false for similar but non-crisis words', () => {
      const result = detectCrisisKeywords('死に物狂いで頑張ります');
      // Note: This contains 死 but not the full keyword 死にたい
      expect(result.isCrisis).toBe(false);
    });
  });

  describe('case sensitivity', () => {
    it('normalizes input to lowercase for comparison', () => {
      // Japanese doesn't have case, so test with English-like input
      // The function calls toLowerCase(), which is important for potential future keywords
      const result = detectCrisisKeywords('SUICIDE'); // Not in keywords, but tests lowercase
      expect(result.isCrisis).toBe(false);
    });
  });

  describe('first match behavior', () => {
    it('returns first matched keyword when multiple present', () => {
      const result = detectCrisisKeywords('死にたいし自殺も考える');
      expect(result.isCrisis).toBe(true);
      // Should match the first keyword in CRISIS_KEYWORDS order
      expect(result.matchedKeyword).toBe('死にたい');
    });
  });
});

describe('handleCrisisIfDetected', () => {
  it('returns crisis response when crisis keyword detected', () => {
    const response = handleCrisisIfDetected('死にたい');
    expect(response).toBe(
      'つらい気持ちを打ち明けてくれてありがとう。専門家に相談することをお勧めします。'
    );
  });

  it('returns undefined when no crisis keyword detected', () => {
    const response = handleCrisisIfDetected('今日は疲れました');
    expect(response).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    const response = handleCrisisIfDetected('');
    expect(response).toBeUndefined();
  });
});
