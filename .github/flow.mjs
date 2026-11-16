// CI: the app in headless Chrome at phone width: a whole sitting, review, a pen-pal letter, AI cowork
// replies (untrusted), free reading, the word list, a role-play, a second language, and a reload.
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
// the browser's on-device translator cannot fetch its language packs here: a stand-in that wraps the text it is given
await page.addInitScript(() => { self.Translator = { create: async () => ({ translate: async s => 'EN[' + s + ']' }) }; });
// and speech recognition, which needs a microphone: a stand-in that "hears" whatever the test says was said
await page.addInitScript(() => { self.SpeechRecognition = self.webkitSpeechRecognition = class {
  start() { setTimeout(() => { if (self.heard) this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: self.heard }], { isFinal: true })] }); else this.onerror({ error: 'no-speech' }); this.onend(); }, 20); }
  stop() { this.onend(); } }; });
// likewise the browser's own language model: it opens, answers once with a correction, and never answers a message that says "attends"
await page.addInitScript(() => { self.LanguageModel = { availability: async () => 'available', create: async o => { let n = 0; self.lmSystem = o.initialPrompts[0].content;
  return { prompt: text => text.includes('attends') ? new Promise(() => {}) : Promise.resolve(JSON.stringify(n++ ? { reply: 'Très bien. Et que faites-vous demain ?', evil: '<b>',
    corrections: [{ wrong: 'je suis allé bien', right: 'je vais bien', why: 'present tense', x: 1 }, { wrong: 'no right form' }] } : { reply: 'Bonjour ! Comment allez-vous ?', corrections: [] })) }; } }; });
await page.goto(`http://localhost:${server.address().port}/`);
const btn = name => page.getByRole('button', { name, exact: true });
const click = name => btn(name).first().click();
const has = name => btn(name).count();
const main = () => page.innerText('#main');
const fits = async where => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no sideways scroll: ' + where);
// from the end of the dictation to the writing step, skipping whatever lies between (write it back, speaking)
const toWriting = async () => {
  for (let i = 0; i < 20; i++) for (const n of ['Next: writing', 'Next: write it back', 'Next: speaking', 'Next sentence', 'Next line']) if (await has(n)) { await click(n); if (n === 'Next: writing') return; break; }
  assert.fail('never reached the writing step');
};
const marche = JSON.parse(await readFile(path.join(root, 'content/fr.json'), 'utf8')).find(s => s.id === 'fr-marche');

assert.match(await main(), /Welcome/);                  // first run: pick a language and a level, then begin
await click('Begin');
assert.match(await main(), /Le marché du samedi/);
await fits('today');

await click('Start');                                   // listen
await click('Next: questions');                         // questions from the ear alone: two right, one wrong
await page.fill('#q0', marche.questions[0].a[0]);
await page.fill('#q1', 'Je crois : ' + marche.questions[1].a[0].toUpperCase());
await page.fill('#q2', 'aucune idée');
await click('Check');
assert.match(await main(), /Right:[\s\S]*Right:[\s\S]*Not yet:[\s\S]*The answer was/);
await click('Show the text');                           // read: tap two words, take one back
await page.locator('.w[data-k="panier"]').first().click();
assert.match(await page.innerText('#gloss'), /panier\s+basket/);
await page.locator('.w[data-k="marché"]').first().click();
await page.locator('.w[data-k="marché"]').first().click();
await page.locator('.w[data-k="samedi"]').first().click();        // the text brings no meaning for this one: translated on the device
await page.waitForFunction(() => document.querySelector('#gloss').innerText.includes('EN[samedi]'));
await click('Translate the sentence');
await page.waitForFunction(() => document.querySelector('#sent').textContent.startsWith('EN[Chaque samedi matin'));
await page.locator('.w[data-k="samedi"]').first().click();
assert.equal(await page.locator('.w.learn').count(), 2, 'both copies of "panier" are marked, "marché" is not');
assert.match(await main(), /Something to notice/);
await click('Next: dictation');                         // dictation: first sentence right, the rest blank
const total = +(await main()).match(/Sentence 1 of (\d+)/)[1];
await page.fill('#ans', 'elle aime ce moment de la semaine');
await page.keyboard.press('Enter');
assert.match(await main(), /100% of the words/);
for (let i = 1; i < total; i++) { await click('Next sentence'); await click('é'); await click('Check'); }
await click('Next: write it back');                     // write it back: a sentence given only by its meaning
assert.ok((await main()).includes(marche.back[0][1]), 'the story brings the meaning of its own sentence: no translator needed');
await page.fill('#ans', marche.back[0][0]);
await click('Check');
assert.match(await main(), /100% of the words/);
await click('Next sentence');                           // the second sentence is skipped
await click('Next: speaking');                          // say it: nothing heard, then six of the seven words
await click('Speak');
await page.waitForFunction(() => document.querySelector('#micmsg').textContent.includes('Nothing was heard'));
await page.evaluate(() => { self.heard = 'elle aime ce moment de la'; });
await click('Speak');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('It heard:'));
assert.match(await main(), /It heard: elle aime ce moment de la\s+86% of the words/);
assert.equal(await page.locator('#main .big .miss').innerText(), 'semaine');
await toWriting();                                      // the other sentences are skipped; then write
await page.fill('#ans', 'Claire va au marché. Elle achète du fromage.');
await click('Library');                                 // leaving half way warns once and keeps what was typed
assert.match(await main(), /Leave this sitting/);
assert.equal(await page.inputValue('#ans'), 'Claire va au marché. Elle achète du fromage.');
await click('Finish the sitting');
const done = await main();
assert.match(done, /67%\s+of the questions right/);
assert.match(done, new RegExp(`${Math.round(100 / total)}%\\s+of the words caught`));
assert.match(done, /8\s+words written/);
assert.match(done, /100%\s+of the words right when you wrote a sentence back/);
assert.match(done, /86%\s+of your words understood when you spoke/);
await click('Done');

