import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { IoniconsName } from '@/navigation/routes';
import type { SemanticTokenName } from '@/theme/tokens';
import { cn } from '@/utils/cn';

export type IconButtonVariant = 'tonal' | 'ghost' | 'primary';
export type IconButtonSize = 'sm' | 'md';

const variantClass: Record<IconButtonVariant, string> = {
  tonal: 'bg-surface-variant active:bg-accent-soft',
  ghost: 'bg-transparent active:bg-surface-variant',
  primary: 'bg-primary active:bg-primary/80',
};

const variantIconColor: Record<IconButtonVariant, SemanticTokenName> = {
  tonal: 'onSurfaceVariant',
  ghost: 'onSurface',
  primary: 'onPrimary',
};

const sizeClass: Record<IconButtonSize, string> = {
  sm: 'h-11 w-11',
  md: 'h-11 w-11',
};

const iconSize: Record<IconButtonSize, number> = {
  sm: 18,
  md: 22,
};

export type IconButtonProps = {
  name: IoniconsName;
  onPress?: () => void;
  /** Required: icon-only controls need a spoken label. */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
};

/**
 * Circular icon button. Keeps a 44×44 minimum touch target in both sizes, with
 * tonal fills instead of borders so it sits calmly on any warm surface.
 */
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  variant = 'tonal',
  size = 'md',
  className,
}: IconButtonProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'items-center justify-center rounded-full',
        sizeClass[size],
        variantClass[variant],
        className
      )}
    >
      <Ionicons name={name} size={iconSize[size]} color={tokens[variantIconColor[variant]]} />
    </Pressable>
  );
}
