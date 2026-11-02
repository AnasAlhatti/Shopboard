import type { ConsoleApi } from '../app.types.ts';

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
