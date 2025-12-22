import { getMockDailyBreakdown, getMockScreenTimeData } from '../screenTime';

describe('screenTime mock data', () => {
  const fixedNow = new Date('2025-12-22T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calculates weekly totals and averages from the breakdown', () => {
    const data = getMockScreenTimeData('moderate');
    const totalFromApps = data.appBreakdown.reduce(
      (sum, app) => sum + app.weeklyMinutes,
      0
    );

    expect(data.weeklyTotal).toBe(totalFromApps);
    expect(data.dailyAverage).toBe(Math.round(totalFromApps / 7));
    expect(data.peakHours).toHaveLength(3);
    expect(data.lastUpdated).toBe(new Date().toISOString());
  });

  it('returns a 7-day breakdown ending today', () => {
    const breakdown = getMockDailyBreakdown('light');
    const dates = breakdown.map((day) => day.date);

    expect(breakdown).toHaveLength(7);
    expect(new Set(dates).size).toBe(7);
    expect(dates[dates.length - 1]).toBe(new Date().toISOString().split('T')[0]);
  });
});
