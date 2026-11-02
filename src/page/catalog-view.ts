import { icon, money } from '../shared/presentation.ts';
import type { Category, Product } from '../data/catalog-data.ts';
import type { CatalogState, SortBy, SortOrder } from '../catalog/catalog-store.ts';
import type { ShopModel } from '../types.ts';
import type { CollectionViewOptions } from './catalog-interactions.ts';
import { required } from './dom.ts';
import { header, footer } from './layout.ts';
import { productCard } from './product-card.ts';
import { bindAddButtons, clearCatalogFilters } from './catalog-interactions.ts';

export function createCatalogView({
  app,
  products,
  categories,
  actions,
  bindShopChrome,
  bindInfoLinks,
}: CollectionViewOptions) {
  function productsPage(model: ShopModel): void {
    const counts = categoryCounts(products, categories);
    app.innerHTML = `${header(model.cart.count)}<main id="main-content" class="products-page" tabindex="-1"><div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#home">Home</a><span aria-hidden="true">/</span><span>Products</span></nav>
    <header class="products-page-header"><p class="eyebrow">THE FULL COLLECTION</p><h1 id="products-page-title">Shop the Collection</h1><p>Useful, lasting goods chosen for everyday life.</p><p id="products-count" class="products-count" role="status"></p></header>
    <section class="catalog-toolbar" aria-label="Product filters"><div class="category-pills" aria-label="Filter by category"><a class="category-pill" data-catalog-category="" href="#products">All (${counts.all})</a>${categories.map((category) => `<a class="category-pill" data-catalog-category="${category.id}" href="#category/${category.id}">${category.name} (${counts[category.id]})</a>`).join('')}</div>
    <div class="catalog-controls"><div class="sort-group"><label for="product-sort">Sort by</label><select id="product-sort" class="sort-select"><option value="default">Featured / Default</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A to Z</option><option value="name-desc">Name: Z to A</option></select></div><div class="catalog-search"><label class="visually-hidden" for="product-search">Search products</label>${icon('search')}<input id="product-search" type="search" placeholder="Search the collection…" autocomplete="off"/></div></div>
    <div class="active-filters" hidden><span class="active-filter-copy"></span><button class="text-button clear-catalog-filters" type="button">Clear filters ×</button></div></section>
    <section aria-labelledby="products-page-title"><div class="product-grid catalog-product-grid"></div></section></div></main>${footer()}`;
    bindShopChrome();
    bindInfoLinks();
    const productSearch = required<HTMLInputElement>(app, '#product-search');
    productSearch.addEventListener('input', () => actions.search(productSearch.value));
    const productSort = required<HTMLSelectElement>(app, '#product-sort');
    productSort.addEventListener('change', () => {
      const [by = 'default', order = 'asc'] = productSort.value.split('-');
      if (isSortBy(by) && isSortOrder(order)) actions.sort(by, order);
      else actions.sort('default');
    });
    required<HTMLButtonElement>(app, '.clear-catalog-filters').addEventListener('click', () => {
      clearCatalogFilters(actions);
    });
    renderCatalogPage(model);
  }

  function renderCatalogPage(model: ShopModel): void {
    const grid = app.querySelector('.catalog-product-grid');
    if (!grid) return;
    grid.innerHTML = model.results.length
      ? model.results.map(productCard).join('')
      : `<div class="empty-results">${icon('search')}<h2>No finds just yet.</h2><p>Try another search or explore the full collection.</p><button class="button button-green clear-empty" type="button">Explore all products</button></div>`;
    bindAddButtons(grid, actions.addToCart);
    grid.querySelector('.clear-empty')?.addEventListener('click', () => {
      clearCatalogFilters(actions);
    });
    required<HTMLInputElement>(app, '#product-search').value = model.catalog.query;
    required<HTMLSelectElement>(app, '#product-sort').value = sortValue(model.catalog);
    required<HTMLElement>(app, '#products-count').textContent =
      `Showing ${model.results.length} ${model.results.length === 1 ? 'find' : 'finds'}`;
    const filters = [];
    if (model.catalog.category)
      filters.push(
        `Category: ${categories.find((item) => item.id === model.catalog.category)?.name}`,
      );
    if (model.catalog.query) filters.push(`Search: “${model.catalog.query}”`);
    if (model.catalog.minPrice !== null) filters.push(`From ${money(model.catalog.minPrice)}`);
    if (model.catalog.maxPrice !== null) filters.push(`Up to ${money(model.catalog.maxPrice)}`);
    const summary = required<HTMLElement>(app, '.active-filters');
    summary.hidden = filters.length === 0;
    required<HTMLElement>(app, '.active-filter-copy').textContent = filters.join(' · ');
    app.querySelectorAll<HTMLElement>('[data-catalog-category]').forEach((link) => {
      const active = link.dataset.catalogCategory === model.catalog.category;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  return { render: productsPage, update: renderCatalogPage };
}

function sortValue(state: CatalogState): string {
  return state.sortBy === 'default' ? 'default' : `${state.sortBy}-${state.sortOrder}`;
}

function categoryCounts(
  products: readonly Product[],
  categories: readonly Category[],
): Record<string, number> {
  const counts: Record<string, number> = { all: products.length };
  for (const category of categories) {
    counts[category.id] = products.filter((product) => product.category === category.id).length;
  }
  return counts;
}

function isSortBy(value: string): value is SortBy {
  return value === 'default' || value === 'price' || value === 'name';
}

function isSortOrder(value: string): value is SortOrder {
  return value === 'asc' || value === 'desc';
}
