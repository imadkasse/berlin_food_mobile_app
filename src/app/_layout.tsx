import '@/global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeHydration } from '@/hooks/use-theme-hydration';
import { ROUTES } from '@/navigation/routes';
import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

// Required on web for `signInWithOAuth` popups to close; a no-op on native.
WebBrowser.maybeCompleteAuthSession();

// Keep the splash screen visible until fonts, the persisted theme preference
// and the restored auth session are all ready, so the app never first-paints
// with fallback fonts, the wrong theme, or a flash of a gated route.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Best-effort: continue if the splash screen cannot be held.
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <RootNavigator />
        <RootStatusBar />
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootStatusBar() {
  const { colorScheme } = useColorScheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

/**
 * Root navigator.
 *
 * One native stack owns every top-level destination:
 *  - `index`          the public landing screen (always reachable)
 *  - `(public)`       guest + auth flows (login, onboarding, delivery requests)
 *  - `(customer)`     menu, cart and the signed-in customer surfaces
 *  - `(admin)`        role gated
 *  - `(delivery)`     role gated
 *
 * Access rules mirror the web application's route guard: guests may browse the
 * menu and keep a cart, while orders, profile, admin and delivery routes need
 * an authenticated session with the matching role. `Stack.Protected` removes
 * the guarded screens from the navigation state entirely, so signing in or out
 * never leaves a dead screen behind.
 */
function RootNavigator() {
  const [fontsLoaded, fontError] = useAppFonts();
  const themeHydrated = useThemeHydration();
  const { status, role, isSignedIn } = useSession();
  const { tokens } = useTheme();

  const ready = themeHydrated && (fontsLoaded || fontError !== null) && status !== 'loading';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: tokens.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="design-system" />
      <Stack.Screen name="(public)" />

      {/*
        The customer group is reachable without a session because the menu and
        the cart are public in the web application. The orders and profile
        screens are guarded inside `(customer)/(tabs)/_layout.tsx`.
      */}
      <Stack.Screen name="(customer)" />

      <Stack.Protected guard={isSignedIn && role === 'admin'} redirectTo={ROUTES.login}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn && role === 'delivery'} redirectTo={ROUTES.login}>
        <Stack.Screen name="(delivery)" />
      </Stack.Protected>
    </Stack>
  );
}
