/**
 * Order service.
 *
 * Ported from the web app:
 * - `client/src/api/orders.ts`
 * - `client/src/api/delivery.dashboard.ts` (delivery-side order lookups)
 *
 * Business rules are unchanged: identical filters, ordering, the `order_info`
 * view pagination and the two-step order creation (order row first, then the
 * `order_items` batch insert).
 */

import type {
  MenuItemRow,
  OrderInfoRow,
  OrderInsert,
  OrderItemInsert,
  OrderRow,
} from '@/types/database.types';

import { supabase } from './supabase';
import { fetchOrNull, mutate, mutateVoid, toServiceError } from './supabase/query';

/**
 * Mirrors `api/orders.ts` → `getOrders()`.
 *
 * All orders, newest first.
 */
export async function getOrders(): Promise<OrderRow[]> {
  return mutate(
    () => supabase.from('orders').select('*').order('created_at', { ascending: false }),
    {
      fallbackMessage: 'Failed to load orders',
    }
  );
}

/**
 * Mirrors `api/orders.ts` → `getCustomerOrders()`.
 */
export async function getCustomerOrders(customerId: string): Promise<OrderRow[]> {
  return mutate(
    () =>
      supabase.from('orders').select('*').eq('customer_id', customerId).order('created_at', {
        ascending: false,
      }),
    { fallbackMessage: 'Failed to load orders' }
  );
}

/**
 * Mirrors `api/orders.ts` → `getOrderById()`.
 *
 * `PGRST116` ("0 rows") resolves to `null` exactly like the web app.
 */
export async function getOrderById(id: string): Promise<OrderRow | null> {
  return fetchOrNull(() => supabase.from('orders').select('*').eq('id', id).single(), {
    fallbackMessage: 'Failed to load order',
  });
}

/**
 * Mirrors `api/orders.ts` → `createOrder()`.
 *
 * The order row is inserted and selected back first; the `order_items` rows are
 * then batch-inserted with the freshly created `order_id`.
 */
