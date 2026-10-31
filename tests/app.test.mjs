import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

const calls = { add: 0, syncCart: 0, render: 0, installed: 0, connected: 0 };
const cartSnapshot = { items: [{ id: 'mug', quantity: 1 }], count: 1, subtotal: 18 };
const cart = {
  getSnapshot: () => ({ items: [], count: 0, subtotal: 0 }),
  add: () => {
    calls.add += 1;
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
  updateCatalog: () => {
    calls.render += 1;
  },
  syncCart: (snapshot) => {
    calls.syncCart += 1;
    assert.deepEqual(snapshot, cartSnapshot);
  },
  renderCart: () => {},
  showToast: () => {},
};

const app = createApp({ catalog, cart, page });
app.start();
assert.equal(calls.connected, 1);
assert.equal(calls.installed, 1);

actions.navigate('category/missing');
assert.equal(catalog.getState().category, '');

actions.addToCart('mug');
assert.equal(calls.add, 1);
assert.equal(calls.syncCart, 1);

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
