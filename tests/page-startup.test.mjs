import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { build, preview } from 'vite';

const port = 4177;
const base = `http://127.0.0.1:${port}/`;
await build({ logLevel: 'silent' });
const server = await preview({ preview: { host: '127.0.0.1', port, strictPort: true } });
const browser = await chromium.launch({
  headless: true,
});

try {
  const page = await browser.newPage();
  await page.route(base, async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      '<div id="toast" class="toast" role="status" aria-live="polite"></div>',
      '',
    );
    await route.fulfill({ response, body: html });
  });

  const startupError = page.waitForEvent('pageerror', { timeout: 10_000 });
  await page.goto(`${base}#home`, { waitUntil: 'commit' });
  assert.match((await startupError).message, /Required element not found: #toast/);
  console.log('PASS page startup rejects missing required toast markup');
} finally {
  await browser.close();
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}
