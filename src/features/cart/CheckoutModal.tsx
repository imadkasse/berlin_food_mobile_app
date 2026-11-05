import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Input, Modal, Text } from '@/components/ui';
import { formatAddress, type SavedAddress } from '@/features/profile/addresses';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type CheckoutModalProps = {
  visible: boolean;
  onClose: () => void;
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isSignedIn: boolean;
  isSubmitting: boolean;
  error: string | null;
  /**
   * Kept for parity with the web cart. There is no note column on `orders`,
   * so the field is disabled instead of silently discarding what is typed.
   */
  note: string;
  onChangeNote: (value: string) => void;
  onConfirm: () => void;
  onSignIn: () => void;
  onManageAddresses: () => void;
};

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  const { tokens } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Deliver to ${address.label}: ${formatAddress(address)}`}
      onPress={onSelect}
      className={cn(
        'flex-row items-center gap-3 rounded-md p-3 active:opacity-80',
        selected ? 'bg-accent-soft' : 'bg-surface-variant'
      )}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary' : 'border-outline bg-transparent'
        )}
      >
        {selected ? <View className="h-1.5 w-1.5 rounded-full bg-on-primary" /> : null}
      </View>

      <Ionicons
        name="location-outline"
        size={18}
        color={selected ? tokens.primary : tokens.onSurfaceVariant}
      />

      <View className="flex-1 gap-0.5">
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {address.label}
        </Text>
        <Text variant="body-sm" tone="secondary" numberOfLines={2}>
          {formatAddress(address)}
        </Text>
      </View>
    </Pressable>
  );
}

/** Address picker + note + confirmation step for placing an order. */
export function CheckoutModal({
  visible,
  onClose,
  addresses,
  selectedId,
  onSelect,
  isSignedIn,
  isSubmitting,
  error,
  note,
  onChangeNote,
  onConfirm,
  onSignIn,
  onManageAddresses,
}: CheckoutModalProps) {
  const { tokens } = useTheme();
  const hasAddresses = addresses.length > 0;

  return (
    <Modal visible={visible} onClose={onClose} title="Confirm your address">
      <ScrollView
        style={{ maxHeight: 420 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4"
      >
        <Text variant="body-sm" tone="secondary">
          Where should we deliver this order?
        </Text>

        {hasAddresses ? (
          <View className="gap-2">
            {addresses.map((address) => (
              <AddressOption
                key={address.id}
                address={address}
                selected={selectedId === address.id}
                onSelect={() => onSelect(address.id)}
              />
            ))}
          </View>
        ) : (
          <View className="items-center gap-3 rounded-md bg-surface-variant p-5">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="map-outline" size={22} color={tokens.accent} />
            </View>
            <Text variant="title" weight="bold" className="text-center">
              No saved address
            </Text>
            <Text variant="body-sm" tone="secondary" className="text-center">
              {isSignedIn
                ? 'Add a delivery address before placing your order.'
                : 'Sign in to use the address saved on your Berlin Food account.'}
            </Text>
            <Button size="sm" variant="tonal" onPress={isSignedIn ? onManageAddresses : onSignIn}>
              {isSignedIn ? 'Add an address' : 'Sign in'}
            </Button>
          </View>
        )}

        <Input
          label="Order note"
          placeholder="Ring the bell, leave at the door…"
          value={note}
          onChangeText={onChangeNote}
          multiline
          editable={false}
          hint="Order notes are not supported yet."
        />

        {error ? (
          <Text variant="body-sm" tone="error">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View className="gap-2 pt-1">
        <Button
          block
          size="lg"
          loading={isSubmitting}
          disabled={!hasAddresses || !selectedId}
          onPress={onConfirm}
        >
          Place order
        </Button>

        <Button block variant="ghost" onPress={onClose} disabled={isSubmitting}>
          Keep browsing
        </Button>
      </View>
    </Modal>
  );
}
