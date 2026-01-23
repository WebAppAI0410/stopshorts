/**
 * Statistics Store
 * Manages urge surfing statistics, badges, and usage data
 *
 * Architecture: Zustand Slice Pattern
 * - types.ts: Type definitions
 * - helpers.ts: Utility functions
 * - dataSlice.ts: Data recording actions
 * - computedSlice.ts: Derived data getters
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StatisticsState } from './types';
import { createInitialDataState, createDataSlice } from './dataSlice';
import { createComputedSlice } from './computedSlice';

// Re-export types for external use
export type { InterventionRecord, UrgeSurfingRecordInput, InterventionInput } from './types';

/**
 * Statistics Store
 * Combined store from all slices
 */
export const useStatisticsStore = create<StatisticsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...createInitialDataState(),

        // Data actions slice
        ...createDataSlice(set, get),

        // Computed getters slice
        ...createComputedSlice(set, get),
      }),
      {
        name: 'stopshorts-statistics',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'StatisticsStore', enabled: __DEV__ }
  )
);
