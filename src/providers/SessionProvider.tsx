import { createContext, useContext, useEffect, useMemo } from 'react';

import { supabase } from '@/services/supabase';
import { useSessionStore } from '@/stores/session.store';
import { normalizeRole, type AppRole, type Profile } from '@/types/models';
import type { Session } from '@supabase/supabase-js';

export type SessionContextValue = {
  status: 'loading' | 'signed-out' | 'signed-in';
  session: Session | null;
  profile: Profile | null;
  role: AppRole;
  isSignedIn: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Owns the single Supabase auth subscription for the whole app and mirrors it
 * into `useSessionStore`. Mount it once, inside the root layout.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const status = useSessionStore((state) => state.status);
  const session = useSessionStore((state) => state.session);
  const profile = useSessionStore((state) => state.profile);
  const setSession = useSessionStore((state) => state.setSession);
  const setProfile = useSessionStore((state) => state.setProfile);
  const setStatus = useSessionStore((state) => state.setStatus);
  const refreshProfile = useSessionStore((state) => state.refreshProfile);
  const signOut = useSessionStore((state) => state.signOut);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;

        setSession(data.session);
        setStatus(data.session ? 'signed-in' : 'signed-out');

        if (data.session) {
          refreshProfile().catch(() => {});
        }
      })
      .catch(() => {
        if (active) setStatus('signed-out');
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Never `await` inside this callback — Supabase auth holds a lock while
      // dispatching, and awaiting here can deadlock the session refresh.
      setSession(nextSession);
      setStatus(nextSession ? 'signed-in' : 'signed-out');

      if (nextSession) {
        setTimeout(() => {
          refreshProfile().catch(() => {});
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile, setProfile, setSession, setStatus]);

  const role = useMemo(
    () =>
      normalizeRole(
        // Prefer the canonical `profiles.role`, and fall back to the auth
        // metadata mirror while that row is still loading so a freshly signed
        // in admin never flickers through the customer navigator.
        profile?.role ?? (session?.user.user_metadata?.role as string | undefined)
      ),
    [profile?.role, session?.user.user_metadata]
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      profile,
      role,
      isSignedIn: status === 'signed-in',
      isLoading: status === 'loading',
      signOut,
      refreshProfile,
    }),
    [status, session, profile, role, signOut, refreshProfile]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Reads the app-wide session. Must be used under `SessionProvider`. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}
