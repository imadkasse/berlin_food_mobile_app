/**
 * Authentication service.
 *
 * Ported from the web app: `client/src/api/auth.ts`.
 *
 * The web app's `createUser()` is intentionally NOT ported — it calls
 * `supabaseAdmin.auth.admin.createUser()` with a service-role key to create
 * confirmed accounts on behalf of an administrator. A mobile app ships with
 * the public anon key only, so account creation must go through the normal
 * `signUp()` flow below (which sends the confirmation email).
 */

import type { ProfileInsert } from '@/types/database.types';

import { supabase } from './supabase';
import { toServiceError } from './supabase/query';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  profile: Omit<ProfileInsert, 'id'>;
};

/**
 * Mirrors `api/auth.ts` → `login()`.
 */
export async function login({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw toServiceError(error, 'Failed to sign in');
  }

  return data;
}

/**
 * Mirrors `api/auth.ts` → `register()`.
 *
 * The `profiles` row is created by a database trigger from the `options.data`
 * metadata — never inserted from the client. The metadata shape is unchanged:
 * full name, phone number, role (defaulting to `customer`), address, vehicle
 * type (`null` for customers, defaulting to `motorcycle` otherwise) and the
 * availability status (defaulting to `true`).
 */
export async function register({ email, password, profile }: RegisterInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        role: profile.role || 'customer',
        address: profile.address,
        vehicle_type: profile.role === 'customer' ? null : profile.vehicle_type || 'motorcycle',
        availability_status: profile.availability_status ?? true,
      },
    },
  });

  if (error) {
    throw toServiceError(error, 'Failed to sign up');
  }

  return data;
}

/**
 * Mirrors `api/auth.ts` → `signupWithGoogle()`.
 *
 * The redirect URL is passed in by the caller because the mobile app builds it
 * from the Expo scheme (see `features/auth/oauth.ts` → `getAuthRedirectUrl()`),
 * while the web app derives it from `window.location.origin`.
 */
export async function signupWithGoogle(redirectTo: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw toServiceError(error, 'Failed to sign in with Google');
  }

  return data;
}

/**
 * Mirrors `api/auth.ts` → `logout()`.
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw toServiceError(error, 'Failed to sign out');
  }
}

/**
 * Mirrors `api/auth.ts` → `forgotPassword()`.
 *
 * The web app hard-codes `${window.location.origin}/auth/reset-password`; the
 * mobile app passes the deep link that the app can actually handle.
 */
export async function forgotPassword(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw toServiceError(error, 'Failed to send reset password email');
  }
}

/**
 * Mirrors `api/auth.ts` → `resetPassword()`.
 *
 * Updates the password of the currently signed-in (recovery) session.
 */
export async function resetPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw toServiceError(error, 'Failed to reset password');
  }
}

/**
 * Mirrors `api/auth.ts` → `updatePassword()`.
 */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw toServiceError(error, 'Failed to update password');
  }
}

/**
 * `createUser()` from the web app is NOT available on the mobile client.
 *
 * The web implementation calls `supabaseAdmin.auth.admin.createUser()`, which
 * requires a service-role key. A mobile app ships with the public anon key, so
 * accounts can only be created through the regular sign-up flow (`register()`),
 * where the confirmation email is delivered by Supabase itself.
 */
export const CREATE_USER_UNAVAILABLE =
  'Creating confirmed accounts requires a service-role client and is not available in the mobile app.';
