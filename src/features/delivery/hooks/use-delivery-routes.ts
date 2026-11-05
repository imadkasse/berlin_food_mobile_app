import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useSession } from '@/providers/SessionProvider';
import { getDeliveryQueueByDeliveryId } from '@/services';
import type { Order } from '@/types/models';
import { errorMessage } from '../lib/format';

export type UseDeliveryRoutesResult = {
  orders: Order[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * "My routes": orders that are out for delivery and assigned to the signed-in
 * courier. Mirrors `getDeliveryQueueByDeliveryId` in `client/src/api/orders.ts`.
 */
export function useDeliveryRoutes(): UseDeliveryRoutesResult {
  const { session } = useSession();
  const userId = session?.user.id ?? null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!userId) return;

    const currentRequest = ++requestId.current;

    try {
      const data = await getDeliveryQueueByDeliveryId(userId);

      if (currentRequest !== requestId.current) return;

      // The web query has no explicit ordering; the mobile list shows the
      // newest routes first, so the rows are sorted here instead of in SQL.
      const rows = [...(data ?? [])].sort((left, right) =>
        (right.created_at ?? '').localeCompare(left.created_at ?? '')
      );

      setOrders(rows as unknown as Order[]);
      setError(null);
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(errorMessage(loadError, 'We could not load your routes. Pull to retry.'));
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

  return { orders, isLoading, isRefreshing, error, refresh };
}
