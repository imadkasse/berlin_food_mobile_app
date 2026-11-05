import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeStoreState = {
  /** The user's theme preference. NativeWind's color scheme override is
   *  kept in sync with this value by the ThemeProvider. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'berlin-food.theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
