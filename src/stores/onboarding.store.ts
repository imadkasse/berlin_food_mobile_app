import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OnboardingAddress = {
  lat: number;
  lng: number;
};

export type OnboardingDraft = {
  full_name: string;
  phone_number: string;
  email: string;
  /** Kept in memory only — never written to AsyncStorage. */
  password: string;
  address: OnboardingAddress | null;
};

export type OnboardingProgressStep = 1 | 2 | 3;

type OnboardingState = {
  draft: OnboardingDraft;
  setDetails: (details: Pick<OnboardingDraft, 'full_name' | 'phone_number'>) => void;
  setAccount: (account: Pick<OnboardingDraft, 'email' | 'password'>) => void;
  setAddress: (address: OnboardingAddress) => void;
  reset: () => void;
};

const EMPTY_DRAFT: OnboardingDraft = {
  full_name: '',
  phone_number: '',
  email: '',
  password: '',
  address: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: EMPTY_DRAFT,

      setDetails: (details) => set((state) => ({ draft: { ...state.draft, ...details } })),

      setAccount: (account) => set((state) => ({ draft: { ...state.draft, ...account } })),

      setAddress: (address) => set((state) => ({ draft: { ...state.draft, address } })),

      reset: () => set({ draft: EMPTY_DRAFT }),
    }),
    {
      name: 'berlin-food.onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * Intentionally omit `password`: credentials must never be written to
       * plain AsyncStorage. The password stays in memory for the duration of
       * the registration flow and is cleared on `reset()`.
       */
      partialize: (state) => ({
        draft: {
          full_name: state.draft.full_name,
          phone_number: state.draft.phone_number,
          email: state.draft.email,
          password: '',
          address: state.draft.address,
        },
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<OnboardingState> | undefined;
        return {
          ...current,
          ...persistedState,
          draft: { ...current.draft, ...persistedState?.draft, password: '' },
        };
      },
    }
  )
);

/**
 * Derived onboarding progress: 1 while personal details are missing, 2 until
 * an address is chosen, 3 when the draft is complete.
 */
export function selectProgressStep(state: OnboardingState): OnboardingProgressStep {
  const { full_name, phone_number, email, address } = state.draft;

  if (!full_name.trim() || !phone_number.trim() || !email.trim()) return 1;
  if (!address) return 2;
  return 3;
}
