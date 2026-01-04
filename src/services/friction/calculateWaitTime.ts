/**
 * Friction Intervention Wait Time Calculator
 *
 * Uses a Fibonacci-like sequence for progressive friction:
 * 5 → 8 → 13 → 21 → 34 → 55 → 89 seconds
 *
 * Each time the user tries to open a target app within the same day,
 * the wait time increases according to this sequence.
 */

// Fibonacci-like wait time sequence (in seconds)
const WAIT_SEQUENCE = [5, 8, 13, 21, 34, 55, 89];

/**
 * Calculate wait time based on daily open count
 * @param openCount - Number of times user has opened target apps today (0-indexed for first open)
 * @returns Wait time in seconds
 */
export function calculateWaitTime(openCount: number): number {
  // openCount starts from 0, so first open = 5 seconds
  const index = Math.min(Math.max(0, openCount), WAIT_SEQUENCE.length - 1);
  return WAIT_SEQUENCE[index];
}

/**
 * Check if daily count should be reset (new day started)
 * @param lastOpenDate - ISO date string of last open, or null if never opened
 * @returns true if count should be reset
 */
export function shouldResetDailyCount(lastOpenDate: string | null): boolean {
  if (!lastOpenDate) return true;

  const today = new Date();
  const lastDate = new Date(lastOpenDate);

  // Compare year, month, day in local timezone
  return (
    today.getFullYear() !== lastDate.getFullYear() ||
    today.getMonth() !== lastDate.getMonth() ||
    today.getDate() !== lastDate.getDate()
  );
}

/**
 * Get the maximum wait time in the sequence
 */
export function getMaxWaitTime(): number {
  return WAIT_SEQUENCE[WAIT_SEQUENCE.length - 1];
}

/**
 * Get wait time sequence for display purposes
 */
export function getWaitTimeSequence(): readonly number[] {
  return WAIT_SEQUENCE;
}
