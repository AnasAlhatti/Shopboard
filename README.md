# ShopBoard

ShopBoard is a vanilla TypeScript and Vite storefront with a responsive home page, searchable and filterable product catalog, shopping cart, and login/signup screens. Its visual system follows the handmade marketplace direction in [marketnest-DESIGN.md](marketnest-DESIGN.md).

## Start the app

```sh
npm install
npm run dev
```

## Project checks

| Command                | Purpose                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `npm run check`        | Check formatting, strict TypeScript, lint, architecture rules, and production build.    |
| `npm test`             | Run catalog, cart, route, and app coordination unit checks without requiring a browser. |
| `npm run test:startup` | Run the page startup check with Playwright's installed Chromium browser.                |
| `npm run verify:ui`    | Check page behavior, responsive layouts, forms, and accessibility.                      |
| `npm run verify:part1` | Run the storefront behavior acceptance checks.                                          |
| `npm run verify:hooks` | Check that the commit hook formats valid changes and rejects invalid TypeScript.        |

Husky runs lint-staged on commit; lint-staged formats staged files with Prettier and checks staged TypeScript with ESLint.

## Code map

Each code file is listed below with its responsibility in one sentence.

### Application and page code

| File                      | Responsibility                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `index.html`              | Defines the document metadata, app mount point, dialogs, toast region, and TypeScript entry point. |
| `src/main.ts`             | Creates the catalog and cart stores, connects the page adapter, and starts the app.                |
| `src/app.ts`              | Connects navigation, catalog actions, cart change events, and page updates.                        |
| `src/app.types.ts`        | Defines the contracts shared by app coordination and page rendering.                               |
| `src/page/shop-page.ts`   | Builds the page adapter that renders routes, connects UI actions, and synchronizes updates.        |
| `src/page/routes.ts`      | Parses hash routes into typed home, catalog, category, authentication, or unknown route values.    |
| `src/page/layout.ts`      | Renders shared navigation and footer markup and connects the shared cart and search controls.      |
| `src/page/console-api.ts` | Exposes the typed `window.shop` interface for inspecting and controlling catalog state.            |

### Feature modules

| File                                  | Responsibility                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/products/catalog.ts`     | Defines product and catalog types, local records, and catalog search, filtering, sorting, and reset behavior.                           |
| `src/modules/products/products.ui.ts` | Renders the home and catalog views and binds their product, search, sorting, and filter controls.                                       |
| `src/modules/cart/cart.ts`            | Defines cart types and actions, calculates cart totals, persists changes through its adapter, and announces item additions and updates. |
| `src/modules/cart/cart.storage.ts`    | Reads and validates persisted cart data through a storage adapter.                                                                      |
| `src/modules/cart/cart.ui.ts`         | Renders the shopping cart dialog and binds its quantity, removal, and clear controls.                                                   |
| `src/modules/auth/auth.ui.ts`         | Renders login and signup forms, preserves the account story image proportions, and handles client-side validation and feedback.         |

### Shared code and styles

| File                           | Responsibility                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/shared/dom.ts`            | Provides typed DOM lookup helpers used by page and feature views.                                  |
| `src/shared/presentation.ts`   | Provides inline icons, standard and aspect-preserving sprite image crops, and currency formatting. |
| `src/shared/ui/toast.ts`       | Displays temporary status messages in the shared toast region.                                     |
| `src/shared/ui/info-dialog.ts` | Renders and controls the shared informational dialog.                                              |
| `src/style.css`                | Imports the base, storefront, catalog, footer, auth, dialog, and responsive styles.                |
| `src/styles/base.css`          | Defines design tokens, global element styles, focus states, and common layout utilities.           |
| `src/styles/storefront.css`    | Styles shared navigation, the home page, product cards, and collection content.                    |
| `src/styles/catalog.css`       | Styles the catalog title, filters, product grid, and pagination.                                   |
| `src/styles/responsive.css`    | Applies the mobile-first layout changes at wider breakpoints and reduced-motion preferences.       |
| `src/styles/footer.css`        | Styles the benefits section, newsletter, and site footer.                                          |
| `src/styles/auth.css`          | Styles authentication layouts, fields, tabs, and validation feedback.                              |
| `src/styles/dialogs.css`       | Styles the cart and informational dialogs, backdrops, and toast presentation.                      |

### Verification code

| File                              | Responsibility                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `tests/catalog.test.mjs`          | Checks catalog query, filter, sorting, and reset behavior.                                  |
| `tests/cart.test.mjs`             | Checks cart arithmetic, item changes, storage validation, and persistence.                  |
| `tests/routes.test.mjs`           | Checks shared parsing for home, catalog, category, authentication, and unknown routes.      |
| `tests/app.test.mjs`              | Checks coordination between app actions, stores, and page updates.                          |
| `tests/page-startup.test.mjs`     | Checks that the app starts and reports unexpected page errors.                              |
| `scripts/verify-ui.mjs`           | Checks the storefront’s routes, interactions, responsive layouts, forms, and accessibility. |
| `scripts/verify-part1.mjs`        | Checks the storefront’s required end-to-end behaviors.                                      |
| `scripts/verify-hooks.mjs`        | Checks formatting and lint enforcement through the configured commit hook.                  |
| `scripts/verify-architecture.mjs` | Enforces feature ownership, dependency direction, and import-cycle rules.                   |

### Configuration code

| File                | Responsibility                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `package.json`      | Declares project commands, dependencies, staged-file hook behavior, and a separate optional browser startup check. |
| `tsconfig.json`     | Enables strict TypeScript checking for application source without emitting build files.                            |
| `eslint.config.js`  | Configures JavaScript and TypeScript lint rules, including restrictions on unsafe typing.                          |
| `.prettierrc.json`  | Configures the project’s shared formatting conventions.                                                            |
| `.husky/pre-commit` | Runs lint-staged before each commit to format and lint staged code.                                                |

## Assets

The site uses `public/shopboard-homepage-concept.webp` as its compressed product and category image sprite and `public/favicon.svg` as its browser icon; unused duplicate and starter images are excluded.

## Current limits

The catalog uses local sample data; authentication, payments, and newsletter delivery do not connect to a backend.
