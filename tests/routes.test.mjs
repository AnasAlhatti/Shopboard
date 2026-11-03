import assert from 'node:assert/strict';
import { parseRoute } from '../src/page/routes.ts';
import { header } from '../src/page/layout.ts';

assert.deepEqual(parseRoute('#home'), { type: 'home' });
assert.deepEqual(parseRoute('products'), { type: 'products' });
assert.deepEqual(parseRoute('#category/lifestyle'), {
  type: 'category',
  categoryId: 'lifestyle',
});
assert.deepEqual(parseRoute('#signup'), { type: 'auth', mode: 'signup' });
assert.deepEqual(parseRoute('#login'), { type: 'auth', mode: 'login' });
assert.deepEqual(parseRoute('#unknown'), { type: 'unknown' });

const navigation = header(0, false, [
  { id: 'lifestyle', name: 'Lifestyle', image: [0, 0, 1, 1] },
  { id: 'workspace', name: 'Workspace', image: [0, 0, 1, 1] },
]);
assert.match(navigation, /href="#category\/lifestyle"/);
assert.match(navigation, /href="#category\/workspace"/);

console.log('ALL ROUTE PARSING TESTS PASSED');
