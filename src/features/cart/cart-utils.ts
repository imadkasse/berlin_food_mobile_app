import type { CartItem } from '@/stores/cart.store';

import type { MenuItem } from '@/types/models';

/**
 * Maps a Supabase `menu_items` row to the zustand cart line shape. This is
 * the same payload the web app's `FoodCard` adds, minus its unused `order_id`
 * field, so merge rules in `useCartStore.addItem` behave identically.
 */
export function toCartItem(
  item: MenuItem,
  quantity = 1
): Omit<CartItem, 'quantity'> & { quantity: number } {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    quantity,
  };
}
