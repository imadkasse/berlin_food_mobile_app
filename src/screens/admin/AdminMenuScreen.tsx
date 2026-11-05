import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { Screen, SectionHeader } from '@/components/navigation';
import { IconButton } from '@/components/navigation/IconButton';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import { CategoryFormModal } from '@/features/admin/components/CategoryFormModal';
import { DeleteMenuItemModal } from '@/features/admin/components/DeleteMenuItemModal';
import { FilterChip } from '@/features/admin/components/FilterChip';
import { MenuItemFormModal } from '@/features/admin/components/MenuItemFormModal';
import { useAdminMenu } from '@/features/admin/hooks/use-admin-menu';
import type { MenuItemDraft } from '@/features/admin/types';
import { formatCurrency } from '@/features/admin/utils';
import { useTheme } from '@/hooks/use-theme';
import type { MenuItem } from '@/types/models';

export function AdminMenuScreen() {
  const { tokens } = useTheme();
  const {
    categories,
    filteredItems,
    loading,
    refreshing,
    error,
    actionError,
    saving,
    creatingCategory,
    togglingId,
    deletingId,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    refresh,
    clearActionError,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    createCategory,
  } = useAdminMenu();

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [categoryVisible, setCategoryVisible] = useState(false);

  const openCreate = () => {
    clearActionError();
    setEditingItem(null);
    setFormVisible(true);
  };

  const openEdit = (item: MenuItem) => {
    clearActionError();
    setEditingItem(item);
    setFormVisible(true);
  };

  const openDelete = (item: MenuItem) => {
    clearActionError();
    setDeletingItem(item);
  };

  const openCategory = () => {
    clearActionError();
    setCategoryVisible(true);
  };

  const handleSubmit = async (draft: MenuItemDraft) => {
    const saved = editingItem ? await updateItem(editingItem.id, draft) : await createItem(draft);

    if (saved) {
      setFormVisible(false);
      setEditingItem(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const deleted = await deleteItem(deletingItem.id);
    if (deleted) setDeletingItem(null);
  };

  const handleCreateCategory = async (name: string, imageUrl: string) => {
    const created = await createCategory(name, imageUrl);
    if (created) setCategoryVisible(false);
  };

  const listEmpty = loading ? (
    <LoadingState label="Loading the menu…" />
  ) : error ? (
    <ErrorState message={error} onRetry={() => void refresh()} />
  ) : (
    <EmptyState
      title="No dishes found"
      message="Try another search or category, or add a new dish."
      actionLabel="Add dish"
      onAction={openCreate}
    />
  );

  return (
    <Screen>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-4 px-5 pb-28 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={tokens.primary}
            colors={[tokens.primary]}
          />
        }
        ListHeaderComponent={
          <View className="gap-4">
            <SectionHeader
              eyebrow="Catalogue"
              title="Menu editor"
              description="Prices, categories and availability in one place."
              action={
                <Button variant="primary" size="sm" onPress={openCreate}>
                  <Ionicons name="add" size={18} color={tokens.onPrimary} />
                  <Text variant="body-sm" weight="semibold" tone="inverse">
                    Add dish
                  </Text>
                </Button>
              }
            />

            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search dishes"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={100}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="items-center gap-2 pe-5"
            >
              <FilterChip
                label="All"
                active={categoryFilter === 'all'}
                onPress={() => setCategoryFilter('all')}
              />
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.name}
                  active={categoryFilter === category.id}
                  onPress={() => setCategoryFilter(category.id)}
                />
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add category"
                onPress={() => openCategory()}
                className="h-9 flex-row items-center gap-1.5 rounded-full bg-accent-soft px-4 active:opacity-80"
              >
                <Ionicons name="folder-open-outline" size={15} color={tokens.primary} />
                <Text variant="label" weight="semibold" tone="primary">
                  Add category
                </Text>
              </Pressable>
            </ScrollView>

            {actionError ? (
              <View className="rounded-md bg-error-container p-3">
                <Text variant="body-sm" weight="medium" tone="error">
                  {actionError}
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const available = item.is_available ?? false;
          const toggling = togglingId === item.id;

          return (
            <Card className="gap-3">
              <View className="flex-row gap-4">
                <View className="h-24 w-24 overflow-hidden rounded-md bg-surface-variant">
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="restaurant-outline" size={24} color={tokens.outline} />
                    </View>
                  )}
                </View>

                <View className="flex-1 gap-1.5">
                  <View className="flex-row items-start justify-between gap-2">
                    <Text variant="body-lg" weight="bold" numberOfLines={2} className="flex-1">
                      {item.name}
                    </Text>
                    <Text variant="body-lg" weight="bold" tone="primary">
                      {formatCurrency(item.price)}
                    </Text>
                  </View>

                  {item.description ? (
                    <Text variant="body-sm" tone="secondary" numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <Pressable
                    accessibilityRole="switch"
                    accessibilityLabel={`Toggle availability for ${item.name}`}
                    accessibilityState={{ checked: available, disabled: toggling }}
                    disabled={toggling}
                    onPress={() => void toggleAvailability(item)}
                    className="flex-row items-center gap-2 self-start rounded-full bg-surface-variant/60 px-3 py-1 active:opacity-70"
                  >
                    <View
                      className={`h-2 w-2 rounded-full ${available ? 'bg-success' : 'bg-outline'}`}
                    />
                    <Text
                      variant="caption"
                      weight="semibold"
                      tone={available ? 'success' : 'secondary'}
                    >
                      {toggling ? 'Updating…' : available ? 'Available' : 'Hidden'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="flex-row items-center justify-end gap-2">
                <IconButton
                  name="create-outline"
                  variant="tonal"
                  size="sm"
                  accessibilityLabel={`Edit ${item.name}`}
                  onPress={() => openEdit(item)}
                />
                <IconButton
                  name="trash-outline"
                  variant="tonal"
                  size="sm"
                  accessibilityLabel={`Delete ${item.name}`}
                  onPress={() => openDelete(item)}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={listEmpty}
      />

      <MenuItemFormModal
        visible={formVisible}
        item={editingItem}
        categories={categories}
        saving={saving}
        error={actionError}
        onClose={() => {
          setFormVisible(false);
          setEditingItem(null);
        }}
        onSubmit={(draft) => void handleSubmit(draft)}
      />

      <DeleteMenuItemModal
        item={deletingItem}
        saving={deletingId !== null}
        error={actionError}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => void handleDelete()}
      />

      <CategoryFormModal
        visible={categoryVisible}
        saving={creatingCategory}
        error={actionError}
        onClose={() => setCategoryVisible(false)}
        onSubmit={(name, imageUrl) => void handleCreateCategory(name, imageUrl)}
      />
    </Screen>
  );
}

export default AdminMenuScreen;
