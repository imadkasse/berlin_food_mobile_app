import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { IconButton } from '@/components/navigation';
import { Badge, Text } from '@/components/ui';
import type { MenuItem } from '@/types/models';
import { cn } from '@/utils/cn';

import { DishImage } from './DishImage';
import { formatPrice } from './utils';

export type MenuCardProps = {
  item: MenuItem;
  /** Very narrow phones fall back to a single full-width column. */
  singleColumn?: boolean;
  onAdd: (item: MenuItem) => void;
};

/**
 * Menu tile: image, name, price and an add affordance. Unavailable dishes
 * still render (web parity) but cannot be added.
 */
export function MenuCard({ item, singleColumn = false, onAdd }: MenuCardProps) {
  const isUnavailable = item.is_available === false;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatPrice(item.price)}`}
      onPress={() => router.push({ pathname: '/menu/[id]', params: { id: item.id } })}
      className={cn(
        'overflow-hidden rounded-md bg-surface active:opacity-90',
        singleColumn ? 'w-full' : 'w-[48%]'
      )}
    >
      <View className="relative">
        <DishImage uri={item.image_url} className="h-36 w-full" accessibilityLabel={item.name} />
        {isUnavailable ? (
          <Badge tone="error" className="absolute right-2 top-2">
            Unavailable
          </Badge>
        ) : null}
      </View>

      <View className="gap-2 p-3">
        <Text variant="body-lg" weight="semibold" numberOfLines={2} className="min-h-12">
          {item.name}
        </Text>

        <View className="flex-row items-center justify-between gap-2">
          <Text variant="body-lg" weight="bold" tone="primary">
            {formatPrice(item.price)}
          </Text>

          {isUnavailable ? (
            <Text variant="caption" tone="secondary">
              Sold out
            </Text>
          ) : (
            <IconButton
              name="add"
              variant="primary"
              accessibilityLabel={`Add ${item.name} to cart`}
              onPress={() => onAdd(item)}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
