import { test, expect } from '@playwright/test';
import { readdirSync, existsSync } from 'node:fs';

// Find every game folder automatically, so new games are tested without edits here.
const games = readdirSync('.', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !['node_modules', 'dist', 'tests', 'test-results'].includes(d.name))
  .filter((d) => existsSync(`${d.name}/index.html`))
  .map((d) => d.name);

test('home page links to every game', async ({ page }) => {
  await page.goto('/');
  for (const g of games) {
    await expect(page.locator(`a[href="${g}/"]`), `missing link to ${g}`).toHaveCount(1);
  }
});

for (const game of games) {
  test(`${game} loads without errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`/${game}/`);
    await expect(page.locator('canvas').first()).toBeVisible();
    await page.waitForTimeout(1000); // let the game loop run
    await page.screenshot({ path: `test-results/screenshots/${game}.png` });
    expect(errors).toEqual([]);
  });
}
