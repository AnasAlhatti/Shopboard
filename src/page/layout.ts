import { icon } from '../shared/presentation.ts';
import type { CartSnapshot } from '../cart/cart-store.ts';
import type { ShopActions } from '../types.ts';
import { required } from './dom.ts';

export function header(cartCount: number, auth = false): string {
  return `<div class="announcement">${icon('leaf')}<span>Thoughtfully chosen for a better everyday.<span class="announcement-extra"> &nbsp; A little less ordinary.</span></span></div>
  <header class="site-header"><div class="container header-inner"><a class="logo" href="#home" aria-label="ShopBoard home">ShopBoard<span class="logo-dot">.</span></a>
  ${auth ? '<a class="back-to-shop" href="#home">Back to the shop <span aria-hidden="true">↗</span></a>' : `<form class="search-form" role="search"><label class="visually-hidden" for="global-product-search">Search products</label>${icon('search')}<input id="global-product-search" name="q" type="search" placeholder="Search for something good…" autocomplete="off"/><button class="visually-hidden" type="submit">Search</button></form><nav class="main-nav" aria-label="Main navigation"><a href="#home" data-nav="home">Home</a><a href="#products" data-nav="products">Products</a><a href="#category/lifestyle" data-nav="lifestyle">Lifestyle</a><a href="#category/workspace" data-nav="workspace">Workspace</a><a href="#category/gifts" data-nav="gifts">Gifts</a></nav><div class="header-actions"><a class="icon-button account-link" href="#login" aria-label="Log in or create an account">${icon('user')}</a><button class="icon-button cart-toggle" type="button" aria-label="Open shopping bag, ${cartCount} items">${icon('cart')}<span class="cart-count">${cartCount}</span></button></div>`}</div></header>`;
}

export function footer(auth = false): string {
  const links = auth
    ? ['About', 'Contact', 'Privacy']
    : ['About', 'Contact', 'Shipping', 'Returns', 'FAQs'];
  return `<footer class="site-footer"><div class="container footer-inner"><div><a class="logo footer-logo" href="#home">ShopBoard<span class="logo-dot">.</span></a><p class="copyright">© ${new Date().getFullYear()} ShopBoard. A considered everyday.</p></div><nav aria-label="Footer navigation">${links.map((label) => `<button type="button" class="text-button" data-info="${label}">${label}</button>`).join('')}</nav><span class="footer-note">A little more thoughtful. ${icon('leaf')}</span></div></footer>`;
}

export function syncActiveNavigation(category: string): void {
  document.querySelectorAll<HTMLElement>('[data-category]').forEach((link) => {
    if (link.dataset.category === category) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((link) => {
    if (link.dataset.nav === (category || 'home')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

export function createShopChrome(app: HTMLElement, actions: ShopActions, openCart: () => void) {
  function bind(): void {
    required<HTMLButtonElement>(app, '.cart-toggle').addEventListener('click', openCart);
    required<HTMLFormElement>(app, '.search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      actions.search(required<HTMLInputElement>(app, '#global-product-search').value);
      if (location.hash !== '#products') location.hash = 'products';
    });
  }
  function sync(snapshot: CartSnapshot): void {
    const badge = app.querySelector<HTMLElement>('.cart-count');
    if (badge) badge.textContent = String(snapshot.count);
    app
      .querySelector('.cart-toggle')
      ?.setAttribute('aria-label', `Open shopping bag, ${snapshot.count} items`);
  }
  return { bind, sync };
}
