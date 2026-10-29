import './style.css';

const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  cart: '<path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  leaf: '<path d="M20 3C9 2 2 9 5 16c7 4 15-2 15-13Z"/><path d="M3 22 16 8"/>',
  truck:
    '<path d="M2 5h12v13H2zM14 10h5l3 5v3h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  shield: '<path d="m12 2 9 4v7c0 5-9 9-9 9S3 18 3 13V6z"/><path d="m8 12 3 3 5-6"/>',
  box: '<path d="m12 2 10 5v11l-10 5-10-5V7zM2 7l10 5 10-5M12 12v11M7 4l10 5v6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;

// Clip a shared, eagerly loaded image into the supplied photographic regions.
// Native image elements keep the decoded bitmap available across view changes.
const photo = (x, y, w, h) =>
  `<span class="photo" aria-hidden="true" style="--photo-width:${(1672 / w) * 100}%;--photo-height:${(941 / h) * 100}%;--photo-left:${(-x / w) * 100}%;--photo-top:${(-y / h) * 100}%"><img src="/shopboard-homepage-concept.png" alt="" width="1672" height="941" loading="eager" decoding="sync" draggable="false"/></span>`;
const products = [
  { id: 'mug', name: 'Stoneware Mug', price: 18, category: 'home', image: [126, 549, 221, 121] },
  {
    id: 'planter',
    name: 'Ceramic Planter',
    price: 24,
    category: 'home',
    image: [368, 549, 220, 121],
  },
  {
    id: 'blanket',
    name: 'Linen Throw Blanket',
    price: 56,
    category: 'lifestyle',
    image: [607, 549, 219, 121],
  },
  {
    id: 'bottle',
    name: 'Everyday Water Bottle',
    price: 32,
    category: 'lifestyle',
    image: [847, 549, 218, 121],
  },
  {
    id: 'journal',
    name: 'Notebook Journal',
    price: 20,
    category: 'workspace',
    image: [1086, 549, 217, 121],
  },
  {
    id: 'tray',
    name: 'Oak Catchall Tray',
    price: 34,
    category: 'gifts',
    image: [1326, 549, 219, 121],
  },
];
const categories = [
  { id: 'home', name: 'Home', image: [128, 390, 337, 98] },
  { id: 'lifestyle', name: 'Lifestyle', image: [489, 390, 336, 98] },
  { id: 'workspace', name: 'Workspace', image: [849, 390, 336, 98] },
  { id: 'gifts', name: 'Gifts', image: [1208, 390, 336, 98] },
];
const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
let cart = {};
try {
  const saved = JSON.parse(localStorage.getItem('shopboard-cart') || '{}');
  for (const product of products)
    if (Number.isInteger(saved?.[product.id]) && saved[product.id] > 0 && saved[product.id] <= 99)
      cart[product.id] = saved[product.id];
} catch {
  /* Shopping still works when storage is unavailable. */
}
let activeCategory = '';
let query = '';
let toastTimer;
const app = document.querySelector('#app');
const cartDialog = document.querySelector('#cart-dialog');
const infoDialog = document.querySelector('#info-dialog');

function header(auth = false) {
  return `<div class="announcement">${icon('leaf')}<span>Thoughtfully chosen for a better everyday.<span class="announcement-extra"> &nbsp; A little less ordinary.</span></span></div>
    <header class="site-header"><div class="container header-inner">
      <a class="logo" href="#home" aria-label="ShopBoard home">ShopBoard<span class="logo-dot">.</span></a>
      ${
        auth
          ? '<a class="back-to-shop" href="#home">Back to the shop <span aria-hidden="true">↗</span></a>'
          : `<form class="search-form" role="search"><label class="visually-hidden" for="product-search">Search products</label>${icon('search')}<input id="product-search" name="q" type="search" placeholder="Search for something good…" autocomplete="off"/><button class="visually-hidden" type="submit">Search</button></form>
      <nav class="main-nav" aria-label="Main navigation"><a href="#home" data-nav="home">Home</a><a href="#category/lifestyle" data-nav="lifestyle">Lifestyle</a><a href="#category/workspace" data-nav="workspace">Workspace</a><a href="#category/gifts" data-nav="gifts">Gifts</a></nav>
      <div class="header-actions"><a class="icon-button account-link" href="#login" aria-label="Log in or create an account">${icon('user')}</a><button class="icon-button cart-toggle" type="button" aria-label="Open shopping bag, ${cartCount()} items">${icon('cart')}<span class="cart-count">${cartCount()}</span></button></div>`
      }
    </div></header>`;
}

