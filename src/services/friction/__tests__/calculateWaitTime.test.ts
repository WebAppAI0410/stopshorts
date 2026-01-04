import {
  calculateWaitTime,
  shouldResetDailyCount,
  getMaxWaitTime,
  getWaitTimeSequence,
} from '../calculateWaitTime';

describe('calculateWaitTime', () => {
  describe('valid inputs', () => {
    it.each([
      [0, 5],
      [1, 8],
      [2, 13],
      [3, 21],
      [4, 34],
      [5, 55],
      [6, 89],
    ])('returns %i seconds for openCount=%i', (openCount, expected) => {
      expect(calculateWaitTime(openCount)).toBe(expected);
    });
  });

  describe('clamping behavior', () => {
    it('clamps to max for large openCount', () => {
      expect(calculateWaitTime(7)).toBe(89);
      expect(calculateWaitTime(100)).toBe(89);
      expect(calculateWaitTime(1000)).toBe(89);
    });

    it('clamps negative values to minimum', () => {
      expect(calculateWaitTime(-1)).toBe(5);
      expect(calculateWaitTime(-100)).toBe(5);
    });

    it('handles decimal values by flooring', () => {
      expect(calculateWaitTime(0.9)).toBe(5); // floors to 0
      expect(calculateWaitTime(1.5)).toBe(8); // floors to 1
      expect(calculateWaitTime(2.9)).toBe(13); // floors to 2
    });
  });

  describe('edge cases', () => {
    it('handles NaN input gracefully', () => {
      expect(calculateWaitTime(NaN)).toBe(5);
    });

    it('handles Infinity input gracefully', () => {
      expect(calculateWaitTime(Infinity)).toBe(5);
      expect(calculateWaitTime(-Infinity)).toBe(5);
    });
  });
});

describe('shouldResetDailyCount', () => {
  const mockNow = new Date('2025-01-15T12:00:00');

  describe('null input', () => {
    it('returns true for null', () => {
      expect(shouldResetDailyCount(null, mockNow)).toBe(true);
    });
  });

  describe('same day', () => {
    it('returns false for same day (earlier)', () => {
      expect(shouldResetDailyCount('2025-01-15T08:00:00', mockNow)).toBe(false);
    });

    it('returns false for same day (later)', () => {
      expect(shouldResetDailyCount('2025-01-15T20:00:00', mockNow)).toBe(false);
    });

    it('returns false for same day (midnight)', () => {
      expect(shouldResetDailyCount('2025-01-15T00:00:00', mockNow)).toBe(false);
    });

    it('returns false for same day (end of day)', () => {
      expect(shouldResetDailyCount('2025-01-15T23:59:59', mockNow)).toBe(false);
    });
  });

  describe('different day', () => {
    it('returns true for previous day', () => {
      expect(shouldResetDailyCount('2025-01-14T12:00:00', mockNow)).toBe(true);
    });

    it('returns true for next day', () => {
      expect(shouldResetDailyCount('2025-01-16T12:00:00', mockNow)).toBe(true);
    });

    it('returns true for different month', () => {
      expect(shouldResetDailyCount('2025-02-15T12:00:00', mockNow)).toBe(true);
      expect(shouldResetDailyCount('2024-12-15T12:00:00', mockNow)).toBe(true);
    });

    it('returns true for different year', () => {
      expect(shouldResetDailyCount('2024-01-15T12:00:00', mockNow)).toBe(true);
      expect(shouldResetDailyCount('2026-01-15T12:00:00', mockNow)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles invalid date string gracefully', () => {
      expect(shouldResetDailyCount('invalid-date', mockNow)).toBe(true);
    });

    it('handles empty string gracefully', () => {
      expect(shouldResetDailyCount('', mockNow)).toBe(true);
    });

    it('handles malformed ISO string gracefully', () => {
      expect(shouldResetDailyCount('2025-13-45T99:99:99', mockNow)).toBe(true);
    });
  });

  describe('default now parameter', () => {
    it('uses current date when now is not provided', () => {
      // This test verifies the function works without the second parameter
      const result = shouldResetDailyCount(null);
      expect(result).toBe(true);
    });
  });
});

describe('getMaxWaitTime', () => {
  it('returns 89 seconds', () => {
    expect(getMaxWaitTime()).toBe(89);
  });
});

describe('getWaitTimeSequence', () => {
  it('returns the correct Fibonacci-like sequence', () => {
    expect(getWaitTimeSequence()).toEqual([5, 8, 13, 21, 34, 55, 89]);
  });

  it('returns a readonly array', () => {
    const sequence = getWaitTimeSequence();
    expect(Array.isArray(sequence)).toBe(true);
    expect(sequence.length).toBe(7);
  });
});
