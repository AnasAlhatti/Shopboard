import type { Product } from '../products/catalog.ts';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'shopboard-cart';

export const browserStorage: StorageAdapter = {
  getItem(key) {
    return globalThis.localStorage.getItem(key);
  },
  setItem(key, value) {
    globalThis.localStorage.setItem(key, value);
  },
};

export function saveQuantities(
  quantities: Readonly<Record<string, number>>,
  storage: StorageAdapter,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(quantities));
  } catch {
    // The in-memory cart remains usable when persistence is unavailable.
  }
}

export function loadQuantities(
  products: readonly Product[],
  storage: StorageAdapter,
  maxQuantity: number,
): Record<string, number> {
  const quantities: Record<string, number> = {};
  try {
    const saved: unknown = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    if (!isRecord(saved)) return quantities;
    for (const product of products) {
      const quantity = saved[product.id];
      if (
        typeof quantity === 'number' &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= maxQuantity
      )
        quantities[product.id] = quantity;
    }
  } catch {
    /* Invalid storage is an empty cart. */
  }
  return quantities;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
