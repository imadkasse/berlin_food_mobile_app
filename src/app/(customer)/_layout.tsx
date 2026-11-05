import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

/**
 * Customer navigation group.
 *
 * The group is intentionally not guarded here: the menu and the cart stay
 * available to guests (exactly like the web app, where `/menu` and
 * `/customer/cart` are outside the auth guard). The tab navigator guards the
 * order history and the profile with `Tabs.Protected`.
 *
 * A stack owns the group: the tab navigator lives in `(tabs)` and pushed
 * detail screens (such as the address book) are stack siblings. They must
 * never be hidden tabs, because expo-router redirects a focused hidden tab to
 * the first visible tab.
 */
export default function CustomerLayout() {
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
      <Stack.Screen name="customer/addresses" />
    </Stack>
  );
}
