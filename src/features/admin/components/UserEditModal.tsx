import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Input, Modal, Text } from '@/components/ui';
import { VEHICLE_LABEL, normalizeRole, type Profile, type VehicleType } from '@/types/models';
import { cn } from '@/utils/cn';

import {
  EDITABLE_ROLES,
  EDITABLE_ROLE_LABEL,
  VEHICLE_OPTIONS,
  type EditableRole,
  type UserDraft,
} from '../types';
import { shortId } from '../utils';
import { ToggleSwitch } from './ToggleSwitch';

const ROLE_HINTS: Record<EditableRole, string> = {
  customer: 'Can order and manage their own profile.',
  delivery: 'Can accept deliveries and update their availability.',
  manager: 'Treated as an admin across the app.',
  support: 'Read-only staff role.',
  admin: 'Full access to the admin area.',
};

function initialDraft(user: Profile): UserDraft {
  const normalized = normalizeRole(user.role);

  return {
    full_name: user.full_name ?? '',
    phone_number: user.phone_number ?? '',
    role: user.role === 'manager' ? 'manager' : normalized,
    vehicle_type: user.vehicle_type ?? 'motorcycle',
    availability_status: user.availability_status ?? false,
  };
}

export type UserEditModalProps = {
  user: Profile | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (id: string, draft: UserDraft) => void;
};

function UserEditContent({
  user,
  saving,
  error,
  onClose,
  onSubmit,
}: Omit<UserEditModalProps, 'user'> & { user: Profile }) {
  const [draft, setDraft] = useState<UserDraft>(() => initialDraft(user));
  const [validation, setValidation] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!draft.full_name.trim()) {
      setValidation('Enter a full name.');
      return;
    }
    setValidation(null);
    onSubmit(user.id, draft);
  };

  return (
    <ScrollView
      style={{ maxHeight: 470 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-4"
    >
      <View className="gap-0.5">
        <Text variant="body-sm" weight="semibold">
          {user.full_name ?? 'Unnamed user'}
        </Text>
        <Text variant="caption" tone="secondary" className="font-sans">
          ID {shortId(user.id)}
        </Text>
      </View>

      <Input
        label="Full name"
        value={draft.full_name}
        onChangeText={(value) => setDraft((current) => ({ ...current, full_name: value }))}
        placeholder="Full name"
        maxLength={100}
      />

      <Input
        label="Phone number"
        value={draft.phone_number}
        onChangeText={(value) => setDraft((current) => ({ ...current, phone_number: value }))}
        placeholder="+49 …"
        keyboardType="phone-pad"
        maxLength={30}
      />

      <View className="gap-2">
        <Text variant="label" weight="semibold" tone="secondary" className="ms-1">
          Role
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {EDITABLE_ROLES.map((role) => {
            const active = draft.role === role;
            return (
              <Pressable
                key={role}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setDraft((current) => ({ ...current, role }))}
                className={cn(
                  'rounded-full px-3 py-1.5 active:opacity-80',
                  active ? 'bg-primary' : 'bg-surface-variant'
                )}
              >
                <Text variant="label" weight="semibold" tone={active ? 'inverse' : 'secondary'}>
                  {EDITABLE_ROLE_LABEL[role]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="caption" tone="secondary" className="ms-1">
          {ROLE_HINTS[draft.role]}
        </Text>
      </View>

      {draft.role === 'delivery' ? (
        <View className="gap-2">
          <Text variant="label" weight="semibold" tone="secondary" className="ms-1">
            Vehicle
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {VEHICLE_OPTIONS.map((vehicle) => {
              const active = draft.vehicle_type === vehicle;
              return (
                <Pressable
                  key={vehicle}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setDraft((current) => ({ ...current, vehicle_type: vehicle }))}
                  className={cn(
                    'rounded-full px-3 py-1.5 active:opacity-80',
                    active ? 'bg-accent' : 'bg-surface-variant'
                  )}
                >
                  <Text variant="label" weight="semibold" tone={active ? 'on-accent' : 'secondary'}>
                    {VEHICLE_LABEL[vehicle as VehicleType]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between gap-3 rounded-md bg-surface-variant/60 p-4">
        <View className="flex-1 gap-0.5">
          <Text variant="body" weight="semibold">
            Available
          </Text>
          <Text variant="caption" tone="secondary">
            Whether this user is currently online.
          </Text>
        </View>
        <ToggleSwitch
          value={draft.availability_status}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, availability_status: value }))
          }
          accessibilityLabel="Toggle user availability"
        />
      </View>

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
          Save changes
        </Button>
      </View>
    </ScrollView>
  );
}

/** Edit sheet for `profiles.update` (no create/delete — see the screen note). */
export function UserEditModal({ user, saving, error, onClose, onSubmit }: UserEditModalProps) {
  return (
    <Modal visible={user !== null} onClose={onClose} title="Edit user">
      {user ? (
        <UserEditContent
          user={user}
          saving={saving}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}
