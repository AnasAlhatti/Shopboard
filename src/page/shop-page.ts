import type { CartSnapshot } from '../cart/cart-store.ts';
import type { Category, Product } from '../data/catalog-data.ts';
import type { ShopActions, ShopModel, ShopPage } from '../types.ts';
import { createAuthView } from './auth-view.ts';
import { createCartDialog } from './cart-dialog.ts';
import { createCatalogView } from './catalog-view.ts';
import { installConsoleApi, createToast } from './browser.ts';
import { required, dismissOnBackdrop } from './dom.ts';
import { createHomeView } from './home-view.ts';
import { createInfoDialog } from './info-dialog.ts';
import { createShopChrome } from './layout.ts';

interface PageDependencies {
  products: readonly Product[];
  categories: readonly Category[];
}

export function createShopPage({ products, categories }: PageDependencies): ShopPage {
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
      products,
      categories,
      actions,
      bindShopChrome: chrome.bind,
      bindInfoLinks: bindInfo,
    };
    return {
      actions,
      cart,
      chrome,
      home: createHomeView(collection),
      catalog: createCatalogView(collection),
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
    const hash = location.hash.slice(1);
    const auth = hash === 'login' || hash === 'signup';
    const categoryId = hash.startsWith('category/') ? (hash.split('/')[1] ?? '') : '';
    const catalogRoute = hash === 'products' || categories.some((item) => item.id === categoryId);
    views.cart.close();
    info.close();
    document.title = auth
      ? `${hash === 'signup' ? 'Create an account' : 'Welcome back'} — ShopBoard`
      : catalogRoute
        ? 'Products — ShopBoard'
        : 'ShopBoard — Goods for a better everyday';
    if (auth) views.auth.render(hash);
    else if (catalogRoute) views.catalog.render(model);
    else views.home.render(model);
    if (hash === 'main-content') required<HTMLElement>(app, '#main-content').focus();
    else window.scrollTo({ left: 0, top: 0 });
  }

  function updateCatalog(model: ShopModel): void {
    currentModel = model;
    if (location.hash === '#login' || location.hash === '#signup') {
      location.hash = 'products';
      return;
    }
    const views = getConnection();
    if (app.querySelector('.catalog-product-grid')) views.catalog.update(model);
    else if (app.querySelector('.shop-content')) views.home.update(model);
  }

  function syncCart(snapshot: CartSnapshot): void {
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
      const route = () => views.actions.navigate(location.hash.slice(1));
      window.addEventListener('hashchange', route);
      route();
    },
    render,
    updateCatalog,
    syncCart,
    renderCart: (snapshot: CartSnapshot) => getConnection().cart.render(snapshot),
    showToast: toast.show,
    installConsoleApi,
  });
}
