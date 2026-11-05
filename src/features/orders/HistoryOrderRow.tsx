import { View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { DishImage } from '@/features/menu/DishImage';
import { formatPrice } from '@/features/menu/utils';
import type { Order } from '@/types/models';

import { formatOrderDate, getOrderAddress, getPrimaryImage, getPrimaryTitle } from './order-utils';

export type HistoryOrderRowProps = {
  order: Order;
  onReorder: (order: Order) => void;
};

/** Delivered/cancelled row with an intentional, working "Reorder" action. */
export function HistoryOrderRow({ order, onReorder }: HistoryOrderRowProps) {
  const address = getOrderAddress(order);

  return (
    <Card compact className="flex-row items-center gap-3">
      <DishImage
        uri={getPrimaryImage(order)}
        className="h-14 w-14 rounded-sm"
        accessibilityLabel={getPrimaryTitle(order)}
      />

      <View className="flex-1 gap-0.5">
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {getPrimaryTitle(order)}
        </Text>
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {formatOrderDate(order.created_at)}
          {address ? ` · ${address}` : ''}
        </Text>
      </View>

      <View className="items-end gap-1.5">
        <Text variant="body-lg" weight="bold">
          {formatPrice(order.total_price ?? 0)}
        </Text>
        <Button
          size="sm"
          variant="tonal"
          onPress={() => onReorder(order)}
          accessibilityLabel={`Reorder ${getPrimaryTitle(order)}`}
        >
          Reorder
        </Button>
      </View>
    </Card>
  );
}
