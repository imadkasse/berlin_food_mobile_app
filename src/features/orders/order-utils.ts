import type { BadgeTone } from '@/components/ui/Badge';
import {
  isOrderStatus,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  type Order,
  type OrderItem,
} from '@/types/models';

/**
 * Statuses that belong in the "Active orders" section. Mirrors
 * `client/src/components/orders/Orders.tsx` exactly.
 */
const ACTIVE_STATUSES = [
  'pending',
  'preparing',
  'on_the_way',
  'out_for_delivery',
  'ready_for_pickup',
  'ready',
];

export function isActiveOrder(order: Order): boolean {
  return order.status !== null && ACTIVE_STATUSES.includes(order.status);
}

export function getOrderItems(order: Order): OrderItem[] {
  return order.order_items ?? [];
}

export function getPrimaryItem(order: Order): OrderItem | null {
  return getOrderItems(order)[0] ?? null;
}

export function getPrimaryImage(order: Order): string | null {
  return getPrimaryItem(order)?.menu_item?.image_url ?? null;
}

/** First dish name, or "First dish and N more" for multi-item orders. */
export function getPrimaryTitle(order: Order): string {
  const items = getOrderItems(order);
  if (items.length === 0) return 'Your order';

  const firstName = items[0]?.menu_item?.name ?? 'Dish';
  if (items.length === 1) return firstName;
  return `${firstName} and ${items.length - 1} more`;
}

/** "2× Truffle Tagliatelle" chips for the active card. */
export function getItemChips(order: Order): string[] {
  return getOrderItems(order)
    .filter((item) => item.menu_item)
    .map((item) => `${item.quantity ?? 1}× ${item.menu_item?.name ?? 'Dish'}`);
}

/** Street → formatted → label, whichever the order snapshot has. */
export function getOrderAddress(order: Order): string {
  const address = order.delivery_address;
  if (!address) return '';
  return address.street ?? address.formatted ?? address.label ?? '';
}

/** Short, readable order reference — first six characters, uppercased. */
export function getShortOrderId(id: string): string {
  return id.slice(0, 6).toUpperCase();
}

export function formatOrderDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatOrderDateTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export type OrderStatusMeta = {
  label: string;
  tone: BadgeTone;
};

/** English label + tonal badge for the persisted order status. */
export function getOrderStatusMeta(status: string | null): OrderStatusMeta {
  if (status && isOrderStatus(status)) {
    return { label: ORDER_STATUS_LABEL[status], tone: ORDER_STATUS_TONE[status] };
  }

  if (!status) return { label: 'Unknown', tone: 'neutral' };

  const fallback = status.replace(/_/g, ' ');
  return { label: fallback.charAt(0).toUpperCase() + fallback.slice(1), tone: 'neutral' };
}
