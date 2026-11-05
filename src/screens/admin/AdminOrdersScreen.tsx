import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';

import { Screen, SectionHeader } from '@/components/navigation';
import { EmptyState, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import { FilterChip } from '@/features/admin/components/FilterChip';
import { OrderCard } from '@/features/admin/components/OrderCard';
import { OrderDetailsModal } from '@/features/admin/components/OrderDetailsModal';
import { OrderStatusPickerModal } from '@/features/admin/components/OrderStatusPickerModal';
import { PaginationBar } from '@/features/admin/components/PaginationBar';
import { useAdminOrders } from '@/features/admin/hooks/use-admin-orders';
import { ADMIN_ORDER_STATUSES, type AdminOrderStatus } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';
import { ORDER_STATUS_LABEL } from '@/types/models';

export function AdminOrdersScreen() {
  const { tokens } = useTheme();
  const {
    orders,
    filteredOrders,
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
  } = useAdminOrders();

  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);

  const detailsOrder = detailsId ? (orders.find((order) => order.id === detailsId) ?? null) : null;
  const statusOrder = statusId ? (orders.find((order) => order.id === statusId) ?? null) : null;

  const handleSelectStatus = async (status: AdminOrderStatus) => {
    if (!statusOrder?.id) return;
    const saved = await updateStatus(statusOrder.id, status);
    if (saved) setStatusId(null);
  };

  const listEmpty = loading ? (
    <LoadingState label="Loading orders…" />
  ) : error ? (
    <ErrorState message={error} onRetry={() => void refresh()} />
  ) : (
    <EmptyState
      title="No orders found"
      message="No orders match this search or status on the current page."
    />
  );

  return (
    <Screen>
      <FlatList
        data={filteredOrders}
        keyExtractor={(order, index) => order.id ?? `order-${index}`}
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
              eyebrow="Kitchen board"
              title="Orders"
              description={`${count} order${count === 1 ? '' : 's'} across all statuses.`}
            />

            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search by order ID or customer"
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
                label="All"
                active={statusFilter === 'all'}
                onPress={() => setStatusFilter('all')}
              />
              {ADMIN_ORDER_STATUSES.map((status) => (
                <FilterChip
                  key={status}
                  label={ORDER_STATUS_LABEL[status]}
                  active={statusFilter === status}
                  onPress={() => setStatusFilter(status)}
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
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            updating={updatingId === item.id}
            onOpenDetails={() => setDetailsId(item.id)}
            onOpenStatus={() => {
              clearActionError();
              setStatusId(item.id);
            }}
          />
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

      <OrderStatusPickerModal
        visible={statusOrder !== null}
        currentStatus={statusOrder?.status ?? null}
        saving={updatingId !== null}
        onSelect={(status) => void handleSelectStatus(status)}
        onClose={() => setStatusId(null)}
      />

      <OrderDetailsModal order={detailsOrder} onClose={() => setDetailsId(null)} />
    </Screen>
  );
}

export default AdminOrdersScreen;
