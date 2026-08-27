// discover-urls.js
// Run with: npm run discover
// Fetches sitemap.xml (falls back to homepage links) and writes urls.json.
// Re-run this whenever new tools are added to the site so tests stay complete.

const fs = require('fs');
const https = require('https');

const BASE_URL = process.env.QA_BASE_URL || 'https://tickmarktools.com';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Request failed: ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fromSitemap() {
  const xml = await fetchText(`${BASE_URL}/sitemap.xml`);
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
  if (!matches.length) throw new Error('sitemap.xml had no <loc> entries');
  return matches;
}

async function fromHomepageLinks() {
  const html = await fetchText(`${BASE_URL}/`);
  const hrefs = [...html.matchAll(/href="(https:\/\/tickmarktools\.com\/[^"#]*)"/g)].map(
    (m) => m[1]
  );
  return [...new Set(hrefs)];
}

// Known-good fallback list (captured manually) in case both sitemap and
// homepage scraping fail — keeps the suite runnable out of the box.
const FALLBACK_URLS = require('./urls.fallback.json');

(async () => {
  let urls;
  try {
    urls = await fromSitemap();
    console.log(`Discovered ${urls.length} URLs from sitemap.xml`);
  } catch (e) {
    console.warn(`sitemap.xml failed (${e.message}), trying homepage link scrape...`);
    try {
      urls = await fromHomepageLinks();
      console.log(`Discovered ${urls.length} URLs from homepage links`);
    } catch (e2) {
      console.warn(`Homepage scrape failed too (${e2.message}), using bundled fallback list.`);
      urls = FALLBACK_URLS;
    }
  }

  urls = [...new Set(urls)].sort();
  fs.writeFileSync('./urls.json', JSON.stringify(urls, null, 2));
  console.log(`Wrote ${urls.length} URLs to urls.json`);
})();
