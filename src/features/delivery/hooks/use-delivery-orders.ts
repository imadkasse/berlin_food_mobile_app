import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useSession } from '@/providers/SessionProvider';
import {
  getAllOrders,
  takeOrderToDelivery,
  toDeliveryAddress,
  updateOrderStatus,
} from '@/services';
import type { Order } from '@/types/models';
import type { DeliveryNoticeData } from '../components/DeliveryNotice';
import { errorMessage, shortOrderId } from '../lib/format';

export type DeliveryOrderAction = 'accept' | 'pick_up' | 'mark_delivered';

export type UseDeliveryOrdersResult = {
  orders: Order[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  pendingOrderId: string | null;
  notice: DeliveryNoticeData | null;
  dismissNotice: () => void;
  refresh: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  pickUpOrder: (orderId: string) => Promise<void>;
  markDelivered: (orderId: string) => Promise<void>;
};

/**
 * The courier order queue. Reads every order with its items, exactly like
 * `getAllOrders` in `client/src/api/orders.ts`, and applies the same status
 * transitions: accept/pick up assigns the order and moves it to
 * `out_for_delivery` (`takeOrderToDelivery`), while mark delivered sets
 * `delivered` (`updateOrderStatus`).
 */
export function useDeliveryOrders(): UseDeliveryOrdersResult {
  const { session } = useSession();
  const userId = session?.user.id ?? null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [notice, setNotice] = useState<DeliveryNoticeData | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;

    try {
      const data = await getAllOrders();

      if (currentRequest !== requestId.current) return;

      // The web query has no explicit ordering; the mobile queue shows the
      // newest orders first, so the rows are sorted here instead of in SQL.
      const rows = [...(data ?? [])].sort((left, right) =>
        (right.created_at ?? '').localeCompare(left.created_at ?? '')
      );

      setOrders(
        rows.map((row) => ({
          ...row,
          delivery_address: toDeliveryAddress(row.delivery_address),
          order_items: (row.order_items ?? []).map((item) => ({
            ...item,
            id: item.id ?? '',
            order_id: item.order_id ?? null,
            menu_item_id: item.menu_item_id ?? null,
            price: item.price ?? null,
            quantity: item.quantity ?? null,
          })),
        }))
      );
      setError(null);
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(errorMessage(loadError, 'We could not load the order queue. Pull to retry.'));
    } finally {
      if (currentRequest !== requestId.current) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setError(null);
    return load();
  }, [load]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const activeAssignedOrder = useMemo(
    () =>
      orders.find((order) => order.delivery_id === userId && order.status === 'out_for_delivery') ??
      null,
    [orders, userId]
  );

  /**
   * Shared accept/pick-up transition. Both buttons call the web's
   * `takeOrderToDelivery`, which writes `delivery_id` and `out_for_delivery`.
   */
  const assignOrder = useCallback(
    async (orderId: string, action: 'accept' | 'pick_up') => {
      if (!userId) {
        setNotice({ tone: 'error', message: 'Sign in again to take a delivery.' });
        return;
      }

      const target = orders.find((order) => order.id === orderId);

      if (!target) {
        setNotice({ tone: 'error', message: 'This order is no longer in the queue.' });
        return;
      }

      if (target.delivery_id && target.delivery_id !== userId) {
        setNotice({
          tone: 'error',
          message: 'Another courier already accepted this order.',
        });
        return;
      }

      if (activeAssignedOrder && activeAssignedOrder.id !== orderId) {
        setNotice({
          tone: 'error',
          message: `Finish delivery #${shortOrderId(
            activeAssignedOrder.id
          )} before accepting another order.`,
        });
        return;
      }

      setPendingOrderId(orderId);
      setNotice(null);

      try {
        const data = await takeOrderToDelivery(userId, orderId);

        setOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  ...data,
                  delivery_address: toDeliveryAddress(data.delivery_address),
                }
              : order
          )
        );

        setNotice({
          tone: 'success',
          message:
            action === 'pick_up'
              ? `Order #${shortOrderId(orderId)} picked up. It is now on your route.`
              : `Order #${shortOrderId(orderId)} accepted. Head to the pickup point.`,
        });
      } catch (mutationError) {
        setNotice({
          tone: 'error',
          message: errorMessage(mutationError, 'We could not take this order. Please try again.'),
        });
      } finally {
        setPendingOrderId(null);
      }
    },
    [activeAssignedOrder, orders, userId]
  );

  const acceptOrder = useCallback(
    (orderId: string) => assignOrder(orderId, 'accept'),
    [assignOrder]
  );

  const pickUpOrder = useCallback(
    (orderId: string) => assignOrder(orderId, 'pick_up'),
    [assignOrder]
  );

  const markDelivered = useCallback(
    async (orderId: string) => {
      const target = orders.find((order) => order.id === orderId);

      if (!userId || !target || target.delivery_id !== userId) {
        setNotice({
          tone: 'error',
          message: 'Only the courier assigned to this order can complete it.',
        });
        return;
      }

      if (target.status !== 'out_for_delivery') {
        setNotice({
          tone: 'error',
          message: 'This order is not out for delivery anymore.',
        });
        return;
      }

      setPendingOrderId(orderId);
      setNotice(null);

      try {
        // Same transition as the active delivery screen (`updateOrderStatus`).
        const data = await updateOrderStatus(orderId, 'delivered');

        setOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  ...data,
                  delivery_address: toDeliveryAddress(data.delivery_address),
                }
              : order
          )
        );

        setNotice({
          tone: 'success',
          message: `Order #${shortOrderId(orderId)} marked as delivered. Nice work.`,
        });
      } catch (mutationError) {
        setNotice({
          tone: 'error',
          message: errorMessage(
            mutationError,
            'We could not mark this order as delivered. Try again.'
          ),
        });
      } finally {
        setPendingOrderId(null);
      }
    },
    [orders, userId]
  );

  return {
    orders,
    isLoading,
    isRefreshing,
    error,
    pendingOrderId,
    notice,
    dismissNotice,
    refresh,
    acceptOrder,
    pickUpOrder,
    markDelivered,
  };
}
