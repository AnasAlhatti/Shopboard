import './style.css';
import {
  products,
  categories,
  catalogState,
  categoryCounts,
  getFilteredProducts,
  initConsoleApi,
  resetCatalog,
  setCategory,
  setQuery,
  setSort,
} from './catalog.js';
import { createCartStore } from './cart/cart-store.js';
import { createCartDialog } from './cart/cart-dialog.js';
import { header, footer } from './layout/site-layout.js';
import { icon, photo, money } from './shared/presentation.js';
import { createInfoDialog } from './dialogs/info-dialog.js';

const cart = createCartStore(products);
let toastTimer;
const app = document.querySelector('#app');
const cartDialog = document.querySelector('#cart-dialog');
const infoDialog = document.querySelector('#info-dialog');
const cartView = createCartDialog(cartDialog, cart, syncCartBadge);
const infoView = createInfoDialog(infoDialog);

function storefront() {
  app.innerHTML = `${header(cart.getSnapshot().count)}<main id="main-content" tabindex="-1">
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
        ([symbol, title, description]) =>
          `<div class="benefit">${icon(symbol)}<div><h3>${title}</h3><p>${description}</p></div></div>`,
      )
      .join('')}</section></div>
    <section class="newsletter" aria-labelledby="newsletter-title"><div class="container newsletter-inner"><div><p class="eyebrow">A LETTER FROM SHOPBOARD</p><h2 id="newsletter-title">Good things in your inbox.</h2><p>New arrivals, simple living tips, and a little inspiration.</p></div><form class="newsletter-form"><label class="visually-hidden" for="newsletter-email">Your email address</label><div class="newsletter-fields"><input id="newsletter-email" name="email" type="email" placeholder="Your email address" autocomplete="email" required/><button class="button button-primary" type="submit">Subscribe ${icon('arrow')}</button></div><p class="newsletter-status" role="status">Just the good stuff. No clutter.</p></form></div></section>
    </main>${footer()}`;
  renderProducts();
  app.querySelector('.search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
  });
  app.querySelector('#global-product-search').value = catalogState.query;
  app.querySelector('#global-product-search').addEventListener('input', (event) => {
    setQuery(event.target.value);
    renderProducts();
  });
  app.querySelector('.view-all').addEventListener('click', clearFilters);
  app.querySelector('.clear-filters').addEventListener('click', clearFilters);
  app.querySelector('.newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    app.querySelector('.newsletter-status').textContent =
      'Thanks for your interest! Newsletter subscriptions are coming soon.';
  });
  app.querySelector('.cart-toggle').addEventListener('click', () => {
    cartView.open();
  });
  infoView.bind(app);
}

