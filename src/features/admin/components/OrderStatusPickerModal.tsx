import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Modal, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { ORDER_STATUS_LABEL } from '@/types/models';
import { cn } from '@/utils/cn';

import { ADMIN_ORDER_STATUSES, type AdminOrderStatus } from '../types';

export type OrderStatusPickerModalProps = {
  visible: boolean;
  currentStatus: string | null;
  saving?: boolean;
  onSelect: (status: AdminOrderStatus) => void;
  onClose: () => void;
};

/** Modal list of the six kitchen statuses used by the web order manager. */
export function OrderStatusPickerModal({
  visible,
  currentStatus,
  saving = false,
  onSelect,
  onClose,
}: OrderStatusPickerModalProps) {
  const { tokens } = useTheme();

  return (
    <Modal visible={visible} onClose={onClose} title="Update status">
      <View className="gap-1">
        {ADMIN_ORDER_STATUSES.map((status) => {
          const selected = currentStatus === status;
          return (
            <Pressable
              key={status}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: saving }}
              onPress={() => onSelect(status)}
              className={cn(
                'flex-row items-center gap-3 rounded-md px-4 py-3 active:opacity-80',
                selected ? 'bg-accent-soft' : 'bg-transparent'
              )}
            >
              <View className={cn('h-2 w-2 rounded-full', selected ? 'bg-accent' : 'bg-outline')} />
              <Text variant="body" weight={selected ? 'semibold' : 'medium'} className="flex-1">
                {ORDER_STATUS_LABEL[status]}
              </Text>
              {selected ? <Ionicons name="checkmark" size={18} color={tokens.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}
