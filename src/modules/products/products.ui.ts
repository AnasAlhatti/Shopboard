import { icon, money, photo } from '../../shared/presentation.ts';
import { required } from '../../shared/dom.ts';
import { header, footer, syncActiveNavigation } from '../../page/layout.ts';

import type {
  Category,
  Product,
  CatalogFilter,
  CatalogState,
  SortBy,
  SortOrder,
} from './catalog.ts';

interface ProductsViewModel {
  readonly catalog: CatalogState;
  readonly results: readonly Product[];
  readonly cart: { readonly count: number };
}

interface ProductsViewActions {
  search(term: string): void;
  filter(criteria?: CatalogFilter): void;
  sort(by: SortBy, order?: SortOrder): void;
  reset(): void;
  addToCart(id: string): void;
}

function createHomeView({
  app,
  products,
  categories,
  actions,
  bindShopChrome,
  bindInfoLinks,
}: CollectionViewOptions) {
  const clearHome = () => clearHomeFilters(actions);
  function storefront(model: ProductsViewModel): void {
    app.innerHTML = `${header(model.cart.count, false, categories)}<main id="main-content" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-art">${photo(665, 98, 1007, 271, true)}</div><div class="container hero-inner"><div class="hero-copy"><p class="eyebrow">THE EVERYDAY, WELL CHOSEN</p><h1 id="hero-title">Find something<br/>worth keeping.</h1><p class="hero-subtitle">Curated goods for everyday living.</p><a class="button button-primary" href="#products">Shop the collection ${icon('arrow')}</a><span class="hero-footnote">Made for your space. Chosen for your life.</span></div></div></section>
    <div class="container shop-content"><nav class="category-grid" aria-label="Shop by category">${categories.map((category) => `<a href="#category/${category.id}" class="category-card" data-category="${category.id}">${photo(...category.image)}<span class="category-name">${category.name}</span></a>`).join('')}</nav>
    <section id="products" class="products" aria-labelledby="products-title"><div class="section-heading"><div><p class="eyebrow">GOOD FINDS, JUST IN</p><h2 id="products-title">New arrivals</h2></div><button class="view-all text-button" type="button">View all ${icon('arrow')}</button></div><div class="filter-summary" hidden><span id="results-description" role="status"></span><button class="text-button clear-filters" type="button">Clear filters ×</button></div><div class="product-grid"></div></section>
    <section class="benefits" aria-label="The ShopBoard approach">${[
      ['truck', 'Made for everyday', 'Useful things. Lasting favorites.'],
      ['leaf', 'Thoughtfully selected', 'A considered collection'],
      ['shield', 'Shop with confidence', 'Clear prices, no surprises'],
      ['box', 'Here to help', 'A little care goes a long way'],
    ]
      .map(
        ([symbol = 'arrow', title = '', description = '']) =>
          `<div class="benefit">${icon(symbol)}<div><h3>${title}</h3><p>${description}</p></div></div>`,
      )
      .join('')}</section></div>
    <section class="newsletter" aria-labelledby="newsletter-title"><div class="container newsletter-inner"><div><p class="eyebrow">A LETTER FROM SHOPBOARD</p><h2 id="newsletter-title">Good things in your inbox.</h2><p>New arrivals, simple living tips, and a little inspiration.</p></div><form class="newsletter-form"><label class="visually-hidden" for="newsletter-email">Your email address</label><div class="newsletter-fields"><input id="newsletter-email" name="email" type="email" placeholder="Your email address" autocomplete="email" required/><button class="button button-primary" type="submit">Subscribe ${icon('arrow')}</button></div><p class="newsletter-status" role="status">Just the good stuff. No clutter.</p></form></div></section>
    </main>${footer()}`;
    renderHomeProducts(model);
    bindShopChrome();
    bindInfoLinks();
    required<HTMLFormElement>(app, '.search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      required<HTMLElement>(document, '#products').scrollIntoView({ behavior: 'smooth' });
    });
    const globalSearch = required<HTMLInputElement>(app, '#global-product-search');
    globalSearch.addEventListener('input', () => actions.search(globalSearch.value));
    required<HTMLButtonElement>(app, '.view-all').addEventListener('click', clearHome);
    required<HTMLButtonElement>(app, '.clear-filters').addEventListener('click', clearHome);
    required<HTMLFormElement>(app, '.newsletter-form').addEventListener('submit', (event) => {
      event.preventDefault();
      required<HTMLElement>(app, '.newsletter-status').textContent =
        'Thanks for your interest! Newsletter subscriptions are coming soon.';
    });
  }

  function renderHomeProducts(model: ProductsViewModel): void {
    const grid = app.querySelector('.shop-content .product-grid');
    if (!grid) return;
    if (!grid.children.length) {
      grid.innerHTML =
        products.map(homeProductCard).join('') +
        `<div class="empty-results" hidden>${icon('search')}<h3>No finds just yet.</h3><p>Try another search or explore the full collection.</p><button class="button button-green clear-empty" type="button">Explore all products</button></div>`;
      bindAddButtons(grid, actions.addToCart);
      required<HTMLButtonElement>(grid, '.clear-empty').addEventListener('click', clearHome);
    }
    const matchingIds = new Set(model.results.map((product) => product.id));
    grid.querySelectorAll<HTMLElement>('[data-product-card]').forEach((card) => {
      const id = card.dataset.productCard;
      card.hidden = !id || !matchingIds.has(id);
    });
    required<HTMLElement>(grid, '.empty-results').hidden = model.results.length > 0;
    required<HTMLInputElement>(app, '#global-product-search').value = model.catalog.query;
    required<HTMLElement>(app, '#products-title').textContent = model.catalog.category
      ? `${categories.find((category) => category.id === model.catalog.category)?.name ?? 'Category'} essentials`
      : 'New arrivals';
    required<HTMLElement>(app, '.filter-summary').hidden =
      !model.catalog.category && !model.catalog.query;
    required<HTMLElement>(app, '#results-description').textContent =
      `${model.results.length} ${model.results.length === 1 ? 'find' : 'finds'}${model.catalog.query ? ` for “${model.catalog.query}”` : ''}`;
    syncActiveNavigation(model.catalog.category);
  }
  return { render: storefront, update: renderHomeProducts };
}

