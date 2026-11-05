import type { BadgeTone } from '@/components/ui/Badge';
import type { Json as DatabaseJson } from '@/types/database.types';

/**
 * Domain models mirroring the existing Supabase schema used by the web app.
 *
 * Column names are intentionally identical to the database (snake_case) so the
 * same queries and business rules can be reused verbatim. Do not invent
 * columns here — extend from `client/src/types/database.types.ts` if needed.
 */

export type Json = DatabaseJson;

export type AppRole = 'customer' | 'admin' | 'delivery' | 'support';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'on_the_way'
  | 'ready';

export type DeliveryRequestStatus = 'pending' | 'approved' | 'rejected';

export type VehicleType = 'bicycle' | 'scooter' | 'motorcycle' | 'car' | 'van';

export type DeliveryAddress = {
  lat: number;
  lng: number;
  street?: string;
  label?: string;
  formatted?: string;
} | null;

export type Profile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  role: string | null;
  address: DeliveryAddress;
  vehicle_type: string | null;
  availability_status: boolean | null;
  delivery_rating: number | null;
  number_ratings: number | null;
  updated_at: string | null;
};

export type Category = {
  id: string;
  name: string;
  image_url: string | null;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean | null;
};

export type OrderItem = {
  id: string;
  order_id: string | null;
  menu_item_id: string | null;
  quantity: number | null;
  price: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  menu_item?: MenuItem | null;
};

export type Order = {
  id: string;
  customer_id: string | null;
  delivery_id: string | null;
  status: string;
  total_price: number;
  delivery_address: DeliveryAddress;
  delivery_rating: number | null;
  created_at: string | null;
  updated_at: string | null;
  order_items?: OrderItem[];
};

export type DeliveryRequest = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string;
  status: DeliveryRequestStatus;
  created_at: string;
  updated_at: string;
};

/**
 * Normalises the free-form `profiles.role` string into an `AppRole`.
 * Mirrors the web app: "manager" is treated as "admin", unknown roles fall
 * back to "customer".
 */
export function normalizeRole(role: string | null | undefined): AppRole {
  switch (role) {
    case 'admin':
    case 'manager':
      return 'admin';
    case 'delivery':
      return 'delivery';
    case 'support':
      return 'support';
    default:
      return 'customer';
  }
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'on_the_way',
  'ready',
];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value);
}

/** English labels for order states (the web app shows Arabic). */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  on_the_way: 'On the way',
  ready: 'Ready',
};

/** Status → Badge tone, matching the design system's tonal pills. */
export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending: 'neutral',
  preparing: 'accent',
  ready_for_pickup: 'primary',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'error',
  on_the_way: 'primary',
  ready: 'accent',
};

export const DELIVERY_REQUEST_STATUS_LABEL: Record<DeliveryRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const DELIVERY_REQUEST_STATUS_TONE: Record<DeliveryRequestStatus, BadgeTone> = {
  pending: 'neutral',
  approved: 'success',
  rejected: 'error',
};

export const ROLE_LABEL: Record<AppRole, string> = {
  customer: 'Customer',
  admin: 'Admin',
  delivery: 'Delivery partner',
  support: 'Support',
};

export const VEHICLE_LABEL: Record<VehicleType, string> = {
  bicycle: 'Bicycle',
  scooter: 'Scooter',
  motorcycle: 'Motorcycle',
  car: 'Car',
  van: 'Van',
};
