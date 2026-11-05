import { Button, Card, Input, Text } from '@/components/ui';

import { useProfileEditor } from './use-profile';

/**
 * Self-contained personal-details form. The parent keys this component by the
 * profile's name/phone so a refresh (or a successful save) remounts it with
 * fresh values instead of synchronising props into state with an effect.
 */
export function PersonalDetailsCard() {
  const editor = useProfileEditor();

  return (
    <Card className="gap-4">
      <Input
        label="Full name"
        placeholder="Your name"
        value={editor.fullName}
        onChangeText={editor.setFullName}
        autoCapitalize="words"
        autoComplete="name"
      />

      <Input
        label="Phone number"
        placeholder="+49 30 1234 5678"
        value={editor.phoneNumber}
        onChangeText={editor.setPhoneNumber}
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      {editor.error ? (
        <Text variant="body-sm" tone="error">
          {editor.error}
        </Text>
      ) : editor.success ? (
        <Text variant="body-sm" tone="success">
          {editor.success}
        </Text>
      ) : null}

      <Button
        block
        loading={editor.isSaving}
        onPress={() => void editor.save()}
        accessibilityLabel="Save personal details"
      >
        Save changes
      </Button>
    </Card>
  );
}
