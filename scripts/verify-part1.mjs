/* global document, window */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4176, strictPort: true } });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
});
const page = await browser.newPage();
const errors = [];
const failedRequests = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('requestfailed', (request) =>
  failedRequests.push(`${request.url()} :: ${request.failure()?.errorText}`),
);
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const names = async () =>
  page
    .locator('.product-card')
    .evaluateAll((cards) =>
      cards.filter((card) => !card.hidden).map((card) => card.querySelector('h2, h3').textContent),
    );
const cartCount = async () => Number(await page.locator('.cart-count').textContent());
const productSearch = () => page.locator('#product-search');
const openCart = async () => page.getByRole('button', { name: /Open shopping bag/ }).click();
const closeCart = async () => page.getByRole('button', { name: 'Close shopping bag' }).click();

try {
  await page.goto('http://127.0.0.1:4176/#products');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await productSearch().fill('MUG');
  assert.deepEqual(await names(), ['Stoneware Mug']);
  await productSearch().fill('mug');
  assert.deepEqual(await names(), ['Stoneware Mug']);
  console.log('PASS search by name is case-insensitive');

  await productSearch().fill('');
  await page.getByRole('link', { name: 'Lifestyle (2)' }).click();
  await page.waitForURL('**/#category/lifestyle');
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 2);
  assert.deepEqual(await names(), ['Linen Throw Blanket', 'Everyday Water Bottle']);
  console.log('PASS category shows only matching products');

  await page.getByRole('link', { name: 'All (6)' }).click();
  await page.waitForURL('**/#products');
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 6);
  await page.getByLabel('Sort by').selectOption('price-asc');
  assert.deepEqual(await names(), [
    'Stoneware Mug',
    'Notebook Journal',
    'Ceramic Planter',
    'Everyday Water Bottle',
    'Oak Catchall Tray',
    'Linen Throw Blanket',
  ]);
  await page.getByLabel('Sort by').selectOption('price-desc');
  assert.deepEqual(await names(), [
    'Linen Throw Blanket',
    'Oak Catchall Tray',
    'Everyday Water Bottle',
    'Ceramic Planter',
    'Notebook Journal',
    'Stoneware Mug',
  ]);
  await page.getByLabel('Sort by').selectOption('default');
  assert.deepEqual(await names(), [
    'Stoneware Mug',
    'Ceramic Planter',
    'Linen Throw Blanket',
    'Everyday Water Bottle',
    'Notebook Journal',
    'Oak Catchall Tray',
  ]);
  console.log('PASS sort ascending, descending, and default order');

  await page.getByRole('link', { name: 'Lifestyle (2)' }).click();
  await page.waitForURL('**/#category/lifestyle');
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 2);
  await productSearch().fill('e');
  await page.getByLabel('Sort by').selectOption('price-asc');
  assert.deepEqual(await names(), ['Everyday Water Bottle', 'Linen Throw Blanket']);
  console.log('PASS search, category, and sort work together');

  await page.evaluate(() => window.shop.reset());
  await page.getByRole('button', { name: 'Add Stoneware Mug to bag' }).click();
  await page.getByRole('button', { name: 'Add Stoneware Mug to bag' }).click();
  await page.getByRole('button', { name: 'Add Everyday Water Bottle to bag' }).click();
  assert.equal(await cartCount(), 3);
  await openCart();
  assert.equal(await page.locator('.cart-item').count(), 2);
  assert.equal(
    await page
      .locator('.cart-item', { hasText: 'Stoneware Mug' })
      .locator('span[aria-label="Quantity"]')
      .textContent(),
    '2',
  );
  assert.match(await page.locator('.cart-total').innerText(), /68\.00/);
  console.log('PASS duplicate adds merge; count 3 and hand-calculated total $68.00');

  await page.getByRole('button', { name: 'Decrease Stoneware Mug quantity' }).click();
  assert.equal(await cartCount(), 2);
  assert.equal(
    await page
      .locator('.cart-item', { hasText: 'Stoneware Mug' })
      .locator('span[aria-label="Quantity"]')
      .textContent(),
    '1',
  );
  assert.match(await page.locator('.cart-total').innerText(), /50\.00/);
  await page.getByRole('button', { name: 'Decrease Stoneware Mug quantity' }).click();
  assert.equal(await page.locator('.cart-item', { hasText: 'Stoneware Mug' }).count(), 0);
  assert.equal(await cartCount(), 1);
  assert.match(await page.locator('.cart-total').innerText(), /32\.00/);
  console.log('PASS decrement removes at 1; no zero/negative row; count 1 and total $32.00');

  await closeCart();
  await page.getByRole('button', { name: 'Add Stoneware Mug to bag' }).click();
  await openCart();
  await page.getByRole('button', { name: 'Remove Stoneware Mug' }).click();
  assert.equal(await page.locator('.cart-item', { hasText: 'Everyday Water Bottle' }).count(), 1);
  assert.equal(await cartCount(), 1);
  assert.match(await page.locator('.cart-total').innerText(), /32\.00/);
  console.log('PASS remove affects only its product; remaining count 1 and total $32.00');

  await closeCart();
  await page.reload();
  assert.equal(await cartCount(), 1);
  await openCart();
  assert.equal(
    await page
      .locator('.cart-item', { hasText: 'Everyday Water Bottle' })
      .locator('span[aria-label="Quantity"]')
      .textContent(),
    '1',
  );
  assert.match(await page.locator('.cart-total').innerText(), /32\.00/);
  console.log('PASS refresh preserves exact cart state');

  await page.getByRole('button', { name: 'Clear shopping bag' }).click();
  assert.equal(await cartCount(), 0);
  assert.equal(await page.locator('.cart-item').count(), 0);
  assert.match(await page.locator('#cart-title').innerText(), /\(0\)/);
  assert.equal(await page.locator('.cart-total').count(), 0);
  console.log('PASS clear empties cart; count is 0 and empty cart has no nonzero total');

  await closeCart();
  await page.getByRole('link', { name: 'Home (2)' }).click();
  await page.waitForURL('**/#category/home');
  await page.getByRole('link', { name: 'Lifestyle (2)' }).click();
  await page.waitForURL('**/#category/lifestyle');
  await page.getByRole('link', { name: 'All (6)' }).click();
  await page.waitForURL('**/#products');
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 6);
  await productSearch().fill('mug');
  await productSearch().fill('');
  await page.getByRole('button', { name: 'Add Stoneware Mug to bag' }).click();
  assert.equal(await cartCount(), 1);
  await openCart();
  assert.equal(await page.locator('.cart-item').count(), 1);
  assert.equal(await page.locator('span[aria-label="Quantity"]').textContent(), '1');
  assert.match(await page.locator('.cart-total').innerText(), /18\.00/);
  console.log('PASS after repeated filter changes, one click adds exactly one item');

  if (errors.length) console.log(`FAILED REQUESTS\n${failedRequests.join('\n')}`);
  assert.deepEqual(errors, []);
  console.log('PASS no browser Console or page errors');
} finally {
  await browser.close();
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}