function createCatalogView({
  app,
  products,
  categories,
  actions,
  bindShopChrome,
  bindInfoLinks,
}: CollectionViewOptions) {
  function productsPage(model: ProductsViewModel): void {
    const counts = categoryCounts(products, categories);
    app.innerHTML = `${header(model.cart.count, false, categories)}<main id="main-content" class="products-page" tabindex="-1">
    <header class="catalog-title"><div class="container"><h1 id="products-page-title">Handmade goods</h1><span class="title-ornament" aria-hidden="true"></span></div></header>
    <div class="container catalog-layout"><aside class="filter-panel" aria-label="Product filters">
    <div class="filter-section"><h2>Categories</h2><div class="category-options"><a class="filter-category" data-catalog-category="" href="#products">All goods <span>${counts.all}</span></a>${categories.map((category) => `<a class="filter-category" data-catalog-category="${category.id}" href="#category/${category.id}">${category.name}<span>${counts[category.id]}</span></a>`).join('')}</div></div>
    <fieldset class="filter-section price-filter"><legend>Price Range</legend><div class="price-inputs"><label><span class="visually-hidden">Minimum price</span><input id="price-min" type="number" min="0" placeholder="Min" value="${model.catalog.minPrice ?? ''}" /></label><label><span class="visually-hidden">Maximum price</span><input id="price-max" type="number" min="0" placeholder="Max" value="${model.catalog.maxPrice ?? ''}" /></label></div><label class="sort-group" for="product-sort"><span>Sort by</span><select id="product-sort" class="sort-select"><option value="default">Featured</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A to Z</option><option value="name-desc">Name: Z to A</option></select></label></fieldset>
    <div class="filter-section catalog-search-section"><label for="product-search">Search</label><div class="catalog-search">${icon('search')}<input id="product-search" type="search" placeholder="Search goods" autocomplete="off"/></div></div>
    <button class="button button-primary apply-filters" type="button">Apply filters</button><button class="text-button clear-catalog-filters" type="button">Clear all filters</button></aside>
    <section class="catalog-results" aria-labelledby="products-page-title"><div class="catalog-results-heading"><p id="products-count" class="products-count" role="status"></p><span>Thoughtfully made, chosen to last.</span></div><div class="active-filters" hidden><span class="active-filter-copy"></span></div><div class="product-grid catalog-product-grid"></div><nav class="pagination" aria-label="Product pages"><span>Prev</span><a href="#products" aria-current="page">1</a><a href="#products">2</a><a href="#products">3</a><span>Next</span></nav></section></div></main>`;
    bindShopChrome();
    bindInfoLinks();
    const productSearch = required<HTMLInputElement>(app, '#product-search');
    productSearch.addEventListener('input', () => actions.search(productSearch.value));
    required<HTMLButtonElement>(app, '.apply-filters').addEventListener('click', () => {
      const minInput = required<HTMLInputElement>(app, '#price-min');
      const maxInput = required<HTMLInputElement>(app, '#price-max');
      actions.filter({
        minPrice: minInput.value ? Number(minInput.value) : null,
        maxPrice: maxInput.value ? Number(maxInput.value) : null,
      });
    });
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

  function renderCatalogPage(model: ProductsViewModel): void {
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
      `${model.results.length} ${model.results.length === 1 ? 'good find' : 'good finds'}`;
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
    syncActiveNavigation(model.catalog.category);
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

function homeProductCard(product: Product): string {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h3>${product.name}</h3><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`;
}

function productCard(product: Product): string {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h2>${product.name}</h2><p class="product-seller">By ${product.seller}</p><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add to bag: ${product.name}">Add to bag</button></div></article>`;
}

interface CollectionViewOptions {
  app: HTMLElement;
  products: readonly Product[];
  categories: readonly Category[];
  actions: ProductsViewActions;
  bindShopChrome(): void;
  bindInfoLinks(): void;
}

function bindAddButtons(root: ParentNode, addToCart: ProductsViewActions['addToCart']): void {
  root.querySelectorAll<HTMLButtonElement>('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.product;
      if (id) addToCart(id);
    });
  });
}

function clearHomeFilters(actions: ProductsViewActions): void {
  actions.reset();
  if (location.hash !== '#home') location.hash = 'home';
}

function clearCatalogFilters(actions: ProductsViewActions): void {
  history.replaceState(null, '', '#products');
  actions.reset();
}

export function createProductsView(options: CollectionViewOptions) {
  return { home: createHomeView(options), catalog: createCatalogView(options) };
}
