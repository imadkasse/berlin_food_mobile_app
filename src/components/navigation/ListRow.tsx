import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  className?: string;
  /** Renders the title in the error tone (sign out, delete account, …). */
  destructive?: boolean;
};

/**
 * Settings/list row on a tonal surface. Rows are separated by spacing, never
 * by divider lines; a chevron is implied whenever the row is pressable.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  className,
  destructive = false,
}: ListRowProps) {
  const { tokens } = useTheme();

  const content = (
    <View className="flex-row items-center gap-3">
      {leading ? <View className="items-center justify-center">{leading}</View> : null}

      <View className="flex-1 gap-0.5">
        <Text variant="body-lg" weight="semibold" tone={destructive ? 'error' : 'default'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body-sm" tone={destructive ? 'error' : 'secondary'}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={18} color={tokens.onSurfaceVariant} />
        ) : null)}
    </View>
  );

  if (!onPress) {
    return <View className={cn('rounded-md bg-surface-variant/60 p-4', className)}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn('rounded-md bg-surface-variant/60 p-4 active:opacity-80', className)}
    >
      {content}
    </Pressable>
  );
}
