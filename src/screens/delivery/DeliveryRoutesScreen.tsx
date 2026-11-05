import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, RefreshControl, View } from 'react-native';

import { Screen } from '@/components/navigation';
import { Button, Card, EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import {
  OrderStatusBadge,
  OrderThumb,
  destinationLabel,
  formatCoordinates,
  formatMoney,
  formatTime,
  shortOrderId,
  useDeliveryRoutes,
} from '@/features/delivery';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';

export function DeliveryRoutesScreen() {
  const { tokens } = useTheme();
  const { orders, isLoading, isRefreshing, error, refresh } = useDeliveryRoutes();

  const header = (
    <View className="gap-1.5 pt-1">
      <Text variant="label" weight="semibold" tone="accent" className="uppercase tracking-widest">
        On the road
      </Text>
      <Text variant="headline" weight="extrabold">
        My routes
      </Text>
      <Text variant="body" tone="secondary">
        {orders.length === 0
          ? 'Active deliveries assigned to you will appear here.'
          : `You have ${orders.length} active ${
              orders.length === 1 ? 'delivery' : 'deliveries'
            } waiting.`}
      </Text>
    </View>
  );

  let emptyContent: React.ReactElement;

  if (isLoading) {
    emptyContent = <LoadingState label="Loading your routes…" />;
  } else if (error) {
    emptyContent = (
      <ErrorState title="Routes unavailable" message={error} onRetry={() => void refresh()} />
    );
  } else {
    emptyContent = (
      <EmptyState
        title="No active deliveries"
        message="You have no orders out for delivery right now. Head to the orders tab to claim one."
        actionLabel="Browse available orders"
        onAction={() => router.push(ROUTES.deliveryOrders)}
      />
    );
  }

  return (
    <Screen>
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        contentContainerClassName="gap-3 px-5 pt-4 pb-28"
        showsVerticalScrollIndicator={false}
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
          const coordinates = formatCoordinates(item.delivery_address);

          return (
            <Card className="gap-4">
              <View className="flex-row items-center gap-3">
                <OrderThumb uri={item.order_items?.[0]?.menu_item?.image_url} size={52} />

                <View className="flex-1 gap-0.5">
                  <Text variant="title" weight="bold">
                    #{shortOrderId(item.id)}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text variant="body-sm" weight="semibold" tone="primary">
                      {formatMoney(item.total_price)}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {formatTime(item.created_at)}
                    </Text>
                  </View>
                </View>

                <OrderStatusBadge status={item.status} />
              </View>

              <View className="flex-row items-start gap-3 rounded-md bg-surface-variant/70 p-4">
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={tokens.primary}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1 gap-1">
                  <Text
                    variant="caption"
                    weight="semibold"
                    tone="secondary"
                    className="uppercase tracking-widest"
                  >
                    Destination
                  </Text>
                  <Text variant="body-sm" weight="semibold" numberOfLines={2}>
                    {destinationLabel(item.delivery_address)}
                  </Text>
                  {coordinates ? (
                    <Text variant="caption" tone="secondary" className="font-mono">
                      {coordinates}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Button
                block
                onPress={() =>
                  router.push({
                    pathname: '/delivery/active-delivery/[id]',
                    params: { id: item.id },
                  })
                }
                accessibilityLabel={`Open delivery ${shortOrderId(item.id)}`}
              >
                View route
              </Button>
            </Card>
          );
        }}
      />
    </Screen>
  );
}
