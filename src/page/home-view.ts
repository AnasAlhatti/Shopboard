import { icon, photo } from '../shared/presentation.ts';
import type { ShopModel } from '../types.ts';
import type { CollectionViewOptions } from './catalog-interactions.ts';
import { required } from './dom.ts';
import { header, footer, syncActiveNavigation } from './layout.ts';
import { homeProductCard } from './product-card.ts';
import { bindAddButtons, clearHomeFilters } from './catalog-interactions.ts';

export function createHomeView({
  app,
  products,
  categories,
  actions,
  bindShopChrome,
  bindInfoLinks,
}: CollectionViewOptions) {
  const clearHome = () => clearHomeFilters(actions);
  function storefront(model: ShopModel): void {
    app.innerHTML = `${header(model.cart.count)}<main id="main-content" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-art">${photo(665, 98, 1007, 271, true)}</div><div class="container hero-inner"><div class="hero-copy"><p class="eyebrow">THE EVERYDAY, WELL CHOSEN</p><h1 id="hero-title">Find something<br/>worth keeping.</h1><p class="hero-subtitle">Curated goods for everyday living.</p><a class="button button-primary" href="#products">Shop the collection ${icon('arrow')}</a><span class="hero-footnote">Made for your space. Chosen for your life.</span></div></div></section>
    <div class="container shop-content"><nav class="category-grid" aria-label="Shop by category">${categories.map((category) => `<a href="#category/${category.id}" class="category-card" data-category="${category.id}">${photo(...category.image)}<span class="category-name">${category.name} <span aria-hidden="true">→</span></span></a>`).join('')}</nav>
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

  function renderHomeProducts(model: ShopModel): void {
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
