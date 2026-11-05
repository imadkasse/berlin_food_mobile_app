import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '@/features/menu/utils';
import { getAllOrderByUserId, rateDelivery, updateOrderStatus } from '@/services';
import type { Order } from '@/types/models';

export type OrdersLoadStatus = 'loading' | 'ready' | 'error';

type LoadMode = 'initial' | 'refresh' | 'quiet';

export type UseOrdersResult = {
  orders: Order[];
  status: OrdersLoadStatus;
  error: string | null;
  refreshing: boolean;
  /** Id of the order currently being completed, if any. */
  updatingOrderId: string | null;
  actionError: string | null;
  refresh: () => Promise<void>;
  retry: () => void;
  clearActionError: () => void;
  confirmDelivery: (order: Order, rating?: number) => Promise<boolean>;
};

/**
 * Customer order history, using the web app's nested select:
 * `*, order_items(*, menu_item:menu_items(*))`, newest first.
 */
export function useOrders(customerId: string | undefined): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrdersLoadStatus>(customerId ? 'loading' : 'ready');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: LoadMode) => {
      // Yield before touching state so the mount effect never causes a
      // synchronous cascading render (react-hooks/set-state-in-effect).
      await Promise.resolve();

      if (!customerId) {
        setOrders([]);
        setStatus('ready');
        return;
      }

      if (mode === 'initial') setStatus('loading');
      if (mode === 'refresh') setRefreshing(true);
      if (mode !== 'quiet') setError(null);

      try {
        const data = await getAllOrderByUserId(customerId);

        // The web query has no explicit ordering; the mobile history is shown
        // newest first, so the rows are sorted here instead of in SQL.
        const rows = [...(data ?? [])].sort((left, right) =>
          (right.created_at ?? '').localeCompare(left.created_at ?? '')
        );

        setOrders(rows as unknown as Order[]);
        setStatus('ready');
        setError(null);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'We could not load your orders.'));
        if (mode === 'initial') setStatus('error');
      } finally {
        setRefreshing(false);
      }
    },
    [customerId]
  );

  useEffect(() => {
    // Defer one tick so the fetch never starts with a synchronous setState
    // inside the effect body.
    const timer = setTimeout(() => {
      void load('initial');
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const retry = useCallback(() => {
    void load('initial');
  }, [load]);

  const clearActionError = useCallback(() => setActionError(null), []);

  /**
   * Mirrors the web app's completion flow: rate the delivery through the
   * `add_delivery_rating` RPC first (only when a rating was chosen and the
   * order has a courier), then mark the order `delivered`. "Maybe later"
   * calls this without a rating and only changes the status.
   */
  const confirmDelivery = useCallback(
    async (order: Order, rating?: number): Promise<boolean> => {
      setUpdatingOrderId(order.id);
      setActionError(null);

      try {
        if (rating && order.delivery_id) {
          await rateDelivery(order.delivery_id, rating);
        }

        await updateOrderStatus(order.id, 'delivered');

        // Move the card to history immediately, then reconcile in the
        // background so a slow refresh never leaves a completed order active.
        setOrders((current) =>
          current.map((entry) =>
            entry.id === order.id ? { ...entry, status: 'delivered' } : entry
          )
        );
        await load('quiet');
        return true;
      } catch (confirmError) {
        setActionError(
          getErrorMessage(confirmError, 'We could not confirm this delivery. Please try again.')
        );
        return false;
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [load]
  );

  return {
    orders,
    status,
    error,
    refreshing,
    updatingOrderId,
    actionError,
    refresh,
    retry,
    clearActionError,
    confirmDelivery,
  };
}
