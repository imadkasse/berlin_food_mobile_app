import { useCallback, useState } from 'react';

import { getErrorMessage } from '@/features/menu/utils';
import { useSession } from '@/providers/SessionProvider';
import { updateProfile } from '@/services';

import { parseAddresses, serializeAddresses, type SavedAddress } from './addresses';

export type UseAddressesResult = {
  addresses: SavedAddress[];
  isSaving: boolean;
  refreshing: boolean;
  error: string | null;
  saveAddress: (address: SavedAddress) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  clearError: () => void;
};

/**
 * Reads and writes the `profiles.address` JSON.
 *
 * NOTE: the web app's `handleUpdateAddressInfo` calls `updateProfile` with the
 * personal-info object (`full_name` / `phone_number`) instead of the address,
 * so its address write is broken and never persists. Mobile writes the whole
 * array back to `profiles.address` — a single object when there is only one —
 * which is exactly the shape the web cart and map picker read.
 */
export function useAddresses(): UseAddressesResult {
  const { profile, session, refreshProfile } = useSession();

  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived from the session profile rather than mirrored into local state, so
  // a successful refresh always reseeds the list without an effect.
  const addresses = parseAddresses(profile?.address);

  const clearError = useCallback(() => setError(null), []);

  const persist = useCallback(
    async (next: SavedAddress[]): Promise<boolean> => {
      const userId = session?.user.id;

      if (!userId) {
        setError('You need to sign in to manage delivery addresses.');
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        await updateProfile(userId, { address: serializeAddresses(next) });

        await refreshProfile();
        return true;
      } catch (saveError) {
        setError(getErrorMessage(saveError, 'We could not save your address.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshProfile, session?.user.id]
  );

  const saveAddress = useCallback(
    async (address: SavedAddress): Promise<boolean> => {
      const exists = addresses.some((entry) => entry.id === address.id);
      const next = exists
        ? addresses.map((entry) => (entry.id === address.id ? address : entry))
        : [...addresses, address];

      return persist(next);
    },
    [addresses, persist]
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      return persist(addresses.filter((entry) => entry.id !== id));
    },
    [addresses, persist]
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  return {
    addresses,
    isSaving,
    refreshing,
    error,
    saveAddress,
    deleteAddress,
    refresh,
    clearError,
  };
}
