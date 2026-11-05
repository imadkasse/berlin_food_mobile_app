import type { IoniconsName } from '@/navigation/routes';
import type { Category, DeliveryRequest, MenuItem, Order, Profile } from '@/types/models';

/**
 * Typed fixtures for Milestone 3 screens. They mirror the web app's mock
 * content in shape and copy but use English labels. Replace with Supabase
 * service results in Milestone 4 — keep the exported names stable.
 */

/* ─── Menu ──────────────────────────────────────────────────────────────── */

export const mockCategories: Category[] = [
  {
    id: 'cat-grills',
    name: 'Grills',
    image_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-pasta',
    name: 'Pasta',
    image_url:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-salads',
    name: 'Salads',
    image_url:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-desserts',
    name: 'Desserts',
    image_url:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-drinks',
    name: 'Drinks',
    image_url:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
  },
];

/** Prices are euro decimals, identical to the web app's `numeric` columns. */
export const mockMenuItems: MenuItem[] = [
  {
    id: 'item-currywurst',
    name: 'Berliner Currywurst',
    description:
      'House sausage, smoked paprika curry sauce and hand-cut fries — the city on one plate.',
    price: 12.5,
    image_url:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-grills',
    is_available: true,
  },
  {
    id: 'item-chicken-skewers',
    name: 'Charcoal Chicken Skewers',
    description: 'Free-range chicken, charred lemon, sumac onions and a garlic yoghurt dip.',
    price: 16.9,
    image_url:
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-grills',
    is_available: true,
  },
  {
    id: 'item-wagyu-burger',
    name: 'Wagyu Smash Burger',
    description: 'Two smashed patties, aged cheddar, pickled cucumber and burnt onion mayo.',
    price: 18.9,
    image_url:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-grills',
    is_available: false,
  },
  {
    id: 'item-truffle-tagliatelle',
    name: 'Truffle Tagliatelle',
    description: 'Fresh ribbon pasta, black truffle cream, parmesan and crispy sage.',
    price: 21,
    image_url:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-pasta',
    is_available: true,
  },
  {
    id: 'item-rigatoni',
    name: 'Spicy Rigatoni',
    description: 'Slow tomato sugo, Calabrian chilli, whipped ricotta and basil oil.',
    price: 17.5,
    image_url:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-pasta',
    is_available: true,
  },
  {
    id: 'item-market-greens',
    name: 'Market Greens',
    description: 'Seasonal leaves, radish, toasted seeds and a warm mustard vinaigrette.',
    price: 11,
    image_url:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-salads',
    is_available: true,
  },
  {
    id: 'item-beet-goat-cheese',
    name: 'Roasted Beet & Goat Cheese',
    description: 'Golden beetroot, creamy goat cheese, hazelnut dukkah and honey.',
    price: 13.5,
    image_url:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-salads',
    is_available: true,
  },
  {
    id: 'item-doughnuts',
    name: 'Berliner Doughnuts',
    description: 'Three warm jam-filled doughnuts dusted with vanilla sugar.',
    price: 8.5,
    image_url:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-desserts',
    is_available: true,
  },
  {
    id: 'item-chocolate-torte',
    name: 'Dark Chocolate Torte',
    description: 'Flourless 70% chocolate torte with crème fraîche and sea salt.',
    price: 9.5,
    image_url:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-desserts',
    is_available: true,
  },
  {
    id: 'item-club-mate',
    name: 'Club-Mate Lemonade',
    description: 'Chilled mate infusion with a bright citrus finish. 0.5 L.',
    price: 4.5,
    image_url:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-drinks',
    is_available: true,
  },
  {
    id: 'item-cold-brew',
    name: 'Cold Brew Coffee',
    description: 'Eighteen-hour cold brew from a Kreuzberg roastery. 0.3 L.',
    price: 5.2,
    image_url:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-drinks',
    is_available: true,
  },
  {
    id: 'item-sparkling-water',
    name: 'Sparkling Water',
    description: 'Berlin tap water, softly carbonated and served ice cold. 0.75 L.',
    price: 3.8,
    image_url:
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1000&q=80',
    category_id: 'cat-drinks',
    is_available: true,
  },
];

/* ─── Orders ────────────────────────────────────────────────────────────── */

