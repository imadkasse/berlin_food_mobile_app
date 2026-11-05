import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
};

type CartState = {
  items: CartItem[];
  /** Adds a line item, merging quantities when the id already exists. */
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  incrementQuantity: (id: string) => void;
  /** Decrements, but never below 1 — same rule as the web cart. */
  decrementQuantity: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const quantity = item.quantity ?? 1;
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        }),

      incrementQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })),

      decrementQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'berlin-food.cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Total number of individual items in the cart (sum of quantities). */
export const selectItemCount = (state: CartState): number =>
  state.items.reduce((n, item) => n + item.quantity, 0);

/** Cart subtotal in euro cents — prices are stored in cents. */
export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((n, item) => n + item.price * item.quantity, 0);

/** Flat delivery fee in euro cents (matches the mobile spec). */
export const DELIVERY_FEE = 150;
export const VAT_RATE = 0;
