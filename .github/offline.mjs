// CI: after ONE visit the app opens without a connection, with its stories and first lessons.
// A stand-in for the live site: the app under /LanguageLab/ and the shared house files (font.js, cowork.js) at the root of
// the same origin, as on adervec.github.io. They come from ../CoworkSyncHub when that folder is there, else from the live
// site, once. Then the server is stopped and the page reloaded.
// Run from the repo root: npm i --no-save playwright-core && node .github/offline.mjs
import { chromium } from 'playwright-core';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const app = process.cwd(), hub = path.join(app, '..', 'CoworkSyncHub'), local = existsSync(path.join(hub, 'font.js')), PORT = 8791;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const shared = {};
if (!local) for (const f of ['/font.js', '/cowork.js']) shared[f] = Buffer.from(await (await fetch('https://adervec.github.io' + f)).arrayBuffer());
const start = () => new Promise(done => { const s = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname), inApp = p.startsWith('/LanguageLab/'), base = inApp ? app : hub;
  try {
    const file = path.join(base, inApp ? p.slice(13) || 'index.html' : p);
    if (!file.startsWith(base)) throw 0;
    let body = inApp || local ? await readFile(file) : shared[p];
    if (!body) throw 0;
    if (inApp && file.endsWith('index.html')) body = Buffer.from(String(body).replaceAll('https://adervec.github.io/', '/')); // one origin, as when deployed
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(PORT, () => done(s)); });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
const main = () => page.innerText('#main'), click = name => page.getByRole('button', { name, exact: true }).first().click();
const server = await start();
await page.goto(`http://localhost:${PORT}/LanguageLab/`);
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('Starting from nothing?'));
// the service worker takes charge of this first page and keeps the shared files it had already loaded
for (let i = 0; i < 100 && !(await page.evaluate(() => caches.match('/font.js').then(r => !!r))); i++) await page.waitForTimeout(100);
assert.ok(await page.evaluate(() => caches.match('/font.js').then(r => !!r)), 'the shared files are kept after one visit');
server.closeAllConnections();
await new Promise(done => server.close(done));               // no connection from here on

await page.reload();
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('Starting from nothing?'));
await click('Begin');
assert.match(await main(), /Today[\s\S]*Le marché du samedi/, 'the French stories are there offline');
await click('Settings');
await page.selectOption('#main select[data-change="lang"]', 'ru');
await click('Today');
assert.match(await main(), /Lesson 1 of 10: Hello and goodbye/, 'so are the first lessons of another language');
await click('Settings');
await page.selectOption('#main select[data-change="lang"]', 'es');
await click('Today');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('El mercado') || document.querySelectorAll('#main button.primary').length > 0);
assert.equal(await page.getByRole('button', { name: 'Start', exact: true }).count(), 1, 'and the stories of a language not opened before');
await browser.close();
console.log('offline ok: after one visit the app, its stories and its first lessons open without a connection');
