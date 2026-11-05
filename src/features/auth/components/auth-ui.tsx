import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { AppHeader } from '@/components/navigation/AppHeader';
import { ScreenScroll } from '@/components/navigation/Screen';
import { Input, Text, type InputProps } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type AuthScreenProps = {
  title?: string;
  canGoBack?: boolean;
  right?: ReactNode;
  children: ReactNode;
};

/** Shared shell for every auth screen: header, keyboard handling, scroll body. */
export function AuthScreen({ title, canGoBack = true, right, children }: AuthScreenProps) {
  return (
    <View className="flex-1 bg-background">
      <AppHeader title={title} canGoBack={canGoBack} right={right} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenScroll>
          <View className="gap-7">{children}</View>
        </ScreenScroll>
      </KeyboardAvoidingView>
    </View>
  );
}

export type AuthHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function AuthHeading({ eyebrow, title, description }: AuthHeadingProps) {
  return (
    <View className="gap-3">
      {eyebrow ? (
        <Text variant="label" weight="semibold" tone="accent" className="uppercase tracking-widest">
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="headline" weight="bold">
        {title}
      </Text>
      {description ? (
        <Text variant="body" tone="secondary">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export type BrandMarkProps = {
  className?: string;
  size?: 'md' | 'lg';
};

/** Circular brand mark used at the top of the sign-in surfaces. */
export function BrandMark({ className, size = 'md' }: BrandMarkProps) {
  const { tokens } = useTheme();
  const box = size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';

  return (
    <View className={cn('items-center justify-center rounded-full bg-accent-soft', box, className)}>
      <Ionicons name="restaurant" size={size === 'lg' ? 26 : 20} color={tokens.primary} />
    </View>
  );
}

export type FormMessageTone = 'error' | 'success' | 'neutral';

const messageClass: Record<FormMessageTone, string> = {
  error: 'bg-error-container',
  success: 'bg-success-container',
  neutral: 'bg-surface-variant',
};

const messageTextTone = {
  error: 'error',
  success: 'success',
  neutral: 'secondary',
} as const;

export function FormMessage({
  message,
  tone = 'error',
}: {
  message: string;
  tone?: FormMessageTone;
}) {
  return (
    <View className={cn('rounded-md p-4', messageClass[tone])}>
      <Text variant="body-sm" tone={messageTextTone[tone]}>
        {message}
      </Text>
    </View>
  );
}

export type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: InputProps['autoComplete'];
  textContentType?: InputProps['textContentType'];
};

/** Password input with a textual show/hide affordance. */
export function PasswordField({
  label,
  value,
  onChangeText,
  error,
  hint,
  placeholder = 'Your password',
  autoComplete = 'current-password',
  textContentType = 'password',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-1">
        <Text variant="label" weight="semibold" tone="secondary">
          {label}
        </Text>
        <Pressable
          onPress={() => setVisible((current) => !current)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          <Text variant="label" weight="semibold" tone="primary">
            {visible ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={error}
        hint={hint}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={textContentType}
      />
    </View>
  );
}

export type SocialButtonProps = {
  label: string;
  icon: 'logo-google' | 'logo-apple';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  note?: string;
};

export function SocialButton({
  label,
  icon,
  onPress,
  disabled = false,
  loading = false,
  note,
}: SocialButtonProps) {
  const { tokens } = useTheme();

  return (
    <View className="flex-1 gap-2">
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || loading }}
        className={cn(
          'h-14 flex-row items-center justify-center gap-2 rounded-full bg-surface-variant px-4',
          'active:bg-accent-soft',
          (disabled || loading) && 'opacity-50'
        )}
      >
        {loading ? (
          <ActivityIndicator size="small" color={tokens.onSurfaceVariant} />
        ) : (
          <Ionicons name={icon} size={19} color={tokens.onSurfaceVariant} />
        )}
        <Text variant="body-sm" weight="semibold">
          {label}
        </Text>
      </Pressable>
      {note ? (
        <Text variant="caption" tone="secondary" className="text-center">
          {note}
        </Text>
      ) : null}
    </View>
  );
}

export type StepProgressProps = {
  step: 1 | 2 | 3;
  total?: 3;
};

/** Tonal step indicator for the three-step sign-up flow. */
export function StepProgress({ step, total = 3 }: StepProgressProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index < step ? 'bg-primary' : 'bg-surface-variant'
            )}
          />
        ))}
      </View>
      <Text
        variant="label"
        weight="semibold"
        tone="secondary"
        className="uppercase tracking-widest"
      >
        Step {step} of {total}
      </Text>
    </View>
  );
}
