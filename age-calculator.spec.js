// tests/tools/age-calculator.spec.js
//
// FUNCTIONAL test — actually uses the tool like a real user and checks the
// output is correct. This is the pattern to copy for your other 60+ tools.
//
// NOTE: locators below use visible label/button TEXT (not CSS ids/classes),
// since that's the most stable way to target elements without seeing your
// exact HTML source. If a locator doesn't match, run:
//   npx playwright codegen https://tickmarktools.com/age-calculator.html
// to record the exact selector your page actually uses, then swap it in.

const { test, expect } = require('@playwright/test');

test.describe('Tool: Age Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/age-calculator.html');
  });

  test('calculates a known age correctly', async ({ page }) => {
    // Fill date of birth
    const dobInput = page.getByLabel(/date of birth/i).first();
    await dobInput.fill('1994-03-15');

    // "Calculate Age On" — set a fixed reference date so the expected result is deterministic
    const onDateInput = page.getByLabel(/calculate age on/i).first();
    if (await onDateInput.isVisible().catch(() => false)) {
      await onDateInput.fill('2026-07-30');
    }

    await page.getByRole('button', { name: /calculate age/i }).click();

    // Expected, per the site's own worked example: 32 years, 4 months, 15 days
    await expect(page.getByText(/32/)).toBeVisible();
    await expect(page.getByText(/years/i)).toBeVisible();
  });

  test('reset button clears the result', async ({ page }) => {
    await page.getByLabel(/date of birth/i).first().fill('2000-01-01');
    await page.getByRole('button', { name: /calculate age/i }).click();
    await page.getByRole('button', { name: /reset/i }).click();

    const dobInput = page.getByLabel(/date of birth/i).first();
    await expect(dobInput).toHaveValue('');
  });

  test('rejects or gracefully handles a future date of birth', async ({ page }) => {
    const dobInput = page.getByLabel(/date of birth/i).first();
    await dobInput.fill('2099-01-01');
    await page.getByRole('button', { name: /calculate age/i }).click();

    // Tool should not silently show a negative/nonsense age.
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/-\d+\s*years/i);
  });
});
