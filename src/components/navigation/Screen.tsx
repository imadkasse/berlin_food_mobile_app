import type { ReactElement, ReactNode } from 'react';
import { RefreshControlProps, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { cn } from '@/utils/cn';

/** Shared vertical rhythm for scrollable screen content. */
export const SCREEN_CONTENT_CLASS = 'gap-6 px-5 pb-28 pt-4';

export type ScreenProps = {
  children: ReactNode;
  className?: string;
  edges?: Edge[];
};

/** Screen shell: safe area at the top, warm background, no header chrome. */
export function Screen({ children, className, edges = ['top'] }: ScreenProps) {
  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

export type ScreenScrollProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  refreshControl?: ReactElement<RefreshControlProps>;
};

/** Scrollable screen body with the standard page padding. */
export function ScreenScroll({
  children,
  className,
  contentClassName,
  refreshControl,
}: ScreenScrollProps) {
  return (
    <ScrollView
      className={cn('flex-1', className)}
      contentContainerClassName={cn(SCREEN_CONTENT_CLASS, contentClassName)}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
}

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

/**
 * Editorial section heading. Separation comes from spacing and type hierarchy
 * — never from a divider line.
 */
export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end gap-4">
      <View className="flex-1 gap-1">
        {eyebrow ? (
          <Text
            variant="label"
            weight="semibold"
            tone="accent"
            className="uppercase tracking-widest"
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title-lg" weight="bold">
          {title}
        </Text>
        {description ? (
          <Text variant="body-sm" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      {action ? <View className="flex-row items-center">{action}</View> : null}
    </View>
  );
}
