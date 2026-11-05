import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { DishImage } from '@/features/menu/DishImage';
import { formatPrice } from '@/features/menu/utils';
import { useTheme } from '@/hooks/use-theme';
import type { CartItem } from '@/stores/cart.store';

import { QuantityStepper } from './QuantityStepper';

export type CartLineItemProps = {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
};

/** One cart line: photo, name, unit price, stepper and remove action. */
export function CartLineItem({ item, onIncrement, onDecrement, onRemove }: CartLineItemProps) {
  const { tokens } = useTheme();

  return (
    <View className="flex-row gap-3 rounded-md bg-surface p-3">
      <DishImage
        uri={item.image_url}
        className="h-20 w-20 rounded-sm"
        accessibilityLabel={item.name}
      />

      <View className="flex-1 gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <Text variant="body-lg" weight="semibold" numberOfLines={2} className="flex-1">
            {item.name}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from cart`}
            onPress={() => onRemove(item.id)}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-variant"
          >
            <Ionicons name="trash-outline" size={17} color={tokens.error} />
          </Pressable>
        </View>

        <Text variant="body-sm" tone="secondary">
          {formatPrice(item.price)} each
        </Text>

        <View className="flex-row items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            onDecrement={() => onDecrement(item.id)}
            onIncrement={() => onIncrement(item.id)}
            decrementDisabled={item.quantity <= 1}
          />

          <Text variant="body-lg" weight="bold" tone="primary">
            {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
      </View>
    </View>
  );
}
