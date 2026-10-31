import { icon, money, photo } from '../shared/presentation.js';

export const browserStorage = globalThis.localStorage;

const information = {
  About:
    'ShopBoard is a concept store for thoughtfully chosen goods for your home, workspace, and everyday life. This storefront is a design preview; products and prices are illustrative.',
  Contact:
    'Our customer support service is coming soon. This preview does not accept orders or support requests.',
  Shipping:
    'Shipping destinations, rates, and delivery estimates will be available when the shop launches. Orders are not available in this preview.',
  Returns:
    'Return details will be published before the shop opens. No purchases can be made in this preview.',
  FAQs: 'You can explore categories, search the collection, and try the shopping bag. Account registration, newsletter subscriptions, and checkout are not connected yet.',
  Privacy:
    'Account and newsletter forms do not send or save your details in this preview. Your shopping bag is saved only in this browser so you can return to it.',
  'Password reset':
    'Password recovery will be available when account access launches. No email has been sent.',
};

export function createShopPage({ products, categories }) {
  const app = document.querySelector('#app');
  const cartDialog = document.querySelector('#cart-dialog');
  const infoDialog = document.querySelector('#info-dialog');
  let actions;
  let currentModel;
  let toastTimer;

  function connect(value) {
    actions = value;
  }

  function start() {
    for (const dialog of [cartDialog, infoDialog]) {
      dialog.addEventListener('click', (event) => {
        const bounds = dialog.getBoundingClientRect();
        if (
          event.target === dialog &&
          (event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom)
        ) {
          dialog.close();
        }
      });
    }
    window.addEventListener('hashchange', route);
    route();
  }

  function route() {
    actions.navigate(location.hash.slice(1));
  }

  function render(model) {
    currentModel = model;
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

    if (auth) authPage(hash, model);
    else if (catalogRoute) productsPage(model);
    else storefront(model);

    if (hash === 'main-content') app.querySelector('#main-content').focus();
    else window.scrollTo(0, 0);
  }

  function storefront(model) {
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
          ([symbol, title, description]) =>
            `<div class="benefit">${icon(symbol)}<div><h3>${title}</h3><p>${description}</p></div></div>`,
        )
        .join('')}</section></div>
      <section class="newsletter" aria-labelledby="newsletter-title"><div class="container newsletter-inner"><div><p class="eyebrow">A LETTER FROM SHOPBOARD</p><h2 id="newsletter-title">Good things in your inbox.</h2><p>New arrivals, simple living tips, and a little inspiration.</p></div><form class="newsletter-form"><label class="visually-hidden" for="newsletter-email">Your email address</label><div class="newsletter-fields"><input id="newsletter-email" name="email" type="email" placeholder="Your email address" autocomplete="email" required/><button class="button button-primary" type="submit">Subscribe ${icon('arrow')}</button></div><p class="newsletter-status" role="status">Just the good stuff. No clutter.</p></form></div></section>
      </main>${footer()}`;
    renderHomeProducts(model);
    bindShopChrome();
    bindInfoLinks();
    app.querySelector('.search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
    });
    app
      .querySelector('#global-product-search')
      .addEventListener('input', (event) => actions.search(event.target.value));
    app.querySelector('.view-all').addEventListener('click', clearFilters);
    app.querySelector('.clear-filters').addEventListener('click', clearFilters);
    app.querySelector('.newsletter-form').addEventListener('submit', (event) => {
      event.preventDefault();
      app.querySelector('.newsletter-status').textContent =
        'Thanks for your interest! Newsletter subscriptions are coming soon.';
    });
  }

  function renderHomeProducts(model) {
    const grid = app.querySelector('.shop-content .product-grid');
    if (!grid) return;
    if (!grid.children.length) {
      grid.innerHTML =
        products.map(homeProductCard).join('') +
        `<div class="empty-results" hidden>${icon('search')}<h3>No finds just yet.</h3><p>Try another search or explore the full collection.</p><button class="button button-green clear-empty" type="button">Explore all products</button></div>`;
      bindAddButtons(grid);
      grid.querySelector('.clear-empty').addEventListener('click', clearFilters);
    }
    const matchingIds = new Set(model.results.map((product) => product.id));
    grid.querySelectorAll('[data-product-card]').forEach((card) => {
      card.hidden = !matchingIds.has(card.dataset.productCard);
    });
    grid.querySelector('.empty-results').hidden = model.results.length > 0;
    app.querySelector('#global-product-search').value = model.catalog.query;
    app.querySelector('#products-title').textContent = model.catalog.category
      ? `${categories.find((category) => category.id === model.catalog.category).name} essentials`
      : 'New arrivals';
    app.querySelector('.filter-summary').hidden = !model.catalog.category && !model.catalog.query;
    app.querySelector('#results-description').textContent =
      `${model.results.length} ${model.results.length === 1 ? 'find' : 'finds'}${model.catalog.query ? ` for “${model.catalog.query}”` : ''}`;
    syncActiveNavigation(model.catalog.category);
  }

  function productsPage(model) {
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
    app
      .querySelector('#product-search')
      .addEventListener('input', (event) => actions.search(event.target.value));
    app.querySelector('#product-sort').addEventListener('change', (event) => {
      const [by, order] = event.target.value.split('-');
      actions.sort(by, order);
    });
    app.querySelector('.clear-catalog-filters').addEventListener('click', () => {
      history.replaceState(null, '', '#products');
      actions.reset();
    });
    renderCatalogPage(model);
  }

  function renderCatalogPage(model) {
    const grid = app.querySelector('.catalog-product-grid');
    if (!grid) return;
    grid.innerHTML = model.results.length
      ? model.results.map(productCard).join('')
      : `<div class="empty-results">${icon('search')}<h2>No finds just yet.</h2><p>Try another search or explore the full collection.</p><button class="button button-green clear-empty" type="button">Explore all products</button></div>`;
    bindAddButtons(grid);
    grid.querySelector('.clear-empty')?.addEventListener('click', () => {
      history.replaceState(null, '', '#products');
      actions.reset();
    });
    app.querySelector('#product-search').value = model.catalog.query;
    app.querySelector('#product-sort').value = sortValue(model.catalog);
    app.querySelector('#products-count').textContent =
      `Showing ${model.results.length} ${model.results.length === 1 ? 'find' : 'finds'}`;
    const filters = [];
    if (model.catalog.category)
      filters.push(
        `Category: ${categories.find((item) => item.id === model.catalog.category)?.name}`,
      );
    if (model.catalog.query) filters.push(`Search: “${model.catalog.query}”`);
    if (model.catalog.minPrice !== null) filters.push(`From ${money(model.catalog.minPrice)}`);
    if (model.catalog.maxPrice !== null) filters.push(`Up to ${money(model.catalog.maxPrice)}`);
    const summary = app.querySelector('.active-filters');
    summary.hidden = filters.length === 0;
    app.querySelector('.active-filter-copy').textContent = filters.join(' · ');
    app.querySelectorAll('[data-catalog-category]').forEach((link) => {
      const active = link.dataset.catalogCategory === model.catalog.category;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function updateCatalog(model) {
    currentModel = model;
    if (location.hash === '#login' || location.hash === '#signup') {
      location.hash = 'products';
      return;
    }
    if (app.querySelector('.catalog-product-grid')) renderCatalogPage(model);
    else if (app.querySelector('.shop-content')) renderHomeProducts(model);
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
      event.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      event.currentTarget.setAttribute('aria-pressed', String(show));
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
    bindInfoLinks();
  }

  function renderCart(snapshot) {
    const { items, count, subtotal } = snapshot;
    cartDialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">YOUR GOOD FINDS</p><h2 id="cart-title">Your shopping bag <span>(${count})</span></h2></div><button class="icon-button close-dialog" type="button" aria-label="Close shopping bag">${icon('close')}</button></div>
      ${items.length ? `<div class="cart-items">${items.map(cartItem).join('')}</div><div class="cart-total"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><button type="button" class="text-button clear-cart">Clear shopping bag</button><p class="cart-note">This is a preview shop. Checkout and payment are not available yet.</p>` : `<div class="empty-bag">${icon('cart')}<h3>A little room for good things.</h3><p>Your bag is empty. Find something worth keeping.</p></div>`}
      <button type="button" class="button button-green continue-shopping">Continue exploring ${icon('arrow')}</button>`;
    cartDialog.querySelector('.close-dialog').addEventListener('click', () => cartDialog.close());
    cartDialog
      .querySelector('.continue-shopping')
      .addEventListener('click', () => cartDialog.close());
    cartDialog.querySelectorAll('[data-quantity]').forEach((button) =>
      button.addEventListener('click', () => {
        actions.changeCart(button.dataset.quantity, Number(button.dataset.delta));
        (
          cartDialog.querySelector(
            `[data-quantity="${button.dataset.quantity}"][data-delta="${button.dataset.delta}"]`,
          ) || cartDialog.querySelector('.close-dialog')
        ).focus();
      }),
    );
    cartDialog.querySelectorAll('[data-remove]').forEach((button) =>
      button.addEventListener('click', () => {
        actions.removeFromCart(button.dataset.remove);
        cartDialog.querySelector('.close-dialog').focus();
      }),
    );
    cartDialog.querySelector('.clear-cart')?.addEventListener('click', () => {
      actions.clearCart();
      cartDialog.querySelector('.close-dialog').focus();
    });
  }

  function syncCart(snapshot) {
    if (currentModel) currentModel = { ...currentModel, cart: snapshot };
    const badge = app.querySelector('.cart-count');
    if (badge) badge.textContent = snapshot.count;
    app
      .querySelector('.cart-toggle')
      ?.setAttribute('aria-label', `Open shopping bag, ${snapshot.count} items`);
  }

  function bindShopChrome() {
    app.querySelector('.cart-toggle').addEventListener('click', () => {
      renderCart(currentModel.cart);
      cartDialog.showModal();
    });
    app.querySelector('.search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const query = app.querySelector('#global-product-search').value;
      actions.search(query);
      if (location.hash !== '#products') location.hash = 'products';
    });
  }

  function bindInfoLinks() {
    app.querySelectorAll('[data-info]').forEach((button) =>
      button.addEventListener('click', () => {
        const title = button.dataset.info;
        infoDialog.innerHTML = `<div class="dialog-heading"><h2 id="info-title">${title}</h2><button class="icon-button" type="button" aria-label="Close">${icon('close')}</button></div><p class="info-copy">${information[title]}</p>`;
        infoDialog.querySelector('button').addEventListener('click', () => infoDialog.close());
        infoDialog.showModal();
      }),
    );
  }

  function bindAddButtons(root) {
    root
      .querySelectorAll('[data-product]')
      .forEach((button) =>
        button.addEventListener('click', () => actions.addToCart(button.dataset.product)),
      );
  }

  function clearFilters() {
    actions.reset();
    if (location.hash !== '#home') location.hash = 'home';
  }

  function installConsoleApi(api) {
    window.shop = api;
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

  function showToast(message) {
    const toast = document.querySelector('#toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  return Object.freeze({
    connect,
    start,
    render,
    updateCatalog,
    renderCart,
    syncCart,
    showToast,
    installConsoleApi,
  });
}

