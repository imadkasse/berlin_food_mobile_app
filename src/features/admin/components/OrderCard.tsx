import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

import type { AdminOrder } from '../types';
import { formatCurrency, formatDateTime, initials, orderReference } from '../utils';
import { OrderStatusBadge } from './OrderStatusBadge';

export type OrderCardProps = {
  order: AdminOrder;
  updating: boolean;
  onOpenDetails: () => void;
  onOpenStatus: () => void;
};

function ItemThumb({ uri, name }: { uri?: string | null; name?: string | null }) {
  const { tokens } = useTheme();

  if (!uri) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-sm bg-surface-variant">
        <Ionicons name="restaurant-outline" size={16} color={tokens.outline} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      contentFit="cover"
      accessibilityLabel={name ?? 'Dish'}
      style={{ width: 40, height: 40, borderRadius: 8 }}
    />
  );
}

/** One order in the admin queue, adapted from the web table row. */
export function OrderCard({ order, updating, onOpenDetails, onOpenStatus }: OrderCardProps) {
  const { tokens } = useTheme();
  const items = order.items ?? [];
  const customerName = order.customer?.full_name?.trim() || 'Customer';
  const overflow = items.length - 3;

  return (
    <Card className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text variant="body-lg" weight="bold" tone="primary">
            {orderReference(order.id)}
          </Text>
          <Text variant="caption" tone="secondary">
            {formatDateTime(order.created_at)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change order status"
          onPress={onOpenStatus}
          className="active:opacity-70"
        >
          <OrderStatusBadge status={order.status} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-3 rounded-md bg-surface-variant/50 p-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
          <Text variant="body-sm" weight="bold" tone="primary">
            {initials(customerName)}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text variant="body-sm" weight="semibold" numberOfLines={1}>
            {customerName}
          </Text>
          <Text variant="caption" tone="secondary">
            {order.customer?.phone_number?.trim() || 'No phone number'}
          </Text>
        </View>
        <Text variant="title" weight="bold">
          {formatCurrency(order.total_price)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-1.5">
          {items.slice(0, 3).map((item, index) => (
            <ItemThumb
              key={`${order.id ?? 'order'}-thumb-${index}`}
              uri={item.menu_item?.image_url}
              name={item.menu_item?.name}
            />
          ))}
          {overflow > 0 ? (
            <View className="h-10 w-10 items-center justify-center rounded-sm bg-surface-variant">
              <Text variant="caption" weight="bold" tone="secondary">
                +{overflow}
              </Text>
            </View>
          ) : null}
          {items.length === 0 ? (
            <Text variant="caption" tone="secondary">
              No items recorded
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center gap-2">
          <Button
            variant="tonal"
            size="sm"
            onPress={onOpenDetails}
            accessibilityLabel="Open order details"
          >
            <Ionicons name="receipt-outline" size={16} color={tokens.onAccentSoft} />
            <Text variant="body-sm" weight="semibold">
              Details
            </Text>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={updating}
            onPress={onOpenStatus}
            accessibilityLabel="Update order status"
          >
            <Ionicons name="swap-horizontal" size={16} color={tokens.primary} />
          </Button>
        </View>
      </View>
    </Card>
  );
}
