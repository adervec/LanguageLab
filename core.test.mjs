// node core.test.mjs                    the one check for core.js and the bundled content
// node core.test.mjs content/es.json    only that content file, listing every problem (for authors)
// Pins the time zone so day tests mean something.
process.env.TZ = 'America/Toronto';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const c = await import('./core.js');

// ---- what every bundled story and dialogue must satisfy (content/AUTHORING.md) ----
const WORDS = { A1: [70, 170], A2: [90, 210], B1: [110, 250], B2: [130, 290], C1: [170, 360] };
function contentProblems(file) {
  const lang = file.match(/([a-z]{2,3})(-\w+)?\.json$/)[1], out = [];
  let list;
  try { list = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return ['not valid JSON: ' + e.message]; }
  if (!Array.isArray(list)) return ['the file must be a JSON array'];
  const ids = new Set(), titles = new Set();
  for (const [i, raw] of list.entries()) {
    const id = raw?.id || '#' + i, bad = m => out.push(`${id}: ${m}`), s = c.cleanStory(raw, lang);
    if (!s) { bad('needs a title and a text (or roles and lines)'); continue; }
    if (!String(raw.id || '').startsWith(lang + '-')) bad(`id must start with "${lang}-"`);
    if (ids.has(raw.id)) bad('duplicate id');
    if (titles.has(s.title)) bad('duplicate title');
    ids.add(raw.id); titles.add(s.title);
    if (!WORDS[s.level]) bad('level must be one of ' + Object.keys(WORDS).join(', '));
    if (/\d/.test(s.text)) bad('no digits: write numbers as words');
    const words = c.plainWords(s.text, lang), keys = new Set(c.wordKeys(s.text, lang));
    const inText = k => c.answerOk(s.text, [k], lang); // the same test a learner's answer gets
    const L = c.langInfo(lang), scale = { ko: 0.6, ja: 1.5, th: 3 }[lang] || 1; // a Korean word carries what takes two words elsewhere; Japanese and Thai need more characters than Chinese
    if (s.lines) {
      if (raw.text) bad('a dialogue has lines, not text');
      if (s.lines.length < 8 || s.lines.length > 18) bad(`a dialogue has 8 to 18 lines (has ${s.lines.length})`);
      for (const r of [0, 1]) if (s.lines.filter(l => l[0] === r).length < 3) bad(`speaker ${r} needs at least 3 lines`);
      for (const l of s.lines) if (c.plainWords(l[1], lang).length > (L.seg ? 60 : 28)) bad('line too long (28 words at most; 60 characters where there are no spaces): ' + l[1].slice(0, 40));
      if (s.lines.filter(l => l[0] === 1 && c.plainWords(l[1], lang).length >= Math.ceil(4 * scale)).length < 3) bad('speaker 1 (the learner) needs at least 3 lines of 4 words or more (3 in Korean)');
    } else {
      const [lo, hi] = (WORDS[s.level] || [0, 1e9]).map(x => Math.round(x * scale));
      if (words.length < lo || words.length > hi) bad(`${s.level} texts have ${lo} to ${hi} words (has ${words.length})`);
    }
    if (c.pickDictation(c.storySentences(s), 4, lang).length < 3) bad('needs at least 3 sentences of 4 to 22 words (for dictation; 3 words will do in Korean, 4 to 40 characters where there are no spaces)');
    const g = Object.keys(s.gloss).length, min = s.lines ? 5 : 10, want = s.lines ? 2 : 3;
    if (g < min || g > 60) bad(`gloss needs ${min} to 60 entries (has ${g})`);
    // (in an unspaced script the key need only be part of the text: versions of the segmenter cut a little differently)
    for (const k of Object.keys(raw.gloss || {})) if (!(L.seg ? s.text.includes(k) : keys.has(c.key(k)))) bad(`gloss "${k}" is not a word of the text (lower case, one word, as written)`);
    if ((s.questions || []).length !== want) bad(`needs exactly ${want} questions (has ${(s.questions || []).length})`);
    for (const q of s.questions || []) {
      if (lang !== 'th' && !/[?？؟;]/.test(q.q)) bad('a question needs a question mark: ' + q.q); // (Thai writes none; Greek writes ;)
      if (/\d/.test(q.q)) bad('no digits in questions');
      for (const k of q.a) {
        if (/^\d+$/.test(k)) continue; // a number may also be answered in digits, which the text never has
        if (!inText(k)) bad(`answer key "${k}" is not in the text (question: ${q.q})`);
        if (c.answerOk(q.q, [k], lang)) bad(`answer key "${k}" is already in its own question: ${q.q}`);
      }
    }
    if (!s.notice || s.notice.length < 40) bad('needs a notice (a grammar or usage point, 40 characters or more)');
    // a story (not in the English set, whose meanings would be English too) carries two sentences to write back from their meaning
    const sents = c.storySentences(s).map(x => x.normalize('NFC'));
    if (!s.lines && lang !== 'en' && (s.back || []).length !== 2) bad(`needs exactly 2 "back" entries (has ${(s.back || []).length})`);
    for (const [x, m] of s.back || []) {
      if (!sents.includes(x.normalize('NFC'))) bad('a "back" sentence must be one whole sentence of the text: ' + x);
      if (m.length < 8) bad('a "back" meaning is too short: ' + m);
    }
  }
  return out;
}
if (process.argv[2]) {
  const p = contentProblems(process.argv[2]);
  console.log(p.length ? p.join('\n') + `\n${p.length} problem(s) in ${process.argv[2]}` : 'ok: ' + process.argv[2]);
  process.exit(p.length ? 1 : 0);
}

// local day, not UTC: 03:30 UTC on the 2nd is still the 1st in Toronto
assert.equal(c.dayStr(Date.UTC(2026, 0, 2, 3, 30)), '2026-01-01');

// tokens join back to the text; elided clitics are not words; aujourd'hui is one
const txt = "Aujourd'hui, l'école n'est pas loin : j'y vais !";
const tk = c.tokens(txt);
assert.equal(tk.map(x => x.s).join(''), txt);
assert.deepEqual(c.wordKeys(txt), ["aujourd'hui", 'école', 'est', 'pas', 'loin', 'y', 'vais']);

// other languages: English keeps "don't" whole and drops a possessive 's; Italian elides but keeps "po'";
// scripts with combining marks keep their words whole; Chinese has no spaces at all
assert.deepEqual(c.wordKeys("I don't know Claire's dog.", 'en'), ['i', "don't", 'know', 'claire', 'dog']);
assert.deepEqual(c.wordKeys("Un po' d'acqua, per favore.", 'it'), ['un', 'po', 'acqua', 'per', 'favore']);
assert.deepEqual(c.wordKeys('Das Mädchen heißt Zoë.', 'de'), ['das', 'mädchen', 'heißt', 'zoë']);
assert.deepEqual(c.wordKeys('मेरा नाम लिया है।', 'hi'), ['मेरा', 'नाम', 'लिया', 'है']);
assert.equal(c.tokens('我喜欢学习中文。', 'zh').map(x => x.s).join(''), '我喜欢学习中文。');
assert.ok(c.wordKeys('我喜欢学习中文。', 'zh').length >= 3);
assert.deepEqual([c.langInfo('fr').bcp, c.langInfo('nl').english, c.isLangCode('nl'), c.isLangCode('<x>')], ['fr-FR', 'Dutch', true, false]);

