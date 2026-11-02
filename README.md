# ShopBoard

A vanilla TypeScript and Vite storefront built with semantic HTML, mobile-first CSS,
Flexbox, and Grid.
The storefront, login, and signup views each render one `h1`. Every input has an
associated label. Signup uses native required, email, and minimum-length validation,
plus the browser's constraint-validation API for password confirmation.

## Development

Use a recent Node.js release supported by the installed development tools, then run:

```sh
npm install
npm run dev
```

`npm install` runs `prepare` to install Husky's Git hooks. Run it from a Git checkout
with development dependencies installed.

## Quality checks

| Command                       | Purpose                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `npm run format`              | Apply Prettier formatting                                                          |
| `npm run format:check`        | Check formatting without editing files                                             |
| `npm run lint`                | Run ESLint; errors or warnings fail the check                                      |
| `npm run lint:fix`            | Apply available ESLint fixes                                                       |
| `npm run typecheck`           | Run strict TypeScript checks without emitting files                                |
| `npm run check`               | Check formatting, types, lint, architecture, and the production build              |
| `npm run test`                | Run the catalog, cart, and app coordination tests                                  |
| `npm run verify:architecture` | Enforce module dependency direction and reject circular imports                    |
| `npm run verify:part1`        | Run the complete Part 1 browser acceptance checks                                  |
| `npm run verify:hooks`        | Verify real successful and rejected commits in an isolated test repository         |
| `npm run verify:ui`           | Build, check responsive layouts and forms, and run Lighthouse accessibility audits |

On each normal commit, Husky runs lint-staged against staged files:

- Prettier fixes formatting and stages the corrected content.
- ESLint checks JavaScript and TypeScript files with zero warnings allowed.
- An ESLint error rejects the commit. Unstaged work is preserved by lint-staged.

`verify:hooks` deliberately stages badly formatted TypeScript, commits it through the
real Husky hook, and checks that the committed content is formatted. It then stages
an explicit `any` and verifies that the next commit fails without changing HEAD.
It never stages or commits the main working tree.

## Browser verification

`npm run verify:ui` uses headless Chromium through Playwright. It prefers `CHROME_PATH`,
then an installed Windows Edge or Chrome, then Playwright's Chromium. On another
machine, install Chromium with `npx playwright install chromium` if needed.

The checks cover home, login, and signup at 360, 768, and 1280 pixels:

- Exactly one `h1`, labels for every input, and no horizontal overflow or clipped controls.
- Native signup validation, matching passwords, and password visibility.
- Search, empty search results, category filtering, cart totals, and dialog dismissal.
- Lighthouse accessibility scores of at least 90 for each page on mobile and desktop.

Screenshots, HTML/JSON Lighthouse reports, and hook-test evidence are saved under
`output/quality/`, which is ignored by Git.

## File map

### Application files

- `index.html` provides the application mount point, shared dialogs, metadata, and TypeScript entry.
- `src/main.ts` creates the catalog, cart, page, and app modules before starting the storefront.
- `src/app.ts` coordinates catalog and cart actions with page updates through small module interfaces.
- `src/types.ts` defines only the coordination contracts shared across application modules.
- `src/data/catalog-data.ts` owns the product/category types and immutable shop data.
- `src/catalog/catalog-store.ts` owns DOM-free search, filtering, sorting, and catalog state.
- `src/cart/cart-store.ts` owns the cart types, DOM-free quantities, totals, validation, and persistence.
- `src/page/shop-page.ts` coordinates routes and assembles the page modules.
- `src/page/home-view.ts` owns the home markup, newsletter form, and stable product filtering.
- `src/page/catalog-view.ts` owns the collection markup, filters, sorting controls, and results.
- `src/page/auth-view.ts` owns account markup, password visibility, and form validation.
- `src/page/cart-dialog.ts` owns shopping bag markup, quantity controls, and dialog focus.
- `src/page/info-dialog.ts` owns informational content and its dialog.
- `src/page/layout.ts` owns the shared header/footer, navigation state, and header interactions.
- `src/page/product-card.ts` supplies shared product card markup.
- `src/page/catalog-interactions.ts` shares collection view options and product/filter actions.
- `src/page/dom.ts` supplies required-element queries and dialog backdrop dismissal.
- `src/page/browser.ts` owns browser storage access, toast notifications, and the console bridge.
- `src/shared/presentation.ts` formats icons, sprite-backed images, and currency as pure values.
- `src/style.css` imports ordered style modules from `src/styles/`; feature styles and responsive overrides are kept in separate files.

### Test files

- `tests/catalog.test.mjs` verifies catalog searching, filtering, sorting, combined operations, and reset behavior.
- `tests/cart.test.mjs` verifies cart arithmetic, item removal, clearing, invalid storage, and refresh persistence.
- `tests/app.test.mjs` verifies coordination among the app, stores, and page adapter.

### Verification files

- `scripts/verify-part1.mjs` runs the complete Part 1 behavior checklist in a real browser.
- `scripts/verify-architecture.mjs` enforces TypeScript sources, DOM access inside `src/page/`, dependency direction, and no circular imports.
- `scripts/verify-ui.mjs` checks routes, forms, responsive layouts, image stability, and accessibility.
- `scripts/verify-hooks.mjs` proves that the real pre-commit hook formats valid code and blocks invalid code.

A future wishlist store belongs in `src/wishlist/wishlist-store.ts`; its visible UI belongs in
`src/page/wishlist-view.ts`, and coordination between the two belongs in `src/app.ts`.

## Module rules for future upgrades

`main.ts` composes the application. `app.ts` translates user actions into store changes and page updates.
Feature stores own their types and state; they never import browser views. Page modules receive
actions and snapshots instead of creating or mutating stores themselves. `types.ts` contains
the small coordination contracts shared by the app and page modules.

Keep a view's markup and event handling together so a feature change has one clear home.
Reuse layout and product markup through their existing modules. Browser-specific operations
belong under `src/page/`, and pure formatting belongs in `src/shared/`.

Run `npm run check` and `npm test` after changes; run `npm run verify:part1` and
`npm run verify:ui` when changing routing, views, dialogs, or styles. The architecture check
also inspects type-only imports for cycles, preventing hidden dependencies from spreading.

## Preview functionality

The shopping bag is saved in this browser. Authentication, payments, and newsletter
delivery are not connected to a backend; the forms state this and never save or send
account credentials. The supplied design concept provides the local photographic
sprite; the interface itself is HTML and CSS.
