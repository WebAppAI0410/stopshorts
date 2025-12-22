import { getCoachingContext, getPersonalizedMessage } from '../personalization';
import type { SleepProfile } from '../../types';

describe('personalization', () => {
  const sleepProfile: SleepProfile = { bedtime: '23:00', wakeTime: '07:00' };
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  it('uses sleep critical message late at night even for non-sleep purposes', () => {
    jest.setSystemTime(new Date(2025, 11, 22, 1, 0, 0));

    const result = getPersonalizedMessage('work', sleepProfile, null, null);

    expect(result.warningLevel).toBe('critical');
    expect(result.message).toBe('就寝時間を過ぎています。今すぐ休みましょう');
  });

  it('maps goal to purpose when using options object', () => {
    jest.setSystemTime(new Date(2025, 11, 22, 13, 0, 0));

    const result = getPersonalizedMessage({
      goal: 'time',
      sleepProfile,
    });

    expect(result.warningLevel).toBe('low');
    expect(result.message).toBe('あと少しで今日のタスクが完了します');
  });

  it('returns critical coaching hints for late-night sessions', () => {
    jest.setSystemTime(new Date(2025, 11, 22, 1, 30, 0));

    const context = getCoachingContext('study', sleepProfile);

    expect(context.suggestedThresholdMinutes).toBe(3);
    expect(context.uiHints.useWarmColors).toBe(true);
    expect(context.uiHints.showWarningIcon).toBe(true);
    expect(context.uiHints.emphasizeSleep).toBe(true);
  });
});