assert.match(await main(), /1 item is due/);            // review: accents forgiven, word scheduled
await click('Review now');
assert.match(await main(), /____/);
await page.fill('#ans', 'PANIER');
await click('Check');
assert.match(await main(), /Right: panier/);
await click('Next');
assert.match(await main(), /1 of 1 right/);
await click('Done');
assert.match(await main(), /0 items are due/);

await click('Open your letters');                       // pen pal: a letter waits for the agent
await page.fill('#ans', 'Bonjour ! Je suis Adam et je habite à Toronto.');
await click('Send');
assert.match(await main(), /Waiting for the reply/);

// AI cowork replies are untrusted: only known fields land, beside the app's own score, and undo removes them
const r = await page.evaluate(() => {
  const { channels: ch, files } = document.querySelector('cowork-panel')._cfg;
  const req = files('sitting-review')['sitting-review/request.json'];
  const reply = { reviews: [{ sessionId: req.payload.sittings[0].sessionId, grade: 'C+', summary: '<img src=x>', fixes: ['a → b', 7], evil: 1,
    corrections: [{ wrong: 'Elle achète du fromages', right: 'Elle achète du fromage', why: 'singular' }, { wrong: 'no right form' }] }, { sessionId: 'nope', grade: 'A' }] };
  const rows = ch['sitting-review'].preview(reply);
  const { undo } = ch['sitting-review'].apply(reply, rows.map(x => x.id));
  const st = ch.stories.apply({ stories: [{ title: 'Nouvelle', level: 'A2', text: 'Une phrase.' }, { title: 'no text' },
    { title: 'Au guichet', level: 'A1', roles: ['Employé', 'Voyageur'], lines: [[0, 'Bonjour.'], [1, "Un billet pour Lyon, s'il vous plaît."], [0, 'Voilà.'], [1, 'Merci beaucoup, au revoir.']] }] }, null);
  const pal = files('penpal')['penpal/request.json'];
  const letters = ch.penpal.apply({ persona: 'Camille, a baker in Lyon', replies: [{ id: pal.payload.pending[0].id, text: 'Bonjour Adam ! Moi, je suis boulangère.', gloss: { boulangère: 'baker' },
    corrections: [{ wrong: 'je habite', right: "j'habite", why: 'elision' }] }, { id: 'nope', text: 'x' }] }, null);
  return { hash: req.requestHash, rows: rows.length, sittings: req.payload.sittings.length, asked: req.payload.sittings[0].questions.length, undo,
    added: st.undo.stories.length, pending: pal.payload.pending.length, answered: letters.undo.items.length };
});
assert.deepEqual([typeof r.hash, r.rows, r.sittings, r.asked, r.added, r.pending, r.answered], ['string', 1, 1, 3, 2, 1, 1]);
assert.match(await main(), /je habite\s*→\s*j'habite[\s\S]*Moi, je suis boulangère/);
await click('Read it and tap the new words');           // the reply is reading material: free reading, no questions
await page.locator('.w[data-k="boulangère"]').first().click();
assert.match(await page.innerText('#gloss'), /boulangère\s+baker/);
await click('Done reading');
assert.match(await main(), /Reading done/);
await click('Done');

assert.match(await main(), /3 items are due/);          // the new word and both corrections
await click('Review now');
await page.fill('#ans', 'boulangere');
await click('Check');
assert.match(await main(), /mind the accents/);
await click('Next');
assert.match(await main(), /Fix your sentence[\s\S]*Elle achète du fromages/);
await page.fill('#ans', 'elle achete du fromage');      // your own mistake comes back to be typed right
await click('Check');
assert.match(await main(), /singular[\s\S]*Right/);
await click('Next');
await page.fill('#ans', 'je habite');
await click('Check');
assert.match(await main(), /Not yet/);
await click('Next');
assert.match(await main(), /2 of 3 right/);
await click('Done');

await click('Progress');
assert.match(await main(), /Where you are[\s\S]*Words known/);
assert.match(await main(), /C\+\s*<img src=x>[\s\S]*a → b/);
assert.equal(await page.locator('#main img').count(), 0, 'reply text is never markup');
assert.match(await main(), /dictation \d+%[\s\S]*questions 67%/, "the app's own numbers are still there");
await fits('progress');
await page.evaluate(u => document.querySelector('cowork-panel')._cfg.channels['sitting-review'].undo(u), r.undo);
assert.match(await main(), /Waiting for the AI review/);

await click('Words');                                   // the word list: search, "I know this", back again
await page.fill('#wq', 'pan');
assert.match(await main(), /panier[\s\S]*Chaque samedi matin/);
await click('I know this');
assert.equal(await has('I know this'), 0);
await click('Review “panier”');
assert.equal(await has('I know this'), 1);
assert.doesNotMatch(await main(), /fromages/, 'undoing the review took its correction away');
await fits('words');

await click('Library');
await click('Dialogues');
assert.match(await main(), /Au guichet/);
assert.doesNotMatch(await main(), /Nouvelle/);
await fits('library');
await page.locator('.card', { hasText: 'Au guichet' }).getByRole('button', { name: 'Role-play', exact: true }).click();
assert.match(await main(), /Bonjour\./);                // the other speaker's line comes first
await page.evaluate(() => { self.heard = 'un billet pour Lyon'; });       // reading the line aloud: four of its eight words heard
await click('Speak');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('It heard:'));
assert.match(await main(), /It heard: un billet pour Lyon\s+50% of the words/);
while (!(await main()).includes('Now from memory')) await click('Next line');
assert.doesNotMatch(await main(), /Un billet pour Lyon/);
await page.fill('#ans', "un billet pour Lyon s'il vous plait");
await click('Check');
assert.match(await main(), /100% of the words/);
await click('Next line');
await page.fill('#ans', 'Merci beaucoup, au revoir');
await click('Check');
await click('Finish');
assert.match(await main(), /Role-play done[\s\S]*83%\s+of your words understood/);   // the mean of 50%, 100% and 100%
await click('Done');

