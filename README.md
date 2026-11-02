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
| `npm run verify:architecture` | Enforce feature ownership, dependency direction, and no circular imports           |
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

```text
src/
├── main.ts
├── app.ts
├── app.types.ts
├── modules/
│   ├── products/
│   │   ├── products.types.ts
│   │   ├── products.data.ts
│   │   ├── products.logic.ts
│   │   └── products.ui.ts
│   ├── cart/
│   │   ├── cart.types.ts
│   │   ├── cart.logic.ts
│   │   ├── cart.storage.ts
│   │   └── cart.ui.ts
│   └── auth/
│       └── auth.ui.ts
├── shared/
│   ├── dom.ts
│   ├── presentation.ts
│   └── ui/
│       ├── toast.ts
│       └── info-dialog.ts
├── page/
│   ├── shop-page.ts
│   ├── layout.ts
│   └── console-api.ts
├── styles/
└── style.css
```

- `main.ts` creates stores, storage and views, then starts the application.
- `app.ts` coordinates feature actions; `app.types.ts` contains only its app/page contracts.
- Products own `Product`, categories, catalog state, local data, search/filter/sort logic,
  and the home/catalog UI including product cards.
- Cart owns `CartItem`, `Cart`, quantity and total calculations, storage validation,
  and the shopping bag dialog.
- Auth owns the existing login/signup forms and validation.
- Shared code supplies DOM helpers, formatting, toasts, and informational dialogs.
- The page shell owns routing, shared layout, and the `window.shop` console bridge.
- `style.css` imports the ordered style modules in `styles/`.

### Test files

- `tests/catalog.test.mjs` verifies catalog searching, filtering, sorting, combined operations, and reset behavior.
- `tests/cart.test.mjs` verifies cart arithmetic, item removal, clearing, invalid storage, and refresh persistence.
- `tests/app.test.mjs` verifies coordination among the app, stores, and page adapter.

### Verification files

- `scripts/verify-part1.mjs` runs the complete Part 1 behavior checklist in a real browser.
- `scripts/verify-architecture.mjs` enforces TypeScript sources, feature-owned UI, independent shared code, dependency direction, and no circular imports.
- `scripts/verify-ui.mjs` checks routes, forms, responsive layouts, image stability, and accessibility.
- `scripts/verify-hooks.mjs` proves that the real pre-commit hook formats valid code and blocks invalid code.

## Module rules for future upgrades

Each feature owns its types, logic, data and UI under `src/modules/<feature>/`.
Feature UI receives the actions and view models it needs; it never creates or imports
stores directly. Feature logic and types do not depend on UI. Cross-feature behavior
is coordinated by `app.ts`; direct cross-feature imports are limited to type contracts.

Shared code does not import features or the application shell. The page shell assembles
the feature views and handles routing and common layout. Browser persistence belongs
in a feature's `.storage.ts` file. Other DOM work belongs in `.ui.ts` files, the page shell,
or shared UI/helpers. `app.types.ts` holds coordination contracts, never feature types.

For a wishlist, add `modules/wishlist/wishlist.types.ts`, `wishlist.logic.ts`, and
`wishlist.ui.ts`; connect it through `app.ts` and the page shell.

### Planned API integration

Products still come from `products.data.ts`. No HTTP requests, asynchronous loading
states, or API placeholders have been introduced by the architecture refactor.

When implementing the REST API, add these files with their actual implementation:

- `shared/api/client.ts`: `fetchJson<T>`, `ApiError`, HTTP handling, and a decoder accepting `unknown`.
- `modules/products/products.api.ts`: endpoint calls and external response validation/types.
- `modules/products/products.mapper.ts`: validated API response to internal `Product` conversion.

Then extend the products-owned state and UI with loading, error, empty, and success
states. Keep server field names in the API layer; product views and cart logic continue
using the internal `Product` contract.

Run `npm run check` and `npm test` after changes; use `npm run verify:part1` and
`npm run verify:ui` for view, routing, dialog, or style changes.

## Preview functionality

The shopping bag is saved in this browser. Authentication, payments, and newsletter
delivery are not connected to a backend; the forms state this and never save or send
account credentials. The supplied design concept provides the local photographic
sprite; the interface itself is HTML and CSS.
