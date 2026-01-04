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
const WAIT_SEQUENCE = [5, 8, 13, 21, 34, 55, 89] as const;

/**
 * Calculate wait time based on daily open count
 * @param openCount - Number of times user has opened target apps today (0-indexed for first open)
 * @returns Wait time in seconds. Returns minimum (5s) for invalid inputs.
 * @example
 * calculateWaitTime(0) // => 5
 * calculateWaitTime(3) // => 21
 * calculateWaitTime(10) // => 89 (clamped to max)
 */
export function calculateWaitTime(openCount: number): number {
  // Handle NaN or invalid inputs
  if (!Number.isFinite(openCount)) {
    return WAIT_SEQUENCE[0];
  }
  // openCount starts from 0, so first open = 5 seconds
  const index = Math.min(Math.max(0, Math.floor(openCount)), WAIT_SEQUENCE.length - 1);
  return WAIT_SEQUENCE[index];
}

/**
 * Check if daily count should be reset (new day started)
 * @param lastOpenDate - ISO date string of last open, or null if never opened
 * @param now - Current date for comparison (defaults to new Date(), injectable for testing)
 * @returns true if count should be reset
 * @example
 * shouldResetDailyCount(null) // => true
 * shouldResetDailyCount('2025-01-15T10:00:00', new Date('2025-01-15T20:00:00')) // => false
 * shouldResetDailyCount('2025-01-14T10:00:00', new Date('2025-01-15T10:00:00')) // => true
 */
export function shouldResetDailyCount(
  lastOpenDate: string | null,
  now: Date = new Date()
): boolean {
  if (!lastOpenDate) return true;

  try {
    const lastDate = new Date(lastOpenDate);
    // Handle invalid date strings
    if (!Number.isFinite(lastDate.getTime())) {
      return true;
    }

    // Compare year, month, day in local timezone
    return (
      now.getFullYear() !== lastDate.getFullYear() ||
      now.getMonth() !== lastDate.getMonth() ||
      now.getDate() !== lastDate.getDate()
    );
  } catch {
    // Fallback for any parsing errors
    return true;
  }
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
