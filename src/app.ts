import type { CartStore } from './modules/cart/cart.ts';
import type { CatalogStore, Product } from './modules/products/catalog.ts';
import { ApiError } from './shared/api/client.ts';
import type { ConsoleApi, ShopActions, ShopModel, ShopPage } from './app.types.ts';
import type { LoadState } from './modules/products/products.types.ts';
import { parseRoute } from './page/routes.ts';

interface AppDependencies {
  catalog: CatalogStore;
  cart: CartStore;
  page: ShopPage;
  loadProducts(): Promise<readonly Product[]>;
}

export function createApp({ catalog, cart, page, loadProducts }: AppDependencies) {
  let loadState: LoadState = { status: 'loading' };
  let productRequestId = 0;

  const model = (): ShopModel => ({
    products: catalog.products,
    loadState,
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

  async function refreshProducts(): Promise<void> {
    const requestId = ++productRequestId;
    loadState = { status: 'loading' };
    page.updateProducts(model());
    let products: readonly Product[];
    try {
      products = await loadProducts();
    } catch (error) {
      if (requestId !== productRequestId) return;
      loadState = {
        status: 'error',
        message: productLoadErrorMessage(error),
      };
      page.updateProducts(model());
      return;
    }
    if (requestId !== productRequestId) return;
    catalog.setProducts(products);
    cart.setProducts(products);
    loadState = { status: 'success', products };
    const cartSnapshot = cart.getSnapshot();
    page.syncCart(cartSnapshot);
    page.renderCart(cartSnapshot);
    page.updateProducts(model());
  }

  cart.onChange(({ snapshot, addedProduct }) => {
    page.syncCart(snapshot);
    page.renderCart(snapshot);
    if (addedProduct) page.showToast(`${addedProduct.name} added to your bag`);
  });

  const actions = Object.freeze<ShopActions>({
    retryProducts: () => void refreshProducts(),
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
    get products() {
      return catalog.products;
    },
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
      void refreshProducts();
    },
  });
}

function productLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `The product request failed with status ${error.status}.`;
  }
  if (error instanceof SyntaxError) {
    return 'The product service returned unreadable data.';
  }
  if (
    error instanceof TypeError &&
    error.message === 'The products response has an invalid format.'
  ) {
    return 'The product service returned data in an unexpected format.';
  }
  return 'The product service could not be reached.';
}
