import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { Screen } from '@/components/navigation';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import {
  DeliveryNotice,
  OrderStatusBadge,
  OrderThumb,
  destinationLabel,
  formatCoordinates,
  formatMoney,
  formatTime,
  shortOrderId,
  useDeliveryOrders,
  type DeliveryOrderAction,
} from '@/features/delivery';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/SessionProvider';
import type { Order } from '@/types/models';
import { cn } from '@/utils/cn';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'ready_for_pickup', label: 'Ready for pickup' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'pending', label: 'Pending' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

function actionFor(order: Order, userId: string | null): DeliveryOrderAction | null {
  if (order.status === 'pending') return 'accept';
  if (order.status === 'ready_for_pickup') return 'pick_up';
  if (order.status === 'out_for_delivery' && order.delivery_id === userId) {
    return 'mark_delivered';
  }
  return null;
}

const ACTION_LABEL: Record<DeliveryOrderAction, string> = {
  accept: 'Accept',
  pick_up: 'Pick up',
  mark_delivered: 'Mark delivered',
};

const ACTION_VARIANT: Record<DeliveryOrderAction, 'tonal' | 'primary' | 'accent'> = {
  accept: 'tonal',
  pick_up: 'primary',
  mark_delivered: 'accent',
};

export function DeliveryOrdersScreen() {
  const { tokens } = useTheme();
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const {
    orders,
    isLoading,
    isRefreshing,
    error,
    pendingOrderId,
    notice,
    dismissNotice,
    refresh,
    acceptOrder,
    pickUpOrder,
    markDelivered,
  } = useDeliveryOrders();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');

  const activeCount = useMemo(
    () => orders.filter((order) => order.status === 'out_for_delivery').length,
    [orders]
  );

  const hasActiveDelivery = useMemo(
    () =>
      orders.some((order) => order.delivery_id === userId && order.status === 'out_for_delivery'),
    [orders, userId]
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = term.length === 0 || order.id.toLowerCase().includes(term);
      const matchesFilter = filter === 'all' || order.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, orders, search]);

  const runAction = (orderId: string, action: DeliveryOrderAction) => {
    if (action === 'mark_delivered') {
      void markDelivered(orderId);
      return;
    }
    if (action === 'pick_up') {
      void pickUpOrder(orderId);
      return;
    }
    void acceptOrder(orderId);
  };

  const header = (
    <View className="gap-4">
      <View className="gap-1.5 pt-1">
        <Text variant="label" weight="semibold" tone="accent" className="uppercase tracking-widest">
          Queue
        </Text>
        <Text variant="headline" weight="extrabold">
          Delivery orders
        </Text>
        {isLoading ? null : (
          <Text variant="body" tone="secondary">
            {orders.length} total · {activeCount} active
          </Text>
        )}
      </View>

      <Input
        value={search}
        onChangeText={setSearch}
        placeholder="Search by order ID"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search orders by ID"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {FILTERS.map((option) => {
          const isActive = filter === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setFilter(option.value)}
              className={cn(
                'h-10 justify-center rounded-full px-4 active:opacity-80',
                isActive ? 'bg-primary' : 'bg-surface'
              )}
            >
              <Text
                variant="body-sm"
                weight="semibold"
                className={isActive ? 'text-on-primary' : 'text-on-surface-variant'}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {notice ? <DeliveryNotice notice={notice} onDismiss={dismissNotice} /> : null}

      {error && orders.length > 0 ? (
        <DeliveryNotice notice={{ tone: 'error', message: error }} />
      ) : null}
    </View>
  );

  let emptyContent: React.ReactElement;

  if (isLoading) {
    emptyContent = <LoadingState label="Loading the order queue…" />;
  } else if (error && orders.length === 0) {
    emptyContent = (
      <ErrorState title="Queue unavailable" message={error} onRetry={() => void refresh()} />
    );
  } else {
    emptyContent = (
      <EmptyState
        title={orders.length === 0 ? 'No orders yet' : 'No matching orders'}
        message={
          orders.length === 0
            ? 'New orders will appear here as soon as the kitchen receives them.'
            : 'Try another order ID or clear the status filter.'
        }
        actionLabel={orders.length === 0 ? undefined : 'Clear filters'}
        onAction={
          orders.length === 0
            ? undefined
            : () => {
                setSearch('');
                setFilter('all');
              }
        }
      />
    );
  }

  return (
    <Screen>
      <FlatList
        data={filteredOrders}
        keyExtractor={(order) => order.id}
        contentContainerClassName="gap-3 px-5 pt-4 pb-28"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={emptyContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={tokens.primary}
            colors={[tokens.primary]}
          />
        }
        renderItem={({ item }) => {
          const action = actionFor(item, userId);
          const assignedToAnotherCourier = item.delivery_id != null && item.delivery_id !== userId;
          const blockedByActiveDelivery =
            action != null && action !== 'mark_delivered' && hasActiveDelivery;
          const isPending = pendingOrderId === item.id;

          const disabled =
            pendingOrderId !== null ||
            assignedToAnotherCourier ||
            blockedByActiveDelivery ||
            (action === 'mark_delivered' && item.delivery_id !== userId);

          const coordinates = formatCoordinates(item.delivery_address);
          const destination = destinationLabel(item.delivery_address);
          const hasStreet = Boolean(
            item.delivery_address?.street?.trim() ||
            item.delivery_address?.formatted?.trim() ||
            item.delivery_address?.label?.trim()
          );

          return (
            <Card className="gap-4">
              <View className="flex-row items-start gap-3">
                <OrderThumb uri={item.order_items?.[0]?.menu_item?.image_url} size={52} />

                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text variant="title" weight="bold">
                      #{shortOrderId(item.id)}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {formatTime(item.created_at)}
                    </Text>
                  </View>

                  <View className="flex-row items-start gap-1">
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={tokens.onSurfaceVariant}
                      style={{ marginTop: 3 }}
                    />
                    <View className="flex-1">
                      {hasStreet ? (
                        <Text variant="body-sm" tone="secondary" numberOfLines={1}>
                          {destination}
                        </Text>
                      ) : null}
                      <Text variant="caption" tone="secondary" className="font-mono">
                        {coordinates ?? 'Coordinates unavailable'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end gap-1.5">
                  <Text variant="title" weight="bold" tone="primary">
                    {formatMoney(item.total_price)}
                  </Text>
                  <OrderStatusBadge status={item.status} className="self-end" />
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Text variant="caption" tone="secondary" className="flex-1" numberOfLines={1}>
                  {item.order_items?.length ?? 0}{' '}
                  {(item.order_items?.length ?? 0) === 1 ? 'item' : 'items'}
                  {assignedToAnotherCourier ? ' · Assigned to another courier' : ''}
                </Text>

                {action ? (
                  <Button
                    size="sm"
                    variant={ACTION_VARIANT[action]}
                    loading={isPending}
                    disabled={disabled}
                    onPress={() => runAction(item.id, action)}
                  >
                    {ACTION_LABEL[action]}
                  </Button>
                ) : null}
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}
