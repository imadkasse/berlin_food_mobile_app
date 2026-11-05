import { useCallback, useEffect, useMemo, useState } from 'react';

import { getOrderWithItems, updateOrderStatus } from '@/services';

import type { AdminOrder, AdminOrderStatus } from '../types';
import { ADMIN_ORDER_STATUSES } from '../types';
import { errorMessage } from '../utils';

const PAGE_SIZE = 10;

/**
 * Admin order queue. Reads the `order_info` view exactly like
 * `getOrderWithItems` in the web app (`select *`, exact count, newest first,
 * range pagination) and updates `orders.status` through `updateOrderStatus`.
 */
export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminOrderStatus>('all');

  const load = useCallback(async (targetPage: number, mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { orders: rows, count: total } = await getOrderWithItems(targetPage, PAGE_SIZE);

      setOrders((rows ?? []) as unknown as AdminOrder[]);
      setCount(total ?? 0);
    } catch (queryError) {
      setError(errorMessage(queryError, 'Failed to load orders'));
      setOrders([]);
      setCount(0);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(page));
  }, [load, page]);

  const refresh = useCallback(async () => {
    await load(page, 'refresh');
  }, [load, page]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(1, nextPage), totalPages));
    },
    [totalPages]
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        (order.id ?? '').toLowerCase().includes(query) ||
        (order.customer?.full_name ?? '').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = useCallback(
    async (orderId: string, status: AdminOrderStatus): Promise<boolean> => {
      if (!ADMIN_ORDER_STATUSES.includes(status)) return false;
      setUpdatingId(orderId);
      setActionError(null);

      // Same query as the web's `updateOrderStatus`: a direct update with no
      // transition validation. RLS admin policies apply unchanged.
      try {
        await updateOrderStatus(orderId, status);
      } catch (updateError) {
        setActionError(errorMessage(updateError, 'Failed to update order status'));
        setUpdatingId(null);
        return false;
      }

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
      setUpdatingId(null);
      return true;
    },
    []
  );

  return {
    orders,
    filteredOrders,
    count,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    loading,
    refreshing,
    error,
    actionError,
    updatingId,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refresh,
    clearActionError,
    goToPage,
    updateStatus,
  };
}
