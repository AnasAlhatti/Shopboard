import assert from 'node:assert/strict';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const output = path.resolve('output/quality');
await mkdir(output, { recursive: true });
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  chromium.executablePath(),
].filter(Boolean);
let executablePath;
for (const candidate of candidates) {
  try {
    await access(candidate);
    executablePath = candidate;
    break;
  } catch {
    // Try the next installed Chromium browser.
  }
}
const server = await preview({ preview: { host: '127.0.0.1', port: 4175, strictPort: true } });
const base = 'http://127.0.0.1:4175/';
let browser;
let chrome;
const results = [];
try {
  browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['home', 'login', 'signup']) {
      await page.goto(`${base}#${route}`);
      await page.locator('h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.locator('.photo img').evaluateAll(async (images) => {
          await Promise.all(images.map((image) => image.decode()));
          return (
            images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0)
          );
        }),
        `${route} at ${width}: all photographic assets are decoded and available`,
      );
      assert.equal(await page.locator('h1').count(), 1, `${route}: exactly one h1`);
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        unlabeledInputs: [...document.querySelectorAll('input')].filter(
          (input) => !input.labels.length,
        ).length,
        overflow: [...document.querySelectorAll('main a, main button, main input, h1')]
          .filter((element) => element.getClientRects().length)
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > innerWidth + 1;
          })
          .map((element) => element.outerHTML.slice(0, 150)),
      }));
      assert.ok(layout.documentWidth <= width, `${route} at ${width}: horizontal overflow`);
      assert.equal(layout.unlabeledInputs, 0, `${route}: every input has a label`);
      assert.deepEqual(layout.overflow, [], `${route} at ${width}: clipped content`);
      await page.screenshot({ path: path.join(output, `${route}-${width}.png`), fullPage: true });
      results.push({ route, width, ...layout });
      console.log(`PASS ${route}: ${width}px, one h1, labeled inputs, no horizontal overflow`);
    }
  }

  await page.goto(`${base}#home`);
  const heroPhoto = await page.locator('.hero-art .photo').elementHandle();
  const journalPhoto = await page
    .locator('.product-card', { hasText: 'Notebook Journal' })
    .locator('.photo')
    .elementHandle();
  await page.getByLabel('Search products').fill('journal');
  assert.equal(
    await journalPhoto.evaluate((element) => element.isConnected),
    true,
    'Searching must preserve existing product images instead of replacing them',
  );
  await page.getByLabel('Search products').fill('');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Workspace' })
    .click();
  await page.waitForURL('**/#category/workspace');
  assert.equal(
    await heroPhoto.evaluate((element) => element.isConnected),
    true,
    'Category navigation must preserve the loaded hero image',
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true })
    .click();
  await page.waitForURL('**/#home');
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('[data-product-card="journal"]').hover();
    assert.equal(
      await journalPhoto.evaluate(
        (element) =>
          element.isConnected &&
          element.querySelector('img').complete &&
          element.querySelector('img').naturalWidth > 0 &&
          getComputedStyle(element).transform === 'none',
      ),
      true,
      `Image remains loaded and stable on hover and resize at ${width}px`,
    );
  }
  console.log('PASS image stability: filtering and category navigation preserve loaded images');

  await page.goto(`${base}#signup`);
  const form = page.locator('.auth-form');
  assert.equal(await form.evaluate((element) => element.checkValidity()), false);
  await page.getByLabel('Full name').fill('Alex Morgan');
  await page.getByLabel('Email address', { exact: true }).fill('invalid');
  assert.equal(
    await page.locator('#auth-email').evaluate((input) => input.validity.typeMismatch),
    true,
  );
  await page.getByLabel('Email address', { exact: true }).fill('alex@example.com');
  await page.getByLabel('Password', { exact: true }).fill('short');
  assert.equal(
    await page.locator('#auth-password').evaluate((input) => input.validity.tooShort),
    true,
  );
  await page.getByLabel('Password', { exact: true }).fill('Demo-password-123');
  await page.getByLabel('Confirm password').fill('Different-password');
  assert.equal(await form.evaluate((element) => element.checkValidity()), false);
  await page.getByLabel('Confirm password').fill('Demo-password-123');
  assert.equal(await form.evaluate((element) => element.checkValidity()), true);
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  assert.equal(await page.locator('#auth-password').getAttribute('type'), 'text');
  await page.getByRole('button', { name: 'Create your account', exact: true }).click();
  await page.locator('.auth-status').waitFor({ state: 'visible' });
  console.log(
    'PASS signup: required, email, minimum length, matching passwords, visibility, submit',
  );

  await page.goto(`${base}#home`);
  await page.getByRole('button', { name: 'Add Stoneware Mug to bag', exact: true }).click();
  await page.getByRole('button', { name: /Open shopping bag/ }).click();
  assert.equal(await page.locator('#cart-dialog').evaluate((element) => element.open), true);
  assert.match(await page.locator('.cart-total').innerText(), /18\.00/);
  await page.getByRole('button', { name: 'Increase Stoneware Mug quantity' }).click();
  assert.match(await page.locator('.cart-total').innerText(), /36\.00/);
  await page.keyboard.press('Escape');
  await page.getByLabel('Search products').fill('journal');
  assert.equal(await page.locator('.product-card:not([hidden])').count(), 1);
  await page.getByLabel('Search products').fill('no-such-product');
  await page.locator('.empty-results').waitFor();
  await page.getByRole('button', { name: 'Explore all products' }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('.product-card:not([hidden])').length === 6,
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Workspace' })
    .click();
  await page.waitForFunction(
    () => document.querySelectorAll('.product-card:not([hidden])').length === 1,
  );
  assert.match(await page.locator('.product-card:not([hidden])').innerText(), /Notebook Journal/);
  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  console.log('PASS storefront: cart totals, dialog Escape, search, empty state, category filter');
  await browser.close();
  browser = undefined;

  chrome = await launch({
    chromePath: executablePath,
    chromeFlags: ['--headless=new', '--disable-gpu', '--no-first-run'],
  });
  for (const device of ['mobile', 'desktop']) {
    for (const route of ['home', 'login', 'signup']) {
      const result = await lighthouse(`${base}#${route}`, {
        port: chrome.port,
        onlyCategories: ['accessibility'],
        output: ['html', 'json'],
        logLevel: 'error',
        ...(device === 'desktop'
          ? {
              formFactor: 'desktop',
              screenEmulation: {
                mobile: false,
                width: 1280,
                height: 900,
                deviceScaleFactor: 1,
                disabled: false,
              },
            }
          : {}),
      });
      const score = Math.round(result.lhr.categories.accessibility.score * 100);
      await writeFile(path.join(output, `lighthouse-${route}-${device}.html`), result.report[0]);
      await writeFile(path.join(output, `lighthouse-${route}-${device}.json`), result.report[1]);
      const failures = Object.values(result.lhr.audits)
        .filter((audit) => audit.scoreDisplayMode === 'binary' && audit.score === 0)
        .map((audit) => ({ id: audit.id, title: audit.title, details: audit.details }));
      results.push({ route, device, accessibility: score, failures });
      console.log(`Lighthouse ${route} (${device}): ${score}/100 accessibility`);
      if (failures.length) console.log(JSON.stringify(failures, null, 2));
      assert.ok(score >= 90, `${route}: accessibility score ${score} is below 90`);
    }
  }
  await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Reports and screenshots saved to ${output}`);
} finally {
  await browser?.close();
  await chrome?.kill();
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}
