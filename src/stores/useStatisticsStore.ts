/**
 * Statistics Store for StopShorts
 * Manages urge surfing statistics, badges, and usage data
 *
 * This file re-exports from the sliced implementation for backward compatibility.
 * See src/stores/statistics/ for the actual implementation.
 */

// Re-export everything from the sliced implementation
export { useStatisticsStore } from './statistics';
export type { InterventionRecord, UrgeSurfingRecordInput, InterventionInput } from './statistics';
