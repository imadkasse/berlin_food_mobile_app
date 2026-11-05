import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { AppHeader } from '@/components/navigation';
import { EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { ActiveOrderCard } from '@/features/orders/ActiveOrderCard';
import { HistoryOrderRow } from '@/features/orders/HistoryOrderRow';
import { RatingModal } from '@/features/orders/RatingModal';
import { getOrderItems, isActiveOrder } from '@/features/orders/order-utils';
import { useOrders } from '@/features/orders/use-orders';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';
import { useCartStore } from '@/stores/cart.store';
import type { Order } from '@/types/models';

type OrderRow =
  | { kind: 'section'; key: string; title: string; accent: boolean }
  | { kind: 'active'; key: string; order: Order }
  | { kind: 'history'; key: string; order: Order };

/**
 * "My orders" — active orders and history, split with the same status list the
 * web app uses. Rows are flattened into a single FlatList so pull-to-refresh
 * and virtualisation work across both sections.
 */ export function OrdersScreen() {
  const { session } = useSession();
  const { tokens } = useTheme();
  const addItem = useCartStore((state) => state.addItem);

  const {
    orders,
    status,
    error,
    refreshing,
    updatingOrderId,
    actionError,
    refresh,
    retry,
    clearActionError,
    confirmDelivery,
  } = useOrders(session?.user.id);

  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

  const rows = useMemo<OrderRow[]>(() => {
    const active = orders.filter(isActiveOrder);
    const history = orders.filter((order) => !isActiveOrder(order));
    const result: OrderRow[] = [];

    if (active.length > 0) {
      result.push({
        kind: 'section',
        key: 'section-active',
        title: `Active orders · ${active.length}`,
        accent: true,
      });
      active.forEach((order) => result.push({ kind: 'active', key: `active-${order.id}`, order }));
    }

    if (history.length > 0) {
      result.push({
        kind: 'section',
        key: 'section-history',
        title: 'Order history',
        accent: false,
      });
      history.forEach((order) =>
        result.push({ kind: 'history', key: `history-${order.id}`, order })
      );
    }

    return result;
  }, [orders]);

  const handleReorder = (order: Order) => {
    const items = getOrderItems(order).flatMap((orderItem) => {
      const menuItem = orderItem.menu_item;
      if (!menuItem) return [];

      return [
        {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: orderItem.price ?? menuItem.price,
          image_url: menuItem.image_url,
          quantity: orderItem.quantity ?? 1,
        },
      ];
    });

    if (items.length === 0) return;

    items.forEach((item) => addItem(item));
    router.navigate(ROUTES.cart);
  };

  const handleStartRating = (order: Order) => {
    clearActionError();
    setRatingOrder(order);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!ratingOrder) return;
    const confirmed = await confirmDelivery(ratingOrder, rating);
    if (confirmed) setRatingOrder(null);
  };

  const handleSkipRating = async () => {
    if (!ratingOrder) return;
    const confirmed = await confirmDelivery(ratingOrder);
    if (confirmed) setRatingOrder(null);
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="My orders" />

      {status === 'loading' ? (
        <LoadingState label="Gathering your orders…" className="flex-1" />
      ) : status === 'error' ? (
        <ErrorState
          title="Orders are out of reach"
          message={error ?? 'We could not load your orders.'}
          onRetry={retry}
          className="flex-1"
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={({ item }) => {
            if (item.kind === 'section') {
              return (
                <View className="pt-3">
                  <Text
                    variant="label"
                    weight="semibold"
                    tone={item.accent ? 'primary' : 'secondary'}
                    className="uppercase tracking-widest"
                  >
                    {item.title}
                  </Text>
                </View>
              );
            }

            if (item.kind === 'active') {
              return (
                <ActiveOrderCard
                  order={item.order}
                  isUpdating={updatingOrderId === item.order.id}
                  onConfirmDelivery={handleStartRating}
                />
              );
            }

            return <HistoryOrderRow order={item.order} onReorder={handleReorder} />;
          }}
          contentContainerClassName="gap-3 px-5 pb-28 pt-4"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="gap-1 pb-1">
              <Text variant="body-lg" tone="secondary">
                From our kitchen to your table — follow every moment of the journey.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No orders yet"
              message="Your first Berlin Food order will appear here."
              actionLabel="Browse the menu"
              onAction={() => router.navigate(ROUTES.menu)}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={tokens.primary}
              colors={[tokens.primary]}
              progressBackgroundColor={tokens.surfaceRaised}
            />
          }
        />
      )}

      {ratingOrder ? (
        <RatingModal
          key={ratingOrder.id}
          visible
          onClose={() => setRatingOrder(null)}
          onSubmit={(rating) => void handleSubmitRating(rating)}
          onSkip={() => void handleSkipRating()}
          isSubmitting={updatingOrderId !== null}
          error={actionError}
        />
      ) : null}
    </View>
  );
}
