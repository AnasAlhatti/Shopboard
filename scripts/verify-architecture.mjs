import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve('src');
const pageRoot = path.join(sourceRoot, 'page') + path.sep;
const sharedRoot = path.join(sourceRoot, 'shared') + path.sep;
const modulesRoot = path.join(sourceRoot, 'modules') + path.sep;
const isFeatureUi = (file) => file.startsWith(modulesRoot) && file.endsWith('.ui.ts');
const isUi = (file) =>
  (file.startsWith(pageRoot) && file !== path.join(pageRoot, 'routes.ts')) ||
  isFeatureUi(file) ||
  file.startsWith(path.join(sharedRoot, 'ui') + path.sep) ||
  file === path.join(sharedRoot, 'dom.ts');
const isStorage = (file) => file.endsWith('.storage.ts');
const featureName = (file) =>
  file.startsWith(modulesRoot) ? path.relative(modulesRoot, file).split(path.sep)[0] : undefined;
const domTokens = [
  /\bdocument\b/,
  /\bwindow\b/,
  /\blocation\b/,
  /\bhistory\b/,
  /\blocalStorage\b/,
  /\bquerySelector(?:All)?\b/,
  /\binnerHTML\b/,
  /\baddEventListener\b/,
  /\bshowModal\b/,
  /\.close\s*\(/,
];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(target);
      return /\.(?:ts|js)$/.test(entry.name) ? [target] : [];
    }),
  );
  return nested.flat();
}

const files = await sourceFiles(sourceRoot);
const knownFiles = new Set(files);
const imports = new Map();
const violations = [];
const relative = (file) => path.relative(process.cwd(), file);
const requiredFiles = [
  'products/catalog.ts',
  'products/products.types.ts',
  'products/products.ui.ts',
  'cart/cart.ts',
  'cart/cart.storage.ts',
  'cart/cart.ui.ts',
];
const removedFiles = [
  'products/products.data.ts',
  'products/products.logic.ts',
  'cart/cart.types.ts',
  'cart/cart.logic.ts',
];

for (const file of requiredFiles) {
  if (!knownFiles.has(path.join(modulesRoot, file))) {
    violations.push(`src/modules/${file}: required feature module file is missing`);
  }
}
for (const file of removedFiles) {
  if (knownFiles.has(path.join(modulesRoot, file))) {
    violations.push(`src/modules/${file}: obsolete split module file must be removed`);
  }
}

for (const file of files) {
  if (file.endsWith('.js'))
    violations.push(`${relative(file)}: production code must use TypeScript`);
  const source = await readFile(file, 'utf8');
  const forbiddenTokens = isStorage(file)
    ? domTokens.filter((token) => token.source !== '\\blocalStorage\\b')
    : domTokens;
  if (!isUi(file) && forbiddenTokens.some((token) => token.test(source))) {
    violations.push(
      `${relative(file)}: DOM access belongs in feature UI, the page shell, or shared UI`,
    );
  }
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const dependencies = [];
  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('.')) continue;
    const target = path.resolve(path.dirname(file), specifier.text.replace(/\.js$/, '.ts'));
    if (!knownFiles.has(target)) continue;
    dependencies.push(target);
    const typeOnly = ts.isImportDeclaration(statement) && statement.importClause?.isTypeOnly;
    if (
      file.startsWith(sharedRoot) &&
      (target.startsWith(modulesRoot) ||
        target.startsWith(pageRoot) ||
        target === path.join(sourceRoot, 'app.types.ts'))
    ) {
      violations.push(
        `${relative(file)}: shared code cannot depend on features or the application shell`,
      );
    }
    if (!isUi(file) && file !== path.join(sourceRoot, 'main.ts') && isUi(target)) {
      violations.push(`${relative(file)}: logic and domain types cannot import UI modules`);
    }
    if (isUi(file) && /\.(logic|storage)\.ts$/.test(target) && !typeOnly) {
      violations.push(
        `${relative(file)}: UI receives actions and snapshots instead of importing feature logic or storage`,
      );
    }
    const owner = featureName(file);
    const dependencyOwner = featureName(target);
    if (
      owner &&
      dependencyOwner &&
      owner !== dependencyOwner &&
      !(
        typeOnly &&
        (target.endsWith('.types.ts') ||
          target === path.join(modulesRoot, 'products', 'catalog.ts') ||
          target === path.join(modulesRoot, 'cart', 'cart.ts'))
      )
    ) {
      violations.push(
        `${relative(file)}: cross-feature coordination belongs in app.ts; only type contracts may be shared directly`,
      );
    }
  }
  imports.set(file, dependencies);
}

const completed = new Set();
const visiting = new Set();
function visit(file, trail = []) {
  if (visiting.has(file)) {
    violations.push(`Circular import: ${[...trail, file].map(relative).join(' -> ')}`);
    return;
  }
  if (completed.has(file)) return;
  visiting.add(file);
  for (const dependency of imports.get(file) ?? []) visit(dependency, [...trail, file]);
  visiting.delete(file);
  completed.add(file);
}
for (const file of files) visit(file);

assert.deepEqual(violations, [], violations.join('\n'));
console.log(
  'PASS architecture: TypeScript source, feature ownership, UI/domain separation, shared-code independence, no circular imports',
);
