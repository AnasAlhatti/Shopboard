import assert from 'node:assert/strict';
import { createCartStore } from '../src/modules/cart/cart.ts';

const products = [
  { id: 'mug', price: 18 },
  { id: 'bottle', price: 32 },
];

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

const storage = memoryStorage();
const cart = createCartStore(products, storage);
const changes = [];
cart.onChange((change) => changes.push(change));

assert.deepEqual(cart.getSnapshot(), { items: [], count: 0, subtotal: 0 });
cart.add('mug');
cart.add('mug');
cart.add('bottle');
assert.equal(cart.getSnapshot().count, 3);
assert.equal(cart.getSnapshot().subtotal, 68);
assert.equal(JSON.parse(storage.getItem('shopboard-cart')).mug, 2);
assert.equal(changes.length, 3);
assert.equal(changes.at(-1).snapshot.count, 3);
assert.equal(changes[0].addedProduct.id, 'mug');
assert.equal(changes[1].addedProduct.id, 'mug');
assert.equal(changes[2].addedProduct.id, 'bottle');

cart.change('mug', -1);
assert.equal(cart.getSnapshot().count, 2);
cart.remove('bottle');
assert.equal(cart.getSnapshot().subtotal, 18);
assert.equal(changes.length, 5);
assert.equal(changes[3].addedProduct, undefined);
assert.equal(changes[4].addedProduct, undefined);

const restored = createCartStore(products, storage);
assert.equal(restored.getSnapshot().items[0].quantity, 1);

restored.add('bottle');
restored.clear();
assert.deepEqual(restored.getSnapshot(), { items: [], count: 0, subtotal: 0 });
assert.deepEqual(JSON.parse(storage.getItem('shopboard-cart')), {});

const clearedAfterRefresh = createCartStore(products, storage);
assert.deepEqual(clearedAfterRefresh.getSnapshot(), { items: [], count: 0, subtotal: 0 });

const invalidStorage = memoryStorage({
  'shopboard-cart': JSON.stringify({ mug: 100, bottle: -1, unknown: 2 }),
});
assert.equal(createCartStore(products, invalidStorage).getSnapshot().count, 0);

console.log('ALL CART STORE TESTS PASSED');
