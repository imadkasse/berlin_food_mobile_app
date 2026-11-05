import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/utils/cn';

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title-lg'
  | 'title'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'label'
  | 'caption';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export type TextTone =
  'default' | 'secondary' | 'primary' | 'accent' | 'on-accent' | 'error' | 'success' | 'inverse';

/* Statically written classes only — NativeWind extracts them from source. */
const variantClass: Record<TextVariant, string> = {
  display: 'text-display',
  headline: 'text-headline',
  'title-lg': 'text-title-lg',
  title: 'text-title',
  'body-lg': 'text-body-lg',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  label: 'text-label',
  caption: 'text-caption',
};

const weightClass: Record<TextWeight, string> = {
  regular: 'font-sans',
  medium: 'font-sans-medium',
  semibold: 'font-sans-semibold',
  bold: 'font-sans-bold',
  extrabold: 'font-sans-extrabold',
};

const toneClass: Record<TextTone, string> = {
  default: 'text-on-surface',
  secondary: 'text-on-surface-variant',
  primary: 'text-primary',
  accent: 'text-accent',
  'on-accent': 'text-on-accent',
  error: 'text-error',
  success: 'text-success',
  inverse: 'text-inverse-on-surface',
};

export type TextProps = RNTextProps & {
  /** Typography scale step. */
  variant?: TextVariant;
  /** Font weight — mapped to the matching Plus Jakarta Sans family. */
  weight?: TextWeight;
  /** Semantic color tone. */
  tone?: TextTone;
};

/**
 * Base text component. Prefer this over the raw React Native `Text` so every
 * piece of copy uses the typography scale and semantic color tokens, and
 * automatically follows the active theme.
 */
export function Text({
  variant = 'body',
  weight = 'regular',
  tone = 'default',
  className,
  ...rest
}: TextProps) {
  return (
    <RNText
      className={cn(variantClass[variant], weightClass[weight], toneClass[tone], className)}
      {...rest}
    />
  );
}
