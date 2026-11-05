import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentType, ReactElement } from 'react';
import { Platform, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES, type TabItem } from '@/navigation/routes';
import { cn } from '@/utils/cn';

/**
 * NativeWind's interop layer consumes the `style` prop of core components,
 * which drops Pressable's style callback (and with it the pressed opacity).
 * Opting this one component out keeps the callback intact; its layout styles
 * live in the `styles.tabButton` object below instead of `className`.
 */
type InteropPressableProps = PressableProps & { cssInterop?: boolean };
const PlainPressable = Pressable as unknown as ComponentType<InteropPressableProps>;

export type AppTabBarProps = BottomTabBarProps & {
  items: TabItem[];
  /** Shown on the cart tab when greater than zero. */
  badgeCount?: number;
};

/**
 * Floating tonal tab bar for the JS `Tabs` navigator. Active items sit on a
 * soft accent pill; there are no dividers or borders, only tone and space.
 *
 * Navigation uses the route key, never the screen name: `navigateToTab` only
 * accepts keys, and a configured item may not have a matching visible route
 * (for example a guarded tab that is not declared for guests).
 */
export function AppTabBar({
  state,
  emitter,
  navigateToTab,
  insets,
  items,
  badgeCount = 0,
}: AppTabBarProps) {
  const { tokens } = useTheme();

  const activeRoute = state.routes[state.index];

  return (
    <View className="px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View className="flex-row items-center rounded-xl bg-surface-raised p-1.5">
        {items.map((item) => {
          const route = state.routes.find((candidate) => candidate.name === item.name);
          if (!route) return null;

          const isActive = activeRoute?.name === item.name;
          const showBadge = item.href === ROUTES.cart && badgeCount > 0;
          const accessibilityLabel = `${item.label}${showBadge ? `, ${badgeCount} items` : ''}`;

          const handlePress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <PlainPressable
              key={item.name}
              cssInterop={false}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={accessibilityLabel}
              onPress={handlePress}
              hitSlop={8}
              android_ripple={
                Platform.OS === 'android'
                  ? { color: tokens.surfaceVariant, borderless: true, radius: 40 }
                  : undefined
              }
              style={({ pressed }) => [styles.tabButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={cn(
                  'items-center gap-0.5 rounded-full px-3 py-1.5',
                  isActive && 'bg-accent-soft'
                )}
              >
                <View>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isActive ? tokens.primary : tokens.onSurfaceVariant}
                  />
                  {showBadge ? (
                    <View className="absolute -right-2.5 -top-1.5 min-w-4 items-center rounded-full bg-accent px-1">
                      <Text variant="caption" weight="bold" tone="on-accent">
                        {badgeCount > 9 ? '9+' : String(badgeCount)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  variant="caption"
                  weight="semibold"
                  tone={isActive ? 'primary' : 'secondary'}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            </PlainPressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Binds a role's tab configuration to the navigator props, so layouts read as
 * `tabBar={createAppTabBar(ROLE_TABS.customer)}`. The returned component is a
 * thin adapter over Expo Router's `BottomTabBarProps`.
 */
export function createAppTabBar(
  items: TabItem[],
  options?: { badgeCount?: number }
): (props: BottomTabBarProps) => ReactElement {
  return function BoundAppTabBar(props: BottomTabBarProps) {
    return <AppTabBar {...props} items={items} badgeCount={options?.badgeCount} />;
  };
}

export default AppTabBar;

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
