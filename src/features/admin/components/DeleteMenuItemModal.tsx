import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button, Modal, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import type { MenuItem } from '@/types/models';

export type DeleteMenuItemModalProps = {
  item: MenuItem | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

/** Confirmation sheet for `menu_items.delete`. */
export function DeleteMenuItemModal({
  item,
  saving,
  error,
  onClose,
  onConfirm,
}: DeleteMenuItemModalProps) {
  const { tokens } = useTheme();

  return (
    <Modal visible={item !== null} onClose={onClose} title="Delete dish?">
      <View className="items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-error-container">
          <Ionicons name="trash-outline" size={24} color={tokens.error} />
        </View>
        <Text variant="body" tone="secondary" className="text-center">
          This permanently removes{' '}
          <Text variant="body" weight="bold">
            {item?.name ?? 'this dish'}
          </Text>{' '}
          from the menu.
        </Text>
      </View>

      {error ? (
        <Text variant="body-sm" tone="error">
          {error}
        </Text>
      ) : null}

      <View className="flex-row gap-3">
        <Button variant="tonal" className="flex-1" onPress={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="destructive" className="flex-1" loading={saving} onPress={onConfirm}>
          Delete
        </Button>
      </View>
    </Modal>
  );
}
