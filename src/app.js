export function createApp({ catalog, cart, page }) {
  const model = () => ({
    products: catalog.products,
    categories: catalog.categories,
    catalog: catalog.getState(),
    results: catalog.getResults(),
    cart: cart.getSnapshot(),
  });

  function updateCatalog(operation) {
    const results = operation();
    page.updateCatalog(model());
    return results;
  }

  const actions = Object.freeze({
    navigate(route) {
      const category = route.startsWith('category/') ? route.split('/')[1] : '';
      if (category && catalog.categories.some((item) => item.id === category)) {
        catalog.filter({ category });
      } else if (route === 'products') catalog.filter({ category: '' });
      else if (route === 'home') catalog.reset();
      page.render(model());
    },
    search: (term) => updateCatalog(() => catalog.search(term)),
    filter: (criteria) => updateCatalog(() => catalog.filter(criteria)),
    sort: (by, order) => updateCatalog(() => catalog.sort(by, order)),
    reset: () => updateCatalog(() => catalog.reset()),
    addToCart(id) {
      const snapshot = cart.add(id);
      page.syncCart(snapshot);
      const product = catalog.products.find((item) => item.id === id);
      if (product) page.showToast(`${product.name} added to your bag`);
      return snapshot;
    },
    changeCart(id, delta) {
      const snapshot = cart.change(id, delta);
      page.syncCart(snapshot);
      page.renderCart(snapshot);
      return snapshot;
    },
    removeFromCart(id) {
      const snapshot = cart.remove(id);
      page.syncCart(snapshot);
      page.renderCart(snapshot);
      return snapshot;
    },
    clearCart() {
      const snapshot = cart.clear();
      page.syncCart(snapshot);
      page.renderCart(snapshot);
      return snapshot;
    },
  });

  const consoleApi = Object.freeze({
    products: catalog.products,
    categories: catalog.categories,
    search(term) {
      const results = actions.search(term);
      console.table(results);
      return results;
    },
    filter(criteria = {}) {
      const results = actions.filter(criteria);
      console.table(results);
      return results;
    },
    sort(by, order = 'asc') {
      const results = actions.sort(by, order);
      console.table(results);
      return results;
    },
    reset() {
      const results = actions.reset();
      console.table(results);
      return results;
    },
    getState: catalog.getState,
  });

  return Object.freeze({
    consoleApi,
    start() {
      page.connect(actions);
      page.installConsoleApi(consoleApi);
      page.start();
    },
  });
}
