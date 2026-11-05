import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Input, Modal, Text } from '@/components/ui';

export type CategoryFormModalProps = {
  visible: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (name: string, imageUrl: string) => void;
};

function CategoryFormContent({
  saving,
  error,
  onClose,
  onSubmit,
}: Omit<CategoryFormModalProps, 'visible'>) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setValidation('Give the category a name.');
      return;
    }
    setValidation(null);
    onSubmit(name, imageUrl);
  };

  return (
    <ScrollView
      style={{ maxHeight: 360 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-4"
    >
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Desserts"
        maxLength={60}
      />
      <Input
        label="Image URL"
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://…"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text variant="caption" tone="secondary" className="ms-1">
        Optional. File upload is not available in the mobile app.
      </Text>

      {validation || error ? (
        <Text variant="body-sm" tone="error">
          {validation ?? error}
        </Text>
      ) : null}

      <View className="flex-row gap-3">
        <Button variant="tonal" className="flex-1" onPress={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" loading={saving} onPress={handleSubmit}>
          Create
        </Button>
      </View>
    </ScrollView>
  );
}

/** Create-category sheet mirroring the web `CreateCategoryModal` insert. */
export function CategoryFormModal({
  visible,
  saving,
  error,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} title="New category">
      {visible ? (
        <CategoryFormContent saving={saving} error={error} onClose={onClose} onSubmit={onSubmit} />
      ) : null}
    </Modal>
  );
}