function footer(auth = false) {
  return `<footer class="site-footer"><div class="container footer-inner"><div><a class="logo footer-logo" href="#home">ShopBoard<span class="logo-dot">.</span></a><p class="copyright">© ${new Date().getFullYear()} ShopBoard. A considered everyday.</p></div>
    <nav aria-label="Footer navigation">${(auth ? ['About', 'Contact', 'Privacy'] : ['About', 'Contact', 'Shipping', 'Returns', 'FAQs']).map((label) => `<button type="button" class="text-button" data-info="${label}">${label}</button>`).join('')}</nav><span class="footer-note">A little more thoughtful. ${icon('leaf')}</span></div></footer>`;
}

function storefront() {
  app.innerHTML = `${header()}<main id="main-content" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-art">${photo(665, 98, 1007, 271)}</div><div class="container hero-inner"><div class="hero-copy"><p class="eyebrow">THE EVERYDAY, WELL CHOSEN</p><h1 id="hero-title">Find something<br/>worth keeping.</h1><p class="hero-subtitle">Curated goods for everyday living.</p><a class="button button-primary" href="#shop">Shop the collection ${icon('arrow')}</a><span class="hero-footnote">Made for your space. Chosen for your life.</span></div></div></section>
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
  app.querySelector('#product-search').value = query;
  app.querySelector('#product-search').addEventListener('input', (event) => {
    query = event.target.value;
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
    renderCart();
    cartDialog.showModal();
  });
  bindInfo();
}

function renderProducts() {
  const matching = products.filter(
    (product) =>
      (!activeCategory || product.category === activeCategory) &&
      product.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
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
  app.querySelector('#products-title').textContent = activeCategory
    ? `${categories.find((category) => category.id === activeCategory).name} essentials`
    : 'New arrivals';
  app.querySelector('.filter-summary').hidden = !activeCategory && !query;
  app.querySelector('#results-description').textContent =
    `${matching.length} ${matching.length === 1 ? 'find' : 'finds'}${query ? ` for “${query}”` : ''}`;
  app.querySelectorAll('[data-category]').forEach((link) => {
    if (link.dataset.category === activeCategory) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  app.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === (activeCategory || 'home')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function clearFilters() {
  activeCategory = '';
  query = '';
  if (location.hash !== '#shop') location.hash = 'shop';
  else {
    app.querySelector('#product-search').value = '';
    renderProducts();
  }
}

function authPage(mode) {
  const signup = mode === 'signup';
  app.innerHTML = `${header(true)}<main id="main-content" class="auth-main" tabindex="-1"><section class="auth-layout" aria-labelledby="auth-title">
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
  bindInfo();
}

