export type ImageCrop = readonly [x: number, y: number, width: number, height: number];

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly image: ImageCrop;
  readonly seller: string;
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

const categoryData: readonly Category[] = [
  { id: 'home', name: 'Home', image: [128, 390, 337, 98] },
  { id: 'lifestyle', name: 'Lifestyle', image: [489, 390, 336, 98] },
  { id: 'workspace', name: 'Workspace', image: [849, 390, 336, 98] },
  { id: 'gifts', name: 'Gifts', image: [1208, 390, 336, 98] },
];

export const categories: readonly Category[] = Object.freeze(
  categoryData.map((category) => Object.freeze(category)),
);

export function createCatalogStore(
  products: readonly Product[],
  categories: readonly Category[],
): CatalogStore {
  const state: CatalogState = {
    category: '',
    query: '',
    sortBy: 'default',
    sortOrder: 'asc',
    minPrice: null,
    maxPrice: null,
  };

  function getResults(): Product[] {
    const query = state.query.trim().toLowerCase();
    const results = products.filter((product) => {
      if (state.category && product.category !== state.category) return false;
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (typeof state.minPrice === 'number' && product.price < state.minPrice) return false;
      if (typeof state.maxPrice === 'number' && product.price > state.maxPrice) return false;
      return true;
    });
    if (state.sortBy === 'price')
      results.sort((a, b) => (state.sortOrder === 'desc' ? b.price - a.price : a.price - b.price));
    else if (state.sortBy === 'name')
      results.sort((a, b) =>
        state.sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
      );
    return results;
  }

  function filter(criteria: CatalogFilter = {}): Product[] {
    if ('category' in criteria) state.category = criteria.category || '';
    if ('query' in criteria) state.query = criteria.query || '';
    if ('minPrice' in criteria)
      state.minPrice = typeof criteria.minPrice === 'number' ? criteria.minPrice : null;
    if ('maxPrice' in criteria)
      state.maxPrice = typeof criteria.maxPrice === 'number' ? criteria.maxPrice : null;
    return getResults();
  }

  function sort(by: SortBy, order: SortOrder = 'asc'): Product[] {
    state.sortBy = by || 'default';
    state.sortOrder = order === 'desc' ? 'desc' : 'asc';
    return getResults();
  }

  function reset(): Product[] {
    Object.assign(state, {
      category: '',
      query: '',
      sortBy: 'default',
      sortOrder: 'asc',
      minPrice: null,
      maxPrice: null,
    });
    return getResults();
  }

  return Object.freeze({
    products,
    categories,
    getState: () => ({ ...state }),
    getResults,
    search: (term: string) => filter({ query: term }),
    filter,
    sort,
    reset,
  });
}
