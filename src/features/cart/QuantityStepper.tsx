import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type QuantityStepperProps = {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** The cart store never goes below 1, so − is disabled at the floor. */
  decrementDisabled?: boolean;
  className?: string;
  label?: string;
};

/** Compact − / + control shared by the dish detail and the cart. */
export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  decrementDisabled = false,
  className,
  label = 'Quantity',
}: QuantityStepperProps) {
  const { tokens } = useTheme();

  return (
    <View
      className={cn('flex-row items-center rounded-full bg-surface-variant p-1', className)}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        disabled={decrementDisabled}
        onPress={onDecrement}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-raised disabled:opacity-40"
      >
        <Ionicons name="remove" size={16} color={tokens.onSurface} />
      </Pressable>

      <Text variant="body" weight="semibold" className="min-w-7 text-center">
        {value}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        onPress={onIncrement}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-raised"
      >
        <Ionicons name="add" size={16} color={tokens.onSurface} />
      </Pressable>
    </View>
  );
}
