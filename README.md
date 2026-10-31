# ShopBoard

A vanilla Vite storefront built with semantic HTML, mobile-first CSS, Flexbox, and Grid.
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
| `npm run check`               | Check formatting, lint, and build for production                                   |
| `npm run test`                | Run the catalog, cart, and app coordination tests                                  |
| `npm run verify:architecture` | Confirm that only the page adapter touches the DOM                                 |
| `npm run verify:part1`        | Run the complete Part 1 browser acceptance checks                                  |
| `npm run verify:hooks`        | Verify real successful and rejected commits in an isolated test repository         |
| `npm run verify:ui`           | Build, check responsive layouts and forms, and run Lighthouse accessibility audits |

On each normal commit, Husky runs lint-staged against staged files:

- Prettier fixes formatting and stages the corrected content.
- ESLint checks JavaScript files with zero warnings allowed.
- An ESLint error rejects the commit. Unstaged work is preserved by lint-staged.

`verify:hooks` deliberately stages badly formatted JavaScript, commits it through the
real Husky hook, and checks that the committed content is formatted. It then stages
an undefined variable and verifies that the next commit fails without changing HEAD.
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

- `index.html` provides the application mount point, shared dialogs, metadata, and JavaScript entry.
- `src/main.js` creates the catalog, cart, page, and app modules before starting the storefront.
- `src/app.js` coordinates catalog and cart actions with page updates through small module interfaces.
- `src/data/catalog-data.js` defines the immutable products and categories used by the shop.
- `src/catalog/catalog-store.js` owns DOM-free search, filtering, sorting, and catalog state.
- `src/cart/cart-store.js` owns DOM-free cart quantities, totals, validation, and persistence.
- `src/page/shop-page.js` is the only production file that reads or changes the DOM and browser page state.
- `src/shared/presentation.js` formats icons, sprite-backed images, and currency as pure values.
- `src/style.css` contains every responsive visual rule for the storefront, catalog, dialogs, and account pages.

### Test files

- `tests/catalog.test.mjs` verifies catalog searching, filtering, sorting, combined operations, and reset behavior.
- `tests/cart.test.mjs` verifies cart arithmetic, item removal, clearing, invalid storage, and refresh persistence.
- `tests/app.test.mjs` verifies coordination among the app, stores, and page adapter.

### Verification files

- `scripts/verify-part1.mjs` runs the complete Part 1 behavior checklist in a real browser.
- `scripts/verify-architecture.mjs` fails if any production file other than `shop-page.js` touches the DOM.
- `scripts/verify-ui.mjs` checks routes, forms, responsive layouts, image stability, and accessibility.
- `scripts/verify-hooks.mjs` proves that the real pre-commit hook formats valid code and blocks invalid code.

A future wishlist store belongs in `src/wishlist/wishlist-store.js`; its visible UI belongs in
`src/page/shop-page.js`, and coordination between the two belongs in `src/app.js`.

## Preview functionality

The shopping bag is saved in this browser. Authentication, payments, and newsletter
delivery are not connected to a backend; the forms state this and never save or send
account credentials. The supplied design concept provides the local photographic
sprite; the interface itself is HTML and CSS.