// a live conversation: the partner opens, answers, corrects; a reply can also come through the cowork folder; the corrections become review cards
await click('Talk with an AI partner');
assert.match(await main(), /It runs on this device/);
await page.selectOption('#scene', { label: 'Au guichet' });
await click('Start the conversation');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('Comment allez-vous'));
assert.match(await main(), /Au guichet · You play Voyageur/);
assert.match(await page.evaluate(() => self.lmSystem), /learning French at CEFR level A2[\s\S]*You play Employé; the learner plays Voyageur/);
await page.fill('#ans', 'je suis allé bien');
await click('Send');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('que faites-vous demain'));
assert.match(await main(), /je suis allé bien\s*→\s*je vais bien\s*present tense/);
await page.fill('#ans', 'attends un moment');                    // the on-device model stays silent: the answer arrives the cowork way
await page.keyboard.press('Enter');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('Waiting for the reply'));
const talk = await page.evaluate(() => {
  const { channels: ch, files } = document.querySelector('cowork-panel')._cfg, req = files('chat')['chat/request.json'];
  const reply = { requestHash: req.requestHash, turnId: req.payload.turnId, reply: 'Je vous attends ici.', corrections: [{ wrong: 'attends un moment', right: 'attendez un moment', why: 'vous' }] };
  const stale = ch.chat.preview({ ...reply, turnId: 'another turn' }).length, rows = ch.chat.preview(reply).length, res = ch.chat.apply(reply, ['reply']);
  return { turns: req.payload.turns.map(x => x.who).join(' '), scene: req.payload.scene.roles[1], stale, rows, undo: res.undo };
});
assert.deepEqual([talk.turns, talk.scene, talk.stale, talk.rows], ['you learner you learner', 'Voyageur', 0, 1]);
assert.match(await main(), /attends un moment\s*→\s*attendez un moment[\s\S]*Je vous attends ici\./);
await page.evaluate(u => document.querySelector('cowork-panel')._cfg.channels.chat.undo(u), talk.undo);      // undo takes the line and its correction away again
assert.doesNotMatch(await main(), /Je vous attends ici|attendez un moment/);
await page.evaluate(() => { const { channels: ch, files } = document.querySelector('cowork-panel')._cfg, req = files('chat')['chat/request.json'];
  ch.chat.apply({ turnId: req.payload.turnId, reply: 'Je vous attends ici.', corrections: [] }, null); });
