import type { CartSnapshot, CartStore, Product, StorageAdapter } from '../types.ts';

const STORAGE_KEY = 'shopboard-cart';
const MAX_QUANTITY = 99;

export function createCartStore(products: readonly Product[], storage: StorageAdapter): CartStore {
  const quantities = loadQuantities(products, storage);

  function save(): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(quantities));
    } catch {
      /* The in-memory cart remains usable. */
    }
  }

  function change(id: string, delta: number): CartSnapshot {
    if (!products.some((product) => product.id === id)) return snapshot();
    quantities[id] = Math.min(MAX_QUANTITY, (quantities[id] || 0) + delta);
    if (quantities[id] <= 0) delete quantities[id];
    save();
    return snapshot();
  }

  function remove(id: string): CartSnapshot {
    delete quantities[id];
    save();
    return snapshot();
  }
  function clear(): CartSnapshot {
    for (const id of Object.keys(quantities)) delete quantities[id];
    save();
    return snapshot();
  }

  function snapshot(): CartSnapshot {
    const items = products.flatMap((product) => {
      const quantity = quantities[product.id];
      return quantity ? [{ ...product, quantity }] : [];
    });
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }

  return Object.freeze({
    getSnapshot: snapshot,
    add: (id: string) => change(id, 1),
    change,
    remove,
    clear,
  });
}

function loadQuantities(
  products: readonly Product[],
  storage: StorageAdapter,
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
        quantity <= MAX_QUANTITY
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
