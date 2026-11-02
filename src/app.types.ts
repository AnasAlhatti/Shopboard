import type { Cart } from './modules/cart/cart.types.ts';
import type {
  CatalogFilter,
  CatalogState,
  SortBy,
  SortOrder,
  Category,
  Product,
} from './modules/products/products.types.ts';

export interface ShopModel {
  readonly products: readonly Product[];
  readonly categories: readonly Category[];
  readonly catalog: CatalogState;
  readonly results: readonly Product[];
  readonly cart: Cart;
}

export interface ShopActions {
  navigate(route: string): void;
  search(term: string): Product[];
  filter(criteria?: CatalogFilter): Product[];
  sort(by: SortBy, order?: SortOrder): Product[];
  reset(): Product[];
  addToCart(id: string): Cart;
  changeCart(id: string, delta: number): Cart;
  removeFromCart(id: string): Cart;
  clearCart(): Cart;
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
  renderCart(snapshot: Cart): void;
  syncCart(snapshot: Cart): void;
  showToast(message: string): void;
  installConsoleApi(api: ConsoleApi): void;
}
