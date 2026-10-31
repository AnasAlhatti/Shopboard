# Dedicated Products Page & Browser Console Catalog API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated, responsive Products page (`#products`) with clean category pills, search, and a high-contrast sort selector, coupled with a full-featured browser console API (`window.shop`) to sort, filter, and search products with synchronized UI updates and tabular console output.

**Architecture:** A centralized catalog state module (`src/catalog.js`) manages filtering, sorting, and querying. A global bridge binds `window.shop` methods to this engine, simultaneously driving `console.table()` / return values and re-rendering the UI. The SPA router in `src/main.js` adds a dedicated `#products` view while preserving `#home`'s curated showcase and test compatibility.

**Tech Stack:** Vanilla JavaScript (ES modules), Vite, Semantic HTML5, CSS3 (mobile-first `min-width`), Playwright / Node test runner.

**Spec:** [`docs/superpowers/specs/2026-10-30-console-api-and-products-page-design.md`](file:///d:/coding/Core%20Istanbul/Project1/shopboard/docs/superpowers/specs/2026-10-30-console-api-and-products-page-design.md)

## Global Constraints

- Semantic HTML first.
- Every `<input>` and `<select>` element must have an accessible `<label>`.
- Mobile-first CSS with `min-width` media queries only.
- No `!important` in CSS stylesheets.
- Preserve 100% test compatibility with `npm run check`, `npm run verify:ui`, and `npm run verify:hooks`.

## Review Focus

- Case-insensitive search trimming whitespace and matching product titles.
- Multi-criteria filter combinations (category + search query + price range simultaneously).
- Sorting stability across price (asc/desc), name (asc/desc), and default order.
- Two-way sync: console calls (`shop.sort()`, `shop.filter()`) updating UI `<select>` / category pills without breaking DOM node references.
- Auth route auto-redirection: calling `shop.*` from `#login` or `#signup` cleanly transitions to `#products`.

---

### Task 1: Catalog Data Engine & Console API (`src/catalog.js`)

**Files:**

- Create: `src/catalog.js`
- Test: `tests/catalog.test.mjs`

**Interfaces:**

- Produces:
  - `products`: Array of product objects `{ id, name, price, category, image }`
  - `categories`: Array of category objects `{ id, name, image }`
  - `catalogState`: `{ category, query, sortBy, sortOrder, minPrice, maxPrice }`
  - `getFilteredProducts()`: `() => Product[]`
  - `setCategory(category: string): Product[]`
  - `setQuery(query: string): Product[]`
  - `setSort(by: string, order?: string): Product[]`
  - `setPriceRange(min: number | null, max: number | null): Product[]`
  - `resetCatalog(): Product[]`
  - `initConsoleApi(options: { onUpdate?: () => void, onNavigate?: () => void }): void`

- [ ] **Step 1: Write the failing test for the catalog engine and console API**
      Create `tests/catalog.test.mjs` testing `getFilteredProducts`, sorting by price and name, category filtering, search queries, price ranges, and `window.shop` console API methods.

- [ ] **Step 2: Run test to verify it fails**
      Run: `node tests/catalog.test.mjs`
      Expected: FAIL (module `src/catalog.js` does not exist)

- [ ] **Step 3: Implement `src/catalog.js`**
      Implement the product data list, category data, state management functions, query/sorting pipelines, and `initConsoleApi` binding `window.shop` with `console.table()` logging and return arrays.

- [ ] **Step 4: Run test to verify it passes**
      Run: `node tests/catalog.test.mjs`
      Expected: PASS with all catalog query and console API assertions met.

- [ ] **Step 5: Commit**
      `git add src/catalog.js tests/catalog.test.mjs && git commit -m "feat: add catalog data engine and console api"`

---

### Task 2: Dedicated Products Page Layout & Router Integration (`src/main.js`)

**Files:**

- Modify: `src/main.js`
- Modify: `index.html` (if navigation or title adjustments are required)

**Interfaces:**

- Consumes:
  - `src/catalog.js`: `products`, `categories`, `catalogState`, `getFilteredProducts`, `setCategory`, `setQuery`, `setSort`, `setPriceRange`, `resetCatalog`, `initConsoleApi`
- Produces:
  - Dedicated `#products` route view with Top Toolbar (category pills with counts, sort `<select>` with `<label>`, live search input, active filter summary, product grid).
  - Header navigation containing "Products" link pointing to `#products`.
  - Synchronization between `window.shop` updates and on-screen controls.
  - Seamless fallback and coexistence for `#home`.

- [ ] **Step 1: Update router and header navigation**
      Add `#products` link to `header()` navigation (`<a href="#products" data-nav="products">Products</a>`). Add route handling for `#products` and `#category/:id` in `route()`.

- [ ] **Step 2: Implement dedicated `productsPage()` view and unified catalog renderer**
      Build `productsPage()` rendering the clean top toolbar:
- Category filter buttons with dynamic counts: `All (6)`, `Home (2)`, etc.
- Sort dropdown with accessible label `<label for="product-sort">Sort by</label>`.
- Search input with `<label for="product-search" class="visually-hidden">Search products</label>`.
- Filter summary with "Clear filters ×" button.
- Product grid using established photographic clipping markup.
- Bind all UI event listeners to update `catalog` state and sync with `window.shop`.

- [ ] **Step 3: Connect `initConsoleApi` with UI callbacks**
      Initialize `initConsoleApi({ onUpdate: () => renderCurrentView(), onNavigate: () => { location.hash = 'products'; } })`.

- [ ] **Step 4: Verify manual interactive behavior in browser**
      Run Vite dev server or verify through scripts.

- [ ] **Step 5: Commit**
      `git add src/main.js && git commit -m "feat: implement dedicated products page view and router"`

---

### Task 3: Mobile-First Responsive Styles & High-Contrast Controls (`src/style.css`)

**Files:**

- Modify: `src/style.css`

**Interfaces:**

- Consumes:
  - Top Toolbar and Products Page markup classes (`.products-page`, `.catalog-toolbar`, `.category-pills`, `.sort-group`, `.active-filters`, etc.)
- Produces:
  - Clean, warm minimalist styling matching ShopBoard's design tokens.
  - High-contrast sort dropdown (`#182c24` text and border).
  - High-contrast active and inactive category pills.
  - Mobile-first layout (`min-width: 640px` and `min-width: 1024px`).
  - Zero `!important` declarations.

- [ ] **Step 1: Add styling for products page header, toolbar, category pills, and sort controls**
      Write CSS rules for `.products-page`, `.catalog-toolbar`, `.category-pill`, `.sort-group`, `.sort-select`, and `.filter-summary`.

- [ ] **Step 2: Add responsive grid rules using `min-width` media queries**
      Mobile: 1 column. Tablet (`@media (min-width: 640px)`): 2 columns. Desktop (`@media (min-width: 1024px)`): 3 columns.

- [ ] **Step 3: Verify formatting and linter**
      Run: `npm run format:check && npm run lint`
      Expected: PASS (zero lint warnings, prettier format valid).

- [ ] **Step 4: Commit**
      `git add src/style.css && git commit -m "style: add mobile-first styles for dedicated products page and controls"`

---

### Task 4: End-to-End Verification & Quality Audit

**Files:**

- Modify: `scripts/verify-ui.mjs` (add verification for `#products` route, sort dropdown, and console API)
- Run: `npm run check` and `npm run verify:ui`

**Interfaces:**

- Verifies:
  - Full catalog console API (`shop.search`, `shop.filter`, `shop.sort`, `shop.reset`, `shop.getState`).
  - `#products` view accessibility, single `<h1>`, labeled inputs, zero horizontal overflow.
  - Existing `#home`, `#login`, `#signup` test suites.

- [ ] **Step 1: Extend `scripts/verify-ui.mjs`**
      Add `#products` to the verified routes array in `verify-ui.mjs`, and add test assertions testing:

1. Navigating to `#products`.
2. Verifying the sort dropdown reorders products.
3. Executing `page.evaluate(() => window.shop.sort('price', 'asc'))` and verifying the UI sort dropdown and cards update.
4. Executing `page.evaluate(() => window.shop.search('mug'))` and verifying only the mug card is displayed.

- [ ] **Step 2: Run verification suite**
      Run: `npm run check && npm run verify:ui`
      Expected: PASS (all format, lint, build, accessibility, and UI checks succeed).

- [ ] **Step 3: Commit**
      `git add scripts/verify-ui.mjs && git commit -m "test: add e2e tests for products page and window.shop console api"`
