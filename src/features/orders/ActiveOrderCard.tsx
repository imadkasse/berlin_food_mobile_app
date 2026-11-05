import { View } from 'react-native';

import { Badge, Button, Card, Text } from '@/components/ui';
import { DishImage } from '@/features/menu/DishImage';
import { formatPrice } from '@/features/menu/utils';
import type { Order } from '@/types/models';

import {
  formatOrderDateTime,
  getItemChips,
  getOrderStatusMeta,
  getPrimaryImage,
  getPrimaryTitle,
  getShortOrderId,
} from './order-utils';

export type ActiveOrderCardProps = {
  order: Order;
  isUpdating: boolean;
  onConfirmDelivery: (order: Order) => void;
};

/** Live order card: photo, title, dish chips, status, total and completion. */
export function ActiveOrderCard({ order, isUpdating, onConfirmDelivery }: ActiveOrderCardProps) {
  const status = getOrderStatusMeta(order.status);
  const chips = getItemChips(order);
  const canConfirm = order.status === 'out_for_delivery';

  return (
    <Card className="gap-4">
      <View className="flex-row items-start gap-3">
        <DishImage
          uri={getPrimaryImage(order)}
          className="h-16 w-16 rounded-sm"
          accessibilityLabel={getPrimaryTitle(order)}
        />

        <View className="flex-1 gap-0.5">
          <Text variant="caption" weight="semibold" tone="secondary" className="uppercase">
            #{getShortOrderId(order.id)}
          </Text>
          <Text variant="body-lg" weight="bold" numberOfLines={2}>
            {getPrimaryTitle(order)}
          </Text>
          <Text variant="caption" tone="secondary">
            {formatOrderDateTime(order.created_at)}
          </Text>
        </View>

        <Badge tone={status.tone}>{status.label}</Badge>
      </View>

      {chips.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {chips.map((chip) => (
            <View key={chip} className="rounded-full bg-surface-variant px-3 py-1">
              <Text variant="caption" weight="semibold" tone="secondary">
                {chip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-center justify-between gap-3">
        <Text variant="title" weight="bold" tone="primary">
          {formatPrice(order.total_price ?? 0)}
        </Text>

        {canConfirm ? (
          <Button
            size="sm"
            loading={isUpdating}
            onPress={() => onConfirmDelivery(order)}
            accessibilityLabel="Confirm delivery"
          >
            Confirm delivery
          </Button>
        ) : null}
      </View>
    </Card>
  );
}
