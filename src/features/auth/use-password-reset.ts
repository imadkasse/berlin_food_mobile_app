import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';

import { forgotPassword, resetPassword } from '@/services';

import { getErrorMessage } from './errors';
import { createSessionFromAuthUrl, hasAuthParams } from './oauth';
import { validateEmail, validatePassword, validatePasswordConfirmation } from './validation';

export function useForgotPassword() {
  const [email, setEmailState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setFieldError(null);
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    const emailError = validateEmail(email);
    setFieldError(emailError);
    setError(null);

    if (emailError) return false;

    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim(), Linking.createURL('/auth/reset-password'));

      setIsSubmitted(true);
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not send the reset email.'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  const reset = useCallback(() => {
    setIsSubmitted(false);
    setError(null);
  }, []);

  return {
    email,
    fieldError,
    error,
    isSubmitting,
    isSubmitted,
    setEmail,
    submit,
    reset,
  };
}

export function useResetPassword() {
  const [password, setPasswordState] = useState('');
  const [confirmation, setConfirmationState] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmation?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    setErrors((current) => ({ ...current, password: undefined }));
    setError(null);
  }, []);

  const setConfirmation = useCallback((value: string) => {
    setConfirmationState(value);
    setErrors((current) => ({ ...current, confirmation: undefined }));
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    const nextErrors = {
      password: validatePassword(password, 6) ?? undefined,
      confirmation: validatePasswordConfirmation(password, confirmation) ?? undefined,
    };

    setErrors(nextErrors);
    setError(null);

    if (nextErrors.password || nextErrors.confirmation) return false;

    setIsSubmitting(true);

    try {
      await resetPassword(password);

      setIsSuccess(true);
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not update your password.'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmation, password]);

  return {
    password,
    confirmation,
    errors,
    error,
    isSubmitting,
    isSuccess,
    setPassword,
    setConfirmation,
    submit,
  };
}

/**
 * Turns a Supabase recovery deep link into a session.
 *
 * The shared client disables `detectSessionInUrl` (it is not reliable on
 * native), so the password-reset screen reads the incoming URL itself and
 * exchanges either implicit tokens or a PKCE code.
 */
export function useRecoverySession() {
  const url = Linking.useURL();
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !hasAuthParams(url)) return;

    const authUrl = url;
    let active = true;

    async function restore() {
      setIsRecovering(true);
      setError(null);

      try {
        await createSessionFromAuthUrl(authUrl);
      } catch (caught) {
        if (active) {
          setError(getErrorMessage(caught, 'This password reset link is invalid or has expired.'));
        }
      } finally {
        if (active) setIsRecovering(false);
      }
    }

    void restore();

    return () => {
      active = false;
    };
  }, [url]);

  return { isRecovering, error };
}
