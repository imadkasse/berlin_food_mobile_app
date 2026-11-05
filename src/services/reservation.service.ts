/**
 * Reservation service.
 *
 * Ported from the web app: `client/src/api/reservations.ts`.
 *
 * Business rules are unchanged: identical filters and the same ordering by
 * `reservation_time` (ascending).
 */

import type { ReservationInsert, ReservationRow } from '@/types/database.types';

import { supabase } from './supabase';
import { fetchOrNull, mutate } from './supabase/query';

/**
 * Mirrors `api/reservations.ts` → `getReservations()`.
 *
 * All reservations, soonest first.
 */
export async function getReservations(): Promise<ReservationRow[]> {
  return mutate(
    () => supabase.from('reservations').select('*').order('reservation_time', { ascending: true }),
    { fallbackMessage: 'Failed to load reservations' }
  );
}

/**
 * Mirrors `api/reservations.ts` → `getCustomerReservations()`.
 */
export async function getCustomerReservations(customerId: string): Promise<ReservationRow[]> {
  return mutate(
    () =>
      supabase
        .from('reservations')
        .select('*')
        .eq('customer_id', customerId)
        .order('reservation_time', { ascending: true }),
    { fallbackMessage: 'Failed to load reservations' }
  );
}

/**
 * Mirrors `api/reservations.ts` → `getReservationById()`.
 *
 * `PGRST116` ("0 rows") resolves to `null` exactly like the web app.
 */
export async function getReservationById(id: string): Promise<ReservationRow | null> {
  return fetchOrNull(() => supabase.from('reservations').select('*').eq('id', id).single(), {
    fallbackMessage: 'Failed to load reservation',
  });
}

/**
 * Mirrors `api/reservations.ts` → `createReservation()`.
 */
export async function createReservation(reservation: ReservationInsert): Promise<ReservationRow> {
  return mutate(() => supabase.from('reservations').insert(reservation).select().single(), {
    fallbackMessage: 'Failed to create reservation',
  });
}

/**
 * Mirrors `api/reservations.ts` → `updateReservationStatus()`.
 */
export async function updateReservationStatus(id: string, status: string): Promise<ReservationRow> {
  return mutate(
    () => supabase.from('reservations').update({ status }).eq('id', id).select().single(),
    { fallbackMessage: 'Failed to update reservation status' }
  );
}
