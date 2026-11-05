import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

/**
 * Delivery navigation group — role guarded by the root navigator.
 *
 * A stack owns the group: the tab navigator lives in `(tabs)` and pushed
 * detail screens (such as the active delivery) are stack siblings. They must
 * never be hidden tabs, because expo-router redirects a focused hidden tab to
 * the first visible tab.
 */
export default function DeliveryLayout() {
  const { tokens } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: tokens.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="delivery/active-delivery/[id]" />
    </Stack>
  );
}
