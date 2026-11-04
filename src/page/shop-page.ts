import type { Cart } from '../modules/cart/cart.ts';
import type { Category } from '../modules/products/catalog.ts';
import type { ShopActions, ShopModel, ShopPage } from '../app.types.ts';
import { createAuthView } from '../modules/auth/auth.ui.ts';
import { createCartDialog } from '../modules/cart/cart.ui.ts';
import { createProductsView } from '../modules/products/products.ui.ts';
import { installConsoleApi } from './console-api.ts';
import { createToast } from '../shared/ui/toast.ts';
import { required, dismissOnBackdrop } from '../shared/dom.ts';
import { createInfoDialog } from '../shared/ui/info-dialog.ts';
import { createShopChrome } from './layout.ts';
import { parseRoute } from './routes.ts';

interface PageDependencies {
  categories: readonly Category[];
}

export function createShopPage({ categories }: PageDependencies): ShopPage {
  const app = required<HTMLElement>(document, '#app');
  const cartElement = required<HTMLDialogElement>(document, '#cart-dialog');
  const infoElement = required<HTMLDialogElement>(document, '#info-dialog');
  const toast = createToast(required<HTMLElement>(document, '#toast'));
  const info = createInfoDialog(infoElement);
  let currentModel: ShopModel | undefined;
  let connection: ReturnType<typeof connectViews> | undefined;

  function getModel(): ShopModel {
    if (!currentModel) throw new Error('Shop page has not rendered a model yet.');
    return currentModel;
  }

  function connectViews(actions: ShopActions) {
    const cart = createCartDialog(cartElement, actions);
    const chrome = createShopChrome(app, actions, () => cart.open(getModel().cart));
    const bindInfo = () => info.bind(app);
    const collection = {
      app,
      categories,
      actions,
      bindShopChrome: chrome.bind,
      bindInfoLinks: bindInfo,
    };
    const productsView = createProductsView(collection);
    return {
      actions,
      cart,
      chrome,
      home: productsView.home,
      catalog: productsView.catalog,
      auth: createAuthView(app, bindInfo),
    };
  }

  function getConnection(): ReturnType<typeof connectViews> {
    if (!connection) throw new Error('Connect shop actions before starting the page.');
    return connection;
  }

  function render(model: ShopModel): void {
    currentModel = model;
    const views = getConnection();
    const route = parseRoute(location.hash);
    const auth = route.type === 'auth';
    const catalogRoute =
      route.type === 'products' ||
      (route.type === 'category' && categories.some((item) => item.id === route.categoryId));
    views.cart.close();
    info.close();
    document.title = auth
      ? `${route.type === 'auth' && route.mode === 'signup' ? 'Create an account' : 'Welcome back'} — ShopBoard`
      : catalogRoute
        ? 'Products — ShopBoard'
        : 'ShopBoard — Goods for a better everyday';
    if (route.type === 'auth') views.auth.render(route.mode);
    else if (catalogRoute) views.catalog.render(model);
    else views.home.render(model);
    if (location.hash === '#main-content') required<HTMLElement>(app, '#main-content').focus();
    else window.scrollTo({ left: 0, top: 0 });
  }

  function updateCatalog(model: ShopModel): void {
    currentModel = model;
    if (parseRoute(location.hash).type === 'auth') {
      location.hash = 'products';
      return;
    }
    const views = getConnection();
    if (app.querySelector('.catalog-product-grid')) views.catalog.update(model);
    else if (app.querySelector('.shop-content')) views.home.update(model);
  }

  function updateProducts(model: ShopModel): void {
    currentModel = model;
    if (parseRoute(location.hash).type === 'auth') return;
    const views = getConnection();
    if (app.querySelector('.catalog-product-grid')) views.catalog.update(model);
    else if (app.querySelector('.shop-content')) views.home.update(model);
  }

  function syncCart(snapshot: Cart): void {
    if (currentModel) currentModel = { ...currentModel, cart: snapshot };
    getConnection().chrome.sync(snapshot);
  }

  return Object.freeze({
    connect(actions: ShopActions) {
      connection = connectViews(actions);
    },
    start() {
      const views = getConnection();
      dismissOnBackdrop(cartElement);
      dismissOnBackdrop(infoElement);
      const route = () => views.actions.navigate(location.hash);
      window.addEventListener('hashchange', route);
      route();
    },
    render,
    updateProducts,
    updateCatalog,
    syncCart,
    renderCart: (snapshot: Cart) => getConnection().cart.render(snapshot),
    showToast: toast.show,
    installConsoleApi,
  });
}
