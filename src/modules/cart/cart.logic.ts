import type { Product } from '../products/products.types.ts';
import type { Cart, CartStore, StorageAdapter } from './cart.types.ts';
import { loadQuantities, saveQuantities } from './cart.storage.ts';

const MAX_QUANTITY = 99;

export function createCartStore(products: readonly Product[], storage: StorageAdapter): CartStore {
  const quantities = loadQuantities(products, storage, MAX_QUANTITY);

  const save = () => saveQuantities(quantities, storage);

  function change(id: string, delta: number): Cart {
    if (!products.some((product) => product.id === id)) return snapshot();
    quantities[id] = Math.min(MAX_QUANTITY, (quantities[id] || 0) + delta);
    if (quantities[id] <= 0) delete quantities[id];
    save();
    return snapshot();
  }

  function remove(id: string): Cart {
    delete quantities[id];
    save();
    return snapshot();
  }
  function clear(): Cart {
    for (const id of Object.keys(quantities)) delete quantities[id];
    save();
    return snapshot();
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
    add: (id: string) => change(id, 1),
    change,
    remove,
    clear,
  });
}
