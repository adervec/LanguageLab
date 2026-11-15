// node core.test.mjs — the one check for core.js. Pins the time zone so day tests mean something.
process.env.TZ = 'America/Toronto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const c = await import('./core.js');

// local day, not UTC: 03:30 UTC on the 2nd is still the 1st in Toronto
assert.equal(c.dayStr(Date.UTC(2026, 0, 2, 3, 30)), '2026-01-01');

// tokens join back to the text; elided clitics are not words; aujourd'hui is one
const txt = "Aujourd'hui, l'école n'est pas loin : j'y vais !";
const tk = c.tokens(txt);
assert.equal(tk.map(x => x.s).join(''), txt);
assert.deepEqual(c.wordKeys(txt), ["aujourd'hui", 'école', 'est', 'pas', 'loin', 'y', 'vais']);

assert.deepEqual(c.sentences('Il pleut. « Viens ! » dit-elle. Elle rit.'), ['Il pleut.', '« Viens ! » dit-elle.', 'Elle rit.']);
assert.equal(c.coverage('le chat dort', { le: 1, chat: 1 }), 2 / 3);

// dictation: accents and case forgiven, order matters, extra words cost nothing, missing words do
assert.equal(c.dictationScore('Elle a mangé une pomme.', 'elle a mange une pomme').score, 1);
const d = c.dictationScore("Il n'a pas vu le chien.", 'il a vu un chien');
assert.equal(d.score, 4 / 7);
assert.deepEqual(d.hits, [true, false, true, false, true, false, true]);
assert.equal(c.dictationScore('Bonjour.', '').score, 0);
assert.equal(c.pickDictation('Un. Deux mots ici non. Voici une phrase assez longue. Encore une autre phrase ici. Et une dernière phrase pour finir. Oui.', 2).length, 2);

assert.equal(c.cloze("L'école est loin de l'école.", 'école'), "L'____ est loin de l'école.");
assert.equal(c.judgeWord(' École ', 'école'), 'exact');
assert.equal(c.judgeWord('ecole', 'école'), 'accent');
assert.equal(c.judgeWord('écoles', 'école'), 'wrong');

// scheduler: 1 day, 3 days, then growing; a miss comes back in ten minutes
let s = c.schedule(null, true, 0); assert.equal(s.interval, 1);
s = c.schedule(s, true, 0); assert.equal(s.interval, 3);
s = c.schedule(s, true, 0); assert.equal(s.interval, 8);
s = c.schedule(s, false, 0); assert.deepEqual([s.interval, s.due, s.lapses], [0, 600000, 1]);
assert.ok(c.isDue({ srs: null }) && !c.isDue({ srs: { due: 10 } }, 5));

const sc = c.scoreSitting({ dictation: [{ score: 1, replays: 1 }, { score: 0.5 }, { score: null }], tapped: ['a', 'b'], uniqueWords: 20, wordsRead: 50, writing: { text: 'Je suis là.' }, speaking: [{ score: 0.5 }, { score: null }] });
assert.equal(sc.score, 75);
assert.deepEqual(sc.breakdown, { listening: 0.75, understood: 0.9, speaking: 0.5, replays: 1, wordsRead: 50, wordsWritten: 3 });
assert.equal(c.scoreSitting({}).score, null);

// outside data: unknown fields dropped, bad shapes refused
assert.equal(c.cleanStory({ title: 'x' }, 'fr'), null);
const st = c.cleanStory({ title: 'T', text: 'Bonjour.', level: 'Z9', gloss: { Chat: 'cat', bad: 3 }, evil: '<script>' }, 'fr');
assert.deepEqual([st.level, st.gloss, st.evil, st.lang], ['', { chat: 'cat' }, undefined, 'fr']);
assert.equal(c.cleanReview({ sessionId: 'a', grade: 'excellent' }), null);
assert.equal(c.cleanReview({ sessionId: 'a', grade: 'b+', fixes: ['x', 4] }).fixes.length, 1);
assert.throws(() => c.cleanState({ v: 1 }));
const state = c.cleanState(JSON.parse(JSON.stringify({ app: 'languagelab', v: 1, langs: { fr: { known: { Chat: 1 }, cards: { chien: { gloss: 'dog', srs: { due: 5 } } } } },
  sittings: [{ id: 's1', day: '2026-01-01', score: 250, ai: { grade: 'A', summary: 'ok' } }, { nope: 1 }], stories: [{ id: 'a', lang: 'fr', title: 'T', text: 'x' }] })));
assert.deepEqual(Object.keys(state.langs.fr.known), ['chat']);
assert.equal(state.langs.fr.cards.chien.srs.due, 5);
assert.deepEqual([state.sittings.length, state.sittings[0].score, state.sittings[0].ai.grade, state.stories.length], [1, 100, 'A', 1]);

// the bundled stories are well formed and every one can be dictated
for (const s of JSON.parse(readFileSync(new URL('./content/fr.json', import.meta.url), 'utf8'))) {
  assert.ok(s.id && c.cleanStory(s, 'fr'), 'story ' + s.id);
  assert.ok(c.pickDictation(s.text).length >= 3, 'dictation in ' + s.id);
  for (const k of Object.keys(s.gloss)) assert.ok(c.wordKeys(s.text).includes(k), `${s.id}: gloss "${k}" is not a word of the text`);
}
console.log('core.test: ok');

// merging this device with Drive loses nothing from either side
{
  const mk = (updatedAt, extra) => c.cleanState({ app: 'languagelab', v: 1, updatedAt, ...extra });
  const here = mk(2, { langs: { fr: { known: { chat: 1, chien: 1 }, cards: { pont: { srs: { t: 1, due: 1 } } } } },
    sittings: [{ id: 'b', at: 2 }], stories: [{ id: 's', lang: 'fr', title: 'T', text: 'x' }] });
  const there = mk(1, { langs: { fr: { known: { pomme: 1 }, cards: { pont: { srs: { t: 9, due: 9 } }, chien: {} } } },
    sittings: [{ id: 'a', at: 1 }, { id: 'b', at: 2, ai: { grade: 'B' } }], stories: [{ id: 's', lang: 'fr', title: 'T', text: 'x', readAt: 7 }] });
  for (const m of [c.mergeState(here, there), c.mergeState(there, here)]) {
    assert.deepEqual(m.sittings.map(s => s.id), ['a', 'b']);
    assert.equal(m.sittings[1].ai.grade, 'B');
    assert.deepEqual(Object.keys(m.langs.fr.known).sort(), ['chat', 'pomme']);
    assert.equal(m.langs.fr.cards.pont.srs.t, 9);
    assert.deepEqual([m.stories.length, m.stories[0].readAt, m.updatedAt], [1, 7, 2]);
  }
  console.log('merge: ok');
}