assert.deepEqual(c.sentences('Il pleut. « Viens ! » dit-elle. Elle rit.'), ['Il pleut.', '« Viens ! » dit-elle.', 'Elle rit.']);
assert.deepEqual(c.sentences('¿Dónde está? No lo sé. ¡Mira!'), ['¿Dónde está?', 'No lo sé.', '¡Mira!']);
assert.deepEqual(c.sentences('今天很冷。我不想出门！'), ['今天很冷。', '我不想出门！']);
// Thai separates with a space and no stop, Urdu has its own stop, Greek asks with a semicolon
assert.deepEqual(c.sentences('วันนี้อากาศดี ไปตลาด', 'th'), ['วันนี้อากาศดี', 'ไปตลาด']);
assert.equal(c.sentences('یہ میرا گھر ہے۔ میں یہاں رہتا ہوں۔').length, 2);
assert.deepEqual([c.sentences('Πού είναι; Είναι εδώ.', 'el').length, c.sentences('Il vient; Elle part.').length], [2, 1]);
assert.deepEqual(c.sentences('「行きましょう。」と言いました。そして出かけました。'), ['「行きましょう。」', 'と言いました。', 'そして出かけました。']);
// Chinese and Japanese are marked character by character, and an answer is looked for inside what was typed; Korean matches a word's stem
assert.deepEqual([c.dictationScore('我喜欢喝茶。', '我喜欢茶', 'zh').score, c.plainWords('我喜欢喝茶。', 'zh').length], [4 / 5, 5]);
assert.ok(c.answerOk('她去了市场。', ['市场'], 'zh') && !c.answerOk('她去了学校。', ['市场'], 'zh'));
assert.ok(c.answerOk('학교에 갑니다', ['학교'], 'ko') && c.answerOk('책을 읽어요', ['책'], 'ko') && !c.answerOk('집에 갑니다', ['학교'], 'ko'));
assert.equal(c.pickDictation('昨日は友だちと一緒に駅の近くの新しいレストランで晩ごはんを食べました。短い。', 4, 'ja').length, 1);
assert.deepEqual(c.sentences('„Komm mit.“ Dann ging er. He said. “Hello.” She left.'), ['„Komm mit.“', 'Dann ging er.', 'He said.', '“Hello.”', 'She left.']);
assert.equal(c.coverage('le chat dort', { le: 1, chat: 1 }), 2 / 3);

// dictation: accents and case forgiven, order matters, extra words cost nothing, missing words do
assert.equal(c.dictationScore('Elle a mangé une pomme.', 'elle a mange une pomme').score, 1);
assert.equal(c.dictationScore('Die Straße ist schön.', 'die strasse ist schon', 'de').score, 1);
const d = c.dictationScore("Il n'a pas vu le chien.", 'il a vu un chien');
assert.equal(d.score, 4 / 7);
assert.deepEqual(d.hits, [true, false, true, false, true, false, true]);
assert.deepEqual(c.dictationScore("L'eau est froide.", 'eau froide').parts.map(p => p.hit), [false, undefined, true, undefined, false, undefined, true, undefined]);
assert.equal(c.dictationScore('Bonjour.', '').score, 0);
// what a recogniser heard: it writes numbers as digits, so one stands for a word of the line (typed text gets no such favour)
assert.deepEqual([c.dictationScore('The trip took five hours.', 'the trip took 5 hours', 'en', true).score, c.dictationScore('The trip took five hours.', 'the trip took 5 hours', 'en').score], [1, 4 / 5]);
assert.deepEqual(c.dictationScore('Elle a deux chats.', 'elle a 2 chiens', 'fr', true).hits, [true, true, true, false]);
assert.equal(c.dictationScore('我有三本书。', '我有3本书', 'zh', true).score, 1);
// speaking: the first guess is the score; a word only a second guess holds is "near", and a typed line has no second guesses
{
  const m = c.speechMarks('Elle aime le poisson frais.', ['elle aime le poison', 'elle aime le poisson', 'elle aime le poisson frais'], 'fr');
  assert.deepEqual([m.score, m.near, m.parts.filter(p => p.hit != null).map(p => p.hit ? 1 : p.near ? 2 : 0)], [3 / 5, 2, [1, 1, 1, 2, 2]]);
  assert.deepEqual([c.speechMarks('Bonjour à tous.', ['bonjour'], 'fr').near, c.speechMarks('Bonjour.', [], 'fr').score, c.speechMarks('Il a cinq chats.', ['il a 5 chats'], 'fr').score, c.speechMarks('Il a cinq chats.', ['il a 5 chats'], 'fr', false).score], [0, 0, 1, 3 / 4]);
  const row = c.cleanState({ app: 'languagelab', v: 1, sittings: [{ id: 'x', lang: 'fr', speaking: [{ target: 'a', heard: 'a', score: 1, tries: 1, near: 2, sure: 0.83, evil: 1 }, { target: 'b', heard: 'b', score: 1, tries: 1, near: 0, sure: 0 }] }] }).sittings[0].speaking;
  assert.deepEqual(row, [{ target: 'a', heard: 'a', score: 1, tries: 1, near: 2, sure: 0.83 }, { target: 'b', heard: 'b', score: 1, tries: 1 }]);
  // a speaking level: two sessions with speaking at the level, 85% understood
  const rows = [{ level: 'A1', sittings: 2, spoken: 2, speaking: 0.9, listening: 0.9, reading: 0.99 }, { level: 'A2', sittings: 2, spoken: 2, speaking: 0.8, listening: 0.5, reading: 0.5 }];
  assert.deepEqual([c.estimate(rows).speaking, c.estimate([{ ...rows[0], spoken: 1 }]).speaking], ['A1', '']);
}
// Arabic script: vowel marks and a hamza on its carrier are forgiven like accents; Arabic and Persian yeh and kaf are one letter
assert.equal(c.dictationScore('شكراً جزيلاً، أنا أحب السفر إلى هناك.', 'شكرا جزيلا انا احب السفر الى هناك', 'ar').score, 1);
assert.equal(c.dictationScore('ماهی و کتاب', 'ماهي و كتاب', 'fa').score, 1);
assert.equal(c.dictationScore('شكراً', 'شكر', 'ar').score, 0); // (a missing letter is still a miss)
// a Persian word in two halves around a zero-width non-joiner: one word to tap, and right typed with the joiner, with a space or joined up
assert.deepEqual(c.wordKeys('من می‌روم.', 'fa'), ['من', 'می‌روم']);
for (const typed of ['من به بازار می‌روم', 'من به بازار می روم', 'من به بازار میروم']) assert.equal(c.dictationScore('من به بازار می‌روم.', typed, 'fa').score, 1);
assert.equal(c.dictationScore('من به بازار می‌روم.', 'من به بازار', 'fa').score, 3 / 5);
// Arabic joins "the" (and a little word before it) to its noun: an answer passes with or without it; a short word is left whole
assert.deepEqual([c.answerOk('يشرب القهوة بالحليب', ['حليب'], 'ar'), c.answerOk('حليب', ['الحليب'], 'ar'), c.answerOk('القطار', ['قطار'], 'ar'), c.answerOk('ألف', ['ف'], 'ar'), c.answerOk('الحليب', ['قطار'], 'ar')], [true, true, true, false, false]);
assert.equal(c.pickDictation('Un. Deux mots ici non. Voici une phrase assez longue. Encore une autre phrase ici. Et une dernière phrase pour finir. Oui.', 2).length, 2);
assert.deepEqual(c.pickDictation(['Oui.', 'Je voudrais un café.'], 4), ['Je voudrais un café.']);

