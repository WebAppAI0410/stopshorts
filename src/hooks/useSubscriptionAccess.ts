/**
 * useSubscriptionAccess Hook
 * Provides subscription status checks for access control
 *
 * @description
 * This hook centralizes subscription access logic following the design spec.
 * Reference: .kiro/specs/subscription-flow/requirements.md
 *
 * Access Control Rules:
 * - Full access: trial, trialGrace, active, cancelled, billingIssue
 * - Limited access (Home + Stats only): expired
 *
 * @example
 * ```tsx
 * function PremiumFeature() {
 *   const { hasFullAccess, isExpired, showTrialWarning } = useSubscriptionAccess();
 *
 *   if (!hasFullAccess) {
 *     return <PaywallScreen />;
 *   }
 *
 *   return <FeatureContent showWarning={showTrialWarning} />;
 * }
 * ```
 */

import { useAppStore } from '../stores/useAppStore';
import type { SubscriptionPlan, RevenueCatSubscriptionState } from '../types';

export interface SubscriptionAccessResult {
  /** User has full access (trial, grace, paid, billing issue) */
  hasFullAccess: boolean;
  /** User can only access Home and Stats */
  hasLimitedAccess: boolean;
  /** User is on trial period */
  isTrialing: boolean;
  /** User is in trial grace period (1 day after trial ended) */
  isInTrialGrace: boolean;
  /** User has active paid subscription */
  isPaid: boolean;
  /** User has cancelled but still active until period end */
  isCancelled: boolean;
  /** User has billing issue (RevenueCat grace period) */
  hasBillingIssue: boolean;
  /** Subscription has expired (no premium access) */
  isExpired: boolean;
  /** Expiry date has passed (for display only, not authoritative) */
  isExpiryDatePassed: boolean;
  /** Current subscription plan */
  subscriptionPlan: SubscriptionPlan;
  /** Days remaining in subscription (null if no expiry set, 0 if expired) */
  daysRemaining: number | null;
  /** Should show trial warning banner (last day of trial grace) */
  showTrialWarning: boolean;
  /** Should show resubscribe prompt (expired) */
  showResubscribePrompt: boolean;
  /** Derived RevenueCat state for display */
  revenueCatState: RevenueCatSubscriptionState;
}

/**
 * Safely parse a date string and check if it's in the past
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

/**
 * Derive RevenueCat state from store values
 * This provides a unified state for access control
 */
function deriveRevenueCatState(
  plan: SubscriptionPlan,
  status: string,
  daysRemaining: number | null,
  trialStartDate: string | null
): RevenueCatSubscriptionState {
  // Expired status is authoritative
  if (status === 'expired') {
    return 'expired';
  }

  // Check if in trial
  if (plan === 'trial' && trialStartDate) {
    const trialStart = new Date(trialStartDate);
    const trialEnd = new Date(trialStart.getTime() + 3 * 24 * 60 * 60 * 1000);
    const graceEnd = new Date(trialEnd.getTime() + 1 * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now <= trialEnd) {
      return 'trial';
    } else if (now <= graceEnd) {
      return 'trialGrace';
    } else {
      return 'expired';
    }
  }

  // Cancelled status
  if (status === 'cancelled') {
    return 'cancelled';
  }

  // Active paid subscription
  if (['monthly', 'quarterly', 'annual'].includes(plan)) {
    return 'active';
  }

  // Free/no subscription
  if (plan === 'free') {
    return 'expired';
  }

  return 'expired';
}

export function useSubscriptionAccess(): SubscriptionAccessResult {
  const {
    subscriptionPlan,
    subscriptionStatus,
    subscriptionExpiry,
    trialStartDate,
  } = useAppStore();

  // Calculate days remaining
  const daysRemaining = calculateDaysRemaining(subscriptionExpiry);

  // Derive RevenueCat state
  const revenueCatState = deriveRevenueCatState(
    subscriptionPlan,
    subscriptionStatus,
    daysRemaining,
    trialStartDate
  );

  // State checks
  const isTrialing = revenueCatState === 'trial';
  const isInTrialGrace = revenueCatState === 'trialGrace';
  const isPaid = revenueCatState === 'active';
  const isCancelled = revenueCatState === 'cancelled';
  const hasBillingIssue = revenueCatState === 'billingIssue';
  const isExpired = revenueCatState === 'expired';

  // Access levels
  const hasFullAccess = isTrialing || isInTrialGrace || isPaid || isCancelled || hasBillingIssue;
  const hasLimitedAccess = isExpired;

  // Calculate expiry date passed (for display only)
  const isExpiryDatePassed = isDatePassed(subscriptionExpiry);

  // UI hints
  const showTrialWarning = isInTrialGrace;
  const showResubscribePrompt = isExpired;

  return {
    hasFullAccess,
    hasLimitedAccess,
    isTrialing,
    isInTrialGrace,
    isPaid,
    isCancelled,
    hasBillingIssue,
    isExpired,
    isExpiryDatePassed,
    subscriptionPlan,
    daysRemaining,
    showTrialWarning,
    showResubscribePrompt,
    revenueCatState,
  };
}
