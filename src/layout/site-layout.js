import { icon } from '../shared/presentation.js';

export function header(cartCount, auth = false) {
  return `<div class="announcement">${icon('leaf')}<span>Thoughtfully chosen for a better everyday.<span class="announcement-extra"> &nbsp; A little less ordinary.</span></span></div>
    <header class="site-header"><div class="container header-inner">
      <a class="logo" href="#home" aria-label="ShopBoard home">ShopBoard<span class="logo-dot">.</span></a>
      ${
        auth
          ? '<a class="back-to-shop" href="#home">Back to the shop <span aria-hidden="true">↗</span></a>'
          : `<form class="search-form" role="search"><label class="visually-hidden" for="global-product-search">Search products</label>${icon('search')}<input id="global-product-search" name="q" type="search" placeholder="Search for something good…" autocomplete="off"/><button class="visually-hidden" type="submit">Search</button></form>
      <nav class="main-nav" aria-label="Main navigation"><a href="#home" data-nav="home">Home</a><a href="#products" data-nav="products">Products</a><a href="#category/lifestyle" data-nav="lifestyle">Lifestyle</a><a href="#category/workspace" data-nav="workspace">Workspace</a><a href="#category/gifts" data-nav="gifts">Gifts</a></nav>
      <div class="header-actions"><a class="icon-button account-link" href="#login" aria-label="Log in or create an account">${icon('user')}</a><button class="icon-button cart-toggle" type="button" aria-label="Open shopping bag, ${cartCount} items">${icon('cart')}<span class="cart-count">${cartCount}</span></button></div>`
      }
    </div></header>`;
}

export function footer(auth = false) {
  return `<footer class="site-footer"><div class="container footer-inner"><div><a class="logo footer-logo" href="#home">ShopBoard<span class="logo-dot">.</span></a><p class="copyright">© ${new Date().getFullYear()} ShopBoard. A considered everyday.</p></div>
    <nav aria-label="Footer navigation">${(auth ? ['About', 'Contact', 'Privacy'] : ['About', 'Contact', 'Shipping', 'Returns', 'FAQs']).map((label) => `<button type="button" class="text-button" data-info="${label}">${label}</button>`).join('')}</nav><span class="footer-note">A little more thoughtful. ${icon('leaf')}</span></div></footer>`;
}