// questions after the first listen: a key word, accents forgiven, a longer ending accepted
assert.ok(c.answerOk('Elle va au marché.', ['marché'], 'fr'));
assert.ok(c.answerOk('aux marches', ['marché'], 'fr'));
assert.ok(c.answerOk('sur la grande place', ['marché', 'la place'], 'fr'));
assert.ok(!c.answerOk('Elle va à la gare.', ['marché', 'la place'], 'fr'));
assert.ok(!c.answerOk('', ['marché'], 'fr'));

assert.equal(c.cloze("L'école est loin de l'école.", 'école'), "L'____ est loin de l'école.");
assert.equal(c.judgeWord(' École ', 'école'), 'exact');
assert.equal(c.judgeWord('ecole', 'école'), 'accent');
assert.equal(c.judgeWord('écoles', 'école'), 'wrong');

// scheduler: 1 day, 3 days, then growing; a miss comes back in ten minutes; "I know this" is never due
let s = c.schedule(null, true, 0); assert.equal(s.interval, 1);
s = c.schedule(s, true, 0); assert.equal(s.interval, 3);
s = c.schedule(s, true, 0); assert.equal(s.interval, 8);
s = c.schedule(s, false, 0); assert.deepEqual([s.interval, s.due, s.lapses], [0, 600000, 1]);
assert.ok(c.isDue({ srs: null }) && !c.isDue({ srs: { due: 10 } }, 5) && !c.isDue({ srs: null, retired: 5 }));

const sc = c.scoreSitting({ lang: 'fr', dictation: [{ score: 1, replays: 1 }, { score: 0.5 }, { score: null }], tapped: ['a', 'b'], uniqueWords: 20, wordsRead: 50,
  writing: { text: 'Je suis là.' }, speaking: [{ score: 0.5 }, { score: null }], rebuild: [{ score: 0.8 }], questions: [{ ok: true }, { ok: false }] });
assert.equal(sc.score, 75);
assert.deepEqual(sc.breakdown, { listening: 0.75, speaking: 0.5, rebuilt: 0.8, comprehension: 0.5, understood: 0.9, replays: 1, wordsRead: 50, wordsWritten: 3 });
assert.equal(c.scoreSitting({}).score, null);
// a conversation's minutes: the learner's own time over their lines (a minute, then ten capped at three); the hour spent waiting for the agent is not counted
assert.equal(c.activeMinutes([{ who: 0, at: 0 }, { who: 1, at: 60e3 }, { who: 0, at: 3660e3 }, { who: 1, at: 4260e3 }], 0), 4);
assert.equal(c.activeMinutes([{ who: 0, at: 5 }], 0), 1);
assert.equal(c.scoreSitting({ mode: 'talk', speaking: [{ score: 0.6 }] }).score, 60);

// outside data: unknown fields dropped, bad shapes refused
assert.equal(c.cleanStory({ title: 'x' }, 'fr'), null);
const st = c.cleanStory({ title: 'T', text: 'Bonjour.', level: 'Z9', gloss: { Chat: 'cat', bad: 3 }, evil: '<script>' }, 'fr');
assert.deepEqual([st.level, st.gloss, st.evil, st.lang], ['', { chat: 'cat' }, undefined, 'fr']);
const dlg = c.cleanStory({ id: 'd', title: 'Au café', level: 'A1', roles: ['Serveur', 'Client'], lines: [[0, 'Bonjour !'], [1, "Un café, s'il vous plaît."], ['x', 'Voilà.']],
  questions: [{ q: 'Que veut le client ?', a: ['café', 7] }, { q: '', a: ['x'] }] }, 'fr');
assert.deepEqual([dlg.text, dlg.lines[2][0], dlg.questions.length, dlg.questions[0].a], ["Bonjour !\nUn café, s'il vous plaît.\nVoilà.", 1, 1, ['café']]);
assert.deepEqual(c.storySentences(dlg), ['Bonjour !', "Un café, s'il vous plaît.", 'Voilà.']);
assert.deepEqual(c.cleanStory({ title: 'T', text: 'Il pleut. Elle rit.', back: [['Il pleut.', 'It is raining.', 'x'], ['Elle rit.'], 7] }, 'fr').back, [['Il pleut.', 'It is raining.']]);
const subs = c.parseSubs('WEBVTT\n\n1\n00:00:01.000 --> 00:00:03,500\n<i>Bonjour</i> à tous.\n\n2\n00:01:02.000 --> 00:01:04.000 align:start\nÇa va ?\nOui.\n');
assert.deepEqual(subs, [[1, 3.5, 'Bonjour à tous.'], [62, 64, 'Ça va ? Oui.']]);
assert.equal(c.cleanStory({ title: 'Podcast', cues: subs }, 'fr').text, 'Bonjour à tous. Ça va ? Oui.');
assert.equal(c.cleanReview({ sessionId: 'a', grade: 'excellent' }), null);
const rv = c.cleanReview({ sessionId: 'a', grade: 'b+', fixes: ['x', 4], corrections: [{ wrong: 'je suis allé', right: 'je suis allée', why: 'agreement', evil: 1 }, { wrong: 'x' }] });
assert.deepEqual([rv.fixes.length, rv.corrections], [1, [{ wrong: 'je suis allé', right: 'je suis allée', why: 'agreement' }]]);
assert.equal(c.cleanPalReply({ id: 'm', text: ' ' }), null);
assert.deepEqual(c.cleanPalReply({ id: 'm', text: 'Salut', gloss: { Salut: 'hi' }, corrections: [{ wrong: 'a', right: 'b' }], x: 1 }),
  { id: 'm', text: 'Salut', gloss: { salut: 'hi' }, corrections: [{ wrong: 'a', right: 'b', why: '' }] });
assert.equal(c.cleanChatReply({ reply: ' ' }), null);
assert.deepEqual(c.cleanChatReply({ turnId: 't1', reply: 'Bonjour !', corrections: [{ wrong: 'a', right: 'b', why: 'c', x: 1 }, 5], evil: '<b>' }),
  { turnId: 't1', reply: 'Bonjour !', corrections: [{ wrong: 'a', right: 'b', why: 'c' }] });
