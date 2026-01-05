/**
 * RevenueCat Service
 *
 * Handles all subscription-related operations using RevenueCat SDK.
 * Reference: .kiro/specs/subscription-flow/requirements.md
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  PURCHASES_ERROR_CODE,
  PurchasesError,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys (to be set in environment variables)
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';
const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';

// Entitlement ID
export const PREMIUM_ENTITLEMENT_ID = 'premium';

// Product IDs
export const PRODUCT_IDS = {
  monthly: 'stopshorts_monthly',
  quarterly: 'stopshorts_quarterly',
  annual: 'stopshorts_annual',
} as const;

// Subscription states
export type SubscriptionState =
  | 'trial' // 3-day trial active
  | 'trialGrace' // Trial ended, 1-day grace period
  | 'active' // Paid subscription active
  | 'cancelled' // Cancellation scheduled (still active until period end)
  | 'expired' // Subscription expired (no access)
  | 'billingIssue'; // Payment failed (grace period from RevenueCat)

export interface SubscriptionInfo {
  state: SubscriptionState;
  isActive: boolean;
  expirationDate: Date | null;
  willRenew: boolean;
  productId: string | null;
}

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    if (__DEV__) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return await Purchases.getCustomerInfo();
}

/**
 * Get available offerings (subscription packages)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; success: boolean; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { customerInfo, success: true };
  } catch (error) {
    const purchasesError = error as PurchasesError;

    // User cancelled purchase
    if (purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { customerInfo: await getCustomerInfo(), success: false, error: 'cancelled' };
    }

    // Other errors
    console.error('Purchase failed:', error);
    return {
      customerInfo: await getCustomerInfo(),
      success: false,
      error: purchasesError.message || 'Purchase failed',
    };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<{
  customerInfo: CustomerInfo;
  restored: boolean;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const hasActiveEntitlement =
      customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    return { customerInfo, restored: hasActiveEntitlement };
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Determine subscription state from customer info
 */
export function getSubscriptionState(customerInfo: CustomerInfo): SubscriptionInfo {
  const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];

  // No active entitlement
  if (!entitlement) {
    return {
      state: 'expired',
      isActive: false,
      expirationDate: null,
      willRenew: false,
      productId: null,
    };
  }

  const expirationDate = entitlement.expirationDate
    ? new Date(entitlement.expirationDate)
    : null;
  const willRenew = entitlement.willRenew;
  const productId = entitlement.productIdentifier;

  // Check if in trial period
  const isTrialPeriod = entitlement.periodType === 'TRIAL';

  // Check for billing issues
  const hasBillingIssue = customerInfo.entitlements.all[PREMIUM_ENTITLEMENT_ID]?.billingIssueDetectedAt;

  if (hasBillingIssue) {
    return {
      state: 'billingIssue',
      isActive: true, // Still active during grace period
      expirationDate,
      willRenew: false,
      productId,
    };
  }

  if (isTrialPeriod) {
    // Check if in grace period (trial ended within last day)
    const now = new Date();
    const gracePeriodEnd = expirationDate
      ? new Date(expirationDate.getTime() + 24 * 60 * 60 * 1000)
      : null;

    if (expirationDate && now > expirationDate && gracePeriodEnd && now <= gracePeriodEnd) {
      return {
        state: 'trialGrace',
        isActive: true,
        expirationDate: gracePeriodEnd,
        willRenew: false,
        productId,
      };
    }

    return {
      state: 'trial',
      isActive: true,
      expirationDate,
      willRenew,
      productId,
    };
  }

  // Paid subscription
  if (!willRenew) {
    return {
      state: 'cancelled',
      isActive: true,
      expirationDate,
      willRenew: false,
      productId,
    };
  }

  return {
    state: 'active',
    isActive: true,
    expirationDate,
    willRenew: true,
    productId,
  };
}

/**
 * Check if user has premium access
 */
export function hasPremiumAccess(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}

/**
 * Get management URL for subscription
 */
export function getManagementURL(customerInfo: CustomerInfo): string | null {
  return customerInfo.managementURL;
}

/**
 * Listen for customer info updates
 */
export function addCustomerInfoListener(
  listener: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    // Note: RevenueCat SDK doesn't provide a direct way to remove listeners
    // The listener will be cleaned up when the app is terminated
  };
}
