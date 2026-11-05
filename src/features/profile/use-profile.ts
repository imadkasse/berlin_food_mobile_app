import { useCallback, useState } from 'react';

import { getErrorMessage } from '@/features/menu/utils';
import { useSession } from '@/providers/SessionProvider';
import { updatePassword as updateUserPassword, updateProfile } from '@/services';

export type UseProfileEditorResult = {
  fullName: string;
  phoneNumber: string;
  setFullName: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  save: () => Promise<boolean>;
};

/**
 * Personal-details draft + save. The draft is initialised from the session
 * profile; the owning section is keyed by the profile values so a refreshed
 * profile remounts it with the canonical values (no setState in an effect).
 */
export function useProfileEditor(): UseProfileEditorResult {
  const { profile, refreshProfile } = useSession();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const save = async (): Promise<boolean> => {
    const name = fullName.trim();

    if (!profile?.id) {
      setError('You need to sign in again.');
      return false;
    }

    if (!name) {
      setError('Please enter your full name.');
      return false;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(profile.id, {
        full_name: name,
        phone_number: phoneNumber.trim() || null,
      });

      await refreshProfile();
      setSuccess('Your details are saved.');
      return true;
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'We could not save your details.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fullName,
    phoneNumber,
    setFullName,
    setPhoneNumber,
    isSaving,
    error,
    success,
    save,
  };
}

export type UsePasswordUpdateResult = {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  updatePassword: () => Promise<boolean>;
};

/** Password change with the web app's validation: both fields, match, min 6. */
export function usePasswordUpdate(): UsePasswordUpdateResult {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updatePassword = useCallback(async (): Promise<boolean> => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('The two passwords do not match.');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Use at least 6 characters.');
      return false;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserPassword(newPassword);

      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Your password is updated.');
      return true;
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'We could not update your password.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [confirmPassword, newPassword]);

  return {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    isSaving,
    error,
    success,
    updatePassword,
  };
}
