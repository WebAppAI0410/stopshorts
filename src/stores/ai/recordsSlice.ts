/**
 * Records Slice for AI Store
 * Handles urge and success records (iOS value enhancement)
 */

import type { UrgeRecord, SuccessRecord } from '../../types/ai';
import type { AIStore, RecordsState, RecordsActions } from './types';
import { generateId } from './helpers';

/**
 * Create initial records state
 */
export function createInitialRecordsState(): RecordsState {
  return {
    urgeRecords: [],
    successRecords: [],
  };
}

/**
 * Create records slice actions
 */
export function createRecordsSlice(
  set: (partial: Partial<AIStore>) => void,
  get: () => AIStore
): RecordsActions {
  return {
    addUrgeRecord: (record: Omit<UrgeRecord, 'id' | 'timestamp'>) => {
      const { urgeRecords } = get();

      const newRecord: UrgeRecord = {
        id: generateId(),
        timestamp: Date.now(),
        ...record,
      };

      // Keep last 100 records
      const updated = [...urgeRecords, newRecord].slice(-100);
      set({ urgeRecords: updated });
    },

    addSuccessRecord: (record: Omit<SuccessRecord, 'id' | 'timestamp'>) => {
      const { successRecords } = get();

      const newRecord: SuccessRecord = {
        id: generateId(),
        timestamp: Date.now(),
        ...record,
      };

      // Keep last 100 records
      const updated = [...successRecords, newRecord].slice(-100);
      set({ successRecords: updated });
    },
  };
}
