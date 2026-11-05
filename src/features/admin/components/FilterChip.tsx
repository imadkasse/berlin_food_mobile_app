import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/utils/cn';

export type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Optional count rendered after the label. */
  count?: number;
};

/** Pill-shaped filter used by every admin list toolbar. */
export function FilterChip({ label, active, onPress, count }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cn(
        'h-9 flex-row items-center gap-1.5 rounded-full px-4 active:opacity-80',
        active ? 'bg-primary' : 'bg-surface-variant'
      )}
    >
      <Text variant="label" weight="semibold" tone={active ? 'inverse' : 'secondary'}>
        {label}
      </Text>
      {typeof count === 'number' ? (
        <View
          className={cn('rounded-full px-1.5', active ? 'bg-on-primary/20' : 'bg-surface-raised')}
        >
          <Text variant="caption" weight="bold" tone={active ? 'inverse' : 'secondary'}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
