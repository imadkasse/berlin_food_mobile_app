import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

export type CardVariant = 'default' | 'tonal' | 'raised';

const variantClass: Record<CardVariant, string> = {
  /** Card on the page background. */
  default: 'bg-surface',
  /** Subtle group inside another surface (chips, meta blocks). */
  tonal: 'bg-surface-variant',
  /** Elevated layer (sheets, popovers, modals). */
  raised: 'bg-surface-raised',
};

export type CardProps = Omit<PressableProps & ViewProps, 'onPress'> & {
  variant?: CardVariant;
  /** Pressable card with pressed-state feedback (menu items, tappable rows). */
  onPress?: PressableProps['onPress'];
  /** Extra-compact padding for dense lists. */
  compact?: boolean;
};

/**
 * Base card. Sections are separated by tone and spacing — never by borders —
 * so cards stay calm in both light and dark modes.
 */
export function Card({
  variant = 'default',
  onPress,
  compact = false,
  disabled,
  className,
  children,
  accessibilityRole,
  ...rest
}: CardProps) {
  const classes = cn('rounded-md', compact ? 'p-4' : 'p-5', variantClass[variant], className);

  if (onPress) {
    return (
      <Pressable
        {...rest}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? 'button'}
        className={cn(classes, 'active:opacity-80')}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} accessibilityRole={accessibilityRole} className={classes}>
      {children}
    </View>
  );
}
