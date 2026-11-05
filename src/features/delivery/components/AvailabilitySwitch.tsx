import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type AvailabilitySwitchProps = {
  checked: boolean;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * Purely presentational availability switch. The surrounding pressable row
 * owns the interaction so the whole card/row stays tappable.
 */
export function AvailabilitySwitch({ checked, loading = false }: AvailabilitySwitchProps) {
  const { tokens } = useTheme();

  if (loading) {
    return <ActivityIndicator size="small" color={tokens.primary} />;
  }

  return (
    <View
      className={cn(
        'h-8 w-14 justify-center rounded-full px-1',
        checked ? 'bg-primary' : 'bg-outline-variant'
      )}
    >
      <View
        className={cn(
          'h-6 w-6 rounded-full bg-surface-raised',
          checked ? 'self-end' : 'self-start'
        )}
      />
    </View>
  );
}
