import type { Product } from '../products/catalog.ts';
import type { StorageAdapter } from './cart.storage.ts';
import { loadQuantities, saveQuantities } from './cart.storage.ts';

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
  onChange(listener: (change: CartChange) => void): () => void;
  add(id: string): Cart;
  change(id: string, delta: number): Cart;
  remove(id: string): Cart;
  clear(): Cart;
}

export interface CartChange {
  readonly snapshot: Cart;
  readonly addedProduct?: Product;
}

const MAX_QUANTITY = 99;

export function createCartStore(products: readonly Product[], storage: StorageAdapter): CartStore {
  const quantities = loadQuantities(products, storage, MAX_QUANTITY);
  const listeners = new Set<(change: CartChange) => void>();

  const save = () => saveQuantities(quantities, storage);

  function publish(addedProduct?: Product): Cart {
    const current = snapshot();
    const change = addedProduct ? { snapshot: current, addedProduct } : { snapshot: current };
    listeners.forEach((listener) => listener(change));
    return current;
  }

  function change(id: string, delta: number, addedProduct?: Product): Cart {
    if (!products.some((product) => product.id === id)) return snapshot();
    quantities[id] = Math.min(MAX_QUANTITY, (quantities[id] || 0) + delta);
    if (quantities[id] <= 0) delete quantities[id];
    save();
    return publish(addedProduct);
  }

  function remove(id: string): Cart {
    delete quantities[id];
    save();
    return publish();
  }

  function clear(): Cart {
    for (const id of Object.keys(quantities)) delete quantities[id];
    save();
    return publish();
  }

  function snapshot(): Cart {
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
    onChange(listener: (change: CartChange) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add: (id: string) =>
      change(
        id,
        1,
        products.find((product) => product.id === id),
      ),
    change,
    remove,
    clear,
  });
}