// a "correction" that changes nothing is dropped (the browser's small model sends those)
assert.deepEqual(c.cleanChatReply({ reply: 'x', corrections: [{ wrong: "J'ai acheté", right: "j'ai acheté", why: 'no mistake' }, { wrong: 'des pomme', right: 'des pommes' }] }).corrections, [{ wrong: 'des pomme', right: 'des pommes', why: '' }]);
// a teacher with no server: the writing goes out inside a link, the corrections come back inside another; both are outside text
{
  const link = c.packLink({ id: 's1', lang: 'fr', level: 'A2', title: 'Le marché', text: 'Elle est très content. 日本', evil: '<b>' });
  assert.match(link, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(c.cleanTeach(JSON.parse(c.linkText(link))), { id: 's1', lang: 'fr', level: 'A2', title: 'Le marché', story: '', text: 'Elle est très content. 日本' });
  assert.deepEqual([c.linkText('%%%'), c.linkText('x'.repeat(70000)), c.cleanTeach({ id: 's1' }), c.cleanTeacher({ id: 's1' })], ['', '', null, null]);
  assert.deepEqual(c.cleanTeacher({ id: 's1', note: ' Bien ! ', corrections: [{ wrong: 'content', right: 'contente', why: 'feminine', x: 1 }, { wrong: 'x' }], evil: 1 }),
    { id: 's1', note: 'Bien !', corrections: [{ wrong: 'content', right: 'contente', why: 'feminine' }] });
  const mk = (updatedAt, teacher) => c.cleanState({ app: 'languagelab', v: 1, updatedAt, sittings: [{ id: 's1', at: 1, ...(teacher ? { teacher } : {}) }] });
  const taught = mk(1, { note: 'Bien', corrections: [{ wrong: 'a', right: 'b' }], at: 5, evil: 1 });
  assert.deepEqual(taught.sittings[0].teacher, { note: 'Bien', corrections: [{ wrong: 'a', right: 'b', why: '' }], at: 5 });
  assert.equal(c.mergeState(mk(2), taught).sittings[0].teacher.note, 'Bien'); // a newer copy without it does not lose it
}
assert.throws(() => c.cleanState({ v: 1 }));
const state = c.cleanState(JSON.parse(JSON.stringify({ app: 'languagelab', v: 1, level: 'B1', gone: { z: 5 }, langs: { fr: { known: { Chat: 1 }, cards: { chien: { gloss: 'dog', srs: { due: 5 } } } }, '<b>': {} },
  sittings: [{ id: 's1', day: '2026-01-01', score: 250, ai: { grade: 'A', summary: 'ok' } }, { nope: 1 }],
  stories: [{ id: 'a', lang: 'fr', title: 'T', text: 'x' }, { id: 'z', lang: 'fr', title: 'Z', text: 'x' }] })));
assert.deepEqual(Object.keys(state.langs), ['fr']);
assert.deepEqual(Object.keys(state.langs.fr.known), ['chat']);
assert.equal(state.langs.fr.cards.chien.srs.due, 5);
assert.deepEqual([state.langs.fr.level, state.langs.fr.pal.msgs.length, state.sittings[0].mode], ['B1', 0, 'sitting']); // a save from before levels were per language
assert.deepEqual([state.sittings.length, state.sittings[0].score, state.sittings[0].ai.grade, state.stories.map(x => x.id)], [1, 100, 'A', ['a']]);

// ability, level by level, and the level the numbers support
{
  const S = c.cleanState({ app: 'languagelab', v: 1, langs: { fr: { known: { le: 1, chat: 1, dort: 1 } } },
    stories: [{ id: 'a', lang: 'fr', level: 'A1', title: 'A', text: 'Le chat dort.' }, { id: 'b', lang: 'fr', level: 'A2', title: 'B', text: 'Le chien court vite.' }],
    sittings: [1, 2].map(i => ({ id: 's' + i, lang: 'fr', level: 'A1', breakdown: { listening: 0.9, comprehension: 1 } })) });
  const rows = c.abilities(S, 'fr');
  assert.deepEqual(rows.map(r => [r.level, r.reading, r.listening, r.sittings]), [['A1', 1, 0.9, 2], ['A2', 0.25, null, 0]]);
  assert.deepEqual(c.estimate(rows), { reading: 'A1', listening: 'A1', speaking: '' }); // (nothing was spoken in those sittings)
}
// suggestions from the browser's own model on a retelling stay beside the sitting: three at most, known fields only, none that changes nothing
{ const rows = c.cleanState({ app: 'languagelab', v: 1, sittings: [{ id: 's1', hints: [{ wrong: ' je suis allé bien ', right: 'je vais bien', why: 'present', evil: 1 }, { wrong: 'no right form' }, 'junk',
    { wrong: 'Je suis', right: 'je suis' }, { wrong: 'a', right: 'b' }, { wrong: 'c', right: 'd' }, { wrong: 'e', right: 'f' }] }, { id: 's2', hints: 'none' }] }).sittings;
  assert.deepEqual(rows[0].hints, [{ wrong: 'je suis allé bien', right: 'je vais bien', why: 'present' }, { wrong: 'a', right: 'b', why: '' }, { wrong: 'c', right: 'd', why: '' }]);
  assert.ok(!('hints' in rows[1])); }
// what stood in a word's place: only where a gap holds as many words heard as wanted; and which letters two words share
{ assert.deepEqual(c.speechMarks('Elle aime le poisson frais.', ['elle aime le poison frais'], 'fr').subs, [['poisson', 'poison']]);
  assert.deepEqual(c.speechMarks('Elle aime le poisson frais.', ['elle aime le'], 'fr').subs, []);          // nothing was said there
  assert.deepEqual(c.speechMarks('Bonjour à tous.', ['bonjour à vous tous'], 'fr').subs, []);                // a word too many stands for none
  assert.deepEqual(c.speechMarks('Je vois la rue.', ['je bois la roue'], 'fr').subs, [['vois', 'bois'], ['rue', 'roue']]);
  assert.deepEqual(c.letterDiff('rue', 'roue'), [[['rue', true]], [['r', true], ['o', false], ['ue', true]]]);
  assert.deepEqual(c.letterDiff('Été', 'étais'), [[['Ét', true], ['é', false]], [['ét', true], ['ais', false]]]);
  assert.deepEqual(c.letterDiff('chat', ''), [[['chat', false]], []]); }
// a number typed in any script's digits
{ assert.equal(c.digits(' ٤٧ '), '47'); assert.equal(c.digits('१२०'), '120'); assert.equal(c.digits('۱۹۸۴'), '1984'); assert.equal(c.digits('๕๐'), '50');
  assert.equal(c.digits('1 000'), '1000'); assert.equal(c.digits('４７'), '47'); assert.equal(c.digits('abc'), ''); assert.equal(c.digits(null), ''); }
// a first lesson from an AI: its phrases are short, have no digits, are not said twice and can be marked; fewer than four is no lesson
{ const l = c.cleanLesson({ title: 'First words', evil: '<script>', phrases: [['שלום', 'Hello', 'shalom'], ['תודה רבה', 'Thank you very much', 'toda raba'], ['כן', 'Yes', 'ken'], ['לא', 'No', 'lo'],
    ['יש לי 3 ילדים', 'I have 3 children', 'x'], ['', 'empty'], ['שלום', 'again', 'x'], ['?!', 'nothing to mark'], [7, 'not a string']] }, 'he');
  assert.deepEqual([l.title, l.phrases, l.back.length, l.back[0], l.evil, l.text.split('\n').length, l.lang], ['First words', true, 4, ['שלום', 'Hello', 'shalom'], undefined, 4, 'he']);
  assert.deepEqual(c.cleanLesson({ title: 'Latin', phrases: [['a b', 'x', ''], ['c d', 'x'], ['e f', 'x'], ['g h', 'x']] }, 'fr').back[0], ['a b', 'x']);   // no reading where none is given
  assert.equal(c.cleanLesson({ title: 'Too short', phrases: [['שלום', 'Hello'], ['כן', 'Yes']] }, 'he'), null);
  assert.equal(c.cleanLesson({ phrases: [['a b', 'x'], ['c d', 'x'], ['e f', 'x'], ['g h', 'x']] }, 'fr'), null);
  assert.equal(c.cleanLesson(null, 'fr'), null); }
// the sound itself: the pitch of a frame, when a voice was there, and how its pitch moved
{ const tone = (hz, rate = 12000, n = 512) => Float32Array.from({ length: n }, (_, i) => 0.3 * Math.sin(2 * Math.PI * hz * i / rate));
  for (const hz of [110, 220, 330]) assert.ok(Math.abs(c.pitchOf(tone(hz), 12000) - hz) < hz * 0.04, 'the pitch of ' + hz + ' Hz: ' + c.pitchOf(tone(hz), 12000));
  assert.equal(c.pitchOf(new Float32Array(512), 12000), 0);                                   // silence
  let seed = 7; const noise = Float32Array.from({ length: 512 }, () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.3);
  assert.equal(c.pitchOf(noise, 12000), 0);                                                   // noise has no pitch
  // half a second of room, a second of voice, a pause of 0.6 s, half a second of voice, room again
  const fr = []; for (let k = 0; k < 107; k++) { const s = k * 0.03, on = (s >= 0.5 && s < 1.5) || (s >= 2.1 && s < 2.6); fr.push([s, on ? 0.2 : 0.004, on ? 180 + 60 * s : 0]); }
  const v = c.voiceStats(fr);
  assert.ok(Math.abs(v.sec - 2.07) < 0.1 && v.pauses === 1 && v.pitch.length > 40, JSON.stringify([v.sec, v.pauses, v.pitch.length]));
  assert.deepEqual(c.voiceStats([[0, 0.001, 0], [0.03, 0.001, 0]]), { sec: 0, pauses: 0, pitch: [] });
  // a vowel made of a pulse train through four resonances: the back vowel is dark, the front ones bright, a half-fronted one between
  const vowel = (f0, formants, rate = 12000) => { const n = rate * 0.6, x = new Float64Array(n); for (let t = 0; t < n; t += rate / f0) x[Math.round(t)] = 1;
    let lp = 0; for (let i = 0; i < n; i++) { lp = 0.9 * lp + x[i]; x[i] = lp; }
    for (const [F, B] of formants) { const C = -Math.exp(-2 * Math.PI * B / rate), Bc = 2 * Math.exp(-Math.PI * B / rate) * Math.cos(2 * Math.PI * F / rate), A = 1 - Bc - C; let y1 = 0, y2 = 0;
      for (let i = 0; i < n; i++) { const y = A * x[i] + Bc * y1 + C * y2; y2 = y1; y1 = y; x[i] = y; } }
    const peak = x.reduce((m, s) => Math.max(m, Math.abs(s)), 0); return x.map(s => 0.3 * s / peak); };
  const heard = (f0, formants, rate = 12000) => { const x = vowel(f0, formants, rate), fr = [];                                 // the vowel from the first frame to the last: no quiet room
    for (let at = 0, k = 0; at + 512 <= x.length; at += Math.round(rate * 0.03), k++) { const f = x.subarray(at, at + 512); fr.push([k * 0.03, 0.2, c.pitchOf(f, rate), c.brightOf(f, rate)]); }
    return c.heldVowel(fr); };
  const U = [[290, 60], [750, 90], [2300, 150], [3300, 200]], Y = [[250, 60], [1750, 90], [2150, 150], [3300, 200]], I = [[250, 60], [2250, 90], [3000, 150], [3500, 200]], MID = [[320, 60], [1400, 90], [2300, 150], [3300, 200]];
  for (const f0 of [110, 140, 220]) for (const rate of [12000, 11025])
    assert.deepEqual([U, MID, Y, I].map(f => c.tongueSpot(heard(f0, f, rate))), ['back', 'between', 'front', 'front'], `vowels at ${f0} Hz, ${rate} samples a second`);
  assert.ok(heard(140, U) < 900 && heard(140, Y) > 1650, JSON.stringify([heard(140, U), heard(140, Y)]));
  assert.deepEqual([c.brightOf(new Float32Array(512), 12000), c.tongueSpot(0), c.tongueSpot(820), c.tongueSpot(1300), c.tongueSpot(2100)], [0, '', 'back', 'between', 'front']);
  // a front vowel made another way (a sawtooth through filters side by side), where the first resonance tails off slowly: still front
  const side = (f0, formants, rate = 12000) => { const n = rate * 0.6, out = new Float64Array(n);
    for (const [F, g] of formants) { const w0 = 2 * Math.PI * F / rate, al = Math.sin(w0) / (2 * F / 90), a1 = -2 * Math.cos(w0); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < n; i++) { const s = 2 * ((i * f0 / rate) % 1) - 1, y = (al * s - al * x2 - a1 * y1 - (1 - al) * y2) / (1 + al); x2 = x1; x1 = s; y2 = y1; y1 = y; out[i] += g * y; } }
    const fr2 = []; for (let at = 0, k = 0; at + 512 <= n; at += Math.round(rate * 0.03), k++) { const f = out.subarray(at, at + 512); fr2.push([k * 0.03, 0.2, c.pitchOf(f, rate), c.brightOf(f, rate)]); }
    return c.heldVowel(fr2); };
  assert.deepEqual([[[290, 1], [750, 0.6], [2300, 0.05]], [[320, 1], [1400, 0.5], [2300, 0.15]], [[250, 1], [1750, 0.5], [2150, 0.35]]].map(f => c.tongueSpot(side(140, f))), ['back', 'between', 'front']);
  // too short a sound, or one with no pitch, gives no answer; a quiet stretch before the vowel changes nothing
  const held = n => Array.from({ length: n }, (_, k) => [k * 0.03, 0.2, 140, 800]);
  assert.deepEqual([c.heldVowel(held(7)), c.heldVowel(held(8)), c.heldVowel(held(20).map(f => [f[0], f[1], 0, f[3]])), c.heldVowel([[0, 0.004, 0, 0], [0.03, 0.004, 90, 3000], ...held(12)]), c.heldVowel([])], [0, 800, 0, 800, 0]);
  const line = f => Array.from({ length: 20 }, (_, i) => [i * 0.03, f(i / 19)]);
  assert.deepEqual([line(() => 200), line(x => 150 + 150 * x), line(x => 300 - 150 * x), line(x => 200 - 240 * x * (1 - x)), [[0, 200]]].map(c.pitchShape), ['level', 'rising', 'falling', 'dipping', '']); }
