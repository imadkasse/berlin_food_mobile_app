import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';

import { AppHeader } from '@/components/navigation/AppHeader';
import { Screen, SectionHeader } from '@/components/navigation/Screen';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Text,
} from '@/components/ui';
import { FilterChip } from '@/features/admin/components/FilterChip';
import { PaginationBar } from '@/features/admin/components/PaginationBar';
import { RequestStatusPickerModal } from '@/features/admin/components/RequestStatusPickerModal';
import { useAdminRequests } from '@/features/admin/hooks/use-admin-requests';
import {
  formatDateTime,
  requestStatusLabel,
  requestStatusTone,
  shortId,
} from '@/features/admin/utils';
import { useTheme } from '@/hooks/use-theme';
import type { DeliveryRequest, DeliveryRequestStatus } from '@/types/models';

const STATUS_OPTIONS: { value: 'all' | DeliveryRequestStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export function AdminDeliveryRequestsScreen() {
  const { tokens } = useTheme();
  const {
    filteredRequests,
    counts,
    count,
    page,
    totalPages,
    loading,
    refreshing,
    error,
    actionError,
    updatingId,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refresh,
    clearActionError,
    goToPage,
    updateStatus,
  } = useAdminRequests();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRequest = selectedId
    ? (filteredRequests.find((request) => request.id === selectedId) ?? null)
    : null;

  const handleSelect = async (status: DeliveryRequestStatus) => {
    if (!selectedRequest) return;
    const saved = await updateStatus(selectedRequest.id, status);
    if (saved) setSelectedId(null);
  };

  const stats: {
    label: string;
    value: number;
    tone: 'default' | 'accent' | 'success' | 'error';
  }[] = [
    { label: 'Total', value: counts.total, tone: 'default' },
    { label: 'Pending', value: counts.pending, tone: 'accent' },
    { label: 'Approved', value: counts.approved, tone: 'success' },
    { label: 'Rejected', value: counts.rejected, tone: 'error' },
  ];

  const listEmpty = loading ? (
    <LoadingState label="Loading requests…" />
  ) : error ? (
    <ErrorState message={error} onRetry={() => void refresh()} />
  ) : (
    <EmptyState
      title="No requests found"
      message="No delivery applications match this search or status."
    />
  );

  return (
    <Screen edges={[]}>
      <AppHeader title="Delivery requests" canGoBack />

      <FlatList
        data={filteredRequests}
        keyExtractor={(request) => request.id}
        contentContainerClassName="gap-4 px-5 pb-28 pt-2"
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
              eyebrow="Couriers"
              title="Delivery applications"
              description="Review riders who applied to join the fleet."
            />

            <View className="flex-row flex-wrap gap-3">
              {stats.map((stat) => (
                <Card key={stat.label} compact className="w-[47%] flex-grow gap-1">
                  <Text
                    variant="label"
                    weight="semibold"
                    tone="secondary"
                    className="uppercase tracking-widest"
                  >
                    {stat.label}
                  </Text>
                  <Text
                    variant="title-lg"
                    weight="bold"
                    tone={
                      stat.tone === 'accent'
                        ? 'accent'
                        : stat.tone === 'success'
                          ? 'success'
                          : stat.tone === 'error'
                            ? 'error'
                            : 'default'
                    }
                  >
                    {stat.value}
                  </Text>
                </Card>
              ))}
            </View>

            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, email, phone or ID"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={100}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pe-5"
            >
              {STATUS_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={statusFilter === option.value}
                  onPress={() => setStatusFilter(option.value)}
                />
              ))}
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
        renderItem={({ item }: { item: DeliveryRequest }) => (
          <Card className="gap-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-0.5">
                <Text variant="body-lg" weight="bold" numberOfLines={1}>
                  {item.full_name}
                </Text>
                <Text variant="caption" tone="secondary" className="font-sans">
                  {shortId(item.id, 12)}
                </Text>
              </View>
              <Badge tone={requestStatusTone(item.status)}>{requestStatusLabel(item.status)}</Badge>
            </View>

            <View className="gap-2 rounded-md bg-surface-variant/50 p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={15} color={tokens.onSurfaceVariant} />
                <Text variant="body-sm" tone="secondary" numberOfLines={1} className="flex-1">
                  {item.email?.trim() || 'No email provided'}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="call-outline" size={15} color={tokens.onSurfaceVariant} />
                <Text variant="body-sm" tone="secondary">
                  {item.phone_number?.trim() || 'No phone number'}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={15} color={tokens.onSurfaceVariant} />
                <Text variant="body-sm" tone="secondary">
                  Submitted {formatDateTime(item.created_at)}
                </Text>
              </View>
            </View>

            <Button
              variant="tonal"
              size="sm"
              block
              loading={updatingId === item.id}
              onPress={() => {
                clearActionError();
                setSelectedId(item.id);
              }}
            >
              Review application
            </Button>
          </Card>
        )}
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

      <RequestStatusPickerModal
        visible={selectedRequest !== null}
        currentStatus={selectedRequest?.status ?? 'pending'}
        saving={updatingId !== null}
        onSelect={(status) => void handleSelect(status)}
        onClose={() => setSelectedId(null)}
      />
    </Screen>
  );
}

export default AdminDeliveryRequestsScreen;
