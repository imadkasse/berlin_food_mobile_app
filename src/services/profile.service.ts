/**
 * Profile service.
 *
 * Ported from the web app: `client/src/api/profiles.ts`.
 *
 * Note: `createProfile()` from the web app is intentionally NOT ported.
 * In the web app the `profiles` row is created by a database trigger that runs
 * when the corresponding `auth.users` row is inserted (see
 * `client/src/api/auth.ts` → `register()`). Inserting a profile from the
 * client would therefore create a duplicate row. Profile creation happens in
 * `auth.service.ts` → `register()` only.
 */

import type { ProfileRow, ProfileUpdate } from '@/types/database.types';

import { supabase } from './supabase';
import { fetchOrNull, mutate, toServiceError } from './supabase/query';

/**
 * Mirrors `api/profiles.ts` → `getProfile()`.
 *
 * `PGRST116` ("0 rows") resolves to `null` exactly like the web app.
 */
export async function getProfile(id: string): Promise<ProfileRow | null> {
  return fetchOrNull(() => supabase.from('profiles').select('*').eq('id', id).single(), {
    fallbackMessage: 'Failed to load profile',
  });
}

/**
 * Mirrors `api/profiles.ts` → `updateProfile()`.
 */
export async function updateProfile(id: string, profile: ProfileUpdate): Promise<ProfileRow> {
  return mutate(() => supabase.from('profiles').update(profile).eq('id', id).select().single(), {
    fallbackMessage: 'Failed to update profile',
  });
}

/**
 * Mirrors `api/profiles.ts` → `updateProfileRole()`.
 */
export async function updateProfileRole(
  id: string,
  role: 'admin' | 'customer' | 'delivery' | 'support'
): Promise<ProfileRow> {
  return mutate(() => supabase.from('profiles').update({ role }).eq('id', id).select().single(), {
    fallbackMessage: 'Failed to update profile role',
  });
}

/**
 * Mirrors `api/profiles.ts` → `getAllProfiles()`.
 *
 * Uses the web app's double ordering (most recently updated first, then by id)
 * together with an exact count and range pagination.
 */
export async function getAllProfiles(
  page: number,
  pageSize: number
): Promise<{ profiles: ProfileRow[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: true })
    .range(from, to);

  if (error) {
    throw toServiceError(error, 'Failed to load profiles');
  }

  return { profiles: data ?? [], count: count ?? 0 };
}

/**
 * Mirrors `api/profiles.ts` → `rateDelivery()`.
 *
 * Calls the `add_delivery_rating` RPC which updates the courier's rating and
 * rating count server-side.
 */
export async function rateDelivery(deliveryId: string, rating: number): Promise<void> {
  const { error } = await supabase.rpc('add_delivery_rating', {
    delivery_id: deliveryId,
    new_rating: rating,
  });

  if (error) {
    throw toServiceError(error, 'Failed to rate delivery');
  }
}

/**
 * `deleteProfile()` from the web app is NOT available on the mobile client.
 *
 * The web implementation calls `supabase.auth.admin.deleteUser(id)`, which
 * requires a service-role key. A mobile app ships with the public anon key, so
 * this operation must stay on the server (the web app's server actions).
 *
 * The database trigger that removes the `profiles` row when the `auth.users`
 * row disappears is therefore never triggered from the mobile client.
 */
export const DELETE_PROFILE_UNAVAILABLE =
  'Deleting a profile requires a service-role client and is not available in the mobile app.';
