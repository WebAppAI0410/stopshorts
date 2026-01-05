/**
 * Performance Monitor for intervention components
 *
 * Tracks and logs performance metrics for NFR-1 requirements:
 * - Intervention screen display: < 500ms
 * - Camera initialization: < 1s
 * - LLM response: < 3s
 *
 * Only outputs logs in __DEV__ mode.
 */

/** Performance thresholds in milliseconds (NFR-1) */
export const PERFORMANCE_THRESHOLDS = {
  /** Intervention screen mount time threshold */
  INTERVENTION_MOUNT: 500,
  /** Camera initialization threshold */
  CAMERA_INIT: 1000,
  /** LLM response time threshold */
  LLM_RESPONSE: 3000,
} as const;

/** Performance measurement labels */
export type PerformanceLabel =
  | 'friction_intervention_mount'
  | 'mirror_intervention_mount'
  | 'ai_intervention_mount'
  | 'camera_init'
  | 'llm_response';

/** Performance measurement result */
interface PerformanceResult {
  label: PerformanceLabel;
  duration: number;
  threshold: number;
  exceededThreshold: boolean;
}

type PerformanceCallback = (result: PerformanceResult) => void;

/**
 * Performance monitor singleton for tracking component performance
 */
export const performanceMonitor = {
  /** Map of active performance marks */
  marks: new Map<PerformanceLabel, number>(),

  /** Optional callback for test/analytics purposes */
  onMeasure: null as PerformanceCallback | null,

  /**
   * Start a performance measurement
   * @param label - Unique label for the measurement
   */
  start(label: PerformanceLabel): void {
    this.marks.set(label, performance.now());
  },

  /**
   * End a performance measurement and log the result
   * @param label - Label of the measurement to end
   * @param threshold - Optional threshold to check against (ms)
   * @returns Duration in milliseconds, or null if no start mark found
   */
  end(label: PerformanceLabel, threshold?: number): number | null {
    const startTime = this.marks.get(label);
    if (startTime === undefined) {
      if (__DEV__) {
        console.warn(`[Performance] No start mark found for: ${label}`);
      }
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    const thresholdValue = threshold ?? this.getDefaultThreshold(label);
    const exceededThreshold = thresholdValue !== null && duration > thresholdValue;

    if (__DEV__) {
      const status = exceededThreshold ? '⚠️ SLOW' : '✓';
      const thresholdStr = thresholdValue !== null ? ` (threshold: ${thresholdValue}ms)` : '';
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms ${status}${thresholdStr}`);
    }

    // Call optional callback for testing/analytics
    if (this.onMeasure && thresholdValue !== null) {
      this.onMeasure({
        label,
        duration,
        threshold: thresholdValue,
        exceededThreshold,
      });
    }

    return duration;
  },

  /**
   * Get default threshold for a label
   * @param label - Performance label
   * @returns Default threshold in ms, or null if none
   */
  getDefaultThreshold(label: PerformanceLabel): number | null {
    switch (label) {
      case 'friction_intervention_mount':
      case 'mirror_intervention_mount':
      case 'ai_intervention_mount':
        return PERFORMANCE_THRESHOLDS.INTERVENTION_MOUNT;
      case 'camera_init':
        return PERFORMANCE_THRESHOLDS.CAMERA_INIT;
      case 'llm_response':
        return PERFORMANCE_THRESHOLDS.LLM_RESPONSE;
      default:
        return null;
    }
  },

  /**
   * Clear all active marks (useful for cleanup/testing)
   */
  clear(): void {
    this.marks.clear();
  },
};

/**
 * Hook-friendly performance tracking function
 * Returns start/end functions bound to a specific label
 */
export function createPerformanceTracker(label: PerformanceLabel) {
  return {
    start: () => performanceMonitor.start(label),
    end: (threshold?: number) => performanceMonitor.end(label, threshold),
  };
}
