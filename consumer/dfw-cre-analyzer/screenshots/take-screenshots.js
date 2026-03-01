#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');

const BASE = 'http://localhost:4002';
const OUT = path.join(__dirname);

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  // 1. Top Deals tab (default view)
  console.log('📸 01 — Top Deals dashboard...');
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '01-top-deals-dashboard.png') });

  // 2. All Listings tab
  console.log('📸 02 — All Listings...');
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.tab-btn');
    for (const t of tabs) { if (t.textContent.includes('All')) t.click(); }
  });
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '02-all-listings.png') });

  // 3. Map tab
  console.log('📸 03 — Map view...');
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.tab-btn');
    for (const t of tabs) { if (t.textContent.includes('Map')) t.click(); }
  });
  await wait(2000);
  // Trigger Leaflet resize
  await page.evaluate(() => { window.dispatchEvent(new Event('resize')); });
  await wait(1000);
  await page.screenshot({ path: path.join(OUT, '03-map-view.png') });

  // 4. Market Summary tab
  console.log('📸 04 — Market Summary...');
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.tab-btn');
    for (const t of tabs) { if (t.textContent.includes('Market')) t.click(); }
  });
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '04-market-summary.png') });

  // 5. Property detail modal — click first row in Top Deals
  console.log('📸 05 — Property Detail modal...');
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.tab-btn');
    for (const t of tabs) { if (t.textContent.includes('Top')) t.click(); }
  });
  await wait(1000);
  await page.evaluate(() => {
    const row = document.querySelector('#topDealsBody tr');
    if (row) row.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '05-property-detail.png') });

  console.log('✅ All screenshots saved to', OUT);
  await browser.close();
})();