const MITTE_ADDRESS = {
  lat: 52.5209,
  lng: 13.4094,
  street: 'Torstraße 124',
  label: 'Home',
  formatted: 'Torstraße 124, 10119 Berlin',
} as const;

const KREUZBERG_ADDRESS = {
  lat: 52.4996,
  lng: 13.4189,
  street: 'Oranienstraße 45',
  label: 'Office',
  formatted: 'Oranienstraße 45, 10999 Berlin',
} as const;

export const mockOrders: Order[] = [
  {
    id: 'ord-1001',
    customer_id: 'profile-customer-1',
    delivery_id: null,
    status: 'pending',
    total_price: 30.4,
    delivery_address: MITTE_ADDRESS,
    delivery_rating: null,
    created_at: '2026-10-28T17:42:00.000Z',
    updated_at: '2026-10-28T17:42:00.000Z',
    order_items: [
      {
        id: 'oi-1001-1',
        order_id: 'ord-1001',
        menu_item_id: 'item-currywurst',
        quantity: 1,
        price: 12.5,
        menu_item: mockMenuItems[0],
      },
      {
        id: 'oi-1001-2',
        order_id: 'ord-1001',
        menu_item_id: 'item-truffle-tagliatelle',
        quantity: 1,
        price: 21,
        menu_item: mockMenuItems[3],
      },
    ],
  },
  {
    id: 'ord-1002',
    customer_id: 'profile-customer-1',
    delivery_id: 'profile-delivery-1',
    status: 'preparing',
    total_price: 35.2,
    delivery_address: KREUZBERG_ADDRESS,
    delivery_rating: null,
    created_at: '2026-10-28T18:05:00.000Z',
    updated_at: '2026-10-28T18:11:00.000Z',
    order_items: [
      {
        id: 'oi-1002-1',
        order_id: 'ord-1002',
        menu_item_id: 'item-chicken-skewers',
        quantity: 2,
        price: 16.9,
        menu_item: mockMenuItems[1],
      },
      {
        id: 'oi-1002-2',
        order_id: 'ord-1002',
        menu_item_id: 'item-club-mate',
        quantity: 1,
        price: 4.5,
        menu_item: mockMenuItems[9],
      },
    ],
  },
  {
    id: 'ord-1003',
    customer_id: 'profile-customer-2',
    delivery_id: 'profile-delivery-1',
    status: 'ready_for_pickup',
    total_price: 26,
    delivery_address: MITTE_ADDRESS,
    delivery_rating: null,
    created_at: '2026-10-27T19:20:00.000Z',
    updated_at: '2026-10-27T19:38:00.000Z',
    order_items: [
      {
        id: 'oi-1003-1',
        order_id: 'ord-1003',
        menu_item_id: 'item-rigatoni',
        quantity: 1,
        price: 17.5,
        menu_item: mockMenuItems[4],
      },
      {
        id: 'oi-1003-2',
        order_id: 'ord-1003',
        menu_item_id: 'item-doughnuts',
        quantity: 1,
        price: 8.5,
        menu_item: mockMenuItems[7],
      },
    ],
  },
  {
    id: 'ord-1004',
    customer_id: 'profile-customer-2',
    delivery_id: 'profile-delivery-2',
    status: 'out_for_delivery',
    total_price: 22.3,
    delivery_address: KREUZBERG_ADDRESS,
    delivery_rating: null,
    created_at: '2026-10-27T20:02:00.000Z',
    updated_at: '2026-10-27T20:15:00.000Z',
    order_items: [
      {
        id: 'oi-1004-1',
        order_id: 'ord-1004',
        menu_item_id: 'item-beet-goat-cheese',
        quantity: 1,
        price: 13.5,
        menu_item: mockMenuItems[6],
      },
      {
        id: 'oi-1004-2',
        order_id: 'ord-1004',
        menu_item_id: 'item-cold-brew',
        quantity: 1,
        price: 5.2,
        menu_item: mockMenuItems[10],
      },
      {
        id: 'oi-1004-3',
        order_id: 'ord-1004',
        menu_item_id: 'item-sparkling-water',
        quantity: 1,
        price: 3.6,
        menu_item: mockMenuItems[11],
      },
    ],
  },
  {
    id: 'ord-1005',
    customer_id: 'profile-customer-1',
    delivery_id: 'profile-delivery-2',
    status: 'delivered',
    total_price: 21,
    delivery_address: MITTE_ADDRESS,
    delivery_rating: 5,
    created_at: '2026-10-26T18:30:00.000Z',
    updated_at: '2026-10-26T19:04:00.000Z',
    order_items: [
      {
        id: 'oi-1005-1',
        order_id: 'ord-1005',
        menu_item_id: 'item-market-greens',
        quantity: 1,
        price: 11,
        menu_item: mockMenuItems[5],
      },
      {
        id: 'oi-1005-2',
        order_id: 'ord-1005',
        menu_item_id: 'item-chocolate-torte',
        quantity: 1,
        price: 10,
        menu_item: mockMenuItems[8],
      },
    ],
  },
  {
    id: 'ord-1006',
    customer_id: 'profile-customer-2',
    delivery_id: null,
    status: 'cancelled',
    total_price: 18.9,
    delivery_address: KREUZBERG_ADDRESS,
    delivery_rating: null,
    created_at: '2026-10-25T21:12:00.000Z',
    updated_at: '2026-10-25T21:18:00.000Z',
    order_items: [
      {
        id: 'oi-1006-1',
        order_id: 'ord-1006',
        menu_item_id: 'item-wagyu-burger',
        quantity: 1,
        price: 18.9,
        menu_item: mockMenuItems[2],
      },
    ],
  },
];

