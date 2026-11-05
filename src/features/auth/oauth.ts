import * as Linking from 'expo-linking';

import { supabase } from '@/services/supabase';

/** Path of the deep link Supabase sends the user back to. */
export const AUTH_CALLBACK_PATH = 'auth/callback';

/** Scheme declared as `expo.scheme` in `app.json`. */
const APP_SCHEME = 'berlinfood';

/** Scheme Expo Go uses for development deep links. */
const EXPO_GO_SCHEME = 'exp';

/**
 * Deep link Supabase should redirect to after the Google round-trip.
 *
 * In a native/dev build this is `berlinfood://auth/callback`; in Expo Go it is
 * `exp://<host>/--/auth/callback`. Both `berlinfood://**` and `exp://**` must be
 * allow-listed in Supabase → Authentication → URL Configuration, otherwise
 * Supabase ignores `redirectTo` and falls back to the project Site URL.
 */
export function getAuthRedirectUrl(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}

/**
 * True when a redirect URL belongs to this app (native scheme) or to Expo Go.
 *
 * Used to fail loudly when Supabase falls back to the web Site URL instead of
 * honouring `redirectTo`.
 */
export function isAppRedirectUrl(url: string): boolean {
  try {
    const scheme = Linking.parse(url).scheme?.toLowerCase();
    return scheme === APP_SCHEME || scheme === EXPO_GO_SCHEME;
  } catch {
    return false;
  }
}

function readParams(url: string): URLSearchParams {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');

  const raw =
    hashIndex >= 0 ? url.slice(hashIndex + 1) : queryIndex >= 0 ? url.slice(queryIndex + 1) : '';

  return new URLSearchParams(raw);
}

/**
 * Completes a native OAuth redirect.
 *
 * Supabase returns either implicit-flow tokens in the fragment (default) or a
 * PKCE `code` in the query string. Both shapes are handled here so the flow
 * works regardless of the project's OAuth flow configuration.
 */
export async function createSessionFromAuthUrl(url: string): Promise<void> {
  const params = readParams(url);

  const errorDescription = params.get('error_description') ?? params.get('error');
  if (errorDescription) {
    throw new Error(errorDescription.replace(/\+/g, ' '));
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return;
  }

  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  throw new Error('The sign-in link did not contain a valid session.');
}

/** True when a deep link carries Supabase auth tokens or a PKCE code. */
export function hasAuthParams(url: string): boolean {
  const params = readParams(url);

  return ['access_token', 'refresh_token', 'code', 'error', 'error_description'].some((key) =>
    params.has(key)
  );
}
