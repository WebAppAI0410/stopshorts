/**
 * InterventionGate Component
 * Wraps intervention screens with subscription access control
 *
 * Usage:
 * <InterventionGate>
 *   <FrictionIntervention ... />
 * </InterventionGate>
 */

import React from 'react';
import { useRouter } from 'expo-router';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import { ExpiredSubscriptionScreen } from './ExpiredSubscriptionScreen';

interface InterventionGateProps {
  /** Child components to render when access is granted */
  children: React.ReactNode;
  /** Custom callback when subscription expires (default: navigate to paywall) */
  onExpired?: () => void;
}

export function InterventionGate({ children, onExpired }: InterventionGateProps) {
  const router = useRouter();
  const { hasFullAccess, isExpired } = useSubscriptionAccess();

  // Handle subscribe button press
  const handleSubscribe = () => {
    if (onExpired) {
      onExpired();
    } else {
      // Default: navigate to paywall
      router.push('/(main)/settings');
    }
  };

  // Handle restore purchases
  const handleRestore = () => {
    // TODO: Implement restore purchases when IAP is integrated
    if (__DEV__) {
      console.log('[InterventionGate] Restore purchases requested');
    }
  };

  // Show expired screen if subscription has expired or no access
  if (isExpired || !hasFullAccess) {
    return (
      <ExpiredSubscriptionScreen
        onSubscribe={handleSubscribe}
        onRestore={handleRestore}
      />
    );
  }

  // Grant access
  return <>{children}</>;
}
