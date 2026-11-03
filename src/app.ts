import type { CartStore } from './modules/cart/cart.ts';
import type { CatalogStore, Product } from './modules/products/catalog.ts';
import type { ConsoleApi, ShopActions, ShopModel, ShopPage } from './app.types.ts';
import { parseRoute } from './page/routes.ts';

interface AppDependencies {
  catalog: CatalogStore;
  cart: CartStore;
  page: ShopPage;
}

export function createApp({ catalog, cart, page }: AppDependencies) {
  const model = (): ShopModel => ({
    products: catalog.products,
    categories: catalog.categories,
    catalog: catalog.getState(),
    results: catalog.getResults(),
    cart: cart.getSnapshot(),
  });

  function updateCatalog(operation: () => Product[]): Product[] {
    const results = operation();
    page.updateCatalog(model());
    return results;
  }

  cart.onChange(({ snapshot, addedProduct }) => {
    page.syncCart(snapshot);
    page.renderCart(snapshot);
    if (addedProduct) page.showToast(`${addedProduct.name} added to your bag`);
  });

  const actions = Object.freeze<ShopActions>({
    navigate(route) {
      const parsed = parseRoute(route);
      if (
        parsed.type === 'category' &&
        catalog.categories.some((item) => item.id === parsed.categoryId)
      )
        catalog.filter({ category: parsed.categoryId });
      else if (parsed.type === 'products') catalog.filter({ category: '' });
      else if (parsed.type === 'home') catalog.reset();
      page.render(model());
    },
    search: (term) => updateCatalog(() => catalog.search(term)),
    filter: (criteria) => updateCatalog(() => catalog.filter(criteria)),
    sort: (by, order) => updateCatalog(() => catalog.sort(by, order)),
    reset: () => updateCatalog(() => catalog.reset()),
    addToCart: cart.add,
    changeCart: cart.change,
    removeFromCart: cart.remove,
    clearCart: cart.clear,
  });

  const consoleApi = Object.freeze<ConsoleApi>({
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