// a placement by ear: two sentences from one bundled story of each level; it says to start where less than 80% was caught
{ const text = n => `Voici une première phrase assez simple. Elle marche tous les jours avec ${n} au bord de la mer. Le soir, nous mangeons ensemble dans le jardin. Demain, il fera beau partout.`;
  const st = (id, level, extra) => ({ id, lang: 'fr', level, source: 'starter', text: text(id), ...extra });
  const cards = c.placeCards([st('b', 'B1'), st('a', 'A1'), st('a2', 'A1'), st('t', 'A2', { lines: [[0, 'Bonjour.']] }), st('p', 'A2', { source: 'pasted' }), st('x', 'B2', { text: 'Trop court.' }), { ...st('d', 'A2'), lang: 'de' }], 'fr', l => l[l.length - 1]);
  assert.deepEqual(cards.map(x => x.level), ['A1', 'A1', 'B1', 'B1']);                       // a dialogue, a pasted text, a text too short and another language give none
  assert.ok(cards[0].target.includes('avec a2') && cards[0].target !== cards[1].target);  // the story the caller picked, two different sentences
  const r = (level, score) => ({ level, score });
  assert.deepEqual(c.placeLevel([r('A1', 1), r('A1', 0.9), r('A2', 0.9), r('A2', 0.6)]), { by: [{ level: 'A1', score: 0.95 }, { level: 'A2', score: 0.75 }], level: 'A2', all: false });
  assert.deepEqual([c.placeLevel([r('A1', 0.2), r('A1', 0.5)]).level, c.placeLevel([r('A1', 1), r('A1', 1), r('B1', 0.8), r('B1', 0.8)]), c.placeLevel([]).level],
    ['A1', { by: [{ level: 'A1', score: 1 }, { level: 'B1', score: 0.8 }], level: 'B1', all: true }, '']); }