function header(cartCount, auth = false) {
  return `<div class="announcement">${icon('leaf')}<span>Thoughtfully chosen for a better everyday.<span class="announcement-extra"> &nbsp; A little less ordinary.</span></span></div>
    <header class="site-header"><div class="container header-inner"><a class="logo" href="#home" aria-label="ShopBoard home">ShopBoard<span class="logo-dot">.</span></a>
    ${auth ? '<a class="back-to-shop" href="#home">Back to the shop <span aria-hidden="true">↗</span></a>' : `<form class="search-form" role="search"><label class="visually-hidden" for="global-product-search">Search products</label>${icon('search')}<input id="global-product-search" name="q" type="search" placeholder="Search for something good…" autocomplete="off"/><button class="visually-hidden" type="submit">Search</button></form><nav class="main-nav" aria-label="Main navigation"><a href="#home" data-nav="home">Home</a><a href="#products" data-nav="products">Products</a><a href="#category/lifestyle" data-nav="lifestyle">Lifestyle</a><a href="#category/workspace" data-nav="workspace">Workspace</a><a href="#category/gifts" data-nav="gifts">Gifts</a></nav><div class="header-actions"><a class="icon-button account-link" href="#login" aria-label="Log in or create an account">${icon('user')}</a><button class="icon-button cart-toggle" type="button" aria-label="Open shopping bag, ${cartCount} items">${icon('cart')}<span class="cart-count">${cartCount}</span></button></div>`}</div></header>`;
}

