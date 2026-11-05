/**
 * Delivery request + delivery dashboard service.
 *
 * Ported from the web app:
 * - `client/src/api/admin.ts` (delivery requests table)
 * - `client/src/api/delivery.dashboard.ts` (courier dashboard order lookups)
 *
 * Business rules are unchanged: identical filters, ordering, range pagination
 * and the same `maybeSingle()` semantics for the active delivery.
 */

import type {
  DeliveryRequestInsert,
  DeliveryRequestRow,
  DeliveryStatus,
  OrderRow,
} from '@/types/database.types';

import { supabase } from './supabase';
import { fetchOrNull, mutate, mutateVoid, toServiceError } from './supabase/query';

/**
 * Mirrors `api/admin.ts` → `createRequest()`.
 *
 * Public signup flow: a visitor asks to become a delivery partner.
 */
export async function createRequest(data: DeliveryRequestInsert): Promise<void> {
  await mutateVoid(() => supabase.from('delivery_requests').insert(data), {
    fallbackMessage: 'Failed to submit delivery request',
  });
}

/**
 * Mirrors `api/admin.ts` → `getAllRequests()`.
 *
 * Newest requests first, with an exact count and range pagination.
 */
export async function getAllRequests(
  page: number,
  pageSize: number
): Promise<{ requests: DeliveryRequestRow[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('delivery_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw toServiceError(error, 'Failed to load delivery requests');
  }

  return { requests: data ?? [], count: count ?? 0 };
}

/**
 * Mirrors `api/admin.ts` → `updateRequestStatusById()`.
 */
export async function updateRequestStatusById(
  id: DeliveryRequestRow['id'],
  status: DeliveryStatus
): Promise<void> {
  await mutateVoid(() => supabase.from('delivery_requests').update({ status }).eq('id', id), {
    fallbackMessage: 'Failed to update delivery request status',
  });
}

/**
 * Mirrors `api/admin.ts` → `getRequestByEmail()`.
 *
 * Note: the web app throws on any error here; the mobile version keeps the
 * "missing row → null" behaviour of the other single-row lookups, which is the
 * only sensible outcome for the public "track my request" screen.
 */
export async function getRequestByEmail(email: string): Promise<DeliveryRequestRow | null> {
  return fetchOrNull(
    () => supabase.from('delivery_requests').select('*').eq('email', email).single(),
    { fallbackMessage: 'Failed to load delivery request' }
  );
}

/**
 * Mirrors `api/admin.ts` → `getRequestById()`.
 */
export async function getRequestById(
  id: DeliveryRequestRow['id']
): Promise<DeliveryRequestRow | null> {
  return fetchOrNull(() => supabase.from('delivery_requests').select('*').eq('id', id).single(), {
    fallbackMessage: 'Failed to load delivery request',
  });
}

/**
 * Mirrors `api/admin.ts` → `deleteRequestById()`.
 */
export async function deleteRequestById(id: DeliveryRequestRow['id']): Promise<void> {
  await mutateVoid(() => supabase.from('delivery_requests').delete().eq('id', id), {
    fallbackMessage: 'Failed to delete delivery request',
  });
}

/**
 * Mirrors `api/delivery.dashboard.ts` → `getActiveOrderDeliver()`.
 *
 * The courier's single active delivery (if any).
 */
export async function getActiveOrderDeliver(deliveryId: string): Promise<OrderRow | null> {
  return fetchOrNull(
    () =>
      supabase
        .from('orders')
        .select('*')
        .eq('delivery_id', deliveryId)
        .eq('status', 'out_for_delivery')
        .maybeSingle(),
    { fallbackMessage: 'Failed to load active delivery' }
  );
}

/**
 * Mirrors `api/delivery.dashboard.ts` → `getRecantOrdersDeliverd()`.
 *
 * The courier's 50 most recent orders.
 */
export async function getRecantOrdersDeliverd(deliveryId: string): Promise<OrderRow[]> {
  return mutate(
    () =>
      supabase
        .from('orders')
        .select('*')
        .eq('delivery_id', deliveryId)
        .order('created_at', { ascending: false })
        .limit(50),
    { fallbackMessage: 'Failed to load orders' }
  );
}
