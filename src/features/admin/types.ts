import type { OrderStatus } from '@/types/models';

/** One line item as serialised by the `order_info` view's `items` JSON. */
export type AdminOrderItem = {
  menu_item?: {
    id?: string | null;
    name?: string | null;
    image_url?: string | null;
    price?: number | null;
  } | null;
  quantity?: number | null;
  price?: number | null;
};

/** Customer JSON embedded in each `order_info` row. */
export type AdminOrderCustomer = {
  id?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
} | null;

/**
 * A row of the `order_info` database view used by the web admin orders page.
 * The view exposes denormalised `customer`, `items` and `delivery_address`
 * JSON columns — never raw table columns.
 */
export type AdminOrder = {
  id: string | null;
  created_at: string | null;
  customer: AdminOrderCustomer;
  delivery_address: Record<string, unknown> | null;
  items: AdminOrderItem[] | null;
  status: string | null;
  total_price: number | null;
};

/**
 * The six statuses the web admin order manager offers. Mirrors
 * `STATUS_CONFIG` in `client/src/components/admin/OrderManagment.tsx`.
 */
export type AdminOrderStatus = Extract<
  OrderStatus,
  'pending' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled'
>;

export const ADMIN_ORDER_STATUSES: AdminOrderStatus[] = [
  'pending',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

/** Raw role values accepted by the users editor (same set as the web app). */
export type EditableRole = 'customer' | 'delivery' | 'manager' | 'support' | 'admin';

export const EDITABLE_ROLES: EditableRole[] = [
  'customer',
  'delivery',
  'manager',
  'support',
  'admin',
];

/** Labels for the raw roles editable in the mobile app (manager included). */
export const EDITABLE_ROLE_LABEL: Record<EditableRole, string> = {
  customer: 'Customer',
  delivery: 'Delivery partner',
  manager: 'Manager',
  support: 'Support',
  admin: 'Admin',
};

export const ROLE_FILTER_OPTIONS: { value: EditableRole; label: string }[] = [
  { value: 'customer', label: 'Customers' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'manager', label: 'Managers' },
  { value: 'support', label: 'Support' },
  { value: 'admin', label: 'Admins' },
];

export const VEHICLE_OPTIONS = ['bicycle', 'scooter', 'motorcycle', 'car', 'van'] as const;

/** Values collected by the dish create/edit sheet. */
export type MenuItemDraft = {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  is_available: boolean;
};

/** Values collected by the user edit sheet. */
export type UserDraft = {
  full_name: string;
  phone_number: string;
  role: EditableRole;
  vehicle_type: string;
  availability_status: boolean;
};