// a word practised on its own: by ear, and aloud (understood, nearly, taken for the other word of its pair, or missed)
{ let r; for (const [how, ok] of [['ear', true], ['ear', false], ['hit'], ['near'], ['other'], ['other'], ['miss']]) r = c.aloneAdd(r, how, ok, 9);
  assert.deepEqual(r, [2, 1, 5, 1, 1, 2, 9]);
  const st = c.aloneStats({ rue: r, roue: [0, 0, 3, 3, 0, 0, 1], chat: [0, 0, 2, 0, 0, 0, 1], vin: [4, 4, 4, 2, 0, 0, 1] });
  assert.deepEqual([st.ear, st.earOk, st.said, st.hit, st.weak.map(x => x.word)], [6, 5, 14, 6, ['rue', 'vin']]); // two tries are too few to say
  assert.deepEqual(c.aloneStats(undefined), { ear: 0, earOk: 0, said: 0, hit: 0, weak: [] });
  // from outside: counts that cannot be are cut down, an empty record is dropped; a merge keeps the longer record of each word
  const mk = (updatedAt, alone) => c.cleanState({ app: 'languagelab', v: 1, updatedAt, langs: { fr: { alone } } });
  const a = mk(2, { rue: [1, 5, 2, 9, 9, 9, 3], vide: [0, 0, 0, 0, 0, 0, 0], bad: 'x', lac: [0, 0, 1, 1] }), b = mk(1, { rue: [2, 2, 6, 1, 0, 4, 1], roue: [1, 1, 0, 0, 0, 0, 1] });
  assert.deepEqual(a.langs.fr.alone, { rue: [1, 1, 2, 2, 0, 0, 3], lac: [0, 0, 1, 1, 0, 0, 0] });
  for (const m of [c.mergeState(a, b), c.mergeState(b, a)]) assert.deepEqual(m.langs.fr.alone, { rue: [2, 2, 6, 1, 0, 4, 1], roue: [1, 1, 0, 0, 0, 0, 1], lac: [0, 0, 1, 1, 0, 0, 0] });
  assert.deepEqual(c.mergeState(c.cleanState({ app: 'languagelab', v: 1, updatedAt: 3, langs: { fr: {} } }), b).langs.fr.alone.rue, [2, 2, 6, 1, 0, 4, 1]); }
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
  // a removed story stays removed, "I know this" stays known, corrections and letters are joined
  const a = mk(5, { langs: { fr: { cards: { pont: { srs: { t: 3, due: 3 } } }, fixes: { 'x:0': { wrong: 'je suis allé', right: 'je suis allée', srs: { t: 1 } } },
    pal: { msgs: [{ id: 'm1', at: 1, text: 'Bonjour' }, { id: 'm2', at: 2, text: 'Salut' }] } } },
    stories: [{ id: 's', lang: 'fr', title: 'T', text: 'x' }, { id: 'k', lang: 'fr', title: 'K', text: 'y' }] });
  const b = mk(4, { gone: { s: 9 }, langs: { fr: { cards: { pont: { retired: 7, srs: { t: 3, due: 3 } } }, fixes: { 'x:0': { wrong: 'je suis allé', right: 'je suis allée', srs: { t: 6, due: 6 } } },
    pal: { persona: 'Camille', msgs: [{ id: 'm1', at: 1, text: 'Bonjour', reply: { text: 'Salut !', at: 3 } }] } } } });
  for (const m of [c.mergeState(a, b), c.mergeState(b, a)]) {
    assert.deepEqual(m.stories.map(s => s.id), ['k']);
    assert.ok(m.langs.fr.cards.pont.retired && m.langs.fr.known.pont);
    assert.equal(m.langs.fr.fixes['x:0'].srs.t, 6);
    assert.deepEqual([m.langs.fr.pal.persona, m.langs.fr.pal.msgs.length, m.langs.fr.pal.msgs[0].reply.text], ['Camille', 2, 'Salut !']);
  }
  // a conversation in progress: the longer copy wins; once finished on one device it does not come back from the other
  const turn = (id, who, text) => ({ id, who, text, at: 1 });
  const p = mk(9, { langs: { fr: { chat: { id: 'c1', wait: 't2', scene: { title: 'Au café', roles: ['Serveur', 'Client'], evil: 1 }, turns: [turn('t1', 0, 'Bonjour !'), turn('t2', 1, 'Un café')] } } } });
  const q = mk(8, { langs: { fr: { chat: { id: 'c1', turns: [turn('t1', 0, 'Bonjour !')] } } } });
  const done = mk(7, { sittings: [{ id: 'c1', mode: 'chat', at: 5 }], langs: { fr: {} } });
  assert.deepEqual([p.langs.fr.chat.scene, p.langs.fr.chat.turns[1].who], [{ title: 'Au café', roles: ['Serveur', 'Client'] }, 1]);
  assert.equal(c.mergeState(q, p).langs.fr.chat.turns.length, 2);
  assert.equal(c.mergeState(p, done).langs.fr.chat, null);
  assert.equal(c.mergeState(done, p).sittings[0].mode, 'chat');
  console.log('merge: ok');
}

// the bundled content: every language with starter stories has a full, well-formed set
{
  const files = readdirSync(new URL('./content/', import.meta.url)).filter(f => f.endsWith('.json') && f !== 'first.json'), bad = [];
  for (const f of files) bad.push(...contentProblems('content/' + f).map(p => f + ' ' + p));
  const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  for (const code of Object.keys(c.LANGS)) {
    if (!sw.includes(`'content/${code}.json'`)) bad.push(`sw.js does not keep content/${code}.json for offline use`);
    let list = [];
    try { list = JSON.parse(readFileSync(new URL(`./content/${code}.json`, import.meta.url), 'utf8')); } catch { /* reported below */ }
    const dialogues = list.filter(x => x.lines).length;
    const [stories, talks] = c.LANGS[code].mini ? [4, 2] : c.LANGS[code].small ? [8, 4] : [16, 8]; // a full set, half a set, a first handful (how a new language may start)
    if (list.length - dialogues < stories || dialogues < talks) bad.push(`content/${code}.json needs ${stories} stories and ${talks} dialogues (has ${list.length - dialogues} and ${dialogues})`);
  }
  if (bad.length) { console.log(bad.slice(0, 40).join('\n')); assert.fail(`${bad.length} content problem(s)`); }
  console.log(`content: ok (${files.length} files)`);
}

