import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  /** Error message. When set, the control shows the error affordance. */
  error?: string;
  /** Neutral helper text shown when there is no error. */
  hint?: string;
};

/**
 * Base text input. Follows the web app's field treatment: a tonal warm fill
 * with a soft outline at rest — lines are used only as control affordances,
 * never for section separation.
 */
export function Input({
  label,
  error,
  hint,
  className,
  accessibilityLabel,
  editable,
  multiline,
  ...rest
}: InputProps) {
  const { tokens } = useTheme();
  const disabled = editable === false;

  return (
    <View className="gap-2">
      {label ? (
        <Text variant="label" weight="semibold" tone="secondary" className="ms-1">
          {label}
        </Text>
      ) : null}

      <TextInput
        {...rest}
        editable={editable}
        multiline={multiline}
        placeholderTextColor={tokens.outline}
        textAlignVertical={multiline ? 'top' : undefined}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? hint}
        accessibilityState={disabled ? { disabled: true } : undefined}
        accessibilityValue={error ? { text: error } : undefined}
        className={cn(
          'rounded-lg border-2 bg-surface px-5 font-sans text-body text-on-surface',
          disabled && 'opacity-50',
          multiline ? 'min-h-28 py-4' : 'h-14',
          error ? 'border-error' : 'border-outline-variant/40',
          className
        )}
      />

      {error ? (
        <Text variant="body-sm" tone="error" className="ms-1">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="body-sm" tone="secondary" className="ms-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
