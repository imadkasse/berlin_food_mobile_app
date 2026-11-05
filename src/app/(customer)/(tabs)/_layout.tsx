import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { createAppTabBar } from '@/components/navigation/AppTabBar';
import { useTheme } from '@/hooks/use-theme';
import { CUSTOMER_GUEST_TABS, ROLE_HOME, ROLE_TABS, ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';
import { selectItemCount, useCartStore } from '@/stores/cart.store';

/** Open on the menu tab, matching the web application. */
export const unstable_settings = {
  anchor: 'menu',
};

/**
 * Customer tab navigator.
 *
 * The menu and the cart stay available to guests (exactly like the web app,
 * where `/menu` and `/customer/cart` are outside the auth guard), while the
 * order history and the profile require a signed-in customer.
 *
 * Tab order comes from `ROLE_TABS.customer` so the tab bar and the router can
 * never drift apart.
 *
 * Pushed detail screens (such as the address book) live in the parent stack
 * (`(customer)/_layout.tsx`), never as hidden tabs.
 */
export default function CustomerTabsLayout() {
  const { isSignedIn, role } = useSession();
  const itemCount = useCartStore(selectItemCount);
  const { tokens } = useTheme();

  const isCustomer = isSignedIn && role === 'customer';
  const tabs = isCustomer ? ROLE_TABS.customer : CUSTOMER_GUEST_TABS;
  const fallbackHref = isSignedIn ? ROLE_HOME[role] : ROUTES.login;
  const tabBar = useMemo(() => createAppTabBar(tabs, { badgeCount: itemCount }), [tabs, itemCount]);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: tokens.background },
      }}
      tabBar={tabBar}
    >
      <Tabs.Screen name="menu" options={{ title: 'Menu' }} />

      <Tabs.Protected guard={isCustomer} redirectTo={fallbackHref}>
        <Tabs.Screen name="customer/orders" options={{ title: 'Orders' }} />
        <Tabs.Screen name="customer/profile" options={{ title: 'Profile' }} />
      </Tabs.Protected>

      <Tabs.Screen name="customer/cart" options={{ title: 'Cart' }} />
    </Tabs>
  );
}