/* ─── Profiles ──────────────────────────────────────────────────────────── */

export const mockProfiles: Profile[] = [
  {
    id: 'profile-customer-1',
    full_name: 'Lena Hoffmann',
    phone_number: '+49 30 1234 5678',
    role: 'customer',
    address: MITTE_ADDRESS,
    vehicle_type: null,
    availability_status: null,
    delivery_rating: null,
    number_ratings: null,
    updated_at: '2026-10-20T10:00:00.000Z',
  },
  {
    id: 'profile-customer-2',
    full_name: 'Jonas Weber',
    phone_number: '+49 30 8765 4321',
    role: 'customer',
    address: KREUZBERG_ADDRESS,
    vehicle_type: null,
    availability_status: null,
    delivery_rating: null,
    number_ratings: null,
    updated_at: '2026-10-18T12:30:00.000Z',
  },
  {
    id: 'profile-admin-1',
    full_name: 'Amira Khalil',
    phone_number: '+49 30 5555 0101',
    role: 'admin',
    address: null,
    vehicle_type: null,
    availability_status: null,
    delivery_rating: null,
    number_ratings: null,
    updated_at: '2026-10-22T08:00:00.000Z',
  },
  {
    id: 'profile-delivery-1',
    full_name: 'Lukas Schmidt',
    phone_number: '+49 30 1234 9876',
    role: 'delivery',
    address: MITTE_ADDRESS,
    vehicle_type: 'bicycle',
    availability_status: true,
    delivery_rating: 4.9,
    number_ratings: 312,
    updated_at: '2026-10-28T16:00:00.000Z',
  },
  {
    id: 'profile-delivery-2',
    full_name: 'Marta Nowak',
    phone_number: '+49 30 4321 9876',
    role: 'delivery',
    address: KREUZBERG_ADDRESS,
    vehicle_type: 'scooter',
    availability_status: false,
    delivery_rating: 4.7,
    number_ratings: 189,
    updated_at: '2026-10-27T14:20:00.000Z',
  },
  {
    id: 'profile-support-1',
    full_name: 'Noah Fischer',
    phone_number: '+49 30 2222 0101',
    role: 'support',
    address: null,
    vehicle_type: null,
    availability_status: null,
    delivery_rating: null,
    number_ratings: null,
    updated_at: '2026-10-24T09:15:00.000Z',
  },
];

/* ─── Delivery requests ─────────────────────────────────────────────────── */

