/**
 * useNetworkStatus Hook
 * Monitors network connectivity status using @react-native-community/netinfo
 *
 * Features:
 * - Real-time network status monitoring
 * - Checks both isConnected AND isInternetReachable for accurate offline detection
 * - Handles captive portals and other "connected but no internet" scenarios
 * - Returns isConnected (boolean | null) and isOffline (boolean)
 * - Automatically subscribes/unsubscribes on mount/unmount
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

interface NetworkStatus {
  /** Network connection status: true if connected, false if not, null if unknown */
  isConnected: boolean | null;
  /** Internet reachability: true if internet is reachable, false if not, null if unknown */
  isInternetReachable: boolean | null;
  /** Convenience flag: true when definitely offline or internet unreachable */
  isOffline: boolean;
}

/**
 * Hook to monitor network connectivity status
 * @returns NetworkStatus object with isConnected, isInternetReachable, and isOffline flags
 */
export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  // Consider offline if:
  // 1. Not connected to any network (isConnected === false), OR
  // 2. Connected but internet is unreachable (captive portal, no route, etc.)
  const isOffline = isConnected === false || isInternetReachable === false;

  return {
    isConnected,
    isInternetReachable,
    isOffline,
  };
}
