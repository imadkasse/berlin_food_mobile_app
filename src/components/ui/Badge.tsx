import { View } from 'react-native';
import { cn } from '@/utils/cn';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'accent' | 'primary' | 'success' | 'error';

const toneClass: Record<BadgeTone, { container: string; text: string }> = {
  neutral: { container: 'bg-surface-variant', text: 'text-on-surface-variant' },
  accent: { container: 'bg-accent-soft', text: 'text-on-accent-soft' },
  primary: { container: 'bg-primary', text: 'text-on-primary' },
  success: { container: 'bg-success-container', text: 'text-on-success-container' },
  error: { container: 'bg-error-container', text: 'text-on-error-container' },
};

export type BadgeProps = {
  tone?: BadgeTone;
  children: string;
  className?: string;
};

/**
 * Compact status pill (order states, tags, counts). Tonal backgrounds only —
 * readable in both themes by construction.
 */
export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <View className={cn('self-start rounded-full px-3 py-1', toneClass[tone].container, className)}>
      <Text variant="label" weight="semibold" className={toneClass[tone].text}>
        {children}
      </Text>
    </View>
  );
}
