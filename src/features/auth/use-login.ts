import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';

import { login, signupWithGoogle } from '@/services';

import { getErrorMessage } from './errors';
import { createSessionFromAuthUrl, getAuthRedirectUrl, isAppRedirectUrl } from './oauth';
import { validateEmail, validateRequired } from './validation';

type LoginErrors = {
  email?: string;
  password?: string;
};

export type LoginForm = {
  email: string;
  password: string;
  errors: LoginErrors;
  error: string | null;
  notice: string | null;
  isSubmitting: boolean;
  isGoogleLoading: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: () => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
};

/**
 * Email/password and Google sign-in. Mirrors `client/src/api/auth.ts` while
 * keeping the OAuth browser round-trip native (no redirect page).
 */
export function useLogin(): LoginForm {
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setErrors((current) => ({ ...current, email: undefined }));
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    setErrors((current) => ({ ...current, password: undefined }));
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    const nextErrors: LoginErrors = {
      email: validateEmail(email) ?? undefined,
      password: validateRequired(password, 'password') ?? undefined,
    };

    setErrors(nextErrors);
    setError(null);
    setNotice(null);

    if (nextErrors.email || nextErrors.password) {
      return false;
    }

    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });

      setNotice('Signed in. Taking you to your account…');
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not sign you in. Check your details.'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setError(null);
    setNotice(null);
    setIsGoogleLoading(true);

    try {
      const redirectTo = getAuthRedirectUrl();

      // Native OAuth pattern: ask Supabase for the authorize URL only, then
      // open it in the system auth session and consume the returned deep link
      // directly. No callback route is needed — one would race
      // `openAuthSessionAsync` and double-consume a PKCE code.
      const data = await signupWithGoogle(redirectTo);

      if (!data.url) {
        setError('Google sign-in could not be started. Please try again.');
        return false;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success') {
        setNotice('Google sign-in was cancelled.');
        return false;
      }

      // Supabase silently falls back to the project Site URL when `redirectTo`
      // is not allow-listed, so the browser lands on the web app. Detect that
      // instead of trying to parse a web URL for tokens.
      if (!isAppRedirectUrl(result.url)) {
        setError(
          `Google returned to the website instead of the app. Add ${redirectTo} to Supabase → Authentication → URL Configuration → Redirect URLs.`
        );
        return false;
      }

      await createSessionFromAuthUrl(result.url);
      setNotice('Signed in. Taking you to your account…');
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not complete Google sign-in.'));
      return false;
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  return {
    email,
    password,
    errors,
    error,
    notice,
    isSubmitting,
    isGoogleLoading,
    setEmail,
    setPassword,
    submit,
    signInWithGoogle,
  };
}