await click('Finish');
assert.match(await main(), /Conversation done: you said 2 things/);
await click('Today');
assert.match(await main(), /2 items are due/);          // "panier" again, and the correction from the conversation

// your own recording with its subtitles: the real sound is played, whole and cue by cue, and it stays on this device
const wav = Buffer.alloc(44 + 16000, 128);              // two seconds of silence
wav.write('RIFF', 0); wav.writeUInt32LE(36 + 16000, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(8000, 28); wav.writeUInt16LE(1, 32); wav.writeUInt16LE(8, 34); wav.write('data', 36); wav.writeUInt32LE(16000, 40);
const srt = "1\n00:00:00,000 --> 00:00:00,600\nBonjour à tous les amis.\n\n2\n00:00:00,700 --> 00:00:01,300\nAujourd'hui nous parlons du pain.\n\n3\n00:00:01,400 --> 00:00:02,000\nMerci beaucoup et à bientôt.\n";
const stored = () => page.evaluate(() => new Promise(done => { const r = indexedDB.open('languagelab'); r.onsuccess = () => { const st = r.result.transaction('kv').objectStore('kv'), keys = st.getAllKeys(), state = st.get('state');
  state.onsuccess = () => done({ audio: keys.result.filter(k => String(k).startsWith('audio:')).length, last: state.result.sittings.at(-1) }); }; }));
await click('Library');
await page.fill('#recTitle', 'Mon podcast');
await page.setInputFiles('#recAudio', { name: 'pod.wav', mimeType: 'audio/wav', buffer: wav });
await page.setInputFiles('#recSubs', { name: 'pod.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(srt) });
await click('Add the recording');
await page.waitForFunction(() => document.querySelector('#main').innerText.includes('Added'), null, { timeout: 5000 }); // the files are read first
assert.match(await main(), /Added “Mon podcast”[\s\S]*your recording/);
await page.locator('.card', { hasText: 'Mon podcast' }).getByRole('button', { name: 'Sitting', exact: true }).click();
await click('▶ Play');
await page.waitForTimeout(2800);                        // the recording plays to its end
await click('Show the text');
assert.match(await main(), /Bonjour à tous les amis\. Aujourd'hui nous parlons du pain\./);
await click('Next: dictation');
await page.fill('#ans', 'bonjour a tous les amis');
await click('Check');
assert.match(await main(), /100% of the words/);
while (await has('Next sentence')) { await click('Next sentence'); await click('Check'); }
await toWriting();
await click('Finish the sitting');
await click('Done');
let kept = await stored();
assert.equal(kept.audio, 1, 'the recording is kept in this app\'s own database');
assert.ok(kept.last.title === 'Mon podcast' && kept.last.listenSec >= 1, 'listening to the recording itself was timed: ' + kept.last.listenSec);
await click('Library');
await click('Remove “Mon podcast”');
await click('Yes, remove');
assert.doesNotMatch(await main(), /Mon podcast/);
assert.equal((await stored()).audio, 0, 'removing the story removes its recording');

await click('Settings');                                // a second language keeps its own library and words
await fits('settings');
await page.selectOption('#main select[data-change="lang"]', 'es');
await click('Today');
assert.match(await main(), /Español/);
assert.equal(await has('Start'), 1, 'Spanish has starter stories');
assert.match(await main(), /0 items are due/);
// Chinese has no spaces: words come from the browser's segmenter, a meaning starts with its pinyin, an answer is found inside what was typed
await click('Settings');
await page.selectOption('#main select[data-change="lang"]', 'zh');
await click('Today');
assert.match(await main(), /中文[\s\S]*星期六的市场/);
await click('Start');
await click('Next: questions');
await page.fill('#q0', '她去市场买东西');
await click('Check');
assert.match(await main(), /Right: 她去市场买东西/);
await click('Show the text');
await page.locator('.w[data-k="市场"]').first().click();
assert.match(await page.innerText('#gloss'), /市场\s+shìchǎng: market/);
await click('Next: dictation');
const hanzi = (await main()).match(/Sentence 1 of (\d)/)[1];
await page.fill('#ans', '她');                                   // marked character by character
await click('Check');
assert.match(await main(), /\d+% of the words/);
assert.ok(+hanzi >= 3, 'a Chinese story yields dictation sentences');
await click('Settings'); await click('Settings');               // leave the sitting (it warns once)
await page.selectOption('#main select[data-change="lang"]', 'fr');

await page.reload();                                    // it was saved
await click('Progress');
assert.match(await main(), /Le marché du samedi[\s\S]*Au guichet|Au guichet[\s\S]*Le marché du samedi/);

await browser.close();
server.close();
assert.deepEqual(errors, []);
console.log('flow ok: sitting, review, pen pal, cowork, reading, words, role-play, conversation, a recording, a second language, reload');
