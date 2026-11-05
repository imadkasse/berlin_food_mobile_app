import { useCallback, useState } from 'react';

import { getErrorMessage } from '@/features/menu/utils';
import type { SavedAddress } from '@/features/profile/addresses';
import { createOrder } from '@/services';
import type { CartItem } from '@/stores/cart.store';

export type PlaceOrderInput = {
  customerId: string;
  address: SavedAddress;
  items: CartItem[];
  /** Client-computed total: subtotal + DELIVERY_FEE + VAT (VAT_RATE = 0). */
  total: number;
};

/**
 * Mirrors the web app's `createOrder` exactly:
 *  1. insert one `orders` row and select it back,
 *  2. batch-insert the `order_items` rows with the new order id.
 *
 * `delivery_address` keeps the web payload shape `{ lat, lng }`; the note is
 * intentionally not sent because `orders` has no note column.
 */
export function usePlaceOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const placeOrder = useCallback(async (input: PlaceOrderInput): Promise<string | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const createdOrder = await createOrder(
        {
          total_price: Number(input.total.toFixed(2)),
          customer_id: input.customerId,
          delivery_address: { lat: input.address.lat, lng: input.address.lng },
          status: 'pending',
        },
        input.items.map((item) => ({
          menu_item_id: item.id,
          price: item.price,
          quantity: item.quantity,
        }))
      );

      if (!createdOrder) throw new Error('The order could not be created.');

      return createdOrder.id;
    } catch (placeError) {
      setError(getErrorMessage(placeError, 'We could not place your order. Please try again.'));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { placeOrder, isSubmitting, error, clearError };
}
