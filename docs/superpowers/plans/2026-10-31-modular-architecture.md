# ShopBoard Modular Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ShopBoard into focused data, catalog, cart, page, app, and startup modules with exactly one production file touching the DOM.

**Architecture:** DOM-free feature stores own catalog and cart state. `src/page/shop-page.js` is the sole browser/DOM adapter, `src/app.js` coordinates user intents and state snapshots, and `src/main.js` only composes and starts the modules.

**Tech Stack:** Vite, vanilla JavaScript ES modules, semantic HTML, mobile-first CSS, Node assertions, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-modular-architecture-design.md`

## Global Constraints

- Preserve every Part 1 behavior and visible route.
- Only `src/page/shop-page.js` may use DOM/browser page globals or DOM methods under `src`.
- Keep every input labeled, semantic HTML first, mobile-first CSS, and no `!important`.
- Add no framework, state-management package, or build dependency.
- Give every production file one responsibility and document it in one sentence.

## Review Focus

- Invalid saved cart data must still load as an empty cart; keep the cart storage regression assertions in Task 1.
- Default sorting after previous sorting must restore source data order; add the explicit reset-order assertion in Task 1.
- Re-rendering or changing filters repeatedly must not duplicate event effects; `verify:part1` pins one-click/one-item behavior in Task 3.
- Hash navigation among storefront, catalog, and auth routes must preserve current visible behavior; existing `verify:ui` route checks cover Task 3.
- Browser storage or Console integration must not leak DOM/browser globals into feature modules; the architecture search in Task 2 rejects those references.

---

### Task 1: DOM-free feature stores

**Files:**

- Create: `src/catalog/catalog-store.js`
- Modify: `src/data/catalog-data.js`
- Modify: `src/cart/cart-store.js`
- Modify: `tests/catalog.test.mjs`
- Modify: `tests/cart.test.mjs`
- Delete after callers migrate: `src/catalog.js`

**Interfaces:**

- Consumes: catalog arrays from `src/data/catalog-data.js`; injected storage adapter with `getItem` and `setItem`.
- Produces: `createCatalogStore(products, categories)` with `getState()`, `getResults()`, `search(term)`, `filter(criteria)`, `sort(by, order)`, and `reset()`; existing `createCartStore(products, storage)` interface with `getSnapshot()`, `add(id)`, `change(id, delta)`, `remove(id)`, and `clear()`.

- [ ] **Step 1: Rewrite the catalog test against the wished-for store interface**

Assert case-insensitive name search, category filtering, ascending/descending sorting, default source order restoration, combined operations, reset, and immutable state snapshots.

- [ ] **Step 2: Run the catalog test and verify RED**

Run: `node tests/catalog.test.mjs`
Expected: FAIL because `src/catalog/catalog-store.js` or `createCatalogStore` does not exist.

- [ ] **Step 3: Implement `createCatalogStore(products, categories)`**

Keep mutable catalog state private, derive results from the injected source order, return fresh state/results, and perform no logging or browser integration.

- [ ] **Step 4: Keep cart tests storage-injected and confirm edge cases**

Retain assertions for duplicate quantities, decrement-to-removal, individual removal, clearing, exact totals, invalid stored values, and reload persistence.

- [ ] **Step 5: Run both store tests and verify GREEN**

Run: `node tests/catalog.test.mjs; node tests/cart.test.mjs`
Expected: both print their success messages and exit 0.

### Task 2: Single page adapter and architecture guard

**Files:**

- Create: `src/page/shop-page.js`
- Create: `scripts/verify-architecture.mjs`
- Modify: `package.json`
- Delete: `src/cart/cart-dialog.js`
- Delete: `src/dialogs/info-dialog.js`
- Delete: `src/layout/site-layout.js`
- Modify: `src/shared/presentation.js` only if pure template helpers need moving; it must remain DOM-free.

**Interfaces:**

- Consumes: render models containing catalog state/results, cart snapshots, products, categories, and callback functions for user intents.
- Produces: `createShopPage({ products, categories, actions })` with `start(model)`, `render(model)`, `renderCart(snapshot)`, `syncCart(snapshot)`, `showToast(message)`, and `installConsoleApi(api)`; exact render methods may collapse if the resulting interface is smaller while meeting all callers.

- [ ] **Step 1: Write the architecture verification script**

Scan JavaScript files under `src` and fail if any file except `src/page/shop-page.js` contains production DOM/browser tokens: `document`, `window`, `location`, `history`, `localStorage`, `querySelector`, `innerHTML`, `addEventListener`, `showModal`, or `.close(`.

- [ ] **Step 2: Run the architecture check and verify RED**

Run: `node scripts/verify-architecture.mjs`
Expected: FAIL listing current DOM access in `main.js`, `cart-dialog.js`, and `info-dialog.js`.

- [ ] **Step 3: Move all templates and page behavior into `shop-page.js`**

Move storefront, product, auth, header, footer, cart-dialog, info-dialog, routing, history, event binding, toast, and visible synchronization behavior without changing current selectors or copy.

- [ ] **Step 4: Add `verify:architecture` to `package.json`**

Command: `node scripts/verify-architecture.mjs`.

- [ ] **Step 5: Run the architecture check and verify GREEN**

Run: `npm.cmd run verify:architecture`
Expected: PASS naming `src/page/shop-page.js` as the only DOM file.

### Task 3: App coordinator and composition root

**Files:**

- Create: `src/app.js`
- Modify: `src/main.js`
- Modify: `scripts/verify-part1.mjs` only for import/selector compatibility if necessary.
- Modify: `scripts/verify-ui.mjs` only for import/selector compatibility if necessary.

**Interfaces:**

- Consumes: catalog store, cart store, page adapter.
- Produces: `createApp({ catalog, cart, page, products })` with `start()` and a console interface containing `products`, `categories`, `search`, `filter`, `sort`, `reset`, and `getState`.

- [ ] **Step 1: Add an app coordination test**

Create `tests/app.test.mjs` with small fake store/page adapters; assert one add intent calls the cart once, passes the new snapshot to the page once, catalog operations pass fresh render models, and `start()` installs the console interface.

- [ ] **Step 2: Run the app test and verify RED**

Run: `node tests/app.test.mjs`
Expected: FAIL because `createApp` does not exist.

- [ ] **Step 3: Implement `createApp` and reduce `main.js` to composition**

`main.js` imports CSS/data/factories, injects `globalThis.localStorage` into the cart store, constructs modules, and calls `app.start()`; it performs no DOM work.

- [ ] **Step 4: Run unit and acceptance verification**

Run: `node tests/app.test.mjs; node tests/catalog.test.mjs; node tests/cart.test.mjs; npm.cmd run verify:part1`
Expected: all unit success messages and all twelve Part 1 browser checks pass with no Console errors.

- [ ] **Step 5: Run responsive UI verification**

Run: `npm.cmd run verify:ui`
Expected: route/layout/form checks pass and every Lighthouse accessibility score is at least 90.

### Task 4: Documentation and commit-hook proof

**Files:**

- Modify: `README.md`
- Modify: `package.json` if aggregate checks need the new architecture/app tests.
- Verify: `.husky/pre-commit`

**Interfaces:**

- Consumes: final file structure and verification commands.
- Produces: a one-sentence production file map and explicit wishlist extension guidance.

- [ ] **Step 1: Add the one-sentence file map to README**

Describe `catalog-data.js`, `catalog-store.js`, `cart-store.js`, `shop-page.js`, `app.js`, `main.js`, `presentation.js`, and `style.css` in one sentence each.

- [ ] **Step 2: Document the wishlist extension path**

State: future wishlist state belongs in `src/wishlist/wishlist-store.js`, wishlist DOM belongs in `src/page/shop-page.js`, and coordination belongs in `src/app.js`.

- [ ] **Step 3: Run complete verification with fail-fast exit handling**

Run: `npm.cmd run check`, all Node tests, `npm.cmd run verify:architecture`, and `npm.cmd run verify:part1`.
Expected: every command exits 0.

- [ ] **Step 4: Prove the real hook behavior**

Run: `npm.cmd run verify:hooks`
Expected: the isolated valid commit succeeds, the deliberately invalid commit is blocked, and the command exits 0.

- [ ] **Step 5: Create the Part 2 commit through the real pre-commit hook**

Stage only Part 2 architecture, tests, verification, design/plan, and documentation files; commit with `refactor: modularize shop architecture` and confirm the hook exits 0. Do not stage unrelated user changes.

- [ ] **Step 6: Review the committed diff and explain the result**

Confirm the commit contains only intended files, rerun `git status --short`, and provide a one-sentence explanation for every production file plus the location for a future wishlist.
