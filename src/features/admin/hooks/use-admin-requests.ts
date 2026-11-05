import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAllRequests, updateRequestStatusById } from '@/services';
import type { DeliveryRequest, DeliveryRequestStatus } from '@/types/models';

import { errorMessage } from '../utils';

const PAGE_SIZE = 10;

/**
 * Delivery partner applications. Mirrors `getAllRequests` and
 * `updateRequestStatusById` from `client/src/api/admin.ts`: newest first,
 * exact count pagination on `delivery_requests`, direct status update.
 */
export function useAdminRequests() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryRequestStatus>('all');

  const load = useCallback(async (targetPage: number, mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { requests: rows, count: total } = await getAllRequests(targetPage, PAGE_SIZE);

      setRequests((rows ?? []) as unknown as DeliveryRequest[]);
      setCount(total ?? 0);
    } catch (queryError) {
      setError(errorMessage(queryError, 'Failed to load delivery requests'));
      setRequests([]);
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

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.full_name.toLowerCase().includes(query) ||
        (request.email ?? '').toLowerCase().includes(query) ||
        (request.phone_number ?? '').toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      approved: requests.filter((request) => request.status === 'approved').length,
      rejected: requests.filter((request) => request.status === 'rejected').length,
    }),
    [requests]
  );

  const updateStatus = useCallback(
    async (id: string, status: DeliveryRequestStatus): Promise<boolean> => {
      setUpdatingId(id);
      setActionError(null);

      try {
        await updateRequestStatusById(id, status);
      } catch (updateError) {
        setActionError(errorMessage(updateError, 'Failed to update delivery request status'));
        setUpdatingId(null);
        return false;
      }

      setRequests((current) =>
        current.map((request) => (request.id === id ? { ...request, status } : request))
      );
      setUpdatingId(null);
      return true;
    },
    []
  );

  return {
    requests,
    filteredRequests,
    counts,
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
