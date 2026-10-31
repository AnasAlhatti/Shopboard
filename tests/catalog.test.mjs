import assert from 'node:assert/strict';
import {
  products,
  categories,
  catalogState,
  getFilteredProducts,
  setCategory,
  setQuery,
  setSort,
  setPriceRange,
  resetCatalog,
  initConsoleApi,
} from '../src/catalog.js';

// Setup mock window and console for testing
globalThis.window = globalThis;
let tableLogged;
const originalTable = console.table;
const originalInfo = console.info;
console.table = (data) => {
  tableLogged = data;
};
console.info = () => {};

try {
  // Test 1: Data integrity
  assert.equal(products.length, 6, 'Products must have 6 items');
  assert.equal(categories.length, 4, 'Categories must have 4 items');
  assert.equal(getFilteredProducts().length, 6, 'Initial filter returns all 6 products');

  // Test 2: Category filtering
  let filtered = setCategory('home');
  assert.equal(filtered.length, 2, 'Category "home" must return 2 products');
  assert.ok(
    filtered.every((p) => p.category === 'home'),
    'All returned items belong to "home"',
  );
  assert.equal(catalogState.category, 'home');

  // Test 3: Search filtering
  filtered = setQuery('mug');
  assert.equal(filtered.length, 1, 'Search query "mug" must return 1 product');
  assert.equal(filtered[0].id, 'mug');

  // Test 4: Reset
  filtered = resetCatalog();
  assert.equal(filtered.length, 6, 'Reset must restore all 6 products');
  assert.equal(catalogState.category, '');
  assert.equal(catalogState.query, '');
  assert.equal(catalogState.sortBy, 'default');

  // Test 5: Price range filtering
  filtered = setPriceRange(20, 34);
  assert.equal(filtered.length, 4, 'Price range 20-34 should match 4 products (20, 24, 32, 34)');
  assert.ok(filtered.every((p) => p.price >= 20 && p.price <= 34));

  resetCatalog();

  // Test 6: Sorting by price
  filtered = setSort('price', 'asc');
  assert.deepEqual(
    filtered.map((p) => p.price),
    [18, 20, 24, 32, 34, 56],
    'Price sort ascending matches expected order',
  );

  filtered = setSort('price', 'desc');
  assert.deepEqual(
    filtered.map((p) => p.price),
    [56, 34, 32, 24, 20, 18],
    'Price sort descending matches expected order',
  );

  // Test 7: Sorting by name
  filtered = setSort('name', 'asc');
  assert.equal(filtered[0].name, 'Ceramic Planter');
  assert.equal(filtered[filtered.length - 1].name, 'Stoneware Mug');

  filtered = setSort('name', 'desc');
  assert.equal(filtered[0].name, 'Stoneware Mug');
  assert.equal(filtered[filtered.length - 1].name, 'Ceramic Planter');

  resetCatalog();

  // Test 8: Console API (window.shop)
  let updateCalled = 0;
  let navigateCalled = 0;
  initConsoleApi({
    onUpdate: () => {
      updateCalled++;
    },
    onNavigate: () => {
      navigateCalled++;
    },
  });

  assert.ok(window.shop, 'window.shop must be defined');
  assert.equal(typeof window.shop.search, 'function');
  assert.equal(typeof window.shop.filter, 'function');
  assert.equal(typeof window.shop.sort, 'function');
  assert.equal(typeof window.shop.reset, 'function');
  assert.equal(typeof window.shop.getState, 'function');
  assert.equal(typeof navigateCalled, 'number');

  // shop.search
  tableLogged = null;
  const searchResults = window.shop.search('Blanket');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'blanket');
  assert.equal(tableLogged, searchResults, 'shop.search must log table to console');
  assert.ok(updateCalled > 0, 'shop.search must trigger onUpdate');

  // shop.filter
  tableLogged = null;
  const filterResults = window.shop.filter({ category: 'lifestyle', query: '', minPrice: 30 });
  assert.equal(filterResults.length, 2, 'Linen throw (56) and water bottle (32)');
  assert.equal(tableLogged, filterResults, 'shop.filter must log table to console');

  // shop.sort
  tableLogged = null;
  const sortResults = window.shop.sort('price', 'desc');
  assert.equal(sortResults[0].price, 56);
  assert.equal(tableLogged, sortResults, 'shop.sort must log table to console');

  // shop.getState
  const state = window.shop.getState();
  assert.equal(state.category, 'lifestyle');
  assert.equal(state.sortBy, 'price');
  assert.equal(state.sortOrder, 'desc');
  assert.equal(state.minPrice, 30);

  // shop.reset
  const resetResults = window.shop.reset();
  assert.equal(resetResults.length, 6);
  assert.equal(window.shop.getState().category, '');

  console.log('ALL CATALOG AND CONSOLE API TESTS PASSED');
} finally {
  console.table = originalTable;
  console.info = originalInfo;
}
