import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('src');
const allowedDomFile = path.normalize('src/page/shop-page.js');
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

async function javascriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return javascriptFiles(target);
      return entry.name.endsWith('.js') ? [target] : [];
    }),
  );
  return nested.flat();
}

const violations = [];
for (const file of await javascriptFiles(sourceRoot)) {
  const relative = path.normalize(path.relative(process.cwd(), file));
  if (relative === allowedDomFile) continue;
  const source = await readFile(file, 'utf8');
  const matches = domTokens.filter((token) => token.test(source)).map(String);
  if (matches.length) violations.push({ file: relative, matches });
}

assert.deepEqual(
  violations,
  [],
  `Only ${allowedDomFile} may touch the DOM:\n${violations.map(({ file, matches }) => `${file}: ${matches.join(', ')}`).join('\n')}`,
);
console.log(`PASS architecture: ${allowedDomFile} is the only production DOM file`);
