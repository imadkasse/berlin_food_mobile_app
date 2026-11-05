import { router } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { ROUTES } from '@/navigation/routes';
import { cn } from '@/utils/cn';

import { IconButton } from './IconButton';

export type AppHeaderProps = {
  title?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  /** Hides the header fill so hero images can run underneath it. */
  transparent?: boolean;
};

const HEADER_HEIGHT = 56;

/**
 * Custom native-stack header. Warm background, no hairline or shadow — depth
 * comes from tone and spacing only. The back affordance falls back to the
 * landing screen when there is no history (e.g. after a deep link).
 */
export function AppHeader({
  title,
  canGoBack = false,
  onBack,
  right,
  transparent = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const goBack =
    onBack ??
    (() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(ROUTES.landing);
    });

  return (
    <View
      className={cn('w-full px-5', transparent ? 'bg-transparent' : 'bg-background')}
      style={{ paddingTop: insets.top, minHeight: HEADER_HEIGHT + insets.top }}
    >
      <View className="flex-row items-center gap-3" style={{ height: HEADER_HEIGHT }}>
        {canGoBack ? (
          <IconButton
            name="chevron-back"
            onPress={goBack}
            accessibilityLabel="Go back"
            variant="ghost"
          />
        ) : null}

        {title ? (
          <Text variant="title" weight="bold" numberOfLines={1} className="flex-1">
            {title}
          </Text>
        ) : (
          <View className="flex-1" />
        )}

        {right ? <View className="flex-row items-center gap-2">{right}</View> : null}
      </View>
    </View>
  );
}

/**
 * Minimal structural header props — avoids importing React Navigation types
 * while staying assignable to Expo Router's `header` option.
 */
export type HeaderProps = {
  canGoBack?: boolean;
  back?: unknown;
};

export type CreateAppHeaderOptions = {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
};

/**
 * Builds a `header` renderer for `Stack.Screen`:
 *
 * ```tsx
 * <Stack.Screen
 *   name="menu/index"
 *   options={{ header: createAppHeader({ title: 'Menu', showBack: true }) }}
 * />
 * ```
 */
export function createAppHeader({
  title,
  showBack = true,
  right,
}: CreateAppHeaderOptions): (props: HeaderProps) => ReactElement {
  return function AppHeaderRenderer(props: HeaderProps) {
    return (
      <AppHeader title={title} canGoBack={showBack && (props.canGoBack ?? true)} right={right} />
    );
  };
}
