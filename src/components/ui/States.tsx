import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { Text } from './Text';

export type LoadingStateProps = {
  label?: string;
  className?: string;
};

/** Centered loading indicator with an optional label. */
export function LoadingState({ label, className }: LoadingStateProps) {
  const { tokens } = useTheme();

  return (
    <View className={cn('items-center justify-center gap-3 px-6 py-12', className)}>
      <ActivityIndicator size="small" color={tokens.primary} />
      {label ? (
        <Text variant="body-sm" tone="secondary">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export type EmptyStateProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/** Empty-state block with a tonal "plate" mark and an optional action. */
export function EmptyState({ title, message, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center gap-4 px-6 py-12', className)}>
      <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
        <View className="h-7 w-7 rounded-full bg-surface-raised" />
      </View>
      <View className="items-center gap-1">
        <Text variant="title" weight="bold">
          {title}
        </Text>
        {message ? (
          <Text variant="body-sm" tone="secondary" className="text-center">
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button variant="tonal" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

/** Error-state block with a tonal alert mark and an optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try again',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <View className={cn('items-center gap-4 px-6 py-12', className)}>
      <View className="h-16 w-16 items-center justify-center rounded-full bg-error-container">
        <Text variant="title-lg" weight="bold" tone="error">
          !
        </Text>
      </View>
      <View className="items-center gap-1">
        <Text variant="title" weight="bold">
          {title}
        </Text>
        {message ? (
          <Text variant="body-sm" tone="secondary" className="text-center">
            {message}
          </Text>
        ) : null}
      </View>
      {onRetry ? (
        <Button variant="tonal" size="sm" onPress={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </View>
  );
}
