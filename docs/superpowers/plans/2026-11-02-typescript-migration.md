# TypeScript Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish ShopBoard's strict TypeScript migration without changing application behavior or architecture.

**Architecture:** A shared type module defines domain data and the interfaces between the DOM-free stores, app coordinator, and page adapter. Existing closure-based modules keep their responsibilities; TypeScript, ESLint, tests, and architecture verification are updated around those boundaries.

**Tech Stack:** TypeScript 6, Vite 8, vanilla HTML/CSS, ESLint 10, Node 26 tests, Playwright verification

**Spec:** `docs/superpowers/specs/2026-11-02-typescript-migration-design.md`

## Global Constraints

- Preserve all current storefront behavior, copy, layout, routes, persistence, and console API behavior.
- Keep catalog and cart modules DOM-free; only `src/page/shop-page.ts` may access browser page/DOM APIs.
- Use strict TypeScript without project-wide `any`, `@ts-ignore`, or disabled strict compiler checks.
- Preserve semantic HTML, labels for every input, mobile-first CSS, and the prohibition on `!important`.
- Do not add a framework, runtime validation dependency, or unrelated refactor.

## Review Focus

- Missing required DOM nodes must fail at page startup with a useful error instead of producing a distant null-access failure; verify through typed required-query helpers and the production build.
- Persisted cart JSON may be malformed or contain unknown values; retain the existing empty/validated-cart behavior in `tests/cart.test.mjs`.
- Public filters and sorts may receive omitted criteria/default order; preserve defaults in `tests/catalog.test.mjs` and strict signatures.
- Event targets may not be the expected element type; narrow current targets before reading `value` or `dataset`, confirmed by strict type checking.
- The `window.shop` API must remain available to browser verification with its exact search/filter/sort/reset/state behavior.

---

### Task 1: Establish the strict TypeScript boundary

**Files:**

- Create: `tsconfig.json`
- Create: `src/types.ts`
- Modify: `package.json`
- Modify: `eslint.config.js`
- Modify: `.prettierrc.json` only if TypeScript formatting needs an explicit override

**Interfaces:**

- Produces: `Product`, `Category`, `CatalogState`, `CatalogFilter`, `SortBy`, `SortOrder`, `CartItem`, `CartSnapshot`, `StorageAdapter`, `CatalogStore`, `CartStore`, `ShopModel`, `ShopActions`, `ConsoleApi`, and `ShopPage`.

- [ ] **Step 1: Add a strict type-check command that initially exposes untyped source boundaries**

Add `typecheck: tsc --noEmit` and include it in `check`; run `npm.cmd run typecheck` and confirm it fails on implicit types and unsafe access in the current `.ts` files.

- [ ] **Step 2: Add `tsconfig.json`**

Configure ESNext modules, Vite/bundler resolution, browser DOM libraries, `noEmit`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and source inclusion for `src/**/*.ts`.

- [ ] **Step 3: Define shared contracts in `src/types.ts`**

Use readonly domain arrays/records at public boundaries and exact method signatures matching current runtime behavior. Keep types erasable so Node 26 can execute imported `.ts` modules in tests.

- [ ] **Step 4: Teach ESLint and lint-staged about `.ts` files**

Cover `src/**/*.ts` with browser globals only where appropriate and include `ts` in the staged source extension pattern without changing the Node configuration for scripts/tests.

- [ ] **Step 5: Run configuration checks**

Run `npm.cmd run format:check` and `npm.cmd run lint`; expect configuration to load successfully, with remaining source type errors deferred to the next tasks.

### Task 2: Type the domain data and DOM-free stores

**Files:**

- Modify: `src/data/catalog-data.ts`
- Modify: `src/catalog/catalog-store.ts`
- Modify: `src/cart/cart-store.ts`
- Modify: `tests/catalog.test.mjs`
- Modify: `tests/cart.test.mjs`

**Interfaces:**

- Consumes: domain/store contracts from `src/types.ts`.
- Produces: `createCatalogStore(products, categories): CatalogStore`, `createCartStore(products, storage): CartStore`, and immutable typed `products`/`categories` collections.

- [ ] **Step 1: Point store tests at `.ts` modules and run them**

Update imports only, then run `npm.cmd test`; confirm Node reaches the TypeScript sources and failures identify the unfinished typed migration rather than missing `.js` modules.

- [ ] **Step 2: Type immutable catalog data and presentation coordinates**

Annotate product/category collections and their image tuples while preserving every value and `Object.freeze` behavior.

- [ ] **Step 3: Type catalog state transitions**

Apply `CatalogFilter`, `SortBy`, and `SortOrder` to search/filter/sort/reset operations; retain case-insensitive search, combined filtering, defensive state snapshots, and default sorting.

- [ ] **Step 4: Type cart persistence and snapshots**

Type the storage adapter, quantity record, JSON narrowing, change/remove/clear methods, and cart items while retaining maximum quantity and invalid-storage handling.

- [ ] **Step 5: Verify the stores**

Run `npm.cmd test` and `npm.cmd run typecheck`; expect store tests to pass and remaining compiler errors to be isolated to app/page/presentation modules.

### Task 3: Type application coordination and presentation helpers

