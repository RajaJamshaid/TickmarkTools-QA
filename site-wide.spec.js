// tests/site-wide.spec.js
//
// Generic QA sweep: runs the SAME checklist against every URL in urls.json,
// across every browser/device project defined in playwright.config.js.
//
// Add a new tool to the site? Run `npm run discover` (or add the URL by
// hand to urls.json) and this file automatically covers it — no code change.

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

const urls = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'urls.json'), 'utf-8'));

for (const url of urls) {
  test.describe(`Page: ${url}`, () => {
    test('loads successfully with no broken response', async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'load' });
      expect(response, `No response received for ${url}`).not.toBeNull();
      expect(response.status(), `Bad HTTP status for ${url}`).toBeLessThan(400);
    });

    test('has no JavaScript console errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(url, { waitUntil: 'networkidle' });

      expect(errors, `Console/JS errors found on ${url}:\n${errors.join('\n')}`).toEqual([]);
    });

    test('has essential SEO/meta tags', async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveTitle(/.+/);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description, `Missing meta description on ${url}`).toBeTruthy();
    });

    test('has no visibly broken images', async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      const brokenImages = await page.evaluate(() =>
        Array.from(document.images)
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src)
      );
      expect(brokenImages, `Broken images on ${url}:\n${brokenImages.join('\n')}`).toEqual([]);
    });

    test('has no internal links pointing to obviously broken anchors', async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      const emptyHrefLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a'))
          .filter((a) => a.getAttribute('href') === '' || a.getAttribute('href') === '#')
          .map((a) => a.outerHTML.slice(0, 120))
      );
      expect(
        emptyHrefLinks,
        `Links with empty/placeholder href on ${url}:\n${emptyHrefLinks.join('\n')}`
      ).toEqual([]);
    });

    test('passes baseline accessibility scan (WCAG 2 A/AA)', async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const violations = results.violations.map(
        (v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} element(s))`
      );
      expect(
        violations,
        `Accessibility violations on ${url}:\n${violations.join('\n')}`
      ).toEqual([]);
    });

    test('renders correctly at current viewport (visual smoke check)', async ({ page }, testInfo) => {
      await page.goto(url, { waitUntil: 'load' });
      // Confirms no horizontal overflow / broken responsive layout at this device size.
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
      );
      expect(
        hasHorizontalScroll,
        `Horizontal overflow (layout likely broken) on ${url} at ${testInfo.project.name}`
      ).toBe(false);
    });
  });
}
