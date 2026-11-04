import './style.css';
import { createApp } from './app.ts';
import { createCartStore } from './modules/cart/cart.ts';
import { categories, createCatalogStore } from './modules/products/catalog.ts';
import { getProducts } from './modules/products/products.api.ts';
import { browserStorage } from './modules/cart/cart.storage.ts';
import { createShopPage } from './page/shop-page.ts';

async function start(): Promise<void> {
  const products = await getProducts();
  const catalog = createCatalogStore(products, categories);
  const cart = createCartStore(products, browserStorage);
  const page = createShopPage({ products, categories });

  createApp({ catalog, cart, page }).start();
}

void start().catch(() => {
  const app = document.querySelector<HTMLElement>('#app');
  if (!app) return;

  app.innerHTML = `<main role="alert" aria-labelledby="startup-error-title">
    <h1 id="startup-error-title">Products couldn’t be loaded</h1>
    <p>Please check your connection and refresh the page to try again.</p>
  </main>`;
});
