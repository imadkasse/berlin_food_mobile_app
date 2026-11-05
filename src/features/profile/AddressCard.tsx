import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { formatAddress, type SavedAddress } from '@/features/profile/addresses';
import { useTheme } from '@/hooks/use-theme';

export type AddressCardProps = {
  address: SavedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (address: SavedAddress) => void;
};

/** Saved address with edit/delete affordances. */
export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const { tokens } = useTheme();

  return (
    <Card className="gap-2">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
          <Ionicons name="location-outline" size={20} color={tokens.primary} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text variant="body-lg" weight="semibold" numberOfLines={1}>
            {address.label}
          </Text>
          <Text variant="body-sm" tone="secondary" numberOfLines={2}>
            {formatAddress(address)}
          </Text>
          <Text variant="caption" tone="secondary">
            {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${address.label}`}
            onPress={() => onEdit(address)}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-variant"
          >
            <Ionicons name="create-outline" size={18} color={tokens.onSurfaceVariant} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${address.label}`}
            onPress={() => onDelete(address)}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-variant"
          >
            <Ionicons name="trash-outline" size={18} color={tokens.error} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
