import type { StorageAdapter } from '../cart/cart-store.ts';
import type { ConsoleApi } from '../types.ts';

export const browserStorage: StorageAdapter = {
  getItem(key) {
    return globalThis.localStorage.getItem(key);
  },
  setItem(key, value) {
    globalThis.localStorage.setItem(key, value);
  },
};

declare global {
  interface Window {
    shop: ConsoleApi;
  }
}

export function installConsoleApi(api: ConsoleApi): void {
  window.shop = api;
  console.info(
    '%c ShopBoard Console API Available \n' +
      'Use window.shop to inspect and manage products:\n' +
      '  - shop.search("mug")              -> Search by name\n' +
      '  - shop.filter({ category: "home", minPrice: 20 }) -> Filter criteria\n' +
      '  - shop.sort("price", "asc")       -> Sort by "price" or "name" ("asc"|"desc")\n' +
      '  - shop.reset()                    -> Reset all filters and sorts\n' +
      '  - shop.getState()                 -> View current state\n' +
      '  - shop.products                   -> Full products catalog',
    'font-weight: bold; color: #203f33;',
  );
}

export function createToast(toast: HTMLElement) {
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  function showToast(message: string): void {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }
  return { show: showToast };
}
