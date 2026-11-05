import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type DeliveryNoticeData = {
  tone: 'success' | 'error';
  message: string;
};

export type DeliveryNoticeProps = {
  notice: DeliveryNoticeData;
  onDismiss?: () => void;
  className?: string;
};

/**
 * Inline tonal feedback used in place of the web's toast library. Success and
 * error share one layout so the page does not jump between states.
 */
export function DeliveryNotice({ notice, onDismiss, className }: DeliveryNoticeProps) {
  const { tokens } = useTheme();
  const isError = notice.tone === 'error';

  return (
    <View
      accessibilityLiveRegion="polite"
      className={cn(
        'flex-row items-start gap-3 rounded-md p-4',
        isError ? 'bg-error-container' : 'bg-success-container',
        className
      )}
    >
      <Ionicons
        name={isError ? 'alert-circle' : 'checkmark-circle'}
        size={18}
        color={isError ? tokens.onErrorContainer : tokens.onSuccessContainer}
      />

      <Text
        variant="body-sm"
        weight="medium"
        className={cn('flex-1', isError ? 'text-on-error-container' : 'text-on-success-container')}
      >
        {notice.message}
      </Text>

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          onPress={onDismiss}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Ionicons
            name="close"
            size={16}
            color={isError ? tokens.onErrorContainer : tokens.onSuccessContainer}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
