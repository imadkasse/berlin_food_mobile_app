import { useCallback, useEffect, useState } from 'react';

import { createRequest, getRequestByEmail, getRequestById, register } from '@/services';
import type { DeliveryRequest, VehicleType } from '@/types/models';

import { getErrorMessage } from './errors';

export type DeliveryApplicationInput = {
  full_name: string;
  email: string;
  phone_number: string;
};

export type DeliveryVehicle = Extract<VehicleType, 'bicycle' | 'scooter' | 'car' | 'van'>;

/**
 * Courier application: inserts into `delivery_requests` exactly like the web
 * app's `createRequest()`. The request status is left to the database default
 * (`pending`) — never set from the client.
 */
export function useDeliveryApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = useCallback(async (input: DeliveryApplicationInput): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createRequest({
        full_name: input.full_name.trim(),
        email: input.email.trim(),
        phone_number: input.phone_number.trim(),
      });

      setIsSubmitted(true);
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not submit your application.'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, error, isSubmitted, submit };
}

/** Looks up a courier application by email (web `getRequestByEmail`). */
export function useTrackDeliveryRequest() {
  const [email, setEmailState] = useState('');
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setError(null);
    setNotFound(false);
    setRequest(null);
  }, []);

  const search = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    setRequest(null);

    try {
      const data = await getRequestByEmail(email.trim());

      if (!data) {
        setNotFound(true);
        return;
      }

      setRequest(data as unknown as DeliveryRequest);
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not look up your application.'));
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return { email, request, isLoading, notFound, error, setEmail, search };
}

/**
 * Loads an approved application by id for the completion screen. A missing
 * row is surfaced as `notFound` so the screen can show an expired state.
 */
export function useDeliveryRequestById(requestId: string | undefined) {
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!active) return;

      if (!requestId) {
        setRequest(null);
        setNotFound(true);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getRequestById(requestId);

        if (!active) return;

        if (!data) {
          setNotFound(true);
          setRequest(null);
          return;
        }

        setRequest(data as unknown as DeliveryRequest);
      } catch (caught) {
        if (!active) return;
        setError(getErrorMessage(caught, 'We could not load this application.'));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [requestId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { request, isLoading, notFound, error, reload };
}

export type CompleteDeliveryInput = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  vehicleType: DeliveryVehicle;
};

/**
 * Courier account creation after approval. Mirrors `register()` with
 * `role: 'delivery'` from the web app; the profile row is created by the
 * database trigger.
 *
 * The web app additionally deletes the approved request through an admin
 * client. That requires service-role privileges, so the mobile client leaves
 * the request in place (a DB trigger/RPC would be the safe equivalent).
 */
export function useCompleteDeliveryRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submit = useCallback(async (input: CompleteDeliveryInput): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await register({
        email: input.email.trim(),
        password: input.password,
        profile: {
          full_name: input.fullName.trim(),
          phone_number: input.phoneNumber.trim(),
          role: 'delivery',
          address: input.address.trim(),
          vehicle_type: input.vehicleType,
          availability_status: true,
        },
      });

      setIsSuccess(true);
      return data.user !== null;
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not create your courier account.'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, error, isSuccess, submit };
}
