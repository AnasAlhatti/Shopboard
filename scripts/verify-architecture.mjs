import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve('src');
const pageRoot = path.join(sourceRoot, 'page') + path.sep;
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

for (const file of files) {
  if (file.endsWith('.js'))
    violations.push(`${relative(file)}: production code must use TypeScript`);
  const source = await readFile(file, 'utf8');
  if (!file.startsWith(pageRoot) && domTokens.some((token) => token.test(source))) {
    violations.push(`${relative(file)}: browser/DOM access belongs in src/page`);
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
    if (
      file !== path.join(sourceRoot, 'main.ts') &&
      !file.startsWith(pageRoot) &&
      target.startsWith(pageRoot)
    ) {
      violations.push(`${relative(file)}: domain/application modules cannot import the page layer`);
    }
    if (
      file.startsWith(pageRoot) &&
      ['cart', 'catalog'].some(
        (feature) => target === path.join(sourceRoot, feature, `${feature}-store.ts`),
      ) &&
      !statement.importClause?.isTypeOnly
    ) {
      violations.push(
        `${relative(file)}: views receive actions; import store contracts with import type`,
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
  'PASS architecture: TypeScript source, page-only DOM access, dependency direction, no circular imports',
);
