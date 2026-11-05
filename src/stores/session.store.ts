import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { getProfile, logout } from '@/services';
import type { Profile } from '@/types/models';

export type SessionStatus = 'loading' | 'signed-out' | 'signed-in';

export type SessionState = {
  status: SessionStatus;
  session: Session | null;
  /** The signed-in user's row from `public.profiles`. */
  profile: Profile | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setStatus: (status: SessionStatus) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

/**
 * Session state. No `persist` middleware: Supabase already persists the auth
 * session in SecureStore (see `services/supabase/secure-storage.ts`), and the
 * profile is re-fetched on launch by `SessionProvider`.
 */
export const useSessionStore = create<SessionState>((set) => ({
  status: 'loading',
  session: null,
  profile: null,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setStatus: (status) => set({ status }),

  refreshProfile: async () => {
    const userId = useSessionStore.getState().session?.user.id;

    if (!userId) {
      set({ profile: null });
      return;
    }

    try {
      const data = await getProfile(userId);

      if (!data) {
        set({ profile: null });
        return;
      }

      set({ profile: data as unknown as Profile });
    } catch {
      set({ profile: null });
    }
  },

  signOut: async () => {
    await logout();
    set({ session: null, profile: null, status: 'signed-out' });
  },
}));
