import { products, categories } from './data/catalog-data.js';

export { products, categories };

export const catalogState = {
  category: '',
  query: '',
  sortBy: 'default', // 'default' | 'price' | 'name'
  sortOrder: 'asc', // 'asc' | 'desc'
  minPrice: null,
  maxPrice: null,
};

export function getFilteredProducts() {
  const queryTrimmed = catalogState.query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    if (catalogState.category && product.category !== catalogState.category) {
      return false;
    }
    if (queryTrimmed && !product.name.toLowerCase().includes(queryTrimmed)) {
      return false;
    }
    if (typeof catalogState.minPrice === 'number' && product.price < catalogState.minPrice) {
      return false;
    }
    if (typeof catalogState.maxPrice === 'number' && product.price > catalogState.maxPrice) {
      return false;
    }
    return true;
  });

  if (catalogState.sortBy === 'price') {
    filtered.sort((a, b) =>
      catalogState.sortOrder === 'desc' ? b.price - a.price : a.price - b.price,
    );
  } else if (catalogState.sortBy === 'name') {
    filtered.sort((a, b) =>
      catalogState.sortOrder === 'desc'
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name),
    );
  }

  return filtered;
}

export function categoryCounts() {
  const counts = { all: products.length };
  for (const cat of categories) {
    counts[cat.id] = products.filter((p) => p.category === cat.id).length;
  }
  return counts;
}

export function setCategory(category) {
  catalogState.category = category || '';
  return getFilteredProducts();
}

export function setQuery(query) {
  catalogState.query = query || '';
  return getFilteredProducts();
}

export function setSort(by, order = 'asc') {
  catalogState.sortBy = by || 'default';
  catalogState.sortOrder = order === 'desc' ? 'desc' : 'asc';
  return getFilteredProducts();
}

export function setPriceRange(min, max) {
  catalogState.minPrice = typeof min === 'number' ? min : null;
  catalogState.maxPrice = typeof max === 'number' ? max : null;
  return getFilteredProducts();
}

export function resetCatalog() {
  catalogState.category = '';
  catalogState.query = '';
  catalogState.sortBy = 'default';
  catalogState.sortOrder = 'asc';
  catalogState.minPrice = null;
  catalogState.maxPrice = null;
  return getFilteredProducts();
}

export function initConsoleApi(options = {}) {
  const { onUpdate, onNavigate } = options;

  function notify() {
    if (typeof onNavigate === 'function') onNavigate();
    if (typeof onUpdate === 'function') onUpdate();
  }

  const shop = {
    products: Object.freeze([...products]),
    categories: Object.freeze([...categories]),

    search(term) {
      const results = setQuery(term);
      notify();
      console.table(results);
      return results;
    },

    filter(criteria = {}) {
      if ('category' in criteria) catalogState.category = criteria.category || '';
      if ('query' in criteria) catalogState.query = criteria.query || '';
      if ('minPrice' in criteria) catalogState.minPrice = criteria.minPrice;
      if ('maxPrice' in criteria) catalogState.maxPrice = criteria.maxPrice;
      const results = getFilteredProducts();
      notify();
      console.table(results);
      return results;
    },

    sort(by, order = 'asc') {
      const results = setSort(by, order);
      notify();
      console.table(results);
      return results;
    },

    reset() {
      const results = resetCatalog();
      notify();
      console.table(results);
      return results;
    },

    getState() {
      return { ...catalogState };
    },
  };

  if (typeof window !== 'undefined') {
    window.shop = shop;
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

  return shop;
}
