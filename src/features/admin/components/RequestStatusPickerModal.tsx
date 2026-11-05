import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Modal, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import type { DeliveryRequestStatus } from '@/types/models';
import { DELIVERY_REQUEST_STATUS_LABEL } from '@/types/models';
import { cn } from '@/utils/cn';

const STATUSES: DeliveryRequestStatus[] = ['pending', 'approved', 'rejected'];

export type RequestStatusPickerModalProps = {
  visible: boolean;
  currentStatus: DeliveryRequestStatus;
  saving: boolean;
  onSelect: (status: DeliveryRequestStatus) => void;
  onClose: () => void;
};

/** Status picker for delivery applications (`delivery_requests.update`). */
export function RequestStatusPickerModal({
  visible,
  currentStatus,
  saving,
  onSelect,
  onClose,
}: RequestStatusPickerModalProps) {
  const { tokens } = useTheme();

  return (
    <Modal visible={visible} onClose={onClose} title="Review request">
      <View className="gap-1">
        {STATUSES.map((status) => {
          const selected = status === currentStatus;
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
                {DELIVERY_REQUEST_STATUS_LABEL[status]}
              </Text>
              {selected ? <Ionicons name="checkmark" size={18} color={tokens.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}
