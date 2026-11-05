import { useSyncExternalStore } from 'react';
import { useThemeStore } from '@/stores';

function onHydrationFinish(callback: () => void) {
  return useThemeStore.persist.onFinishHydration(callback);
}

function isHydrated() {
  return useThemeStore.persist.hasHydrated();
}

/**
 * Tracks whether the persisted theme preference has been rehydrated from
 * storage. The root layout gates first render (and the splash screen) on
 * this so the app never flashes the wrong theme on cold start.
 */
export function useThemeHydration(): boolean {
  return useSyncExternalStore(
    onHydrationFinish,
    isHydrated,
    // Server rendering (web) can't read storage — assume hydrated.
    () => true
  );
}
