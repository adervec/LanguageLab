// CI: one whole sitting and one review in headless Chrome, at phone width.
// Run from the repo root: npm i --no-save playwright-core && node .github/flow.mjs
import { chromium } from 'playwright-core';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer(async (req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  try {
    if (!file.startsWith(root)) throw 0;
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(await readFile(file));
  } catch { res.writeHead(404).end(); }
}).listen(0);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://localhost:${server.address().port}/`);
const click = name => page.getByRole('button', { name, exact: true }).click();
const main = () => page.innerText('#main');

await click('Start');                                   // 1 listen
await click('Show the text');                           // 2 read: tap two words, take one back
await page.locator('.w[data-k="panier"]').first().click();
assert.match(await page.innerText('#gloss'), /panier: basket/);
await page.locator('.w[data-k="marché"]').first().click();
await page.locator('.w[data-k="marché"]').first().click();
assert.equal(await page.locator('.w.learn').count(), 2, 'both copies of "panier" are marked, "marché" is not');
await click('Next: dictation');                         // 3 dictation: first sentence right, the rest blank
const total = +(await main()).match(/Sentence 1 of (\d+)/)[1];
await page.fill('#ans', 'elle aime ce moment de la semaine');
await page.keyboard.press('Enter');
assert.match(await main(), /100% of the words/);
for (let i = 1; i < total; i++) { await click('Next sentence'); await click('é'); await click('Check'); }
const has = name => page.getByRole('button', { name, exact: true }).count();
if (await has('Next: speaking')) {                      // 4 say it, where the browser has speech recognition; it may be skipped
  await click('Next: speaking');
  assert.match(await main(), /Read it aloud/);
  while (await has('Next sentence')) await click('Next sentence');
}
await click('Next: writing');                           // 5 write
await page.fill('#ans', 'Claire va au marché. Elle achète du fromage.');
await click('Library');                                 // leaving mid-sitting warns once and keeps what was typed
assert.match(await main(), /Leave this sitting/);
assert.equal(await page.inputValue('#ans'), 'Claire va au marché. Elle achète du fromage.');
await click('Finish the sitting');
const done = await main();
assert.match(done, new RegExp(`${Math.round(100 / total)}%\\s+of the words caught`));
assert.match(done, /8\s+words written/);
await click('Done');

assert.match(await main(), /1 word is due/);            // review: accents forgiven, word scheduled
await click('Review now');
assert.match(await main(), /____/);
await page.fill('#ans', 'PANIER');
await click('Check');
assert.match(await main(), /Right: panier/);
await click('Next');
assert.match(await main(), /1 of 1 right/);
await click('Done');
assert.match(await main(), /0 words are due/);

// AI cowork replies are untrusted: only known fields land, beside the app's own score, and undo removes them
const r = await page.evaluate(() => {
  const { channels: ch, files } = document.querySelector('cowork-panel')._cfg;
  const req = files('sitting-review')['sitting-review/request.json'];
  const reply = { reviews: [{ sessionId: req.payload.sittings[0].sessionId, grade: 'C+', summary: '<img src=x>', fixes: ['a → b', 7], evil: 1 }, { sessionId: 'nope', grade: 'A' }] };
  const rows = ch['sitting-review'].preview(reply);
  const { undo } = ch['sitting-review'].apply(reply, rows.map(x => x.id));
  const st = ch.stories.apply({ stories: [{ title: 'Nouvelle', level: 'A2', text: 'Une phrase.' }, { title: 'no text' }] }, null);
  return { hash: req.requestHash, rows: rows.length, sittings: req.payload.sittings.length, undo, added: st.undo.stories.length };
});
assert.deepEqual([typeof r.hash, r.rows, r.sittings, r.added], ['string', 1, 1, 1]);
await click('Progress');
assert.match(await main(), /C\+\s*<img src=x>[\s\S]*a → b/);
assert.equal(await page.locator('#main img').count(), 0, 'reply text is never markup');
assert.match(await main(), /dictation \d+%/, "the app's own score is still there");
await page.evaluate(u => document.querySelector('cowork-panel')._cfg.channels['sitting-review'].undo(u), r.undo);
assert.match(await main(), /Waiting for the AI review/);
await click('Library');
assert.match(await main(), /Nouvelle/);

await page.reload();                                    // it was saved
await click('Progress');
assert.match(await main(), /Le marché du samedi/);
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no sideways scroll at 390px');

await browser.close();
server.close();
assert.deepEqual(errors, []);
console.log('flow ok: a sitting and a review, saved across a reload');
