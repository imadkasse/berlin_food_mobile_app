import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import type { SemanticTokenName } from '@/theme/tokens';
import { cn } from '@/utils/cn';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'accent' | 'tonal' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

type VariantStyles = {
  container: string;
  text: string;
  /** Token used to tint the loading spinner. */
  indicator: SemanticTokenName;
};

const variantStyles: Record<ButtonVariant, VariantStyles> = {
  primary: {
    container: 'bg-primary active:bg-primary/80',
    text: 'text-on-primary',
    indicator: 'onPrimary',
  },
  accent: {
    container: 'bg-accent active:bg-accent/80',
    text: 'text-on-accent',
    indicator: 'onAccent',
  },
  tonal: {
    container: 'bg-accent-soft active:bg-accent-soft/70',
    text: 'text-on-accent-soft',
    indicator: 'onAccentSoft',
  },
  ghost: {
    container: 'bg-transparent active:bg-surface-variant',
    text: 'text-primary',
    indicator: 'primary',
  },
  destructive: {
    container: 'bg-error active:bg-error/80',
    text: 'text-on-error',
    indicator: 'onError',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'h-10 px-4 gap-2', text: 'text-body-sm' },
  md: { container: 'h-12 px-5 gap-2', text: 'text-body' },
  lg: { container: 'h-14 px-6 gap-2', text: 'text-body-lg' },
};

export type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction while keeping the layout. */
  loading?: boolean;
  /** Stretches to fill the parent's width (call-to-action usage). */
  block?: boolean;
  children?: React.ReactNode;
};

/**
 * Base button. Uses the brand's pill geometry and semantic tokens, so it
 * follows the active theme. The web app's gradient CTA is adapted to a solid
 * brand fill because React Native does not support CSS gradients.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const { tokens } = useTheme();
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      {...rest}
      // The spinner blocks presses while loading; onPress lives in `rest`.
      disabled={disabled || loading}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      accessibilityState={{
        ...rest.accessibilityState,
        disabled: Boolean(disabled) || loading,
        busy: loading,
      }}
      hitSlop={rest.hitSlop ?? (size === 'sm' ? 4 : undefined)}
      className={cn(
        'flex-row items-center justify-center rounded-full disabled:opacity-50',
        sizeStyle.container,
        styles.container,
        block && 'self-stretch',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tokens[styles.indicator]} />
      ) : typeof children === 'string' ? (
        <Text
          maxFontSizeMultiplier={1.4}
          className={cn(sizeStyle.text, 'font-sans-semibold', styles.text)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
