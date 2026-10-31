# Design Document: Dedicated Products Page & Browser Console Catalog API

## 1. Intent & Why

ShopBoard users and developers need a fast, direct way to explore, sort, filter, and search through catalog products. Currently, catalog filtering is limited to a basic name search and category filter on the homepage, with no sorting and no developer API exposed in DevTools.

This project delivers:

1. A dedicated, standalone Products page (`#products`) featuring high-contrast category filter buttons, a sort selector, search, item counters, and responsive product cards without the homepage hero banner.
2. An interactive browser console API (`window.shop`) providing developers with programmatic control to search, filter, and sort products while keeping the on-screen UI in sync and returning/logging structured data in DevTools.

## 2. Goals, Non-Goals, and Anti-Goals

### Goals

- Expose a clean, intuitive global API on `window.shop` to sort, filter, and search products from the DevTools console.
- Console methods simultaneously update the visible DOM and return/log formatted output (`console.table`).
- Create a dedicated Products page (`#products` / `#category/:id`) with a top toolbar layout containing category pills with counts, a high-contrast sort selector, live search input, and result summaries.
- Keep the UI controls and console API bidirectionally synchronized (e.g. changing sort in console updates the `<select>` dropdown and vice versa).
- Add a "Products" navigation link in the site header.
- Maintain existing `#home` functionality (curated showcase with hero) and full test compatibility with `scripts/verify-ui.mjs`.
- Adhere strictly to project rules: Semantic HTML, every input has a label, mobile-first with `min-width` media queries, no `!important`, and no broken accessibility/performance.

### Non-Goals

- Modifying checkout or cart logic (existing cart flows remain intact).
- Server-side database integration (ShopBoard is a vanilla client-side SPA with local catalog data).

### Anti-Goals

- No DOM-only scraping or decoupled state that allows the UI and console to drift out of sync.
- No low-contrast controls or hidden inputs violating accessibility standards.

## 3. Constraints & Rules

- **Stack**: Vite (vanilla), HTML5, CSS3, modern ES modules.
- **Rules**:
  - Semantic HTML first.
  - Every input/select has an accessible `<label>`.
  - Mobile-first CSS using `min-width` queries only.
  - No `!important` in CSS stylesheets.
  - Preserve all existing tests and quality checks (`npm run check`, `npm run verify:ui`, `npm run verify:hooks`).

## 4. Approaches Considered

- **Approach 1: Unified State Store & Global Console Bridge (Selected)**:
  - A single state object `{ category, query, sortBy, sortOrder, minPrice, maxPrice }` acts as the single source of truth.
  - Both UI event handlers and `window.shop.*` methods update this state and invoke a unified rendering pipeline.
  - Benefits: Guaranteed consistency, zero drift, easy testing, clean API.
- **Approach 2: Direct DOM Manipulation / Scraping (Rejected)**:
  - Console methods directly hide or reorder DOM elements without updating internal state or UI inputs.
  - Drawbacks: Fragile, inputs desync from state, complex cleanup.

## 5. Specifications

### 5.1 Console API Surface (`window.shop`)

The global `window.shop` object exposes:

- `shop.products`: Read-only array of all 6 products in their original catalogue order.
- `shop.categories`: Read-only array of available categories.
- `shop.search(query: string)`:
  - Sets the search query.
  - Navigates to `#products` if currently on an auth route (`#login`, `#signup`).
  - Updates the UI search input and product grid.
  - Prints matching products with `console.table(results)`.
  - Returns `results` array.
- `shop.filter(criteria: { category?: string, minPrice?: number, maxPrice?: number })`:
  - Filters products by category and/or price range.
  - Navigates to `#products` if currently on an auth route.
  - Updates category pills and UI grid.
  - Prints matching products with `console.table(results)`.
  - Returns `results` array.
- `shop.sort(by: 'price' | 'name' | 'default', order: 'asc' | 'desc' = 'asc')`:
  - Sorts products by price or name in ascending/descending order.
  - Navigates to `#products` if currently on an auth route.
  - Updates the sort `<select>` element in the UI and re-renders the grid.
  - Prints sorted products with `console.table(results)`.
  - Returns `results` array.
- `shop.reset()`:
  - Clears all filters, search terms, and sort orders back to default.
  - Updates UI controls and re-renders full catalogue.
  - Prints reset catalogue with `console.table(results)`.
  - Returns all products.
- `shop.getState()`:
  - Returns a copy of current state: `{ category, query, sortBy, sortOrder, minPrice, maxPrice }`.
- DevTools onboarding notice:
  - When the application boots, logs an informative `console.info()` message listing available `window.shop` methods with examples.

### 5.2 Dedicated Products Page (`#products` & `#category/:id`)

- **Route**: `location.hash === '#products'` or `location.hash.startsWith('#category/')`.
- **Navigation**: Site header main navigation:
  - `Home (#home)`
  - `Products (#products)`
  - `Lifestyle (#category/lifestyle)`
  - `Workspace (#category/workspace)`
  - `Gifts (#category/gifts)`
- **Page Layout**:
  - Breadcrumb / Page Title: `<h1 id="products-page-title">Shop the Collection</h1>` with subtitle and live count: "Showing X finds".
  - **Top Toolbar**:
    - **Category Pills**: "All (6)", "Home (2)", "Lifestyle (2)", "Workspace (1)", "Gifts (1)". Clicking a pill updates the active category and URL hash.
    - **Sort Control**:
      - Label: `<label for="product-sort">Sort by</label>`
      - Select: `<select id="product-sort">` with options:
        - `default`: Featured / Default
        - `price-asc`: Price: Low to High
        - `price-desc`: Price: High to Low
        - `name-asc`: Name: A to Z
        - `name-desc`: Name: Z to A
    - **Search Control**:
      - Label: `<label for="product-search" class="visually-hidden">Search products</label>`
      - Input: `<input id="product-search" type="search" placeholder="Search the collection…">`
    - **Active Filter Summary**: Displays active filter tags (category, search query, price bounds) and a "Clear filters ×" button when filters are active.
  - **Product Grid**: Responsive 1-col (mobile) -> 2-col (tablet) -> 3-col (desktop) grid using existing photo region rendering.
  - **Empty State**: Friendly "No finds just yet" illustration and button to reset filters when 0 results match.

### 5.3 Coexistence with `#home`

- `#home` remains the editorial storefront with the Hero banner, Category Grid cards, "New arrivals" preview grid, benefits section, and newsletter signup.
- Links from `#home` ("Shop the collection", "View all") navigate directly to `#products`.
- Image elements on `#home` and `#products` are rendered with the established photographic clipping mechanism so tests in `scripts/verify-ui.mjs` pass with 100% compliance.

### 5.4 Color Contrast & Styling

- Sort label: `#182c24` (`--ink`), bold weight 600.
- Sort select element: `#ffffff` background, `1.5px solid #182c24` border, `#182c24` text, high contrast focus ring (`var(--rust)`).
- Category pills: Active pill uses `#203f33` (`--green`) background with white text; inactive pills use white background with `#182c24` text and `#dcd7ce` border.
- Mobile-first responsiveness (`@media (min-width: 640px)`, `@media (min-width: 1024px)`).
- Strict adherence to rules: No `!important`, all inputs have labels.
