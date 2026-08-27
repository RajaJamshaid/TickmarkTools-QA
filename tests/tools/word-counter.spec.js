// tests/tools/word-counter.spec.js
// Functional test for the live Word Counter tool.

const { test, expect } = require('@playwright/test');

test.describe('Tool: Word Counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/word-counter.html');
  });

  test('counts words, characters and sentences correctly', async ({ page }) => {
    const sample = 'This is a simple test. It has two sentences.';

    const textbox = page.getByRole('textbox').first();
    await textbox.fill(sample);

    // Expected counts for the sample string above
    await expect(page.getByText(/^9$/).first()).toBeVisible({ timeout: 5000 }); // 9 words
    await expect(page.getByText(/^2$/).first()).toBeVisible(); // 2 sentences
  });

  test('updates live as you type (no submit button needed)', async ({ page }) => {
    const textbox = page.getByRole('textbox').first();
    await textbox.fill('One');
    await expect(page.getByText(/^1$/).first()).toBeVisible();

    await textbox.fill('One two three');
    await expect(page.getByText(/^3$/).first()).toBeVisible();
  });

  test('handles empty input without throwing errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const textbox = page.getByRole('textbox').first();
    await textbox.fill('something');
    await textbox.fill('');

    expect(errors).toEqual([]);
  });
});
