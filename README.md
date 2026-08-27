# TickmarkTools — Automated QA Suite

Reusable, real-browser test suite for **tickmarktools.com**, built with
[Playwright](https://playwright.dev). Tests run in actual Chromium, Firefox,
and WebKit engines — not a simulation — across desktop, mobile, and tablet
device profiles.

## What it checks

**Every page on the site** (`tests/site-wide.spec.js`), driven by `urls.json`:
- Page loads successfully (no 4xx/5xx, no broken response)
- Zero JavaScript console errors
- Essential SEO tags present (title, meta description)
- No visibly broken images
- No dead/placeholder links
- Baseline accessibility (WCAG 2 A/AA) via axe-core
- No horizontal-scroll/layout-overflow bugs at that device's viewport

**Specific tools** (`tests/tools/*.spec.js`) — real functional tests:
- `age-calculator.spec.js`
- `word-counter.spec.js`
- `json-formatter.spec.js`

These three are working examples. Copy one of them for each of your other
tools (pattern below) to get full functional coverage, not just "did it load."

**Devices tested** (edit list in `playwright.config.js`):
Desktop Chrome, Desktop Firefox, Desktop Safari, Mobile Chrome (Pixel 7),
Mobile Safari (iPhone 14), Tablet (iPad).

## Running from mobile only (no computer / no terminal needed)

This repo includes `.github/workflows/qa.yml`, which runs the entire suite
on GitHub's own servers — you never touch a terminal.

1. Create a free [github.com](https://github.com) account (do this in your
   phone's browser or the GitHub mobile app).
2. Create a new **repository** (name it anything, e.g. `tickmarktools-qa`),
   set it to Public or Private, don't add a README (this project already has one).
3. Upload every file from this folder into that repo:
   - On the repo page → **Add file → Upload files** → select all files
     from the extracted `tickmarktools-qa` folder (including the hidden
     `.github` folder — if your phone's file picker hides it, use the
     GitHub mobile app's "Add file" instead, or a cloud file manager that
     shows hidden folders) → Commit.
4. Go to the **Actions** tab of your repo. A run named "TickmarkTools QA
   Suite" starts automatically after upload (and also re-runs daily, or
   anytime you tap **Run workflow**).
5. Tap the finished run → scroll to **Artifacts** → download `qa-report`.
   Your phone will unzip it (or use any file manager app) → open
   `index.html` → full report, right there on your phone.

That's the whole workflow — upload once, then just check the Actions tab
whenever you want a fresh report, or let the daily schedule do it for you.

## Setup on a computer (alternative — one-time)

Requires [Node.js](https://nodejs.org) 18+.

```bash
cd tickmarktools-qa
npm install
npx playwright install --with-deps   # downloads real browser binaries
```

## Running it

```bash
npm test                # full suite, every page, every device
npm run test:site       # just the site-wide sweep
npm run test:tools      # just the functional tool tests
npm run test:headed     # watch it run in a visible browser window
npm run report          # open the last HTML report
```

After a run, open `qa-report/index.html` in any browser — a full pass/fail
report per page, per device, with screenshots and video replays attached to
every failure so you can see exactly what broke.

## Keeping the URL list current

When you add a new tool to the site:

```bash
npm run discover
```

This pulls `sitemap.xml` (or falls back to scraping homepage links) and
rewrites `urls.json`. The site-wide test file needs no code changes — it
automatically picks up every URL in that file.

## Adding a functional test for another tool

Copy `tests/tools/word-counter.spec.js`, rename it, and adjust:

```js
test.describe('Tool: Your Tool Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-tool.html');
  });

  test('does the thing it is supposed to do', async ({ page }) => {
    // fill inputs, click the action button, assert the output
  });
});
```

If a locator like `page.getByLabel(/date of birth/i)` doesn't match your
actual markup, generate the correct one automatically:

```bash
npx playwright codegen https://tickmarktools.com/your-tool.html
```

This opens a real browser — click/type through the tool once, and it prints
the exact selector code for you to paste in.

## Honest limitations (please read)

- **No 100% guarantee.** This suite catches broken loads, JS errors, dead
  links, broken images, accessibility violations, and functional bugs in
  the tools you write tests for. It does **not** catch subjective design
  issues, business-logic edge cases you haven't thought to test, or things
  that require human judgment.
- **Coverage = what you write tests for.** The site-wide sweep covers all
  ~65 pages automatically. Deep functional coverage only exists for the 3
  example tools until you add more (5–10 min each, using the pattern above).
- Some checks (accessibility, console errors) can produce noise on
  third-party ad/embed scripts you don't control — review failures before
  treating every one as "your bug."
