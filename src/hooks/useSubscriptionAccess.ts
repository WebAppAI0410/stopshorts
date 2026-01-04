/**
 * useSubscriptionAccess Hook
 * Provides subscription status checks for access control
 *
 * @description
 * This hook centralizes subscription access logic following the design spec (Section 10.2).
 * Key principle: `subscriptionStatus` is the source of truth for expiration, not date calculations.
 *
 * @example
 * ```tsx
 * function PremiumFeature() {
 *   const { hasFullAccess, isExpired, daysRemaining } = useSubscriptionAccess();
 *
 *   if (!hasFullAccess) {
 *     return <PaywallScreen />;
 *   }
 *
 *   return <FeatureContent daysRemaining={daysRemaining} />;
 * }
 * ```
 */

import { useAppStore } from '../stores/useAppStore';
import type { SubscriptionPlan } from '../types';

export interface SubscriptionAccessResult {
  /** User has full access (trial or paid) */
  hasFullAccess: boolean;
  /** User is on trial period */
  isTrialing: boolean;
  /** User has active paid subscription */
  isPaid: boolean;
  /** Subscription has expired (source of truth: subscriptionStatus) */
  isExpired: boolean;
  /** Expiry date has passed (for display only, not authoritative) */
  isExpiryDatePassed: boolean;
  /** Current subscription plan */
  subscriptionPlan: SubscriptionPlan;
  /** Days remaining in subscription (null if no expiry set, 0 if expired) */
  daysRemaining: number | null;
}

/**
 * Safely parse a date string and check if it's in the past
 * @param dateString - ISO date string or null
 * @returns true if the date is valid and in the past
 */
function isDatePassed(dateString: string | null): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) return false;
    return date < new Date();
  } catch {
    return false;
  }
}

/**
 * Calculate days remaining from a date string
 * @param dateString - ISO date string or null
 * @returns Days remaining (0 if past), or null if no date
 */
function calculateDaysRemaining(dateString: string | null): number | null {
  if (!dateString) return null;
  try {
    const expiryDate = new Date(dateString);
    if (!Number.isFinite(expiryDate.getTime())) return null;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / msPerDay));
  } catch {
    return null;
  }
}

export function useSubscriptionAccess(): SubscriptionAccessResult {
  const {
    subscriptionPlan,
    subscriptionStatus,
    subscriptionExpiry,
  } = useAppStore();

  // Active subscription status
  const isActive = subscriptionStatus === 'active';

  // Trial status
  const isTrialing = subscriptionPlan === 'trial' && isActive;

  // Paid subscription status
  const isPaid = ['monthly', 'quarterly', 'annual'].includes(subscriptionPlan) && isActive;

  // Full access = trial OR paid
  const hasFullAccess = isTrialing || isPaid;

  // Expired check - subscriptionStatus is the source of truth (per design spec Section 10.2)
  const isExpired = subscriptionStatus === 'expired';

  // Calculate expiry date passed (for display only, not authoritative)
  const isExpiryDatePassed = isDatePassed(subscriptionExpiry);

  // Calculate days remaining with safe parsing
  const daysRemaining = calculateDaysRemaining(subscriptionExpiry);

  return {
    hasFullAccess,
    isTrialing,
    isPaid,
    isExpired,
    isExpiryDatePassed,
    subscriptionPlan,
    daysRemaining,
  };
}
