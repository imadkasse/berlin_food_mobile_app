import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { createAppTabBar } from '@/components/navigation/AppTabBar';
import { useTheme } from '@/hooks/use-theme';
import { ROLE_TABS } from '@/navigation/routes';

/** Open on the dashboard tab, matching the web application. */
export const unstable_settings = {
  anchor: 'delivery/dashboard',
};

/**
 * Delivery tab navigator.
 *
 * Only the four tab screens are declared here. Pushed detail screens live in
 * the parent stack (`(delivery)/_layout.tsx`) so they never become hidden tabs.
 */
export default function DeliveryTabsLayout() {
  const { tokens } = useTheme();
  const tabBar = useMemo(() => createAppTabBar(ROLE_TABS.delivery), []);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: tokens.background },
      }}
      tabBar={tabBar}
    >
      <Tabs.Screen name="delivery/dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="delivery/orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="delivery/for-delivery" options={{ title: 'Routes' }} />
      <Tabs.Screen name="delivery/profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
