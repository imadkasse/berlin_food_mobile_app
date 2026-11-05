import type { Href } from 'expo-router';

/**
 * ROUTES intentionally stores plain strings so the same constants can feed
 * expo-router, tab configuration and deep links. Expo's generated typed-route
 * union occasionally lags behind route files (notably the `/auth/register`
 * index) and omits parameterised helper results, so this single helper keeps
 * the escape hatch in one place instead of scattering `as any` in screens.
 */
export function toHref(path: string): Href {
  return path as unknown as Href;
}
