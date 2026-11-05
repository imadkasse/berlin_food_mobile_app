import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import type { IoniconsName } from '@/navigation/routes';
import { cn } from '@/utils/cn';

export type StatCardDelta = {
  value: string;
  positive: boolean;
};

export type StatCardProps = {
  label: string;
  value: string;
  delta?: StatCardDelta;
  icon?: IoniconsName;
  className?: string;
};

/**
 * Dashboard metric card: small tonal icon badge, quiet uppercase label, a
 * large value and an optional trend pill.
 */
export function StatCard({ label, value, delta, icon, className }: StatCardProps) {
  const { tokens } = useTheme();

  return (
    <Card className={cn('gap-4', className)}>
      <View className="flex-row items-start justify-between gap-3">
        {icon ? (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
            <Ionicons name={icon} size={20} color={tokens.primary} />
          </View>
        ) : (
          <View />
        )}

        {delta ? (
          <View
            className={cn(
              'rounded-full px-2.5 py-1',
              delta.positive ? 'bg-success-container' : 'bg-error-container'
            )}
          >
            <Text variant="caption" weight="bold" tone={delta.positive ? 'success' : 'error'}>
              {delta.value}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="gap-1">
        <Text
          variant="label"
          weight="semibold"
          tone="secondary"
          className="uppercase tracking-widest"
        >
          {label}
        </Text>
        <Text variant="title-lg" weight="bold">
          {value}
        </Text>
      </View>
    </Card>
  );
}
