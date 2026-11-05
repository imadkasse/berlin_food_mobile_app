import { useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';

import { AppHeader, IconButton, SectionHeader } from '@/components/navigation';
import { EmptyState, Text } from '@/components/ui';
import { AddressCard } from '@/features/profile/AddressCard';
import { AddressFormModal } from '@/features/profile/AddressFormModal';
import type { SavedAddress } from '@/features/profile/addresses';
import { useAddresses } from '@/features/profile/use-addresses';
import { useTheme } from '@/hooks/use-theme';

/**
 * Delivery-address book. Every change is persisted back to `profiles.address`
 * in the web app's JSON shape (single object for one entry, array otherwise).
 */
export function AddressesScreen() {
  const {
    addresses,
    isSaving,
    refreshing,
    error,
    saveAddress,
    deleteAddress,
    refresh,
    clearError,
  } = useAddresses();
  const { tokens } = useTheme();

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  const openAdd = () => {
    clearError();
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (address: SavedAddress) => {
    clearError();
    setEditing(address);
    setFormVisible(true);
  };

  const handleDelete = (address: SavedAddress) => {
    Alert.alert('Remove address', `Remove "${address.label}" from your saved addresses?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void deleteAddress(address.id);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        canGoBack
        title="Addresses"
        right={
          <IconButton
            name="add"
            variant="primary"
            accessibilityLabel="Add delivery address"
            onPress={openAdd}
          />
        }
      />

      <FlatList
        data={addresses}
        keyExtractor={(address) => address.id}
        renderItem={({ item }) => (
          <AddressCard address={item} onEdit={openEdit} onDelete={handleDelete} />
        )}
        contentContainerClassName="gap-3 px-5 pb-28 pt-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            <SectionHeader
              eyebrow="Delivery"
              title="Saved addresses"
              description="Choose where your order should arrive. The first entry is used at checkout."
            />

            {error && !formVisible ? (
              <Text variant="body-sm" tone="error">
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No saved addresses"
            message="Add a home or office address to make checkout one tap."
            actionLabel="Add an address"
            onAction={openAdd}
          />
        }
        ListFooterComponent={
          addresses.length === 0 ? (
            <Text variant="caption" tone="secondary" className="text-center">
              You can also add an address during checkout.
            </Text>
          ) : (
            <Text variant="caption" tone="secondary" className="text-center">
              Used at checkout and shared with the web app.
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={tokens.primary}
            colors={[tokens.primary]}
            progressBackgroundColor={tokens.surfaceRaised}
          />
        }
      />

      {formVisible ? (
        <AddressFormModal
          key={editing?.id ?? 'new'}
          visible
          initial={editing}
          onClose={() => setFormVisible(false)}
          onSubmit={saveAddress}
          isSaving={isSaving}
          error={error}
        />
      ) : null}
    </View>
  );
}
