import './style.css';
import { createApp } from './app.js';
import { createCartStore } from './cart/cart-store.js';
import { createCatalogStore } from './catalog/catalog-store.js';
import { products, categories } from './data/catalog-data.js';
import { browserStorage, createShopPage } from './page/shop-page.js';

const catalog = createCatalogStore(products, categories);
const cart = createCartStore(products, browserStorage);
const page = createShopPage({ products, categories });

createApp({ catalog, cart, page }).start();
