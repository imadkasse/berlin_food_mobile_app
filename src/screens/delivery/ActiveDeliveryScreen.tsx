import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { AppHeader } from '@/components/navigation';
import { Button, Card, EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import {
  DeliveryNotice,
  OrderStatusBadge,
  OrderThumb,
  RouteMap,
  destinationLabel,
  formatCoordinates,
  formatDateTime,
  formatMoney,
  hasCoordinates,
  shortOrderId,
  useActiveDelivery,
  useCourierLocation,
} from '@/features/delivery';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';

export function ActiveDeliveryScreen() {
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = typeof params.id === 'string' ? params.id : undefined;

  const {
    status,
    order,
    error,
    isMarkingDelivered,
    notice,
    dismissNotice,
    refresh,
    markDelivered,
  } = useActiveDelivery(orderId);

  const courierLocation = useCourierLocation();

  const [mapError, setMapError] = useState<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    },
    []
  );

  const goBackToRoutes = () => router.replace(ROUTES.deliveryRoutes);

  const openInMaps = async () => {
    const address = order?.delivery_address;

    if (!address || !hasCoordinates(address)) {
      setMapError('This delivery has no destination coordinates yet.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`;

    try {
      setMapError(null);
      await Linking.openURL(url);
    } catch {
      setMapError('We could not open your maps app. Check that one is installed.');
    }
  };

  const handleMarkDelivered = async () => {
    const delivered = await markDelivered();

    if (!delivered) return;

    redirectTimer.current = setTimeout(() => router.replace(ROUTES.deliveryRoutes), 900);
  };

  if (status === 'loading') {
    return (
      <View className="flex-1 bg-background">
        <AppHeader title="Active delivery" canGoBack />
        <LoadingState label="Loading the delivery…" className="flex-1" />
      </View>
    );
  }

  if (status === 'not-found') {
    return (
      <View className="flex-1 bg-background">
        <AppHeader title="Active delivery" canGoBack />
        <View className="flex-1 justify-center pb-28">
          <EmptyState
            title="Delivery not found"
            message="This order may already be completed, or it is assigned to another courier."
            actionLabel="Back to routes"
            onAction={goBackToRoutes}
          />
        </View>
      </View>
    );
  }

  if (status === 'error' || !order) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader title="Active delivery" canGoBack />
        <View className="flex-1 justify-center pb-28">
          <ErrorState
            title="Delivery unavailable"
            message={error ?? 'We could not load this delivery.'}
            onRetry={() => void refresh()}
          />
          <Pressable
            accessibilityRole="button"
            onPress={goBackToRoutes}
            className="self-center active:opacity-70"
          >
            <Text variant="body-sm" weight="semibold" tone="primary">
              Back to routes
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const address = order.delivery_address;
  const coordinates = formatCoordinates(address);
  const items = order.order_items ?? [];
  const combinedNotice = mapError ? { tone: 'error' as const, message: mapError } : notice;

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Active delivery" canGoBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-28 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Text
            variant="label"
            weight="semibold"
            tone="accent"
            className="uppercase tracking-widest"
          >
            Route active
          </Text>
          <View className="flex-row items-end justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text variant="headline" weight="extrabold">
                Order #{shortOrderId(order.id)}
              </Text>
              <Text variant="body-sm" tone="secondary">
                Placed {formatDateTime(order.created_at)}
              </Text>
            </View>
            <Text variant="title-lg" weight="bold" tone="primary">
              {formatMoney(order.total_price)}
            </Text>
          </View>
          <View className="flex-row">
            <OrderStatusBadge status={order.status} />
          </View>
        </View>

        {combinedNotice ? (
          <DeliveryNotice
            notice={combinedNotice}
            onDismiss={() => {
              dismissNotice();
              setMapError(null);
            }}
          />
        ) : null}

        {address && hasCoordinates(address) ? (
          <View className="gap-2">
            <RouteMap
              pickup={courierLocation.location}
              destination={{ lat: address.lat, lng: address.lng }}
              destinationLabel={destinationLabel(address)}
            />

            <View className="flex-row items-center gap-2 px-1">
              <Ionicons name="navigate-outline" size={14} color={tokens.primary} />
              <Text variant="caption" tone="secondary">
                Destination coordinates
              </Text>
              <Text variant="caption" weight="semibold" className="font-mono">
                {coordinates}
              </Text>
            </View>
          </View>
        ) : (
          <View className="h-60 items-center justify-center gap-2 overflow-hidden rounded-md bg-surface-variant px-6">
            <Ionicons name="map-outline" size={26} color={tokens.onSurfaceVariant} />
            <Text variant="body-sm" weight="semibold" className="text-center">
              Destination coordinates are not available yet.
            </Text>
            <Text variant="caption" tone="secondary" className="text-center">
              The map appears once the customer address includes coordinates.
            </Text>
          </View>
        )}

        <Card className="gap-5">
          <Text variant="title" weight="bold">
            Delivery details
          </Text>

          <View className="gap-1">
            <Text
              variant="caption"
              weight="semibold"
              tone="secondary"
              className="uppercase tracking-widest"
            >
              Address
            </Text>
            <Text variant="body-lg" weight="semibold">
              {destinationLabel(address)}
            </Text>
            {address?.formatted && address.formatted !== destinationLabel(address) ? (
              <Text variant="body-sm" tone="secondary">
                {address.formatted}
              </Text>
            ) : null}
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 gap-1">
              <Text
                variant="caption"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Customer reference
              </Text>
              <Text variant="body-sm" weight="semibold" numberOfLines={1}>
                {order.customer_id ?? 'Guest'}
              </Text>
            </View>

            <View className="items-end gap-1">
              <Text
                variant="caption"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Order total
              </Text>
              <Text variant="body" weight="bold" tone="primary">
                {formatMoney(order.total_price)}
              </Text>
            </View>
          </View>

          <View className="gap-1">
            <Text
              variant="caption"
              weight="semibold"
              tone="secondary"
              className="uppercase tracking-widest"
            >
              GPS
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 rounded-sm bg-surface-variant/70 px-3 py-2">
                <Text variant="caption" tone="secondary">
                  Latitude
                </Text>
                <Text variant="body-sm" weight="semibold" className="font-mono">
                  {address && hasCoordinates(address) ? address.lat.toFixed(5) : 'Unavailable'}
                </Text>
              </View>
              <View className="flex-1 rounded-sm bg-surface-variant/70 px-3 py-2">
                <Text variant="caption" tone="secondary">
                  Longitude
                </Text>
                <Text variant="body-sm" weight="semibold" className="font-mono">
                  {address && hasCoordinates(address) ? address.lng.toFixed(5) : 'Unavailable'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {items.length > 0 ? (
          <Card className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text variant="title" weight="bold">
                Order contents
              </Text>
              <Text variant="body-sm" tone="secondary">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>

            <View className="gap-3">
              {items.map((item) => (
                <View key={item.id} className="flex-row items-center gap-3">
                  <OrderThumb uri={item.menu_item?.image_url} size={44} />

                  <View className="flex-1 gap-0.5">
                    <Text variant="body-sm" weight="semibold" numberOfLines={1}>
                      {item.menu_item?.name ?? 'Menu item'}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {item.quantity} × {formatMoney(item.price)}
                    </Text>
                  </View>

                  <Text variant="body-sm" weight="semibold" tone="secondary">
                    {formatMoney((item.price ?? 0) * (item.quantity ?? 0))}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <View className="gap-3">
          <Button variant="tonal" block onPress={() => void openInMaps()}>
            <Ionicons name="map-outline" size={18} color={tokens.onAccentSoft} />
            <Text variant="body" weight="semibold" className="text-on-accent-soft">
              Open in Maps
            </Text>
          </Button>

          <Button
            variant="accent"
            size="lg"
            block
            loading={isMarkingDelivered}
            onPress={() => void handleMarkDelivered()}
          >
            Mark as delivered
          </Button>

          <Text variant="caption" tone="secondary" className="px-2 text-center">
            Only mark an order delivered once it is handed to the customer.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
