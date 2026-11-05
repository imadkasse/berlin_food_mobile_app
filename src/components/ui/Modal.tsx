import { KeyboardAvoidingView, Modal as RNModal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/utils/cn';
import { Text } from './Text';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Base modal — a tonal elevated card over a warm scrim. Tapping the scrim or
 * the hardware back button (Android) dismisses it.
 */
export function Modal({ visible, onClose, title, children, className }: ModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View
        className="flex-1 bg-scrim/60"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
          className="absolute inset-0"
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          className="flex-1 justify-center px-6"
        >
          <View
            accessibilityViewIsModal
            style={{ maxHeight: '85%' }}
            className={cn('w-full max-w-sm gap-4 rounded-lg bg-surface-raised p-6', className)}
          >
            {title ? (
              <Text variant="title-lg" weight="bold">
                {title}
              </Text>
            ) : null}
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
}
