import { useCallback, useState } from 'react';

import { register } from '@/services';
import type { DeliveryAddress } from '@/types/models';

import { getErrorMessage } from './errors';

export type CustomerRegistrationInput = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: {
    lat: number;
    lng: number;
    label?: string;
    formatted?: string;
  };
};

export type RegistrationResult = {
  ok: boolean;
  error: string | null;
  /** True when Supabase requires the user to confirm their email first. */
  needsEmailConfirmation: boolean;
};

/**
 * Final customer sign-up (step 3).
 *
 * Mirrors `register()` from the web app: the profile row is created by the
 * database trigger from `options.data`, never inserted from the client.
 */
export function useCustomerRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: CustomerRegistrationInput): Promise<RegistrationResult> => {
      setIsSubmitting(true);
      setError(null);

      const address: DeliveryAddress = {
        lat: input.address.lat,
        lng: input.address.lng,
        label: input.address.label?.trim() || undefined,
        formatted:
          input.address.formatted?.trim() ||
          `${input.address.lat.toFixed(5)}, ${input.address.lng.toFixed(5)}`,
      };

      try {
        const data = await register({
          email: input.email.trim(),
          password: input.password,
          profile: {
            full_name: input.fullName.trim(),
            phone_number: input.phoneNumber.trim(),
            role: 'customer',
            address,
            vehicle_type: null,
            availability_status: true,
          },
        });

        return {
          ok: true,
          error: null,
          needsEmailConfirmation: data.session === null,
        };
      } catch (caught) {
        const message = getErrorMessage(caught, 'We could not create your account.');
        setError(message);
        return { ok: false, error: message, needsEmailConfirmation: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { isSubmitting, error, submit };
}
