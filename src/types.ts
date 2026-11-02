import type { CartSnapshot } from './cart/cart-store.ts';
import type { Category, Product } from './data/catalog-data.ts';

export type SortBy = 'default' | 'price' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface CatalogState {
  category: string;
  query: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface CatalogFilter {
  category?: string;
  query?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface CatalogStore {
  readonly products: readonly Product[];
  readonly categories: readonly Category[];
  getState(): CatalogState;
  getResults(): Product[];
  search(term: string): Product[];
  filter(criteria?: CatalogFilter): Product[];
  sort(by: SortBy, order?: SortOrder): Product[];
  reset(): Product[];
}

export interface ShopModel {
  readonly products: readonly Product[];
  readonly categories: readonly Category[];
  readonly catalog: CatalogState;
  readonly results: readonly Product[];
  readonly cart: CartSnapshot;
}

export interface ShopActions {
  navigate(route: string): void;
  search(term: string): Product[];
  filter(criteria?: CatalogFilter): Product[];
  sort(by: SortBy, order?: SortOrder): Product[];
  reset(): Product[];
  addToCart(id: string): CartSnapshot;
  changeCart(id: string, delta: number): CartSnapshot;
  removeFromCart(id: string): CartSnapshot;
  clearCart(): CartSnapshot;
}

export interface ConsoleApi {
  readonly products: readonly Product[];
  readonly categories: readonly Category[];
  search(term: string): Product[];
  filter(criteria?: CatalogFilter): Product[];
  sort(by: SortBy, order?: SortOrder): Product[];
  reset(): Product[];
  getState(): CatalogState;
}

export interface ShopPage {
  connect(actions: ShopActions): void;
  start(): void;
  render(model: ShopModel): void;
  updateCatalog(model: ShopModel): void;
  renderCart(snapshot: CartSnapshot): void;
  syncCart(snapshot: CartSnapshot): void;
  showToast(message: string): void;
  installConsoleApi(api: ConsoleApi): void;
}
