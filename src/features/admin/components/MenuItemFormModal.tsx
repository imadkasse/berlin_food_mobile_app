import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Input, Modal, Text } from '@/components/ui';
import type { Category, MenuItem } from '@/types/models';
import { cn } from '@/utils/cn';

import type { MenuItemDraft } from '../types';
import { ToggleSwitch } from './ToggleSwitch';

const EMPTY_DRAFT: MenuItemDraft = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category_id: '',
  is_available: true,
};

function initialDraft(item: MenuItem | null, categories: Category[]): MenuItemDraft {
  if (!item) {
    return { ...EMPTY_DRAFT, category_id: categories[0]?.id ?? '' };
  }

  return {
    name: item.name,
    description: item.description ?? '',
    price: String(item.price),
    image_url: item.image_url ?? '',
    category_id: item.category_id ?? '',
    is_available: item.is_available ?? false,
  };
}

export type MenuItemFormModalProps = {
  visible: boolean;
  item: MenuItem | null;
  categories: Category[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: MenuItemDraft) => void;
};

type ContentProps = Omit<MenuItemFormModalProps, 'visible'>;

function MenuItemFormContent({ item, categories, saving, error, onClose, onSubmit }: ContentProps) {
  const [draft, setDraft] = useState<MenuItemDraft>(() => initialDraft(item, categories));
  const [validation, setValidation] = useState<string | null>(null);

  const setField = <K extends keyof MenuItemDraft>(key: K, value: MenuItemDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const price = Number.parseFloat(draft.price.replace(',', '.'));

    if (!draft.name.trim()) {
      setValidation('Give the dish a name.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setValidation('Enter a price greater than zero.');
      return;
    }
    if (!draft.category_id) {
      setValidation('Choose a category.');
      return;
    }

    setValidation(null);
    onSubmit({ ...draft, price: String(price) });
  };

  return (
    <ScrollView
      style={{ maxHeight: 460 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-4"
    >
      <Input
        label="Name"
        value={draft.name}
        onChangeText={(value) => setField('name', value)}
        placeholder="e.g. Berliner Currywurst"
        maxLength={80}
      />

      <View className="gap-2">
        <Text variant="label" weight="semibold" tone="secondary" className="ms-1">
          Category
        </Text>
        {categories.length === 0 ? (
          <Text variant="body-sm" tone="secondary">
            Add a category first, then create the dish.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => {
              const active = draft.category_id === category.id;
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setField('category_id', category.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 active:opacity-80',
                    active ? 'bg-primary' : 'bg-surface-variant'
                  )}
                >
                  <Text variant="label" weight="semibold" tone={active ? 'inverse' : 'secondary'}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <Input
        label="Description"
        value={draft.description}
        onChangeText={(value) => setField('description', value)}
        placeholder="How is it served?"
        multiline
        maxLength={400}
      />

      <Input
        label="Price (€)"
        value={draft.price}
        onChangeText={(value) => setField('price', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Input
        label="Image URL"
        value={draft.image_url}
        onChangeText={(value) => setField('image_url', value)}
        placeholder="https://…"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text variant="caption" tone="secondary" className="ms-1">
        Paste a hosted image URL. File upload is not available in the mobile app.
      </Text>

      <View className="flex-row items-center justify-between gap-3 rounded-md bg-surface-variant/60 p-4">
        <View className="flex-1 gap-0.5">
          <Text variant="body" weight="semibold">
            Available
          </Text>
          <Text variant="caption" tone="secondary">
            Hidden dishes stay in the editor but leave the customer menu.
          </Text>
        </View>
        <ToggleSwitch
          value={draft.is_available}
          onValueChange={(value) => setField('is_available', value)}
          accessibilityLabel="Toggle dish availability"
        />
      </View>

      {validation || error ? (
        <Text variant="body-sm" tone="error">
          {validation ?? error}
        </Text>
      ) : null}

      <View className="flex-row gap-3 pt-1">
        <Button variant="tonal" className="flex-1" onPress={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" loading={saving} onPress={handleSubmit}>
          {item ? 'Save changes' : 'Create dish'}
        </Button>
      </View>
    </ScrollView>
  );
}

/**
 * Create/edit dish sheet. The web app also supports file upload, but no image
 * picker dependency is installed on mobile — the URL field is the supported
 * path (the web's `CreateMenuItemModal` accepts URLs too).
 */
export function MenuItemFormModal({
  visible,
  item,
  categories,
  saving,
  error,
  onClose,
  onSubmit,
}: MenuItemFormModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} title={item ? 'Edit dish' : 'Add dish'}>
      {visible ? (
        <MenuItemFormContent
          item={item}
          categories={categories}
          saving={saving}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}
