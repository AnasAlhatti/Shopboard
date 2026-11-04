import './style.css';
import { createApp } from './app.ts';
import { createCartStore } from './modules/cart/cart.ts';
import { categories, createCatalogStore } from './modules/products/catalog.ts';
import { getProducts } from './modules/products/products.api.ts';
import { browserStorage } from './modules/cart/cart.storage.ts';
import { createShopPage } from './page/shop-page.ts';

const catalog = createCatalogStore([], categories);
const cart = createCartStore([], browserStorage);
const page = createShopPage({ categories });

createApp({ catalog, cart, page, loadProducts: getProducts }).start();
