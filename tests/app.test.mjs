import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';

const calls = { add: 0, syncCart: 0, render: 0, renderCart: 0, installed: 0, connected: 0 };
const cartSnapshot = { items: [{ id: 'mug', quantity: 1 }], count: 1, subtotal: 18 };
let onCartChange;
const cart = {
  getSnapshot: () => ({ items: [], count: 0, subtotal: 0 }),
  setProducts: () => {},
  onChange: (listener) => {
    onCartChange = listener;
    return () => {};
  },
  add: () => {
    calls.add += 1;
    onCartChange({ snapshot: cartSnapshot, addedProduct: results[0] });
    return cartSnapshot;
  },
  change: () => cartSnapshot,
  remove: () => cartSnapshot,
  clear: () => ({ items: [], count: 0, subtotal: 0 }),
};
const state = { category: '', query: '', sortBy: 'default', sortOrder: 'asc' };
const results = [{ id: 'mug', name: 'Stoneware Mug', price: 18 }];
const catalog = {
  products: results,
  categories: [],
  setProducts: () => {},
  getState: () => ({ ...state }),
  getResults: () => results,
  search: (term) => {
    state.query = term;
    return results;
  },
  filter: (criteria) => {
    Object.assign(state, criteria);
    return results;
  },
  sort: (by, order) => {
    state.sortBy = by;
    state.sortOrder = order;
    return results;
  },
  reset: () => results,
};
let actions;
const page = {
  connect: (value) => {
    calls.connected += 1;
    actions = value;
  },
  installConsoleApi: () => {
    calls.installed += 1;
  },
  start: () => {},
  render: () => {
    calls.render += 1;
  },
  updateProducts: () => {},
  updateCatalog: () => {
    calls.render += 1;
  },
  syncCart: (snapshot) => {
    calls.syncCart += 1;
    assert.deepEqual(snapshot, cartSnapshot);
  },
  renderCart: () => {
    calls.renderCart += 1;
  },
  showToast: (message) => {
    calls.toastMessage = message;
  },
};

const app = createApp({ catalog, cart, page, loadProducts: () => new Promise(() => {}) });
app.start();
assert.equal(calls.connected, 1);
assert.equal(calls.installed, 1);

actions.navigate('category/missing');
assert.equal(catalog.getState().category, '');

actions.addToCart('mug');
assert.equal(calls.add, 1);
assert.equal(calls.syncCart, 1);
assert.equal(calls.renderCart, 1);
assert.equal(calls.toastMessage, 'Stoneware Mug added to your bag');

const beforeSearch = calls.render;
actions.search('MUG');
assert.equal(catalog.getState().query, 'MUG');
assert.equal(calls.render, beforeSearch + 1);

assert.equal(typeof app.consoleApi.search, 'function');
assert.equal(typeof app.consoleApi.filter, 'function');
assert.equal(typeof app.consoleApi.sort, 'function');
assert.equal(typeof app.consoleApi.reset, 'function');
assert.deepEqual(app.consoleApi.getState(), catalog.getState());

console.log('ALL APP COORDINATION TESTS PASSED');
