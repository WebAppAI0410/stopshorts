/**
 * Secure Storage Wrapper for Sensitive Data
 *
 * Uses expo-secure-store for encrypted storage on iOS (Keychain) and Android (Keystore).
 * Implements chunking for large data (iOS has 2KB per-item limit).
 * Provides Zustand-compatible storage interface.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// SecureStore has a 2KB limit per item on iOS
// We use a conservative chunk size to account for encoding overhead
const CHUNK_SIZE = 1800;
const CHUNK_COUNT_SUFFIX = '_chunk_count';

/**
 * Error types for secure storage operations
 */
export type SecureStorageErrorType =
  | 'STORAGE_UNAVAILABLE'
  | 'ENCRYPTION_FAILED'
  | 'DECRYPTION_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN';

export interface SecureStorageError {
  type: SecureStorageErrorType;
  message: string;
  originalError?: unknown;
}

/**
 * Check if SecureStore is available on the current platform
 */
export async function isSecureStorageAvailable(): Promise<boolean> {
  try {
    // SecureStore is available on iOS and Android
    // On web, it falls back to localStorage (not secure)
    if (Platform.OS === 'web') {
      return false;
    }
    // Test write/read/delete cycle
    const testKey = '__secure_storage_test__';
    await SecureStore.setItemAsync(testKey, 'test');
    const result = await SecureStore.getItemAsync(testKey);
    await SecureStore.deleteItemAsync(testKey);
    return result === 'test';
  } catch {
    return false;
  }
}

/**
 * Split data into chunks for storage (handles iOS 2KB limit)
 */
function splitIntoChunks(data: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    chunks.push(data.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

/**
 * Secure storage operations with chunking support
 */
export const secureStorage = {
  /**
   * Get an item from secure storage
   * Handles chunked data automatically
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // First, check if this is chunked data
      const chunkCountStr = await SecureStore.getItemAsync(
        `${key}${CHUNK_COUNT_SUFFIX}`
      );

      if (chunkCountStr) {
        // Reassemble chunked data
        const chunkCount = parseInt(chunkCountStr, 10);
        const chunks: string[] = [];

        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk === null) {
            // Corrupted data - chunk missing
            if (__DEV__) {
              console.error(
                `[SecureStorage] Missing chunk ${i} for key: ${key}`
              );
            }
            return null;
          }
          chunks.push(chunk);
        }

        return chunks.join('');
      }

      // Non-chunked data
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.error(`[SecureStorage] Error getting item: ${key}`, error);
      }
      return null;
    }
  },

  /**
   * Set an item in secure storage
   * Automatically chunks large data
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      // First, clean up any existing chunks
      await this.removeItem(key);

      if (value.length <= CHUNK_SIZE) {
        // Small data - store directly
        await SecureStore.setItemAsync(key, value);
      } else {
        // Large data - chunk it
        const chunks = splitIntoChunks(value);

        // Store chunk count first
        await SecureStore.setItemAsync(
          `${key}${CHUNK_COUNT_SUFFIX}`,
          chunks.length.toString()
        );

        // Store each chunk
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`[SecureStorage] Error setting item: ${key}`, error);
      }
      throw createSecureStorageError('ENCRYPTION_FAILED', key, error);
    }
  },

  /**
   * Remove an item from secure storage
   * Cleans up all chunks if data was chunked
   */
  async removeItem(key: string): Promise<void> {
    try {
      // Check for chunked data
      const chunkCountStr = await SecureStore.getItemAsync(
        `${key}${CHUNK_COUNT_SUFFIX}`
      );

      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);

        // Delete all chunks
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }

        // Delete chunk count
        await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
      }

      // Delete main key (may not exist if chunked)
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.error(`[SecureStorage] Error removing item: ${key}`, error);
      }
    }
  },
};

/**
 * Create a Zustand-compatible StateStorage using SecureStore
 */
export function createSecureStateStorage(): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      return secureStorage.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      await secureStorage.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      await secureStorage.removeItem(name);
    },
  };
}

/**
 * Migrate data from AsyncStorage to SecureStore
 * Returns true if migration was successful or not needed
 */
export async function migrateToSecureStorage(
  key: string,
  options?: {
    deleteAfterMigration?: boolean;
  }
): Promise<boolean> {
  const { deleteAfterMigration = true } = options ?? {};

  try {
    // Check if data already exists in SecureStore
    const existingSecure = await secureStorage.getItem(key);
    if (existingSecure !== null) {
      // Already migrated
      return true;
    }

    // Get data from AsyncStorage
    const asyncData = await AsyncStorage.getItem(key);
    if (asyncData === null) {
      // No data to migrate
      return true;
    }

    // Migrate to SecureStore
    await secureStorage.setItem(key, asyncData);

    // Verify migration
    const verifyData = await secureStorage.getItem(key);
    if (verifyData !== asyncData) {
      if (__DEV__) {
        console.error(`[SecureStorage] Migration verification failed for: ${key}`);
      }
      return false;
    }

    // Delete from AsyncStorage after successful migration
    if (deleteAfterMigration) {
      await AsyncStorage.removeItem(key);
    }

    if (__DEV__) {
      console.log(`[SecureStorage] Successfully migrated: ${key}`);
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error(`[SecureStorage] Migration failed for: ${key}`, error);
    }
    return false;
  }
}

/**
 * Create a typed SecureStorageError
 */
function createSecureStorageError(
  type: SecureStorageErrorType,
  key: string,
  originalError?: unknown
): SecureStorageError {
  const messages: Record<SecureStorageErrorType, string> = {
    STORAGE_UNAVAILABLE: `Secure storage is not available on this device`,
    ENCRYPTION_FAILED: `Failed to encrypt and store data for key: ${key}`,
    DECRYPTION_FAILED: `Failed to decrypt data for key: ${key}`,
    QUOTA_EXCEEDED: `Storage quota exceeded for key: ${key}`,
    UNKNOWN: `Unknown error occurred for key: ${key}`,
  };

  return {
    type,
    message: messages[type],
    originalError,
  };
}
