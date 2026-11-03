import './style.css';
import { createApp } from './app.ts';
import { createCartStore } from './modules/cart/cart.ts';
import { categories, createCatalogStore, products } from './modules/products/catalog.ts';
import { browserStorage } from './modules/cart/cart.storage.ts';
import { createShopPage } from './page/shop-page.ts';

const catalog = createCatalogStore(products, categories);
const cart = createCartStore(products, browserStorage);
const page = createShopPage({ products, categories });

createApp({ catalog, cart, page }).start();
