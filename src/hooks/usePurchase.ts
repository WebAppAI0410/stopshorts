/**
 * usePurchase Hook
 * Handles subscription purchases and RevenueCat integration
 *
 * @description
 * This hook provides subscription purchase functionality using RevenueCat.
 * Reference: .kiro/specs/subscription-flow/requirements.md
 */

import { useCallback, useEffect, useState } from 'react';
import type { PurchasesPackage, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import {
  initializeRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  getSubscriptionState,
  addCustomerInfoListener,
  type SubscriptionInfo,
} from '../services/revenuecat';
import { useAppStore } from '../stores/useAppStore';
import type { SubscriptionPlan, SubscriptionStatus } from '../types';

interface UsePurchaseResult {
  /** Available subscription packages */
  offerings: PurchasesOffering | null;
  /** Current subscription info from RevenueCat */
  subscriptionInfo: SubscriptionInfo | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Initialize RevenueCat (call on app startup) */
  initialize: () => Promise<void>;
  /** Purchase a subscription package */
  purchase: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  /** Restore previous purchases */
  restore: () => Promise<{ restored: boolean; error?: string }>;
  /** Refresh subscription state */
  refreshSubscription: () => Promise<void>;
}

/**
 * Map RevenueCat product ID to SubscriptionPlan
 */
function productIdToPlan(productId: string | null): SubscriptionPlan {
  if (!productId) return 'free';

  if (productId.includes('annual')) return 'annual';
  if (productId.includes('quarterly')) return 'quarterly';
  if (productId.includes('monthly')) return 'monthly';

  return 'trial';
}

/**
 * Map RevenueCat subscription state to SubscriptionStatus
 */
function stateToStatus(state: SubscriptionInfo['state']): SubscriptionStatus {
  switch (state) {
    case 'trial':
    case 'trialGrace':
    case 'active':
    case 'billingIssue':
      return 'active';
    case 'cancelled':
      return 'cancelled';
    case 'expired':
      return 'expired';
    default:
      return 'expired';
  }
}

export function usePurchase(): UsePurchaseResult {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { setSubscription } = useAppStore();

  /**
   * Sync RevenueCat subscription info with app store
   */
  const syncSubscriptionToStore = useCallback((customerInfo: CustomerInfo) => {
    const info = getSubscriptionState(customerInfo);
    setSubscriptionInfo(info);

    const plan = productIdToPlan(info.productId);
    const status = stateToStatus(info.state);
    const expiry = info.expirationDate?.toISOString() ?? null;

    // Pass the detailed RevenueCat state to the store for proper access control
    setSubscription(plan, status, expiry, info.state);
  }, [setSubscription]);

  /**
   * Initialize RevenueCat SDK
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      await initializeRevenueCat();
      setIsInitialized(true);

      // Get initial customer info
      const customerInfo = await getCustomerInfo();
      syncSubscriptionToStore(customerInfo);

      // Get available offerings
      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);
    } catch (err) {
      console.error('[usePurchase] Initialize failed:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, syncSubscriptionToStore]);

  /**
   * Purchase a subscription package
   */
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await purchasePackage(pkg);

      if (result.success) {
        syncSubscriptionToStore(result.customerInfo);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [syncSubscriptionToStore]);

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async (): Promise<{ restored: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await restorePurchases();
      syncSubscriptionToStore(result.customerInfo);

      if (result.restored) {
        return { restored: true };
      }

      return { restored: false, error: 'No purchases to restore' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed';
      setError(errorMessage);
      return { restored: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [syncSubscriptionToStore]);

  /**
   * Refresh subscription state
   */
  const refreshSubscription = useCallback(async () => {
    try {
      const customerInfo = await getCustomerInfo();
      syncSubscriptionToStore(customerInfo);
    } catch (err) {
      console.error('[usePurchase] Refresh failed:', err);
    }
  }, [syncSubscriptionToStore]);

  /**
   * Listen for customer info updates
   */
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = addCustomerInfoListener((customerInfo) => {
      syncSubscriptionToStore(customerInfo);
    });

    return unsubscribe;
  }, [isInitialized, syncSubscriptionToStore]);

  return {
    offerings,
    subscriptionInfo,
    isLoading,
    error,
    initialize,
    purchase,
    restore,
    refreshSubscription,
  };
}
