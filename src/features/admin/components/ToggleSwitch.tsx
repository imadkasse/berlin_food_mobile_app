import { Pressable, View } from 'react-native';

import { cn } from '@/utils/cn';

export type ToggleSwitchProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

/**
 * Small tonal switch built from plain Views, so it stays on semantic tokens in
 * both themes without relying on platform switch colours.
 */
export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}: ToggleSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      className={cn(
        'h-7 w-12 justify-center rounded-full px-0.5',
        value ? 'bg-accent' : 'bg-surface-variant',
        disabled && 'opacity-50'
      )}
    >
      <View
        className={cn('h-6 w-6 rounded-full bg-surface-raised', value ? 'self-end' : 'self-start')}
      />
    </Pressable>
  );
}