function cartCount() {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}
function saveCart() {
  try {
    localStorage.setItem('shopboard-cart', JSON.stringify(cart));
  } catch {
    /* Keep the current session usable. */
  }
  const badge = app.querySelector('.cart-count');
  if (badge) badge.textContent = cartCount();
  app
    .querySelector('.cart-toggle')
    ?.setAttribute('aria-label', `Open shopping bag, ${cartCount()} items`);
}
function addToCart(id) {
  cart[id] = Math.min(99, (cart[id] || 0) + 1);
  saveCart();
  showToast(`${products.find((product) => product.id === id).name} added to your bag`);
}
function showToast(message) {
  const toast = document.querySelector('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}
function renderCart() {
  const items = products.filter((product) => cart[product.id]);
  cartDialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">YOUR GOOD FINDS</p><h2 id="cart-title">Your shopping bag <span>(${cartCount()})</span></h2></div><button class="icon-button close-dialog" type="button" aria-label="Close shopping bag">${icon('close')}</button></div>
    ${items.length ? `<div class="cart-items">${items.map((product) => `<article class="cart-item"><div class="cart-image">${photo(...product.image)}</div><div class="cart-item-info"><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity-controls"><button type="button" data-quantity="${product.id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">−</button><span aria-label="Quantity">${cart[product.id]}</span><button type="button" data-quantity="${product.id}" data-delta="1" aria-label="Increase ${product.name} quantity" ${cart[product.id] >= 99 ? 'disabled' : ''}>+</button></div></div><button type="button" class="text-button remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">${icon('close')}</button></article>`).join('')}</div><div class="cart-total"><span>Subtotal</span><strong>${money(items.reduce((sum, product) => sum + product.price * cart[product.id], 0))}</strong></div><p class="cart-note">This is a preview shop. Checkout and payment are not available yet.</p>` : `<div class="empty-bag">${icon('cart')}<h3>A little room for good things.</h3><p>Your bag is empty. Find something worth keeping.</p></div>`}
    <button type="button" class="button button-green continue-shopping">Continue exploring ${icon('arrow')}</button>`;
  cartDialog.querySelector('.close-dialog').addEventListener('click', () => cartDialog.close());
  cartDialog
    .querySelector('.continue-shopping')
    .addEventListener('click', () => cartDialog.close());
  cartDialog.querySelectorAll('[data-quantity]').forEach((button) =>
    button.addEventListener('click', () => {
      const id = button.dataset.quantity;
      cart[id] += Number(button.dataset.delta);
      if (cart[id] <= 0) delete cart[id];
      saveCart();
      renderCart();
      (
        cartDialog.querySelector(`[data-quantity="${id}"][data-delta="${button.dataset.delta}"]`) ||
        cartDialog.querySelector('.close-dialog')
      ).focus();
    }),
  );
  cartDialog.querySelectorAll('[data-remove]').forEach((button) =>
    button.addEventListener('click', () => {
      delete cart[button.dataset.remove];
      saveCart();
      renderCart();
      cartDialog.querySelector('.close-dialog').focus();
    }),
  );
}
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
function bindInfo() {
  app.querySelectorAll('[data-info]').forEach((button) =>
    button.addEventListener('click', () => {
      infoDialog.innerHTML = `<div class="dialog-heading"><h2 id="info-title">${button.dataset.info}</h2><button class="icon-button" type="button" aria-label="Close">${icon('close')}</button></div><p class="info-copy">${information[button.dataset.info]}</p>`;
      infoDialog.querySelector('button').addEventListener('click', () => infoDialog.close());
      infoDialog.showModal();
    }),
  );
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
  if (cartDialog.open) cartDialog.close();
  if (infoDialog.open) infoDialog.close();
  document.title = auth
    ? `${hash === 'signup' ? 'Create an account' : 'Welcome back'} — ShopBoard`
    : 'ShopBoard — Goods for a better everyday';
  if (auth) {
    authPage(hash);
    window.scrollTo(0, 0);
  } else {
    const id = hash.startsWith('category/') ? hash.split('/')[1] : '';
    activeCategory = categories.some((category) => category.id === id) ? id : '';
    if (hash === 'home') query = '';
    if (app.querySelector('.product-grid')) {
      app.querySelector('#product-search').value = query;
      renderProducts();
    } else {
      storefront();
    }
    if (hash === 'shop' || activeCategory)
      requestAnimationFrame(() =>
        app.querySelector('#products').scrollIntoView({ behavior: 'instant', block: 'start' }),
      );
    else if (hash === 'main-content') app.querySelector('#main-content').focus();
    else window.scrollTo(0, 0);
  }
}
window.addEventListener('hashchange', route);
route();