**Files:**

- Modify: `src/app.ts`
- Modify: `src/shared/presentation.ts`
- Modify: `tests/app.test.mjs`

**Interfaces:**

- Consumes: `CatalogStore`, `CartStore`, `ShopPage`, image tuples, and shared domain contracts.
- Produces: `createApp({ catalog, cart, page })`, typed `ShopActions`, typed `ConsoleApi`, `icon(name): string`, `photo(...): string`, and `money(value): string`.

- [ ] **Step 1: Update the app test import and fixtures for the strict public contract**

Keep the same coordination assertions while making fixture objects structurally complete for the public interfaces.

- [ ] **Step 2: Type the coordinator's model, update wrapper, actions, and console API**

Preserve category navigation validation, page synchronization, toast behavior, and console-table return values.

- [ ] **Step 3: Type presentation helpers**

Use an explicit icon-name key union and a fixed four-number image tuple while retaining the arrow fallback for unknown runtime input at the external boundary.

- [ ] **Step 4: Verify coordination**

Run `npm.cmd test` and `npm.cmd run typecheck`; expect app/store tests to pass with remaining errors only in the page adapter or entry point.

### Task 4: Type the page adapter and browser entry

**Files:**

- Modify: `src/page/shop-page.ts`
- Modify: `src/main.ts`
- Modify: `index.html`

**Interfaces:**

- Consumes: `Product`, `Category`, `CartSnapshot`, `ShopModel`, `ShopActions`, and `ConsoleApi`.
- Produces: `createShopPage({ products, categories }): ShopPage`, `browserStorage: StorageAdapter`, and the global `Window.shop: ConsoleApi` declaration.

- [ ] **Step 1: Add typed required/optional DOM query helpers**

Required selectors return the requested element subtype or throw a selector-specific startup error; optional selectors remain nullable and are checked before use.

- [ ] **Step 2: Type page state, render methods, templates, and helpers**

Annotate model/action lifecycle, dialogs, timers, product renderers, category counts, information keys, sort values, and all return types without changing generated markup.

- [ ] **Step 3: Narrow browser event targets**

Type submit/click/input/change handlers through `currentTarget` or explicit element guards before reading `value`, `dataset`, dialog methods, validity, or focus behavior.

- [ ] **Step 4: Declare and install the browser console API**

Augment `Window` with `shop: ConsoleApi` and preserve the existing help text and runtime assignment.

- [ ] **Step 5: Correct the Vite entry and composition imports**

Reference `/src/main.ts` from `index.html`; ensure source imports resolve consistently under the chosen TypeScript/Vite module strategy.

- [ ] **Step 6: Verify strict compilation and production bundling**

Run `npm.cmd run typecheck` and `npm.cmd run build`; expect both to pass with no emitted TypeScript artifacts outside Vite's `dist` output.

### Task 5: Align architecture enforcement and documentation

**Files:**

- Modify: `scripts/verify-architecture.mjs`
- Modify: `scripts/verify-hooks.mjs`
- Modify: `README.md`

**Interfaces:**

- Consumes: the final `.ts` source layout and npm quality commands.
- Produces: architecture verification that scans TypeScript and documentation that accurately maps the repository.

- [ ] **Step 1: Make the architecture verifier scan `.ts` files**

Rename its traversal concept from JavaScript to source/TypeScript, allow only `src/page/shop-page.ts` to contain DOM tokens, and preserve the existing violation report.

- [ ] **Step 2: Extend hook verification to TypeScript**

Use a `.ts` fixture for successful formatting and a TypeScript source fixture for the deliberate lint rejection while preserving isolated-repository behavior.

- [ ] **Step 3: Update README commands and file map**

Document `typecheck`, the expanded `check` command, `.ts` source paths, TypeScript architecture enforcement, and future wishlist `.ts` locations.

- [ ] **Step 4: Run focused tooling checks**

Run `npm.cmd run verify:architecture`, `npm.cmd run verify:hooks`, and `npm.cmd run format:check`; expect all to pass.

### Task 6: Full regression verification

**Files:**

- Modify only files required to correct migration-caused verification failures.

**Interfaces:**

- Consumes: the completed strict TypeScript application.
- Produces: evidence that the migration preserved application behavior.

- [ ] **Step 1: Run the standard quality gate**

Run `npm.cmd run check`; expect formatting, type checking, linting, and Vite build to pass.

- [ ] **Step 2: Run unit and architecture verification**

Run `npm.cmd test` and `npm.cmd run verify:architecture`; expect all catalog/cart/app assertions and the single-DOM-adapter rule to pass.

- [ ] **Step 3: Run browser acceptance verification**

Run `npm.cmd run verify:part1`; expect catalog, cart persistence, console API, and browser-error checks to pass.

- [ ] **Step 4: Run responsive/accessibility verification**

Run `npm.cmd run verify:ui`; expect mobile/tablet/desktop layout, form labeling, image stability, interaction, and Lighthouse checks to pass. Report any machine-specific browser limitation distinctly.

- [ ] **Step 5: Review the final diff**

Confirm there are no behavior, markup, CSS, asset, or dependency changes outside the approved migration and documentation scope.
