import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

import type { AppRole } from '@/types/models';

/** Ionicons glyph names, derived from the icon component's props. */
export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

/**
 * Single source of truth for every route path in the app. Paths are strings
 * (not Href) so they can also be used for `Link`, `router.push`, tab
 * configuration and deep-link matching.
 */
export const ROUTES = {
  landing: '/',
  menu: '/menu',
  menuItem: (id: string) => `/menu/${id}`,

  cart: '/customer/cart',
  orders: '/customer/orders',
  profile: '/customer/profile',
  addresses: '/customer/addresses',

  login: '/auth/login',
  register: '/auth/register',
  registerContact: '/auth/register/contact',
  registerAddress: '/auth/register/address',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  registerAsDelivery: '/auth/register-as-delivery',
  trackDeliveryRequest: '/auth/track-delivery-request',
  completeRegistration: (requestId: string) => `/auth/complete-registration/${requestId}`,

  adminDashboard: '/admin/dashboard',
  adminMenu: '/admin/menu',
  adminOrders: '/admin/orders',
  adminUsers: '/admin/users',
  adminDeliveryRequests: '/admin/delivery-requests',
  adminProfile: '/admin/profile',

  deliveryDashboard: '/delivery/dashboard',
  deliveryOrders: '/delivery/orders',
  deliveryRoutes: '/delivery/for-delivery',
  deliveryRoute: (id: string) => `/delivery/active-delivery/${id}`,
  deliveryProfile: '/delivery/profile',
} as const;

/**
 * Where each role lands after signing in. Mirrors the web app, which redirects
 * to `/{role}/profile`.
 */
export const ROLE_HOME: Record<AppRole, Href> = {
  customer: ROUTES.profile,
  admin: ROUTES.adminProfile,
  delivery: ROUTES.deliveryProfile,
  support: ROUTES.profile,
};

export type TabItem = {
  /** Expo Router screen name, e.g. `"customer/orders"`. */
  name: string;
  label: string;
  href: string;
  icon: IoniconsName;
  /** Shown to signed-out visitors in the public tab layout. */
  guestVisible?: boolean;
  /** Requires a signed-in user; hidden from guests. */
  requiresAuth?: boolean;
};

/** Customer tab bar: menu, orders, cart and profile. */
const CUSTOMER_TABS: TabItem[] = [
  { name: 'menu', label: 'Menu', href: ROUTES.menu, icon: 'restaurant-outline' },
  {
    name: 'customer/orders',
    label: 'Orders',
    href: ROUTES.orders,
    icon: 'receipt-outline',
    requiresAuth: true,
  },
  { name: 'customer/cart', label: 'Cart', href: ROUTES.cart, icon: 'bag-handle-outline' },
  {
    name: 'customer/profile',
    label: 'Profile',
    href: ROUTES.profile,
    icon: 'person-outline',
    requiresAuth: true,
  },
];

/** Customer tabs visible to signed-out visitors (no orders or profile). */
export const CUSTOMER_GUEST_TABS: TabItem[] = CUSTOMER_TABS.filter((tab) => !tab.requiresAuth);

/** Admin tab bar. The remaining admin screens live in the drawer/stack. */
const ADMIN_TABS: TabItem[] = [
  {
    name: 'admin/dashboard',
    label: 'Dashboard',
    href: ROUTES.adminDashboard,
    icon: 'grid-outline',
  },
  { name: 'admin/menu', label: 'Menu', href: ROUTES.adminMenu, icon: 'create-outline' },
  { name: 'admin/orders', label: 'Orders', href: ROUTES.adminOrders, icon: 'receipt-outline' },
  { name: 'admin/users', label: 'Users', href: ROUTES.adminUsers, icon: 'people-outline' },
  { name: 'admin/profile', label: 'Profile', href: ROUTES.adminProfile, icon: 'person-outline' },
];

/** Delivery tab bar: overview, assigned orders, routes and profile. */
const DELIVERY_TABS: TabItem[] = [
  {
    name: 'delivery/dashboard',
    label: 'Dashboard',
    href: ROUTES.deliveryDashboard,
    icon: 'grid-outline',
  },
  { name: 'delivery/orders', label: 'Orders', href: ROUTES.deliveryOrders, icon: 'list-outline' },
  {
    name: 'delivery/for-delivery',
    label: 'Routes',
    href: ROUTES.deliveryRoutes,
    icon: 'navigate-outline',
  },
  {
    name: 'delivery/profile',
    label: 'Profile',
    href: ROUTES.deliveryProfile,
    icon: 'person-outline',
  },
];

export const ROLE_TABS: Record<'customer' | 'admin' | 'delivery', TabItem[]> = {
  customer: CUSTOMER_TABS,
  admin: ADMIN_TABS,
  delivery: DELIVERY_TABS,
};

/** Sign-in affordance appended to the public/guest tab bar. */
export const GUEST_TAB: { label: string; href: string; icon: IoniconsName } = {
  label: 'Sign in',
  href: ROUTES.login,
  icon: 'log-in-outline',
};
