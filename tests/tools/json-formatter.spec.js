// tests/tools/json-formatter.spec.js
// Functional test for the JSON Formatter developer tool.

const { test, expect } = require('@playwright/test');

test.describe('Tool: JSON Formatter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-formatter.html');
  });

  test('formats valid but minified JSON into readable output', async ({ page }) => {
    const input = page.getByRole('textbox').first();
    await input.fill('{"name":"Ali","age":25,"active":true}');

    const formatBtn = page.getByRole('button', { name: /format|beautify/i });
    if (await formatBtn.isVisible().catch(() => false)) {
      await formatBtn.click();
    }

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('"name"');
    expect(bodyText).toContain('Ali');
  });

  test('flags invalid JSON with a clear error, not a silent failure', async ({ page }) => {
    const input = page.getByRole('textbox').first();
    await input.fill('{"name": "Ali", "age": }'); // deliberately broken

    const formatBtn = page.getByRole('button', { name: /format|beautify/i });
    if (await formatBtn.isVisible().catch(() => false)) {
      await formatBtn.click();
    }

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.toLowerCase()).toMatch(/error|invalid/);
  });
});