export const mockDeliveryRequests: DeliveryRequest[] = [
  {
    id: 'req-2001',
    full_name: 'Sofia Braun',
    email: 'sofia.braun@example.com',
    phone_number: '+49 30 1111 2222',
    status: 'pending',
    created_at: '2026-10-28T09:12:00.000Z',
    updated_at: '2026-10-28T09:12:00.000Z',
  },
  {
    id: 'req-2002',
    full_name: 'Emre Yilmaz',
    email: 'emre.yilmaz@example.com',
    phone_number: '+49 30 3333 4444',
    status: 'pending',
    created_at: '2026-10-27T15:40:00.000Z',
    updated_at: '2026-10-27T15:40:00.000Z',
  },
  {
    id: 'req-2003',
    full_name: 'Clara Neumann',
    email: 'clara.neumann@example.com',
    phone_number: '+49 30 5555 6666',
    status: 'approved',
    created_at: '2026-10-25T11:05:00.000Z',
    updated_at: '2026-10-26T08:20:00.000Z',
  },
  {
    id: 'req-2004',
    full_name: 'David Okoro',
    email: 'david.okoro@example.com',
    phone_number: '+49 30 7777 8888',
    status: 'approved',
    created_at: '2026-10-24T17:25:00.000Z',
    updated_at: '2026-10-25T10:00:00.000Z',
  },
  {
    id: 'req-2005',
    full_name: 'Ines Wagner',
    email: 'ines.wagner@example.com',
    phone_number: '+49 30 9999 0000',
    status: 'rejected',
    created_at: '2026-10-23T13:50:00.000Z',
    updated_at: '2026-10-24T09:30:00.000Z',
  },
];

/* ─── Admin dashboard ───────────────────────────────────────────────────── */

export type DashboardStat = {
  label: string;
  value: string;
  delta: { value: string; positive: boolean };
  icon: IoniconsName;
};

export const adminStats: DashboardStat[] = [
  {
    label: 'Total revenue',
    value: '€42,850.00',
    delta: { value: '+12.5%', positive: true },
    icon: 'card-outline',
  },
  {
    label: 'Total orders',
    value: '1,284',
    delta: { value: '+8.2%', positive: true },
    icon: 'restaurant-outline',
  },
  {
    label: 'Average order value',
    value: '€33.40',
    delta: { value: '-2.1%', positive: false },
    icon: 'trending-up-outline',
  },
  {
    label: 'New customers',
    value: '412',
    delta: { value: '+24.0%', positive: true },
    icon: 'person-add-outline',
  },
];

export type ChartPoint = { label: string; value: number };

export const weeklyRevenue: ChartPoint[] = [
  { label: 'Mon', value: 6200 },
  { label: 'Tue', value: 8100 },
  { label: 'Wed', value: 5500 },
  { label: 'Thu', value: 9400 },
  { label: 'Fri', value: 4200 },
  { label: 'Sat', value: 10800 },
  { label: 'Sun', value: 8600 },
];

export type TopDish = {
  id: string;
  name: string;
  image_url: string;
  sold: number;
  percent: number;
};

export const topDishes: TopDish[] = [
  {
    id: 'dish-1',
    name: 'Berliner Currywurst',
    image_url:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    sold: 342,
    percent: 85,
  },
  {
    id: 'dish-2',
    name: 'Wagyu Smash Burger',
    image_url:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    sold: 284,
    percent: 70,
  },
  {
    id: 'dish-3',
    name: 'Market Greens',
    image_url:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    sold: 198,
    percent: 55,
  },
];

export const kitchenEfficiency: { percent: number; avgMinutes: number } = {
  percent: 75,
  avgMinutes: 18.4,
};

export const adminLiveOrders: { preparing: number; ready: number; completed: number } = {
  preparing: 12,
  ready: 8,
  completed: 142,
};

/* ─── Delivery dashboard ────────────────────────────────────────────────── */

export const deliveryStats: {
  completedToday: number;
  earningsToday: number;
  avgMinutes: number;
} = {
  completedToday: 14,
  earningsToday: 86.4,
  avgMinutes: 18.4,
};

/** Deliveries per weekday, mirroring the web delivery dashboard bars. */
export const weeklyDeliveries: ChartPoint[] = [
  { label: 'Mon', value: 8 },
  { label: 'Tue', value: 12 },
  { label: 'Wed', value: 7 },
  { label: 'Thu', value: 15 },
  { label: 'Fri', value: 10 },
  { label: 'Sat', value: 18 },
  { label: 'Sun', value: 14 },
];
