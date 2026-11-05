import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { createAppTabBar } from '@/components/navigation/AppTabBar';
import { useTheme } from '@/hooks/use-theme';
import { ROLE_TABS } from '@/navigation/routes';

/** Open on the dashboard tab, matching the web application. */
export const unstable_settings = {
  anchor: 'admin/dashboard',
};

/**
 * Admin tab navigator.
 *
 * Only the five tab screens are declared here. Pushed detail screens live in
 * the parent stack (`(admin)/_layout.tsx`) so they never become hidden tabs.
 */
export default function AdminTabsLayout() {
  const { tokens } = useTheme();
  const tabBar = useMemo(() => createAppTabBar(ROLE_TABS.admin), []);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: tokens.background },
      }}
      tabBar={tabBar}
    >
      <Tabs.Screen name="admin/dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="admin/menu" options={{ title: 'Menu' }} />
      <Tabs.Screen name="admin/orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="admin/users" options={{ title: 'Users' }} />
      <Tabs.Screen name="admin/profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
