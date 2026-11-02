import type { ShopActions } from '../types.ts';
import type { Category, Product } from '../data/catalog-data.ts';

export interface CollectionViewOptions {
  app: HTMLElement;
  products: readonly Product[];
  categories: readonly Category[];
  actions: ShopActions;
  bindShopChrome(): void;
  bindInfoLinks(): void;
}

export function bindAddButtons(root: ParentNode, addToCart: ShopActions['addToCart']): void {
  root.querySelectorAll<HTMLButtonElement>('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.product;
      if (id) addToCart(id);
    });
  });
}

export function clearHomeFilters(actions: ShopActions): void {
  actions.reset();
  if (location.hash !== '#home') location.hash = 'home';
}

export function clearCatalogFilters(actions: ShopActions): void {
  history.replaceState(null, '', '#products');
  actions.reset();
}
