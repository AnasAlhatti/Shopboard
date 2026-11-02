import './style.css';
import { createApp } from './app.ts';
import { createCartStore } from './cart/cart-store.ts';
import { createCatalogStore } from './catalog/catalog-store.ts';
import { products, categories } from './data/catalog-data.ts';
import { browserStorage } from './page/browser.ts';
import { createShopPage } from './page/shop-page.ts';

const catalog = createCatalogStore(products, categories);
const cart = createCartStore(products, browserStorage);
const page = createShopPage({ products, categories });

createApp({ catalog, cart, page }).start();