function footer(auth = false) {
  const links = auth
    ? ['About', 'Contact', 'Privacy']
    : ['About', 'Contact', 'Shipping', 'Returns', 'FAQs'];
  return `<footer class="site-footer"><div class="container footer-inner"><div><a class="logo footer-logo" href="#home">ShopBoard<span class="logo-dot">.</span></a><p class="copyright">© ${new Date().getFullYear()} ShopBoard. A considered everyday.</p></div><nav aria-label="Footer navigation">${links.map((label) => `<button type="button" class="text-button" data-info="${label}">${label}</button>`).join('')}</nav><span class="footer-note">A little more thoughtful. ${icon('leaf')}</span></div></footer>`;
}

function homeProductCard(product) {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h3>${product.name}</h3><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`;
}

function productCard(product) {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h2>${product.name}</h2><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`;
}

function cartItem(product) {
  return `<article class="cart-item"><div class="cart-image">${photo(...product.image)}</div><div class="cart-item-info"><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity-controls"><button type="button" data-quantity="${product.id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">−</button><span aria-label="Quantity">${product.quantity}</span><button type="button" data-quantity="${product.id}" data-delta="1" aria-label="Increase ${product.name} quantity" ${product.quantity >= 99 ? 'disabled' : ''}>+</button></div></div><button type="button" class="text-button remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">${icon('close')}</button></article>`;
}

function sortValue(state) {
  return state.sortBy === 'default' ? 'default' : `${state.sortBy}-${state.sortOrder}`;
}

function categoryCounts(products, categories) {
  const counts = { all: products.length };
  for (const category of categories) {
    counts[category.id] = products.filter((product) => product.category === category.id).length;
  }
  return counts;
}

function syncActiveNavigation(category) {
  document.querySelectorAll('[data-category]').forEach((link) => {
    if (link.dataset.category === category) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === (category || 'home')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
