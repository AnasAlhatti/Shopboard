const STORAGE_KEY = 'shopboard-cart';
const MAX_QUANTITY = 99;

export function createCartStore(products, storage) {
  const quantities = loadQuantities(products, storage);

  function save() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(quantities));
    } catch {
      // The in-memory cart remains usable when browser storage is unavailable.
    }
  }

  function change(id, delta) {
    if (!products.some((product) => product.id === id)) return snapshot();
    quantities[id] = Math.min(MAX_QUANTITY, (quantities[id] || 0) + delta);
    if (quantities[id] <= 0) delete quantities[id];
    save();
    return snapshot();
  }

  function remove(id) {
    delete quantities[id];
    save();
    return snapshot();
  }

  function clear() {
    for (const id of Object.keys(quantities)) delete quantities[id];
    save();
    return snapshot();
  }

  function snapshot() {
    const items = products
      .filter((product) => quantities[product.id])
      .map((product) => ({ ...product, quantity: quantities[product.id] }));
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }

  return Object.freeze({
    getSnapshot: snapshot,
    add: (id) => change(id, 1),
    change,
    remove,
    clear,
  });
}

function loadQuantities(products, storage) {
  const quantities = {};
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    for (const product of products) {
      const quantity = saved?.[product.id];
      if (Number.isInteger(quantity) && quantity > 0 && quantity <= MAX_QUANTITY) {
        quantities[product.id] = quantity;
      }
    }
  } catch {
    // Invalid or unavailable storage is equivalent to an empty cart.
  }
  return quantities;
}
