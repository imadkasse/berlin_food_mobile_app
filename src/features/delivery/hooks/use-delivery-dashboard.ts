import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { weeklyDeliveries } from '@/data/mock';
import { useSession } from '@/providers/SessionProvider';
import { getActiveOrderForDelivery, getRecentOrdersForDelivery, updateProfile } from '@/services';
import type { Order } from '@/types/models';
import type { ChartPoint } from '@/data/mock';
import { AVERAGE_DELIVERY_MINUTES, DELIVERY_COMMISSION_RATE, errorMessage } from '../lib/format';

export type DeliveryDashboardStats = {
  activeOrders: number;
  completedToday: number;
  earningsToday: number;
  averageMinutes: number;
};

export type UseDeliveryDashboardResult = {
  activeOrder: Order | null;
  recentOrders: Order[];
  weeklyDeliveries: ChartPoint[];
  stats: DeliveryDashboardStats;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  isAvailable: boolean;
  isTogglingAvailability: boolean;
  availabilityError: string | null;
  toggleAvailability: () => Promise<void>;
  refresh: () => Promise<void>;
};

/**
 * Dashboard data for a courier: the current out-for-delivery order, the last
 * 50 assigned orders and the derived earnings/completed stats.
 *
 * Mirrors `getActiveOrderDeliver` + `getRecantOrdersDeliverd` in
 * `client/src/api/delivery.dashboard.ts`, including the 12% commission rule.
 * The availability toggle is intentionally persisted here — the web version
 * only mutates local component state.
 */
export function useDeliveryDashboard(): UseDeliveryDashboardResult {
  const { session, profile, refreshProfile } = useSession();
  const userId = session?.user.id ?? null;

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAvailableOverride, setIsAvailableOverride] = useState<boolean | null>(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const requestId = useRef(0);

  const isAvailable = isAvailableOverride ?? profile?.availability_status ?? false;

  const load = useCallback(async () => {
    if (!userId) return;

    const currentRequest = ++requestId.current;

    try {
      const [activeOrderRow, recentRows] = await Promise.all([
        getActiveOrderForDelivery(userId),
        getRecentOrdersForDelivery(userId),
      ]);

      if (currentRequest !== requestId.current) return;

      setActiveOrder((activeOrderRow as unknown as Order | null) ?? null);
      setRecentOrders((recentRows ?? []) as unknown as Order[]);
      setError(null);
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(errorMessage(loadError, 'We could not load your dashboard. Check your connection.'));
    } finally {
      if (currentRequest !== requestId.current) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      void load();
    }, [load, userId])
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setError(null);
    return load();
  }, [load]);

  const toggleAvailability = useCallback(async () => {
    if (!userId) {
      setAvailabilityError('Sign in again to change your availability.');
      return;
    }

    const nextValue = !isAvailable;
    setIsAvailableOverride(nextValue);
    setIsTogglingAvailability(true);
    setAvailabilityError(null);

    try {
      await updateProfile(userId, { availability_status: nextValue });

      await refreshProfile();
      setIsAvailableOverride(null);
    } catch (toggleError) {
      setIsAvailableOverride(null);
      setAvailabilityError(
        errorMessage(toggleError, 'We could not update your availability. Try again.')
      );
    } finally {
      setIsTogglingAvailability(false);
    }
  }, [isAvailable, refreshProfile, userId]);

  const stats = useMemo<DeliveryDashboardStats>(() => {
    const delivered = recentOrders.filter((order) => order.status === 'delivered');

    return {
      activeOrders: activeOrder ? 1 : 0,
      completedToday: delivered.length,
      earningsToday: delivered.reduce(
        (sum, order) => sum + (order.total_price ?? 0) * DELIVERY_COMMISSION_RATE,
        0
      ),
      averageMinutes: AVERAGE_DELIVERY_MINUTES,
    };
  }, [activeOrder, recentOrders]);

  return {
    activeOrder,
    recentOrders,
    weeklyDeliveries,
    stats,
    isLoading,
    isRefreshing,
    error,
    isAvailable,
    isTogglingAvailability,
    availabilityError,
    toggleAvailability,
    refresh,
  };
}
