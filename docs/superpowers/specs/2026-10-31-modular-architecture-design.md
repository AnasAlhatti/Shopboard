# ShopBoard Modular Architecture Design

## Intent

Refactor ShopBoard so every production module has one clear responsibility, modules communicate through imports and exports, and all DOM access is localized in one page module. The structure should be understandable to a new contributor and provide an obvious home for future features such as a wishlist.

## Goals

- Keep product and category data in a data module.
- Keep catalog search, filtering, and sorting in a DOM-free catalog module.
- Keep cart state, arithmetic, validation, and persistence in a DOM-free cart module.
- Put all production DOM reads, writes, event binding, dialogs, routing, history, and browser-global integration in one page module.
- Use an app module to coordinate catalog and cart state with the page through a small interface.
- Keep `main.js` as the minimal composition/startup entry point.
- Document every production file in one sentence and identify the future wishlist location.
- Preserve every Part 1 behavior and pass the real pre-commit hook verification.

## Non-goals

- Add wishlist behavior now.
- Change the visual design, routes, catalog behavior, cart behavior, authentication preview, or newsletter preview.
- Introduce a framework, state-management library, or build dependency.
- Force test and verification scripts to avoid browser globals; the one-DOM-file rule applies to production files under `src`.

## Constraints

- Vite with vanilla HTML, CSS, and JavaScript.
- Semantic HTML, labeled inputs, mobile-first CSS, no `!important`, and clean architecture.
- Only one file under `src` may reference DOM/browser page globals or methods such as `document`, `window`, `location`, `history`, `querySelector`, `innerHTML`, or `addEventListener`.
- Existing Part 1 browser acceptance checks remain the behavioral contract.

## Approaches considered

### Selected: feature logic plus one page adapter

Keep `data`, `catalog`, and `cart` as DOM-free feature modules; centralize templates and DOM behavior in `page/shop-page.js`; coordinate state and user intents in `app.js`; start everything in `main.js`. This directly satisfies the class-style structure, gives browser behavior one searchable home, and leaves a clear `wishlist/` feature location.

### Rejected: one DOM adapter per feature

Separate catalog, cart, and dialog view modules would improve feature locality, but multiple files would touch the DOM and fail the explicit Part 2 check.

### Rejected: keep `main.js` as the page file

Moving only dialog code into `main.js` would technically create one DOM file, but it would preserve the current mixture of startup, coordination, templates, routing, and event handling. A new contributor would still struggle to find the right home for changes.

## Module design

- `src/data/catalog-data.js`: exports immutable product and category definitions.
- `src/catalog/catalog-store.js`: owns catalog state and exposes search, category, price, sort, reset, snapshot, and result operations without browser globals.
- `src/cart/cart-store.js`: owns cart quantities, totals, validation, and persistence behind its existing small store interface.
- `src/page/shop-page.js`: the sole production DOM adapter; renders all routes and dialogs, binds events, updates visible state, owns hash/history behavior, and exposes user-intent callbacks to the app.
- `src/app.js`: coordinates the catalog store, cart store, and page adapter; translates page intents into state changes and tells the page what to render.
- `src/main.js`: imports dependencies, creates the modules, and starts the app.
- `src/shared/presentation.js`: provides pure string/value formatting helpers for icons, photos, and money without reading or changing the DOM.
- `src/style.css`: contains all presentation rules.
- `src/wishlist/`: reserved documented location for a future DOM-free wishlist store; wishlist UI would be added through `shop-page.js` and coordinated by `app.js`.

Existing `layout/site-layout.js`, `dialogs/info-dialog.js`, and `cart/cart-dialog.js` will be removed after their pure templates and DOM behavior are absorbed into `shop-page.js`. The root `src/catalog.js` compatibility module will be replaced by the feature-located catalog store, and its browser console helper will move into the page adapter because assigning `window.shop` is page integration.

## Interfaces and data flow

`main.js` constructs the catalog store and cart store, creates the page adapter with callback hooks, and passes all three to `createApp`. The app owns orchestration: a page intent such as `addToCart(id)` calls the cart store, then passes a fresh snapshot to the page. The page never changes domain state directly. Stores never import the page.

The page adapter receives render-ready catalog and cart snapshots and exposes a compact interface such as `start`, `render`, `renderCart`, `syncCart`, and `showToast`. Exact method names may be reduced during planning; the seam must keep state ownership out of the DOM implementation.

The console helper remains supported. Its methods delegate to the app/catalog interface, while only `shop-page.js` assigns the helper to `window.shop`.

## Verification

- Search `src` for DOM/browser globals and confirm only `src/page/shop-page.js` matches, except allowed non-DOM language/platform utilities such as `Intl` and injected `globalThis.localStorage` defaults if retained; preferably inject storage from `main.js` so even browser storage access is isolated.
- Run cart and catalog tests against the new module locations and interfaces.
- Run `npm run verify:part1` for all Part 1 acceptance behavior and Console cleanliness.
- Run `npm run check` for formatting, lint, and production build.
- Run `npm run verify:hooks` to prove a real valid commit passes and an invalid one is rejected in its isolated repository.
- Update README with a one-sentence file map and the wishlist extension path.

## Builder decisions

- The one-DOM-file rule applies to production files under `src`; browser verification scripts are excluded.
- No empty wishlist implementation will be created. README will state that future wishlist state belongs in `src/wishlist/wishlist-store.js`, with UI in the page adapter and coordination in `app.js`.
- Existing CSS selectors and visible markup will remain stable wherever practical to minimize behavioral and visual risk.
