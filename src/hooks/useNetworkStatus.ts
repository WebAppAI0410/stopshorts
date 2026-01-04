/**
 * useNetworkStatus Hook
 * Monitors network connectivity status using @react-native-community/netinfo
 *
 * Features:
 * - Real-time network status monitoring
 * - Returns isConnected (boolean | null) and isOffline (boolean)
 * - Automatically subscribes/unsubscribes on mount/unmount
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

interface NetworkStatus {
  /** Network connection status: true if connected, false if not, null if unknown */
  isConnected: boolean | null;
  /** Convenience flag: true only when definitely offline */
  isOffline: boolean;
}

/**
 * Hook to monitor network connectivity status
 * @returns NetworkStatus object with isConnected and isOffline flags
 */
export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isOffline: isConnected === false,
  };
}
