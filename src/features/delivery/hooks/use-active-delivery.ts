import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useSession } from '@/providers/SessionProvider';
import { getDeliveryQueueByDeliveryId, updateOrderStatus } from '@/services';
import type { Order } from '@/types/models';
import type { DeliveryNoticeData } from '../components/DeliveryNotice';
import { errorMessage, shortOrderId } from '../lib/format';

export type ActiveDeliveryStatus = 'loading' | 'ready' | 'not-found' | 'error';

export type UseActiveDeliveryResult = {
  status: ActiveDeliveryStatus;
  order: Order | null;
  error: string | null;
  isMarkingDelivered: boolean;
  notice: DeliveryNoticeData | null;
  dismissNotice: () => void;
  refresh: () => Promise<void>;
  markDelivered: () => Promise<boolean>;
};

/**
 * Loads one order and verifies it belongs to the signed-in courier. A missing
 * order, or one assigned to someone else, resolves to `not-found` so the screen
 * never exposes another courier's delivery.
 *
 * The read mirrors the web app's active-delivery page, which loads the
 * courier's out-for-delivery queue (with the embedded `order_items`) and picks
 * the matching order out of it.
 */
export function useActiveDelivery(orderId: string | undefined): UseActiveDeliveryResult {
  const { session } = useSession();
  const userId = session?.user.id ?? null;

  const [status, setStatus] = useState<ActiveDeliveryStatus>(orderId ? 'loading' : 'not-found');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  const [notice, setNotice] = useState<DeliveryNoticeData | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!orderId || !userId) {
      // No order id or no signed-in courier: nothing to show, and the screen
      // must never expose another courier's delivery.
      setOrder(null);
      setStatus('not-found');
      return;
    }

    const currentRequest = ++requestId.current;

    try {
      const queue = await getDeliveryQueueByDeliveryId(userId);

      if (currentRequest !== requestId.current) return;

      const row = (queue ?? []).find((entry) => entry.id === orderId) ?? null;

      if (!row || row.delivery_id !== userId) {
        setOrder(null);
        setStatus('not-found');
        return;
      }

      setOrder(row as unknown as Order);
      setError(null);
      setStatus('ready');
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(errorMessage(loadError, 'We could not load this delivery. Check your connection.'));
      setStatus('error');
    }
  }, [orderId, userId]);

  useFocusEffect(
    useCallback(() => {
      if (!orderId) return;
      void load();
    }, [load, orderId])
  );

  const refresh = useCallback(() => {
    setError(null);
    setStatus('loading');
    return load();
  }, [load]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const markDelivered = useCallback(async () => {
    if (!order || !userId || order.delivery_id !== userId) {
      setNotice({
        tone: 'error',
        message: 'Only the courier assigned to this order can complete it.',
      });
      return false;
    }

    setIsMarkingDelivered(true);
    setNotice(null);

    try {
      // Mirrors `updateOrderStatus(supabase, order.id, "delivered")`.
      await updateOrderStatus(order.id, 'delivered');

      setOrder((current) => (current ? { ...current, status: 'delivered' } : current));
      setNotice({
        tone: 'success',
        message: `Order #${shortOrderId(order.id)} delivered. Great job.`,
      });
      return true;
    } catch (mutationError) {
      setNotice({
        tone: 'error',
        message: errorMessage(
          mutationError,
          'We could not mark this delivery as delivered. Please try again.'
        ),
      });
      return false;
    } finally {
      setIsMarkingDelivered(false);
    }
  }, [order, userId]);

  return {
    status,
    order,
    error,
    isMarkingDelivered,
    notice,
    dismissNotice,
    refresh,
    markDelivered,
  };
}
