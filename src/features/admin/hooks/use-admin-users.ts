import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAllProfiles, updateProfile } from '@/services';
import type { Profile } from '@/types/models';

import type { EditableRole, UserDraft } from '../types';
import { errorMessage } from '../utils';

const PAGE_SIZE = 10;

export type AvailabilityFilter = 'all' | 'available' | 'unavailable';

/**
 * Admin user directory. Mirrors `getAllProfiles` in the web app: `profiles`
 * ordered by `updated_at` desc (with `id` as a stable tiebreaker) plus exact
 * count pagination. Editing mirrors `updateProfile`.
 *
 * Creating and deleting users is intentionally absent: the web performs those
 * through server routes that use the service-role key, which must never ship
 * in the mobile bundle.
 */
export function useAdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | EditableRole>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');

  const load = useCallback(async (targetPage: number, mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { profiles: rows, count: total } = await getAllProfiles(targetPage, PAGE_SIZE);

      setUsers((rows ?? []) as unknown as Profile[]);
      setCount(total ?? 0);
    } catch (queryError) {
      setError(errorMessage(queryError, 'Failed to load profiles'));
      setUsers([]);
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

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !query ||
        (user.full_name ?? '').toLowerCase().includes(query) ||
        (user.phone_number ?? '').toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available'
          ? user.availability_status === true
          : user.availability_status !== true);
      return matchesSearch && matchesRole && matchesAvailability;
    });
  }, [availabilityFilter, roleFilter, search, users]);

  const updateUser = useCallback(async (id: string, draft: UserDraft): Promise<boolean> => {
    setSaving(true);
    setActionError(null);

    let updated: Profile;
    try {
      const row = await updateProfile(id, {
        full_name: draft.full_name.trim(),
        phone_number: draft.phone_number.trim(),
        role: draft.role,
        vehicle_type: draft.role === 'delivery' ? draft.vehicle_type : null,
        availability_status: draft.availability_status,
      });
      updated = row as unknown as Profile;
    } catch (updateError) {
      setActionError(errorMessage(updateError, 'Failed to update profile'));
      setSaving(false);
      return false;
    }

    setUsers((current) => current.map((user) => (user.id === id ? updated : user)));
    setSaving(false);
    return true;
  }, []);

  return {
    users,
    filteredUsers,
    count,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    loading,
    refreshing,
    error,
    actionError,
    saving,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    availabilityFilter,
    setAvailabilityFilter,
    refresh,
    clearActionError,
    goToPage,
    updateUser,
  };
}
