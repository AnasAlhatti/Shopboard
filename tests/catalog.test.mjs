import assert from 'node:assert/strict';
import { products, categories, createCatalogStore } from '../src/modules/products/catalog.ts';

const originalOrder = ['mug', 'planter', 'blanket', 'bottle', 'journal', 'tray'];
const catalog = createCatalogStore(products, categories);

assert.equal(Object.isFrozen(products), true);
assert.equal(Object.isFrozen(categories), true);
assert.deepEqual(
  catalog.getResults().map((product) => product.id),
  originalOrder,
);

assert.deepEqual(
  catalog.search('MUG').map((product) => product.id),
  ['mug'],
);
assert.deepEqual(
  catalog.search('mug').map((product) => product.id),
  ['mug'],
);

catalog.reset();
assert.ok(
  catalog.filter({ category: 'lifestyle' }).every((product) => product.category === 'lifestyle'),
);

catalog.reset();
assert.deepEqual(
  catalog.sort('price', 'asc').map((product) => product.price),
  [18, 20, 24, 32, 34, 56],
);
assert.deepEqual(
  catalog.sort('price', 'desc').map((product) => product.price),
  [56, 34, 32, 24, 20, 18],
);
assert.deepEqual(
  catalog.sort('default').map((product) => product.id),
  originalOrder,
);

catalog.reset();
catalog.filter({ category: 'lifestyle', query: 'e' });
assert.deepEqual(
  catalog.sort('price', 'asc').map((product) => product.id),
  ['bottle', 'blanket'],
);

catalog.filter({ minPrice: 20, maxPrice: 34, category: '', query: '' });
assert.deepEqual(
  catalog.getResults().map((product) => product.price),
  [20, 24, 32, 34],
);

catalog.reset();
const state = catalog.getState();
state.query = 'mutated outside';
assert.equal(catalog.getState().query, '');
assert.deepEqual(
  catalog.getResults().map((product) => product.id),
  originalOrder,
);

console.log('ALL CATALOG STORE TESTS PASSED');
