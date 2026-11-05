import { useCallback, useState } from 'react';

import { useSession } from '@/providers/SessionProvider';
import { updateProfile } from '@/services';
import type { Profile, VehicleType } from '@/types/models';
import type { DeliveryNoticeData } from '../components/DeliveryNotice';
import { errorMessage, isVehicleType } from '../lib/format';

export type DeliveryProfileDraft = {
  full_name: string;
  phone_number: string;
  vehicle_type: VehicleType;
  availability_status: boolean;
};

export type UseDeliveryProfileResult = {
  profile: Profile | null;
  isLoading: boolean;
  draft: DeliveryProfileDraft;
  isSaving: boolean;
  notice: DeliveryNoticeData | null;
  dismissNotice: () => void;
  setField: <K extends keyof DeliveryProfileDraft>(key: K, value: DeliveryProfileDraft[K]) => void;
  save: () => Promise<boolean>;
};

function toDraft(profile: Profile | null): DeliveryProfileDraft {
  return {
    full_name: profile?.full_name ?? '',
    phone_number: profile?.phone_number ?? '',
    vehicle_type: isVehicleType(profile?.vehicle_type) ? profile.vehicle_type : 'bicycle',
    availability_status: profile?.availability_status ?? false,
  };
}

/**
 * Courier profile form state. Saving writes the same four columns as the web
 * (`full_name`, `phone_number`, `vehicle_type`, `availability_status`) through
 * `profiles.update`, then refreshes the session profile.
 */
export function useDeliveryProfile(): UseDeliveryProfileResult {
  const { session, profile, isLoading, refreshProfile } = useSession();
  const [draft, setDraft] = useState<DeliveryProfileDraft>(() => toDraft(profile));
  const [syncedProfile, setSyncedProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<DeliveryNoticeData | null>(null);

  // Seed the form when the session profile arrives (or is refreshed after a
  // save or a dashboard availability change). Comparing the profile reference
  // keeps typing — which never replaces the profile object — from resetting
  // the form.
  if (profile !== syncedProfile) {
    setSyncedProfile(profile);
    setDraft(toDraft(profile));
  }

  const setField = useCallback(
    <K extends keyof DeliveryProfileDraft>(key: K, value: DeliveryProfileDraft[K]) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  const save = useCallback(async () => {
    const userId = session?.user.id;

    if (!userId) {
      setNotice({ tone: 'error', message: 'Sign in again to update your profile.' });
      return false;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      await updateProfile(userId, {
        full_name: draft.full_name.trim() || null,
        phone_number: draft.phone_number.trim() || null,
        vehicle_type: draft.vehicle_type,
        availability_status: draft.availability_status,
      });

      await refreshProfile();
      setNotice({ tone: 'success', message: 'Your courier profile has been updated.' });
      return true;
    } catch (saveError) {
      setNotice({
        tone: 'error',
        message: errorMessage(saveError, 'We could not save your profile. Please try again.'),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [draft, refreshProfile, session?.user.id]);

  return {
    profile,
    isLoading,
    draft,
    isSaving,
    notice,
    dismissNotice,
    setField,
    save,
  };
}
