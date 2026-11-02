export type ImageCrop = readonly [x: number, y: number, width: number, height: number];

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly image: ImageCrop;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly image: ImageCrop;
}

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

export interface ProductsViewModel {
  readonly catalog: CatalogState;
  readonly results: readonly Product[];
  readonly cart: { readonly count: number };
}

export interface ProductsViewActions {
  search(term: string): void;
  sort(by: SortBy, order?: SortOrder): void;
  reset(): void;
  addToCart(id: string): void;
}
