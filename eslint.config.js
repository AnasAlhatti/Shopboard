import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'output/**', '.husky/_/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js', 'scripts/**/*.mjs', 'tests/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright evaluate callbacks execute inside the browser.
    files: ['scripts/verify-ui.mjs', 'tests/**/*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  prettier,
);
