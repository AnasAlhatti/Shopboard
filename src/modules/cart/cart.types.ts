import type { Product } from '../products/products.types.ts';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CartItem extends Product {
  readonly quantity: number;
}

export interface Cart {
  readonly items: readonly CartItem[];
  readonly count: number;
  readonly subtotal: number;
}

export interface CartStore {
  getSnapshot(): Cart;
  add(id: string): Cart;
  change(id: string, delta: number): Cart;
  remove(id: string): Cart;
  clear(): Cart;
}

export interface CartActions {
  changeCart(id: string, delta: number): void;
  removeFromCart(id: string): void;
  clearCart(): void;
}