// first steps (content/first.json): 240 phrases a language (480 in the eight with full sets of stories), each one scoreable; a reading where the script is not Latin; charts and sounds well formed
{
  const first = JSON.parse(readFileSync(new URL('./content/first.json', import.meta.url), 'utf8')), bad = [];
  const latin = s => /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]+$/u.test(s);
  assert.deepEqual([first.meanings.length, first.lessons.length], [480, 60]);
  for (const [code, list] of Object.entries(first.langs)) {
    if (!c.isLangCode(code) || ![240, first.meanings.length].includes(list.length)) bad.push(`${code}: needs 240 or ${first.meanings.length} phrases (has ${list.length})`);
    const seen = new Set(), read = first.readings[code];
    list.forEach((p, i) => {
      const [text, own] = Array.isArray(p) ? p : [p, 'x'];
      if (typeof text !== 'string' || !text.trim() || text.length > 80 || typeof own !== 'string' || !own) bad.push(`${code} #${i}: a phrase is a short string, or [phrase, its own meaning]`);
      else if (/\d/.test(text)) bad.push(`${code} #${i}: no digits`);
      else if (!c.plainWords(text, code).length || c.dictationScore(text, text, code).score !== 1) bad.push(`${code} #${i}: cannot be scored: ${text}`);
      else if (seen.has(text)) bad.push(`${code} #${i}: the same phrase twice: ${text}`);
      seen.add(text);
    });
    if (list.every(p => latin(Array.isArray(p) ? p[0] : p)) === !!read) bad.push(`${code}: a script that is not Latin needs readings, a Latin one has none`);
    if (read && (read.length !== list.length || !read.every(r => typeof r === 'string' && r && latin(r)))) bad.push(`${code}: needs a reading in Latin letters for every phrase`);
  }
  for (const [code, rows] of Object.entries(first.sounds)) for (const [letters, word, hint] of rows) {
    if (!first.langs[code] || !letters || !word || !hint) bad.push(`${code}: a sound is [letters, example word, what to listen for]`);
    else if (!c.langInfo(code).seg && !letters.split(' ').some(x => word.toLowerCase().includes(x.replace(/-/g, '')))) bad.push(`${code}: "${word}" does not show "${letters}"`);
  }
  for (const code of Object.keys(first.langs)) if (!(first.sounds[code]?.length >= 5)) bad.push(`${code}: needs its sounds to notice`);
  for (const [code, rows] of Object.entries(first.pairs)) for (const [a, b, hint] of rows) { // two different single words, and what each means
    const k = w => c.wordKeys(String(w), code);
    if (!first.langs[code] || !hint || k(a).length !== 1 || k(b).length !== 1 || k(a)[0] === k(b)[0]) bad.push(`${code}: a pair is [word, another word, what each means]: ${a} / ${b}`);
  }
  for (const [code, charts] of Object.entries(first.scripts)) for (const [name, src] of charts) {
    const pairs = c.chartPairs(src);
    if (!first.langs[code] || !name || pairs.length < 5 || pairs.length !== src.split(' ').length) bad.push(`${code} ${name}: a chart is "letter=reading" pairs`);
    if (new Set(pairs.map(p => p[0])).size !== pairs.length) bad.push(`${code} ${name}: a letter appears twice`);
    for (const [ch, r] of pairs) if (!c.readingOk(r[0].toUpperCase(), r)) bad.push(`${code} ${name}: ${ch} has no usable reading`);
  }
  if (bad.length) { console.log(bad.slice(0, 40).join('\n')); assert.fail(`${bad.length} problem(s) in content/first.json`); }

  // the lessons built from it: the meaning in the reader's own language where the file has it, a reading, no level
  const ru = c.lessonStories(first, 'ru', 'fr').map(s => c.cleanStory(s, 'ru'));
  assert.deepEqual([ru.length, ru[0].id, ru[29].id, ru[0].title, ru[0].level, ru[0].phrases, ru[0].back.length, ru[0].source], [60, 'ru-first-01', 'ru-first-30', 'Hello and goodbye', '', true, 8, 'first']);
  // a phrase that names the language keeps its English meaning, with the name of the language being learned; English can be learned too
  assert.deepEqual([ru[6].back[7][0], ru[6].back[7][1], c.lessonStories(first, 'en', 'es')[0].back[0][1], c.lessonStories(first, 'en', 'es')[6].back[7][1]], ['Я учу русский язык.', 'I am learning Russian.', 'Hola.', 'I am learning English.']);
  assert.deepEqual(ru[0].back[0], ['Здравствуйте.', 'Bonjour.', 'Zdravstvuyte.']);
  assert.deepEqual(c.cleanStory(c.lessonStories(first, 'es')[0], 'es').back[1], ['Buenas tardes.', 'Good afternoon.']); // a phrase with its own meaning
  assert.equal(c.lessonStories(first, 'ru', 'es')[0].back[1][1], 'Good evening.');   // the reader's own phrase there means something else: English instead
  assert.equal(c.lessonStories(first, 'ru', 'ru')[0].back[0][1], 'Hello.');
  // a language with all sixty lessons: a meaning beyond what the reader's own language has is the English one
  assert.deepEqual([c.lessonStories(first, 'fr', 'sw').length, c.lessonStories(first, 'fr', 'sw')[30].back[0][1], c.lessonStories(first, 'fr', 'es')[30].back[0][1], c.lessonStories(first, 'fr', 'es')[59].title],
    [60, 'I am looking for a flat with two rooms.', 'Busco un piso de dos habitaciones.', 'The old tree']);
  assert.deepEqual([c.storySentences(ru[0]).length, c.lessonStories(first, 'xx').length, c.lessonStories(null, 'ru').length], [8, 0, 0]);
  // lessons have no level, so they never count towards what the numbers say you can read
  const S = c.cleanState({ app: 'languagelab', v: 1, stories: ru, sittings: [{ id: 'f1', lang: 'ru', mode: 'first', level: '' }] });
  assert.deepEqual([S.stories.length, S.stories[0].phrases, S.stories[0].back[0][2], S.sittings[0].mode, c.abilities(S, 'ru')], [60, true, 'Zdravstvuyte.', 'first', []]);
  // letters to tap where the keyboard lacks the script; only the accented ones for a Latin script
  assert.deepEqual(c.lessonKeys('Да. Нет.', 'ru'), ['а', 'д', 'е', 'н', 'т', ' ', '⌫']);
  assert.deepEqual(c.lessonKeys('Où est la gare ? Ça va.', 'fr'), ['ç', 'ù']);
  assert.deepEqual(c.lessonKeys('İstasyon nerede?', 'tr'), []);
  assert.deepEqual(c.chartPairs('あ=a し=shi/si junk'), [['あ', ['a']], ['し', ['shi', 'si']]]);
  assert.ok(c.readingOk(' SHI ', ['shi', 'si']) && c.readingOk('si', ['shi', 'si']) && !c.readingOk('su', ['shi', 'si']) && !c.readingOk('', ['a']));
  // words with pictures: twelve lessons of eight nouns in every language, a picture for each, a reading where the script is not Latin,
  // no word twice in a language (a learner must be able to tell two cards apart), every word one the app can mark
  {
    const badWords = [], icons = first.wordIcons;
    assert.deepEqual([first.wordLessons.length, icons.length, new Set(icons).size, first.wordMeanings.length, icons.every(x => /^\p{Extended_Pictographic}\uFE0F?$/u.test(x))], [12, 96, 96, 96, true]);
    assert.deepEqual(Object.keys(first.words).sort(), Object.keys(first.langs).sort());
    assert.deepEqual(Object.keys(first.wordReadings).sort(), Object.keys(first.readings).sort());
    for (const [code, list] of Object.entries(first.words)) { const seen = new Set();
      if (list.length !== 96) badWords.push(`${code}: ${list.length} words`);
      if (first.wordReadings[code] && (first.wordReadings[code].length !== 96 || !first.wordReadings[code].every(r => typeof r === 'string' && r.trim() && !/[^\u0000-\u024f\u1e00-\u1eff\u02bc]/.test(r)))) badWords.push(`${code}: a reading is missing or not in Latin letters`);
      list.forEach((p, n) => { const w = Array.isArray(p) ? p[0] : p;
        if (typeof w !== 'string' || !w.trim() || w.length > 80 || /\d/.test(w) || (Array.isArray(p) && !(p.length === 2 && typeof p[1] === 'string' && p[1].trim()))) badWords.push(`${code} word ${n + 1}: ${JSON.stringify(p)}`);
        else if (seen.has(w.toLowerCase())) badWords.push(`${code} word ${n + 1}: "${w}" stands for two pictures`);
        else if (c.dictationScore(w, w, code).score !== 1) badWords.push(`${code} word ${n + 1}: cannot be marked: ${w}`);
        seen.add(String(w).toLowerCase()); });
    }
    assert.deepEqual(badWords, []);
    const fw = c.wordStories(first, 'fr'), dw = c.wordStories(first, 'fr', 'de'), kw = c.wordStories(first, 'ko'), rw = c.wordStories(first, 'ru', 'fr');
    assert.deepEqual([fw.length, fw[0].id, fw[11].id, fw[0].title, fw[0].back.length, fw[0].back[0], dw[0].back[0][1], fw.every(s => c.isWordLesson(s) && s.phrases && s.source === 'first')],
      [12, 'fr-words-01', 'fr-words-12', 'Words: food', 8, ['le pain', '🍞 bread', undefined], '🍞 das Brot', true]);
    assert.deepEqual([rw[0].back[0], kw[4].back[5], c.wordStories(first, 'en')[0].back[0][1]], [['хлеб', '🍞 le pain', 'khleb'], ['눈송이', '❄️ snowflake', 'nunsongi'], '🍞 bread']);   // (a word said another way keeps a meaning of its own)
    const clean = c.cleanStory(fw[0], 'fr');
    assert.deepEqual([clean.id, clean.phrases, clean.back[0], c.isWordLesson(clean), c.isWordLesson(c.lessonStories(first, 'fr')[0]), c.isWordLesson({ id: 'fr-words-01', source: 'cowork' }), c.isWordLesson(null)], ['fr-words-01', true, ['le pain', '🍞 bread'], true, false, false, false]);
    assert.deepEqual([c.wordStories(first, 'xx'), c.wordStories(null, 'fr')], [[], []]);
  }
  // a phrase corrected in the file is corrected in the card a learner already has; the card keeps its schedule, and other cards are left alone
  const deck = { 'first:fr-first-42:5': { wrong: 'That depends on the weather.', right: 'Cela dépend du temps.', why: '', added: 1, srs: { reps: 2 } }, 'first:fr-first-42:0': { wrong: 'b', right: 'a' }, 't:x:0': { wrong: 'a', right: 'z' } };
  const l42 = { id: 'fr-first-42', back: [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j'], ['Ça dépend du temps.', 'That depends on the weather.']] };
  assert.deepEqual([c.syncPhraseCards(deck, l42), deck['first:fr-first-42:5'], deck['t:x:0'], Object.keys(deck).length], [1, { wrong: 'That depends on the weather.', right: 'Ça dépend du temps.', why: '', added: 1, srs: { reps: 2 } }, { wrong: 'a', right: 'z' }, 3]);
  assert.deepEqual([c.syncPhraseCards(deck, l42), c.syncPhraseCards(null, l42), c.syncPhraseCards(deck, null), c.syncPhraseCards(deck, { id: 'x' })], [0, 0, 0, 0]);
  // for a native speaker: every lesson, the sounds and every text of a language as rows to read, each with an id that says where it lives
  const frTexts = JSON.parse(readFileSync(new URL('./content/fr.json', import.meta.url), 'utf8')), secs = c.proofSections(first, frTexts, 'fr');
  assert.deepEqual([secs.length, secs.filter(x => x.kind === 'lesson').length, secs.filter(x => x.kind === 'text').length, secs[60].id], [60 + 1 + 12 + frTexts.length, 60, frTexts.length, 'sounds']);
  assert.deepEqual([secs[61].id, secs[61].kind, secs[61].title, secs[61].rows[0], secs[72].rows[7].id], ['words-1', 'words', 'Words: food', { id: 'word:1', text: 'le pain', about: '🍞 bread', reading: '' }, 'word:96']);
  assert.deepEqual(secs[0].rows[0], { id: 'first:1', text: 'Bonjour.', about: 'Hello.', reading: '' });
  assert.deepEqual([secs[0].id, secs[0].n, secs[0].title, secs[0].rows.length, secs[59].rows[7].id], ['first-1', 1, 'Hello and goodbye', 8, 'first:480']);
  assert.deepEqual(secs[60].rows.filter(r => r.id === 'sound:1' || r.id === 'pair:1'), [{ id: 'sound:1', text: 'été', about: 'é: like ay in day, cut short', reading: '' }, { id: 'pair:1', text: 'dessus / dessous', about: 'on top / underneath', reading: '' }]);
  const marche = secs.find(x => x.id === 'fr-marche'), boul = secs.find(x => x.kind === 'text' && x.rows.some(r => r.about === 'La boulangère'));
  assert.deepEqual([marche.title, marche.level, marche.rows[0], marche.rows[1].text], ['Le marché du samedi', 'A2', { id: 'fr-marche:t', text: 'Le marché du samedi', about: '', reading: '', kind: 't' }, 'Chaque samedi matin, Claire va au marché avec son panier.']);
  assert.deepEqual(['b', 'q', 'n'].map(k => marche.rows.filter(r => r.kind === k).length > 0), [true, true, true]);
  assert.ok(marche.rows.find(r => r.kind === 'b').about && marche.rows.find(r => r.kind === 'q').about && marche.words.length > 10 && marche.words.every(r => r.id.startsWith('fr-marche:g:') && r.about));
  assert.deepEqual(boul.rows.find(r => r.id.endsWith(':s1')), { id: boul.id + ':s1', text: 'Bonjour monsieur ! Vous désirez ?', about: 'La boulangère', reading: '' });
  const ids = secs.flatMap(x => [...x.rows, ...x.words].map(r => r.id)); assert.equal(new Set(ids).size, ids.length); // no two rows share an id
  // a script that is not Latin brings its reading; a phrase with a meaning of its own shows that one; a language with nothing has no sections
  assert.deepEqual(c.proofSections(first, [], 'ru')[0].rows[0], { id: 'first:1', text: 'Здравствуйте.', about: 'Hello.', reading: 'Zdravstvuyte.' });
  assert.deepEqual([c.proofSections(first, [], 'xx'), c.proofSections(null, null, 'fr'), c.proofSections(first, [{ id: 'x', title: 'T' }, null, 7], 'fr').filter(x => x.kind === 'text')], [[], [], []]);
  // what the reader marked is rebuilt from known fields; the result names the sections read and gives each correction with what it was about
  const marks = c.cleanProof({ fix: { 'first:1': ['Bonjour !', ' the usual greeting '], 'fr-marche:g:panier': ['', 'a shopping basket'], 'first:2': ['  ', ''], 'first:3': 'no', 'gone:1': ['x', ''], ['k'.repeat(201)]: ['x', ''] }, read: { 'first-1': true, sounds: 1, 'fr-marche': true }, evil: 1 });
  assert.deepEqual([Object.keys(marks.fix), Object.keys(marks.read), Object.getPrototypeOf(marks.fix), marks.read.constructor], [['first:1', 'fr-marche:g:panier', 'gone:1'], ['first-1', 'fr-marche'], null, undefined]);
  assert.deepEqual(c.proofOut('fr', secs, marks, '2026-11-18'), { languagelab: 'proof', lang: 'fr', day: '2026-11-18', sections: secs.length, read: ['first-1', 'fr-marche'],
    fixes: [{ id: 'first:1', was: 'Bonjour.', about: 'Hello.', now: 'Bonjour !', note: 'the usual greeting' }, { id: 'fr-marche:g:panier', was: 'panier', about: marche.words.find(r => r.text === 'panier').about, note: 'a shopping basket' }] });
  assert.deepEqual([c.cleanProof(null), c.cleanProof('x'), c.proofOut('fr', secs, c.cleanProof(null)).fixes].map(x => JSON.stringify(x)), ['{"fix":{},"read":{}}', '{"fix":{},"read":{}}', '[]']);
  console.log(`first steps: ok (${Object.keys(first.langs).length} languages)`);
}
