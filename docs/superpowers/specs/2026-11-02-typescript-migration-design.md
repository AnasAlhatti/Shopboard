# TypeScript Migration Design

## Intent

Complete ShopBoard's partial JavaScript-to-TypeScript migration so the compiler checks the application's module boundaries and browser integration without changing the storefront's behavior or appearance.

## Goals

- Compile every production source module under strict TypeScript settings.
- Give products, categories, catalog state, cart snapshots, app actions, page integration, storage, and the browser console API explicit contracts.
- Keep the existing clean architecture: stores remain DOM-free, the page adapter owns DOM access, the app coordinates modules, and the entry point only composes them.
- Make type checking part of the normal quality gate and keep all existing tests and browser verification working.
- Update documentation and tooling so they describe and inspect the real `.ts` source files.

## Non-goals and anti-goals

- Do not redesign the interface, alter copy, or add features.
- Do not introduce a framework or a runtime type-validation dependency.
- Do not weaken strictness with project-wide `any`, unchecked DOM assertions, or disabled compiler rules merely to make the migration pass.
- Do not reorganize unrelated CSS, assets, or verification behavior.

## Constraints

- Semantic HTML, labeled controls, mobile-first CSS, no `!important`, and clean architecture remain required.
- Existing catalog, cart, routing, forms, dialogs, console API, persistence, and responsive behavior must remain unchanged.
- Node 26 runs the lightweight module tests and can execute erasable TypeScript directly; production output remains built by Vite.

## Approaches

### Selected: strict TypeScript with shared contracts

Add a strict `tsconfig.json`, define focused domain and module interfaces in a shared type module, type every source boundary and DOM interaction, and add `tsc --noEmit` to the quality gate. This adds meaningful compiler protection while preserving the current architecture.

### Rejected: minimal annotations

Broad types and permissive compiler settings would make the renamed files compile quickly, but would leave most invalid calls and unsafe DOM access undetected. That would complete the file-extension change without delivering the value of TypeScript.

### Rejected: TypeScript plus architectural redesign

Splitting the page adapter or introducing classes during the migration could improve some local organization, but would mix a behavior-preserving language conversion with a larger redesign and make regressions harder to isolate.

## Design

`src/types.ts` will contain the immutable domain shapes and the contracts exchanged among the catalog store, cart store, app coordinator, page adapter, and console API. Each implementation module will expose typed factory functions while retaining its existing closure-based implementation. The page adapter will use narrow DOM query helpers that fail clearly when required markup is absent, and event handlers will narrow their targets before reading element-specific properties.

The Vite entry in `index.html` will reference `src/main.ts`. TypeScript will use browser DOM libraries and strict checks with no emitted compiler output. ESLint and lint-staged will include TypeScript files. Node tests will import the `.ts` modules directly, while production TypeScript imports will remain compatible with Vite and the configured module resolver. The architecture verifier will scan `.ts` files and continue enforcing that only `src/page/shop-page.ts` owns browser/DOM behavior.

## Verification

The migration is complete only when formatting, strict type checking, linting, unit tests, the architecture verifier, Vite's production build, and the existing browser acceptance checks pass. Any failures caused by pre-existing environment limitations will be reported separately from code failures.
