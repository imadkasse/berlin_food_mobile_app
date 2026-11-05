import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

import { Button, Modal, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

import type { AdminOrder } from '../types';
import { formatAddress, formatCurrency, formatDateTime, initials, orderReference } from '../utils';
import { OrderStatusBadge } from './OrderStatusBadge';

export type OrderDetailsModalProps = {
  order: AdminOrder | null;
  onClose: () => void;
};

function DetailRow({
  icon,
  value,
}: {
  icon: 'mail-outline' | 'call-outline' | 'location-outline';
  value: string;
}) {
  const { tokens } = useTheme();
  return (
    <View className="flex-row items-start gap-2">
      <Ionicons name={icon} size={16} color={tokens.onSurfaceVariant} style={{ marginTop: 2 }} />
      <Text variant="body-sm" tone="secondary" className="flex-1">
        {value}
      </Text>
    </View>
  );
}

/** Full order sheet: customer, address, line items, payment note and total. */
export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const { tokens } = useTheme();

  if (!order) {
    return <Modal visible={false} onClose={onClose} />;
  }

  const items = order.items ?? [];
  const customerName = order.customer?.full_name?.trim() || 'Customer';

  return (
    <Modal visible onClose={onClose} title="Order details">
      <ScrollView
        style={{ maxHeight: 460 }}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5"
      >
        <View className="gap-2">
          <View className="flex-row items-center justify-between gap-3">
            <Text variant="title" weight="bold" tone="primary">
              {orderReference(order.id)}
            </Text>
            <OrderStatusBadge status={order.status} />
          </View>
          <Text variant="body-sm" tone="secondary">
            {formatDateTime(order.created_at)}
          </Text>
        </View>

        <View className="gap-3 rounded-md bg-surface-variant/60 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
              <Text variant="body" weight="bold" tone="primary">
                {initials(customerName)}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="body-lg" weight="semibold">
                {customerName}
              </Text>
              <Text variant="caption" tone="secondary">
                Customer
              </Text>
            </View>
          </View>

          {order.customer?.email ? (
            <DetailRow icon="mail-outline" value={order.customer.email} />
          ) : null}
          <DetailRow
            icon="call-outline"
            value={order.customer?.phone_number?.trim() || 'No phone number'}
          />
          <DetailRow icon="location-outline" value={formatAddress(order.delivery_address)} />
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            weight="semibold"
            tone="secondary"
            className="uppercase tracking-widest"
          >
            Order items
          </Text>

          {items.length === 0 ? (
            <Text variant="body-sm" tone="secondary">
              No line items were recorded for this order.
            </Text>
          ) : (
            items.map((item, index) => {
              const name = item.menu_item?.name ?? 'Dish';
              const quantity = item.quantity ?? 0;
              const unitPrice = item.price ?? 0;

              return (
                <View
                  key={`${order.id ?? 'order'}-item-${index}`}
                  className="flex-row items-center gap-3"
                >
                  <View className="h-14 w-14 overflow-hidden rounded-sm bg-surface-variant">
                    {item.menu_item?.image_url ? (
                      <Image
                        source={{ uri: item.menu_item.image_url }}
                        contentFit="cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="restaurant-outline" size={18} color={tokens.outline} />
                      </View>
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text variant="body-sm" weight="semibold" numberOfLines={2}>
                      {name}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      Qty {quantity} · {formatCurrency(unitPrice)} each
                    </Text>
                  </View>
                  <Text variant="body-sm" weight="bold">
                    {formatCurrency(unitPrice * quantity)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View className="gap-2 rounded-md bg-surface-variant/60 p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="cash-outline" size={18} color={tokens.onSurfaceVariant} />
            <Text variant="body-sm" weight="semibold">
              Cash on delivery
            </Text>
          </View>
          <Text variant="caption" tone="secondary">
            The web admin view lists every order as paid in cash.
          </Text>
        </View>

        <View className="flex-row items-center justify-between gap-3 rounded-md bg-accent-soft p-4">
          <Text variant="body" weight="semibold" tone="primary">
            Total
          </Text>
          <Text variant="title" weight="bold" tone="primary">
            {formatCurrency(order.total_price)}
          </Text>
        </View>

        <Button variant="tonal" block onPress={onClose}>
          Close
        </Button>
      </ScrollView>
    </Modal>
  );
}
