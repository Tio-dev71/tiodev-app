// ============================================
// Zustand Cart Store
// Persists cart data to localStorage
// ============================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, OrderSummary } from '@/types';

interface CartState {
  items: CartItem[];
  affiliateCode: string;
  discountPercent: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setAffiliateCode: (code: string, discountPercent: number) => void;
  clearAffiliateCode: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getOrderSummary: () => OrderSummary;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      affiliateCode: '',
      discountPercent: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], affiliateCode: '', discountPercent: 0 });
      },

      setAffiliateCode: (code, discountPercent) => {
        set({ affiliateCode: code, discountPercent });
      },

      clearAffiliateCode: () => {
        set({ affiliateCode: '', discountPercent: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getOrderSummary: () => {
        const subtotal = get().getSubtotal();
        const discountPercent = get().discountPercent;
        const discount = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
        const total = Math.round((subtotal - discount) * 100) / 100;

        return {
          subtotal,
          discount,
          discountPercent,
          total,
          affiliateCode: get().affiliateCode || undefined,
        };
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
