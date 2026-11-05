import { useCallback, useState } from 'react';

import { useSession } from '@/providers/SessionProvider';
import { updatePassword as updatePasswordInService, updateProfile } from '@/services';

import { errorMessage } from '../utils';

export type ProfileDetailsDraft = {
  full_name: string;
  phone_number: string;
};

/**
 * Admin profile state. Mirrors the web `ProfileSettings` flow for the pieces
 * that are safe on a public client: `profiles.update` for personal details and
 * `supabase.auth.updateUser` for password changes.
 */
export function useAdminProfile() {
  const { profile, session, refreshProfile, signOut } = useSession();
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const updateDetails = useCallback(
    async (draft: ProfileDetailsDraft): Promise<boolean> => {
      const userId = session?.user.id;
      if (!userId) {
        setDetailsError('You are not signed in.');
        return false;
      }

      setSavingDetails(true);
      setDetailsError(null);
      setDetailsSaved(false);

      try {
        await updateProfile(userId, {
          full_name: draft.full_name.trim(),
          phone_number: draft.phone_number.trim(),
        });
      } catch (error) {
        setDetailsError(errorMessage(error, 'Failed to update profile'));
        setSavingDetails(false);
        return false;
      }

      await refreshProfile();
      setSavingDetails(false);
      setDetailsSaved(true);
      return true;
    },
    [refreshProfile, session?.user.id]
  );

  const updatePassword = useCallback(async (next: string): Promise<boolean> => {
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSaved(false);

    try {
      await updatePasswordInService(next);
    } catch (error) {
      setPasswordError(errorMessage(error, 'Failed to update password'));
      setSavingPassword(false);
      return false;
    }

    setSavingPassword(false);
    setPasswordSaved(true);
    return true;
  }, []);

  return {
    profile,
    email: session?.user.email ?? null,
    signOut,
    savingDetails,
    savingPassword,
    detailsError,
    passwordError,
    detailsSaved,
    passwordSaved,
    updateDetails,
    updatePassword,
  };
}
