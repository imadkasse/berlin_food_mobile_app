import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { ListRow, Screen, SectionHeader } from '@/components/navigation';
import { Badge, Card, EmptyState, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';
import { FilterChip } from '@/features/admin/components/FilterChip';
import { PaginationBar } from '@/features/admin/components/PaginationBar';
import { UserEditModal } from '@/features/admin/components/UserEditModal';
import { useAdminUsers, type AvailabilityFilter } from '@/features/admin/hooks/use-admin-users';
import { ROLE_FILTER_OPTIONS, type EditableRole, type UserDraft } from '@/features/admin/types';
import { formatDate, initials, shortId } from '@/features/admin/utils';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import {
  ROLE_LABEL,
  VEHICLE_LABEL,
  normalizeRole,
  type AppRole,
  type Profile,
  type VehicleType,
} from '@/types/models';

const ROLE_TONE: Record<AppRole, BadgeTone> = {
  admin: 'primary',
  delivery: 'accent',
  support: 'success',
  customer: 'neutral',
};

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Offline' },
];

function vehicleLabel(value: string | null): string | null {
  if (!value) return null;
  if (value in VEHICLE_LABEL) return VEHICLE_LABEL[value as VehicleType];
  return null;
}

export function AdminUsersScreen() {
  const { tokens } = useTheme();
  const {
    filteredUsers,
    count,
    page,
    totalPages,
    loading,
    refreshing,
    error,
    actionError,
    saving,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    availabilityFilter,
    setAvailabilityFilter,
    refresh,
    clearActionError,
    goToPage,
    updateUser,
  } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const handleSubmit = async (id: string, draft: UserDraft) => {
    const saved = await updateUser(id, draft);
    if (saved) setEditingUser(null);
  };

  const listEmpty = loading ? (
    <LoadingState label="Loading users…" />
  ) : error ? (
    <ErrorState message={error} onRetry={() => void refresh()} />
  ) : (
    <EmptyState
      title="No users found"
      message="No profiles match this search, role or availability filter."
    />
  );

  return (
    <Screen>
      <FlatList
        data={filteredUsers}
        keyExtractor={(user) => user.id}
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
              eyebrow="Directory"
              title="Users"
              description="Roles, availability and contact details."
              action={
                <View className="items-center rounded-md bg-accent-soft px-4 py-2">
                  <Text variant="title" weight="bold" tone="primary">
                    {count}
                  </Text>
                  <Text variant="caption" weight="semibold" tone="primary" className="uppercase">
                    total
                  </Text>
                </View>
              }
            />

            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, phone or ID"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={100}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pe-5"
            >
              <FilterChip
                label="All roles"
                active={roleFilter === 'all'}
                onPress={() => setRoleFilter('all')}
              />
              {ROLE_FILTER_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={roleFilter === option.value}
                  onPress={() => setRoleFilter(option.value as EditableRole)}
                />
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pe-5"
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={availabilityFilter === option.value}
                  onPress={() => setAvailabilityFilter(option.value)}
                />
              ))}
            </ScrollView>

            <Card variant="tonal" className="flex-row items-start gap-3 p-4">
              <Ionicons name="information-circle-outline" size={20} color={tokens.primary} />
              <Text variant="caption" tone="secondary" className="flex-1">
                Mobile admins can edit existing profiles. Creating or deleting accounts stays on the
                secure server because it requires the Supabase service-role key — it is never
                shipped in this app.
              </Text>
            </Card>

            <ListRow
              title="Delivery requests"
              subtitle="Review courier applications"
              leading={
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                  <Ionicons name="bicycle-outline" size={18} color={tokens.primary} />
                </View>
              }
              onPress={() => router.push(ROUTES.adminDeliveryRequests)}
            />

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
          const role = normalizeRole(item.role);
          const vehicle = vehicleLabel(item.vehicle_type);
          const available = item.availability_status === true;

          return (
            <Card className="gap-4">
              <View className="flex-row items-start gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                  <Text variant="body" weight="bold" tone="primary">
                    {initials(item.full_name)}
                  </Text>
                </View>

                <View className="flex-1 gap-1">
                  <Text variant="body-lg" weight="bold" numberOfLines={1}>
                    {item.full_name?.trim() || 'Unnamed user'}
                  </Text>
                  <Text variant="caption" tone="secondary" className="font-sans">
                    ID {shortId(item.id)}
                  </Text>
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Badge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Badge>
                    <View className="flex-row items-center gap-1.5">
                      <View
                        className={`h-2 w-2 rounded-full ${available ? 'bg-success' : 'bg-outline'}`}
                      />
                      <Text variant="caption" weight="semibold" tone="secondary">
                        {available ? 'Available' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.full_name ?? 'user'}`}
                  onPress={() => {
                    clearActionError();
                    setEditingUser(item);
                  }}
                  className="h-11 w-11 items-center justify-center rounded-full bg-surface-variant active:opacity-80"
                >
                  <Ionicons name="create-outline" size={18} color={tokens.onSurfaceVariant} />
                </Pressable>
              </View>

              <View className="gap-2 rounded-md bg-surface-variant/50 p-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="call-outline" size={15} color={tokens.onSurfaceVariant} />
                  <Text variant="body-sm" tone="secondary">
                    {item.phone_number?.trim() || 'No phone number'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="bicycle-outline" size={15} color={tokens.onSurfaceVariant} />
                  <Text variant="body-sm" tone="secondary">
                    {vehicle ?? 'No vehicle on file'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location-outline" size={15} color={tokens.onSurfaceVariant} />
                  <Text variant="body-sm" tone="secondary">
                    {item.address ? 'Delivery address saved' : 'No address saved'}
                  </Text>
                  <Text variant="caption" tone="secondary" className="ms-auto">
                    Updated {formatDate(item.updated_at)}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          !loading && !error && count > 0 ? (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPrevious={() => goToPage(page - 1)}
              onNext={() => goToPage(page + 1)}
            />
          ) : undefined
        }
      />

      <UserEditModal
        user={editingUser}
        saving={saving}
        error={actionError}
        onClose={() => setEditingUser(null)}
        onSubmit={(id, draft) => void handleSubmit(id, draft)}
      />
    </Screen>
  );
}

export default AdminUsersScreen;