function renderProducts() {
  const matching = getFilteredProducts();
  const grid = app.querySelector('.product-grid');
  // Create cards once. Filtering should hide cards, not destroy loaded images.
  if (!grid.children.length) {
    grid.innerHTML =
      products
        .map(
          (product) =>
            `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h3>${product.name}</h3><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`,
        )
        .join('') +
      `<div class="empty-results" hidden>${icon('search')}<h3>No finds just yet.</h3><p>Try another search or explore the full collection.</p><button class="button button-green clear-empty" type="button">Explore all products</button></div>`;
    grid
      .querySelectorAll('[data-product]')
      .forEach((button) =>
        button.addEventListener('click', () => addToCart(button.dataset.product)),
      );
    grid.querySelector('.clear-empty').addEventListener('click', clearFilters);
  }
  const matchingIds = new Set(matching.map((product) => product.id));
  grid.querySelectorAll('[data-product-card]').forEach((card) => {
    card.hidden = !matchingIds.has(card.dataset.productCard);
  });
  grid.querySelector('.empty-results').hidden = matching.length > 0;
  app.querySelector('#products-title').textContent = catalogState.category
    ? `${categories.find((category) => category.id === catalogState.category).name} essentials`
    : 'New arrivals';
  app.querySelector('.filter-summary').hidden = !catalogState.category && !catalogState.query;
  app.querySelector('#results-description').textContent =
    `${matching.length} ${matching.length === 1 ? 'find' : 'finds'}${catalogState.query ? ` for “${catalogState.query}”` : ''}`;
  app.querySelectorAll('[data-category]').forEach((link) => {
    if (link.dataset.category === catalogState.category) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  app.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === (catalogState.category || 'home'))
      link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function clearFilters() {
  resetCatalog();
  if (location.hash !== '#home') location.hash = 'home';
  else {
    app.querySelector('#global-product-search').value = '';
    renderProducts();
  }
}

function productCard(product) {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h2>${product.name}</h2><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`;
}

function sortValue() {
  return catalogState.sortBy === 'default'
    ? 'default'
    : `${catalogState.sortBy}-${catalogState.sortOrder}`;
}

function productsPage() {
  const counts = categoryCounts();
  app.innerHTML = `${header(cart.getSnapshot().count)}<main id="main-content" class="products-page" tabindex="-1"><div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#home">Home</a><span aria-hidden="true">/</span><span>Products</span></nav>
    <header class="products-page-header"><p class="eyebrow">THE FULL COLLECTION</p><h1 id="products-page-title">Shop the Collection</h1><p>Useful, lasting goods chosen for everyday life.</p><p id="products-count" class="products-count" role="status"></p></header>
    <section class="catalog-toolbar" aria-label="Product filters">
      <div class="category-pills" aria-label="Filter by category"><a class="category-pill" data-catalog-category="" href="#products">All (${counts.all})</a>${categories.map((category) => `<a class="category-pill" data-catalog-category="${category.id}" href="#category/${category.id}">${category.name} (${counts[category.id]})</a>`).join('')}</div>
      <div class="catalog-controls"><div class="sort-group"><label for="product-sort">Sort by</label><select id="product-sort" class="sort-select"><option value="default">Featured / Default</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A to Z</option><option value="name-desc">Name: Z to A</option></select></div>
      <div class="catalog-search"><label class="visually-hidden" for="product-search">Search products</label>${icon('search')}<input id="product-search" type="search" placeholder="Search the collection…" autocomplete="off"/></div></div>
      <div class="active-filters" hidden><span class="active-filter-copy"></span><button class="text-button clear-catalog-filters" type="button">Clear filters ×</button></div>
    </section>
    <section aria-labelledby="products-page-title"><div class="product-grid catalog-product-grid"></div></section>
  </div></main>${footer()}`;
  app.querySelector('#product-search').addEventListener('input', (event) => {
    setQuery(event.target.value);
    renderCatalogPage();
  });
  app.querySelector('#product-sort').addEventListener('change', (event) => {
    const [by, order] = event.target.value.split('-');
    setSort(by, order);
    renderCatalogPage();
  });
  app.querySelector('.clear-catalog-filters').addEventListener('click', () => {
    resetCatalog();
    history.replaceState(null, '', '#products');
    renderCatalogPage();
  });
  bindShopChrome();
  infoView.bind(app);
  renderCatalogPage();
}

function renderCatalogPage() {
  if (!app.querySelector('.catalog-product-grid')) return;
  const matching = getFilteredProducts();
  const grid = app.querySelector('.catalog-product-grid');
  grid.innerHTML = matching.length
    ? matching.map(productCard).join('')
    : `<div class="empty-results">${icon('search')}<h2>No finds just yet.</h2><p>Try another search or explore the full collection.</p><button class="button button-green clear-empty" type="button">Explore all products</button></div>`;
  grid
    .querySelectorAll('[data-product]')
    .forEach((button) => button.addEventListener('click', () => addToCart(button.dataset.product)));
  grid.querySelector('.clear-empty')?.addEventListener('click', () => {
    resetCatalog();
    history.replaceState(null, '', '#products');
    renderCatalogPage();
  });
  app.querySelector('#product-search').value = catalogState.query;
  app.querySelector('#product-sort').value = sortValue();
  app.querySelector('#products-count').textContent =
    `Showing ${matching.length} ${matching.length === 1 ? 'find' : 'finds'}`;
  const filters = [];
  if (catalogState.category)
    filters.push(`Category: ${categories.find((item) => item.id === catalogState.category)?.name}`);
  if (catalogState.query) filters.push(`Search: “${catalogState.query}”`);
  if (catalogState.minPrice !== null) filters.push(`From ${money(catalogState.minPrice)}`);
  if (catalogState.maxPrice !== null) filters.push(`Up to ${money(catalogState.maxPrice)}`);
  const summary = app.querySelector('.active-filters');
  summary.hidden = filters.length === 0;
  app.querySelector('.active-filter-copy').textContent = filters.join(' · ');
  app.querySelectorAll('[data-catalog-category]').forEach((link) => {
    const active = link.dataset.catalogCategory === catalogState.category;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function bindShopChrome() {
  app.querySelector('.search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    setQuery(app.querySelector('#global-product-search').value);
    if (location.hash === '#products') renderCatalogPage();
    else location.hash = 'products';
  });
  app.querySelector('.cart-toggle').addEventListener('click', () => {
    cartView.open();
  });
}

function authPage(mode) {
  const signup = mode === 'signup';
  app.innerHTML = `${header(0, true)}<main id="main-content" class="auth-main" tabindex="-1"><section class="auth-layout" aria-labelledby="auth-title">
    <aside class="auth-story"><div class="auth-story-image">${photo(950, 98, 722, 271)}</div><div class="auth-story-copy"><p class="eyebrow">A LITTLE MORE THOUGHTFUL</p><h2>Good things.<br/>Everyday moments.</h2><p>A home that feels like you. A workspace that inspires you. Find the little things that make a difference.</p><span class="auth-story-signature">Thoughtfully yours, <span>ShopBoard.</span></span></div></aside>
    <div class="auth-panel"><div class="auth-form-wrap"><a href="#home" class="auth-back">← Back to the collection</a><p class="eyebrow">${signup ? 'MAKE YOURSELF AT HOME' : 'YOUR EVERYDAY, REVISITED'}</p><h1 id="auth-title">${signup ? 'A good place to begin.' : 'Welcome back.'}</h1><p class="auth-intro">${signup ? 'Create an account for a more considered everyday.' : 'A few favorite things are waiting for you.'}</p>
    <nav class="auth-tabs" aria-label="Account access"><a href="#login" ${!signup ? 'aria-current="page"' : ''}>Log in</a><a href="#signup" ${signup ? 'aria-current="page"' : ''}>Sign up</a></nav>
    <form class="auth-form">${signup ? '<div class="form-group"><label for="full-name">Full name</label><input id="full-name" name="name" type="text" autocomplete="name" minlength="2" placeholder="Alex Morgan" required/></div>' : ''}
    <div class="form-group"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required/></div>
    <div class="form-group"><label for="auth-password">Password</label><div class="password-field"><input id="auth-password" name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" ${signup ? 'minlength="8" aria-describedby="password-hint"' : ''} placeholder="${signup ? 'Create a password' : 'Enter your password'}" required/><button type="button" class="password-toggle icon-button" aria-label="Show password" aria-pressed="false">${icon('eye')}</button></div>${signup ? '<p id="password-hint" class="field-hint">Use at least 8 characters.</p>' : ''}</div>
    ${signup ? '<div class="form-group"><label for="confirm-password">Confirm password</label><input id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" placeholder="Re-enter your password" required/></div>' : '<button type="button" class="forgot-password text-button" data-info="Password reset">Forgot your password?</button>'}
    <button type="submit" class="button button-green auth-submit">${signup ? 'Create your account' : 'Log in'} ${icon('arrow')}</button><p class="auth-status" role="status" hidden></p>
    <p class="auth-demo-note">Account access is coming soon. This preview does not save or send your details.</p></form>
    <p class="auth-switch">${signup ? 'Already feel at home here?' : 'New to ShopBoard?'} <a href="#${signup ? 'login' : 'signup'}">${signup ? 'Log in' : 'Create an account'} →</a></p></div></div></section></main>${footer(true)}`;
  const password = app.querySelector('#auth-password');
  const confirm = app.querySelector('#confirm-password');
  app.querySelector('.password-toggle').addEventListener('click', (event) => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    const button = event.currentTarget;
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    button.setAttribute('aria-pressed', String(show));
  });
  if (confirm) {
    const validate = () =>
      confirm.setCustomValidity(
        confirm.value && confirm.value !== password.value ? 'Your passwords do not match.' : '',
      );
    confirm.addEventListener('input', validate);
    password.addEventListener('input', validate);
  }
  app.querySelector('.auth-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const status = app.querySelector('.auth-status');
    status.hidden = false;
    status.textContent = `${signup ? 'Your signup form is ready.' : 'Your login form is ready.'} Account ${signup ? 'creation' : 'sign-in'} will be available when the authentication service is connected. No details have been sent or saved.`;
  });
  infoView.bind(app);
}

function syncCartBadge() {
  const { count } = cart.getSnapshot();
  const badge = app.querySelector('.cart-count');
  if (badge) badge.textContent = count;
  app
    .querySelector('.cart-toggle')
    ?.setAttribute('aria-label', `Open shopping bag, ${count} items`);
}
function addToCart(id) {
  cart.add(id);
  syncCartBadge();
  showToast(`${products.find((product) => product.id === id).name} added to your bag`);
}
function showToast(message) {
  const toast = document.querySelector('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}
for (const dialog of [cartDialog, infoDialog])
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });
function route() {
  const hash = location.hash.slice(1);
  const auth = hash === 'login' || hash === 'signup';
  const categoryId = hash.startsWith('category/') ? hash.split('/')[1] : '';
  const catalogRoute = hash === 'products' || categories.some((item) => item.id === categoryId);
  if (cartDialog.open) cartDialog.close();
  if (infoDialog.open) infoDialog.close();
  document.title = auth
    ? `${hash === 'signup' ? 'Create an account' : 'Welcome back'} — ShopBoard`
    : catalogRoute
      ? 'Products — ShopBoard'
      : 'ShopBoard — Goods for a better everyday';
  if (auth) {
    authPage(hash);
    window.scrollTo(0, 0);
  } else if (catalogRoute) {
    if (categoryId) setCategory(categoryId);
    else if (hash === 'products') setCategory('');
    productsPage();
    window.scrollTo(0, 0);
  } else {
    if (hash === 'home') resetCatalog();
    if (app.querySelector('.shop-content')) {
      app.querySelector('#global-product-search').value = catalogState.query;
      renderProducts();
    } else {
      storefront();
    }
    if (hash === 'main-content') app.querySelector('#main-content').focus();
    else window.scrollTo(0, 0);
  }
}
window.addEventListener('hashchange', route);
initConsoleApi({
  onNavigate: () => {
    if (location.hash === '#login' || location.hash === '#signup') location.hash = 'products';
  },
  onUpdate: () => {
    renderCatalogPage();
    if (app.querySelector('.shop-content')) renderProducts();
  },
});
route();
