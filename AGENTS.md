# ShopBoard

## Stack

Vite, vanilla TypeScript, HTML, CSS, with ESLint, Prettier, Husky, lint-staged

## Commands

- `npm run dev` starts the local Vite development server.
- `npm run build` creates the production build.
- `npm run lint` checks the code with ESLint.
- `npm run typecheck` runs strict TypeScript checks.
- `npm test` runs the browser-independent unit tests.

## Structure

- `src/` contains the application source; `app.ts` connects the features and `main.ts` starts the app.
- `src/modules/` contains feature code, grouped by feature; add new features here with domain logic and UI in focused files.
- `src/page/` contains route parsing, shared page layout, and the page adapter.
- `src/shared/` contains reusable helpers and shared UI; `src/styles/` contains the CSS modules.
- `tests/` contains unit and startup checks, `scripts/` contains verification tools, and `public/` contains site assets.

## Rules

1. Semantic HTML first
2. Every input has a label
3. Mobile-first, min-width
4. No !important
5. Explain every change
6. Only push to master when I ask.
7. Clean architecture
8. Never stretch an image.
