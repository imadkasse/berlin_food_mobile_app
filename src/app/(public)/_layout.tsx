import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

/**
 * Public navigation group — reachable without a session.
 *
 * Holds the authentication flows (login, three-step sign-up, password reset)
 * plus the courier application flow. Every screen renders the shared
 * `AppHeader`, so the native header is disabled here.
 */
export default function PublicLayout() {
  const { tokens } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: tokens.background },
      }}
    />
  );
}