export async function createOrder(
  order: OrderInsert,
  items: Omit<OrderItemInsert, 'order_id'>[]
): Promise<OrderRow> {
  // Create the order
  const createdOrder = await mutate(() => supabase.from('orders').insert(order).select().single(), {
    fallbackMessage: 'Failed to create order',
  });

  // Create order items
  if (items && items.length > 0) {
    const orderItemsToInsert: OrderItemInsert[] = items.map((item) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    await mutateVoid(() => supabase.from('order_items').insert(orderItemsToInsert), {
      fallbackMessage: 'Failed to create order items',
    });
  }

  return createdOrder;
}

/**
 * Mirrors `api/orders.ts` → `updateOrderStatus()`.
 */
export async function updateOrderStatus(id: string, status: string): Promise<OrderRow> {
  return mutate(() => supabase.from('orders').update({ status }).eq('id', id).select().single(), {
    fallbackMessage: 'Failed to update order status',
  });
}

/**
 * Flattened order line as produced by `getOrderItemsDetails()`.
 *
 * The web app spreads the embedded `menu_items` row and overrides `price` with
 * the price captured on the order item itself. `quantity` and `price` stay
 * nullable because that is how the `order_items` columns are defined.
 */
export type OrderItemDetails = Partial<MenuItemRow> & {
  quantity: number | null;
  order_item_id: string;
  price: number | null;
};

/**
 * Order line with the nullable counters resolved.
 *
 * `order_items.quantity` and `order_items.price` are nullable columns, but the
 * checkout flow always writes both. This variant is what the UI layers use when
 * they need to format a price or a quantity without a null check.
 */
export type OrderItemWithRequiredFields = Omit<OrderItemDetails, 'quantity' | 'price'> & {
  quantity: number;
  price: number;
};

/**
 * Mirrors `api/orders.ts` → `getOrderItemsDetails()`.
 */
export async function getOrderItemsDetails(orderId: string): Promise<OrderItemDetails[]> {
  const rows = await mutate(
    () => supabase.from('order_items').select('*, menu_items(*)').eq('order_id', orderId),
    { fallbackMessage: 'Failed to load order items' }
  );

  return (rows ?? []).map((item) => {
    const embedded = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;

    return {
      ...(embedded ?? {}),
      quantity: item.quantity,
      order_item_id: item.id,
      price: item.price,
    } as OrderItemDetails;
  });
}

/**
 * Resolves the nullable `quantity` / `price` counters of an order line.
 *
 * Rows written through the checkout flow always carry both values; the fallback
 * of `0` only applies to legacy rows that predate the columns.
 */
export function withRequiredOrderItemFields(item: OrderItemDetails): OrderItemWithRequiredFields {
  return {
    ...item,
    quantity: item.quantity ?? 0,
    price: item.price ?? 0,
  };
}

/**
 * An order line with the referenced menu item embedded under the `menu_item`
 * alias (the select string used by the web app: `menu_item:menu_items(*)`).
 */
export type OrderWithItems = OrderRow & {
  order_items: (OrderItemInsert & {
    menu_item: MenuItemRow | null;
  })[];
};

/** List of orders with their items and the referenced menu item embedded. */
export type OrderWithItemsList = OrderWithItems[];

/**
 * Mirrors `api/orders.ts` → `getAllOrderByUserId()`.
 *
 * Orders of a single customer, each with its items and the referenced menu item
 * embedded under the `menu_item` alias.
 */
export async function getAllOrderByUserId(customerId: string): Promise<OrderWithItemsList> {
  return mutate(
    () =>
      supabase
        .from('orders')
        .select('*, order_items(*, menu_item:menu_items(*))')
        .eq('customer_id', customerId),
    { fallbackMessage: 'Failed to load orders' }
  ) as Promise<OrderWithItemsList>;
}

/**
 * Mirrors `api/orders.ts` → `getAllOrders()`.
 *
 * Used by admins and delivery partners: every order with its items embedded.
 */
export async function getAllOrders(): Promise<OrderWithItemsList> {
  return mutate(
    () => supabase.from('orders').select('*, order_items(*, menu_item:menu_items(*))'),
    { fallbackMessage: 'Failed to load orders' }
  ) as Promise<OrderWithItemsList>;
}

/**
 * Mirrors `api/orders.ts` → `takeOrderToDelivery()`.
 *
 * Assigns the order to a courier and moves it to `out_for_delivery`.
 */
export async function takeOrderToDelivery(deliveryId: string, orderId: string): Promise<OrderRow> {
  return mutate(
    () =>
      supabase
        .from('orders')
        .update({
          delivery_id: deliveryId,
          status: 'out_for_delivery',
        })
        .eq('id', orderId)
        .select()
        .single(),
    { fallbackMessage: 'Failed to assign order to delivery' }
  );
}

/**
 * Mirrors `api/orders.ts` → `getOrderByDeliverId()`.
 */
export async function getOrderByDeliverId(deliveryId: string): Promise<OrderRow | null> {
  return fetchOrNull(
    () => supabase.from('orders').select('*').eq('delivery_id', deliveryId).single(),
    { fallbackMessage: 'Failed to load order' }
  );
}

/**
 * Mirrors `api/orders.ts` → `getDeliveryQueueByDeliveryId()`.
 *
 * The courier's current queue: orders that are `out_for_delivery` and belong to
 * this delivery partner.
 */
export async function getDeliveryQueueByDeliveryId(
  deliveryId: string
): Promise<OrderWithItemsList> {
  return mutate(
    () =>
      supabase
        .from('orders')
        .select('*, order_items(*, menu_item:menu_items(*))')
        .eq('status', 'out_for_delivery')
        .eq('delivery_id', deliveryId),
    { fallbackMessage: 'Failed to load delivery queue' }
  ) as Promise<OrderWithItemsList>;
}

/**
 * Mirrors `api/delivery.dashboard.ts` → `getActiveOrderDeliver()`.
 *
 * The courier's single active delivery (if any).
 */
export async function getActiveOrderDeliver(deliveryId: string): Promise<OrderRow | null> {
  return fetchOrNull(
    () =>
      supabase
        .from('orders')
        .select('*')
        .eq('delivery_id', deliveryId)
        .eq('status', 'out_for_delivery')
        .maybeSingle(),
    { fallbackMessage: 'Failed to load active delivery' }
  );
}

/**
 * Mirrors `api/delivery.dashboard.ts` → `getRecantOrdersDeliverd()`.
 *
 * The courier's 50 most recent orders.
 */
export async function getRecantOrdersDeliverd(deliveryId: string): Promise<OrderRow[]> {
  return mutate(
    () =>
      supabase
        .from('orders')
        .select('*')
        .eq('delivery_id', deliveryId)
        .order('created_at', { ascending: false })
        .limit(50),
    { fallbackMessage: 'Failed to load orders' }
  );
}

/**
 * Mirrors `api/orders.ts` → `getOrderWithItems()`.
 *
 * Reads the `order_info` VIEW (not the `orders` table) with an exact count and
 * range pagination, newest first.
 */
export async function getOrderWithItems(
  page: number = 1,
  pageSize: number = 3
): Promise<{ orders: OrderInfoRow[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('order_info')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw toServiceError(error, 'Failed to load orders');
  }

  return {
    orders: data ?? [],
    count: count ?? 0,
  };
}
