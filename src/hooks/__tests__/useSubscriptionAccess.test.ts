import { renderHook } from '@testing-library/react-native';
import { useSubscriptionAccess } from '../useSubscriptionAccess';
import { useAppStore } from '../../stores/useAppStore';
import type { SubscriptionPlan, SubscriptionStatus } from '../../types';

// Mock the useAppStore hook
jest.mock('../../stores/useAppStore');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

interface MockStoreState {
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
}

function setupMockStore(state: MockStoreState) {
  mockUseAppStore.mockReturnValue(state as ReturnType<typeof useAppStore>);
}

describe('useSubscriptionAccess', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T12:00:00'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('hasFullAccess', () => {
    it('returns true for active trial', () => {
      setupMockStore({
        subscriptionPlan: 'trial',
        subscriptionStatus: 'active',
        subscriptionExpiry: '2025-01-18T00:00:00',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.hasFullAccess).toBe(true);
      expect(result.current.isTrialing).toBe(true);
      expect(result.current.isPaid).toBe(false);
    });

    it.each(['monthly', 'quarterly', 'annual'] as const)(
      'returns true for active %s subscription',
      (plan) => {
        setupMockStore({
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          subscriptionExpiry: '2025-02-15T00:00:00',
        });

        const { result } = renderHook(() => useSubscriptionAccess());

        expect(result.current.hasFullAccess).toBe(true);
        expect(result.current.isPaid).toBe(true);
        expect(result.current.isTrialing).toBe(false);
      }
    );

    it('returns false for free plan', () => {
      setupMockStore({
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        subscriptionExpiry: null,
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.hasFullAccess).toBe(false);
      expect(result.current.isTrialing).toBe(false);
      expect(result.current.isPaid).toBe(false);
    });

    it('returns false for expired trial', () => {
      setupMockStore({
        subscriptionPlan: 'trial',
        subscriptionStatus: 'expired',
        subscriptionExpiry: '2025-01-10T00:00:00',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.hasFullAccess).toBe(false);
      expect(result.current.isExpired).toBe(true);
    });
  });

  describe('isExpired', () => {
    it('follows subscriptionStatus as source of truth', () => {
      // Status is active but date is passed - should NOT be expired
      setupMockStore({
        subscriptionPlan: 'monthly',
        subscriptionStatus: 'active',
        subscriptionExpiry: '2025-01-10T00:00:00', // Past date
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.isExpired).toBe(false);
      expect(result.current.isExpiryDatePassed).toBe(true);
    });

    it('returns true when status is expired', () => {
      setupMockStore({
        subscriptionPlan: 'trial',
        subscriptionStatus: 'expired',
        subscriptionExpiry: '2025-01-10T00:00:00',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.isExpired).toBe(true);
    });

    it('returns false for cancelled status', () => {
      setupMockStore({
        subscriptionPlan: 'monthly',
        subscriptionStatus: 'cancelled',
        subscriptionExpiry: '2025-01-20T00:00:00',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.isExpired).toBe(false);
    });
  });

  describe('daysRemaining', () => {
    it('calculates correctly for future expiry', () => {
      setupMockStore({
        subscriptionPlan: 'monthly',
        subscriptionStatus: 'active',
        subscriptionExpiry: '2025-01-22T00:00:00', // 7 days from now
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.daysRemaining).toBe(7);
    });

    it('returns 0 for past expiry', () => {
      setupMockStore({
        subscriptionPlan: 'trial',
        subscriptionStatus: 'expired',
        subscriptionExpiry: '2025-01-10T00:00:00',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.daysRemaining).toBe(0);
    });

    it('returns null when no expiry set', () => {
      setupMockStore({
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        subscriptionExpiry: null,
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.daysRemaining).toBeNull();
    });

    it('handles invalid date string gracefully', () => {
      setupMockStore({
        subscriptionPlan: 'trial',
        subscriptionStatus: 'active',
        subscriptionExpiry: 'invalid-date',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.daysRemaining).toBeNull();
      expect(result.current.isExpiryDatePassed).toBe(false);
    });
  });

  describe('subscriptionPlan', () => {
    it('returns the current plan from store', () => {
      setupMockStore({
        subscriptionPlan: 'annual',
        subscriptionStatus: 'active',
        subscriptionExpiry: '2026-01-15T00:00:00',
      });

      const { result } = renderHook(() => useSubscriptionAccess());

      expect(result.current.subscriptionPlan).toBe('annual');
    });
  });
});
