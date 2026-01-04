/**
 * useSubscriptionAccess Hook
 * Provides subscription status checks for access control
 *
 * Usage:
 * - hasFullAccess: Use to check if user can access premium features
 * - isExpired: Use to show renewal prompts
 * - isTrialing: Use to show trial-specific UI
 */

import { useAppStore } from '../stores/useAppStore';

export interface SubscriptionAccessResult {
  /** User has full access (trial or paid) */
  hasFullAccess: boolean;
  /** User is on trial period */
  isTrialing: boolean;
  /** User has active paid subscription */
  isPaid: boolean;
  /** Subscription has expired */
  isExpired: boolean;
  /** Expiry date has passed (for display only) */
  isExpiryDatePassed: boolean;
  /** Current subscription plan */
  subscriptionPlan: string;
  /** Days remaining in subscription (null if no expiry set) */
  daysRemaining: number | null;
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

  // Expired check - subscriptionStatus is the source of truth
  const isExpired = subscriptionStatus === 'expired';

  // Calculate expiry date passed (for display only, not authoritative)
  const isExpiryDatePassed = subscriptionExpiry
    ? new Date(subscriptionExpiry) < new Date()
    : false;

  // Calculate days remaining
  const daysRemaining = subscriptionExpiry
    ? Math.max(0, Math.ceil((new Date(subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

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
