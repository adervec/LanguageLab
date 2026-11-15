// core.js — LanguageLab's logic with no DOM in it, so `node core.test.mjs` can check it.

export const DAY = 86400000;
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// House standard 10: a calendar day is the reader's LOCAL day.
export function dayStr(ms = Date.now()) {
  const d = new Date(ms), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ---- languages ----
// These have starter stories in content/<code>.json. Any other language code works too, with your own
// texts or stories from AI cowork: langInfo() fills in the rest from Intl.
// keys: letters a keyboard may lack. elide: letters before an apostrophe are a clitic (l', dell'), not a word.
export const LANGS = {
  fr: { name: 'Français', english: 'French', bcp: 'fr-FR', keys: 'éèêëàâçùûîïôœ', elide: true },
  es: { name: 'Español', english: 'Spanish', bcp: 'es-ES', keys: 'áéíóúüñ¿¡' },
  de: { name: 'Deutsch', english: 'German', bcp: 'de-DE', keys: 'äöüß' },
  it: { name: 'Italiano', english: 'Italian', bcp: 'it-IT', keys: 'àèéìòù', elide: true },
  pt: { name: 'Português', english: 'Portuguese', bcp: 'pt-BR', keys: 'áâãàçéêíóôõú' },
  nl: { name: 'Nederlands', english: 'Dutch', bcp: 'nl-NL', keys: 'éëïöü' },
  hr: { name: 'Hrvatski', english: 'Croatian', bcp: 'hr-HR', keys: 'čćšžđ' },
  en: { name: 'English', english: 'English', bcp: 'en', keys: '' }, // no region: the chosen voice decides the accent
};
const SEG = /^(zh|ja|th|lo|km|my|yue)$/; // written without spaces: words come from Intl.Segmenter
export const isLangCode = c => typeof c === 'string' && /^[a-z]{2,3}$/.test(c);
export function langInfo(code) {
  if (LANGS[code]) return LANGS[code];
  const name = loc => { try { const n = new Intl.DisplayNames([loc], { type: 'language' }).of(code) || code; return n[0].toLocaleUpperCase(loc) + n.slice(1); } catch { return code; } };
  return { name: name(code), english: name('en'), bcp: code, keys: '', seg: SEG.test(code) };
}

// ---- text ----
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/ß/g, 'ss');
export const key = w => w.normalize('NFC').toLowerCase().replace(/’/g, "'");

export function sentences(text) {
  return String(text).replace(/\s+/g, ' ')
    .split(/(?<=[。！？])\s*|(?<=[.!?…।؟]["»”“’)]?)\s+(?=[\p{Lu}\p{Lo}\p{N}«"“„¿¡—-])/u).map(s => s.trim()).filter(Boolean);
}
// The sentences of a story: a dialogue's are its lines', a subtitled recording's are its cues.
export const storySentences = s => s.cues ? s.cues.map(c => c[2]) : s.lines ? s.lines.flatMap(l => sentences(l[1])) : sentences(s.text);

// Split text into [{ s, word }] pieces that join back to the original.
// ponytail: surface forms, not lemmas ("mange" and "mangé" count separately). Add a per-language
// lemma map if the word counts start to mislead.
export function tokens(text, lang = 'fr') {
  const L = langInfo(lang), out = [];
  const push = (s, word) => {
    if (!s) return;
    const last = out[out.length - 1];
    if (!word && last && !last.word) last.s += s; else out.push({ s, word });
  };
  if (L.seg && typeof Intl.Segmenter === 'function') {
    for (const x of new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)) push(x.segment, !!x.isWordLike && /\p{L}/u.test(x.segment));
    return out;
  }
  // elide: "l'école" is a clitic and a word, "aujourd'hui" is one word. Otherwise an apostrophe inside
  // a word stays in it ("don't", "п'ять"), except a final 's ("Claire's" is "Claire").
  const re = L.elide ? /aujourd['’]hui|\p{L}[\p{L}\p{M}]*/giu
    : /(?<=[\p{L}\p{M}])['’]s(?![\p{L}\p{M}])|\p{L}[\p{L}\p{M}]*(?:['’](?!s(?![\p{L}\p{M}]))\p{L}[\p{L}\p{M}]*)*/gu;
  let at = 0, m;
  while ((m = re.exec(text))) {
    push(text.slice(at, m.index), false);
    const end = m.index + m[0].length;
    push(m[0], !/^['’]/.test(m[0]) && !(L.elide && !/['’]/.test(m[0]) && /^['’]\p{L}/u.test(text.slice(end, end + 3))));
    at = end;
  }
  push(text.slice(at), false);
  return out;
}
export const wordKeys = (text, lang) => tokens(text, lang).filter(x => x.word).map(x => key(x.s));

// Share of a text's words the learner already knows (0..1).
export function coverage(text, known, lang) {
  const ks = wordKeys(text, lang);
  return ks.length ? ks.filter(k => known[k]).length / ks.length : 0;
}

// ---- dictation: how many of the target's words, in order, did you catch? ----
// For scoring, a word is a run of letters and digits (so "l'école" is two). Accents and case are
// forgiven (the test is the ear, not the keyboard); the correction shows them.
function spans(text, lang) {
  if (langInfo(lang).seg) return tokens(text, lang);
  const out = [];
  let at = 0;
  for (const m of text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu)) {
    if (m.index > at) out.push({ s: text.slice(at, m.index), word: false });
    out.push({ s: m[0], word: true });
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push({ s: text.slice(at), word: false });
  return out;
}
export const plainWords = (s, lang) => spans(String(s ?? ''), lang).filter(x => x.word).map(x => strip(x.s));
// -> { score 0..1, hits per target word, parts: the target cut into [{ s, hit? }] for marking }
export function dictationScore(target, typed, lang) {
  const parts = spans(String(target), lang), a = parts.filter(x => x.word).map(x => strip(x.s)), b = plainWords(typed, lang);
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const hits = new Array(a.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) { hits[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  let n = 0;
  return { score: a.length ? L[0][0] / a.length : 0, hits, parts: parts.map(x => x.word ? { s: x.s, hit: hits[n++] } : { s: x.s }) };
}

// Up to n sentences worth dictating (4 to 22 words), spread evenly. src: a text or a list of sentences.
export function pickDictation(src, n = 4, lang) {
  const ok = (Array.isArray(src) ? src : sentences(src)).filter(s => { const c = plainWords(s, lang).length; return c >= 4 && c <= 22; });
  if (ok.length <= n) return ok;
  return Array.from({ length: n }, (_, i) => ok[Math.floor((i + 0.5) * ok.length / n)]);
}

// A typed answer to a question about the story passes when it holds every word of one accepted key.
// A key word of four letters or more also matches a longer word that starts with it (plurals, endings).
// ponytail: a keyword match, so a wrong sentence around the right word passes. The AI review reads the answers properly.
export function answerOk(answer, keys, lang) {
  const have = plainWords(answer, lang), has = w => have.some(h => h === w || (w.length >= 4 && h.startsWith(w)));
  return (keys || []).some(k => { const w = plainWords(k, lang); return w.length > 0 && w.every(has); });
}

// ---- review cards ----
// Blank a word out of the sentence it was met in.
export function cloze(sentence, word, lang) {
  let done = false;
  return tokens(sentence, lang).map(x => (!done && x.word && key(x.s) === key(word)) ? (done = true, '____') : x.s).join('');
}
// 'exact' | 'accent' (right letters, wrong accents: still a pass, shown) | 'wrong'
export function judgeWord(guess, answer) {
  const g = key(String(guess).trim()), a = key(answer);
  return g === a ? 'exact' : g && strip(g) === strip(a) ? 'accent' : 'wrong';
}
// The scheduler is learning-pit's (SM-2 minus the fiddly bits), cut to two grades.
// ponytail: no fuzz, no leech parking. Borrow those from learning-pit/core.js if cohorts pile up.
export function schedule(prev, pass, now = Date.now()) {
  const s = { reps: 0, lapses: 0, ease: 2.5, interval: 0, ...prev };
  if (!pass) {
    s.reps = 0; s.lapses++; s.ease = Math.max(1.3, s.ease - 0.2); s.interval = 0; s.due = now + 600000;
  } else {
    s.reps++;
    s.interval = s.reps === 1 ? 1 : s.reps === 2 ? 3 : Math.min(365, Math.round(s.interval * s.ease));
    s.due = now + s.interval * DAY;
  }
  s.t = now;
  return s;
}
// retired: the learner said "I know this"; it stays as a record so the choice survives a sync.
export const isDue = (card, now = Date.now()) => !card.retired && (!card.srs || card.srs.due <= now);

// ---- a session's own score ----
// Only what an algorithm can grade honestly: the dictation (the score of a sitting), the questions
// answered after the first listen, sentences written back from their meaning, and how much of your
// speech a recogniser understood (the score of a role-play). Free writing is graded by the AI review.
export function scoreSitting(sit) {
  const mean = list => { const v = (list || []).map(x => x.score).filter(x => x != null); return v.length ? v.reduce((n, x) => n + x, 0) / v.length : null; };
  const listening = mean(sit.dictation), speaking = mean(sit.speaking), rebuilt = mean(sit.rebuild), q = sit.questions || [];
  const main = sit.mode === 'talk' ? speaking : listening;
  return {
    score: main == null ? null : Math.round(main * 100),
    breakdown: {
      listening, speaking, rebuilt,
      comprehension: q.length ? q.filter(x => x.ok).length / q.length : null,
      understood: sit.uniqueWords ? 1 - (sit.tapped || []).length / sit.uniqueWords : null,
      replays: (sit.dictation || []).reduce((n, x) => n + (x.replays || 0), 0),
      wordsRead: sit.wordsRead || 0,
      wordsWritten: plainWords(sit.writing?.text, sit.lang).length,
    },
  };
}

// What the numbers say, level by level. reading: the share of running words already known in that
// level's texts (the unread ones while there are any). The rest: means over the last five sittings
// on texts of that level.
export function abilities(S, lang) {
  const known = S.langs[lang]?.known || {}, mine = S.sittings.filter(s => s.lang === lang);
  const mean = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  return LEVELS.map(level => {
    const st = S.stories.filter(s => s.lang === lang && s.level === level), fresh = st.filter(s => !s.readAt), at = mine.filter(s => s.level === level);
    const last = f => mean(at.map(f).filter(x => x != null).slice(-5));
    return {
      level, texts: st.length, sittings: at.filter(s => s.mode === 'sitting').length,
      reading: st.length ? mean((fresh.length ? fresh : st).map(s => coverage(s.text, known, lang))) : null,
      comprehension: last(s => s.breakdown.comprehension), listening: last(s => s.breakdown.listening), speaking: last(s => s.breakdown.speaking),
      grade: at.filter(s => s.ai).slice(-1)[0]?.ai.grade || '',
    };
  }).filter(r => r.texts || r.sittings);
}
// The highest level the numbers support, climbing until one fails. Reading: 95% of the words known.
// Listening: two sittings at the level, 80% of the dictation caught and (where asked) two questions in three right.
export function estimate(rows) {
  const climb = (has, pass) => { let at = ''; for (const r of rows) { if (!has(r)) continue; if (!pass(r)) break; at = r.level; } return at; };
  return {
    reading: climb(r => r.reading != null, r => r.reading >= 0.95),
    listening: climb(r => r.sittings >= 2 && r.listening != null, r => r.listening >= 0.8 && (r.comprehension == null || r.comprehension >= 0.66)),
  };
}

// Timed text (.srt or .vtt) -> [[startSec, endSec, text]]. Tags and positioning are dropped.
export function parseSubs(src) {
  const sec = t => t.replace(',', '.').split(':').reduce((n, x) => n * 60 + Number(x), 0), out = [];
  for (const block of String(src).replace(/\r/g, '').split(/\n{2,}/)) {
    const lines = block.split('\n'), i = lines.findIndex(l => l.includes('-->'));
    const m = i < 0 ? null : lines[i].match(/([\d:.,]+)\s*-->\s*([\d:.,]+)/);
    const text = lines.slice(i + 1).join(' ').replace(/<[^>]*>|\{[^}]*\}/g, '').replace(/\s+/g, ' ').trim();
    if (m && text && sec(m[2]) > sec(m[1])) out.push([sec(m[1]), sec(m[2]), text]);
  }
  return out;
}

// ---- everything that arrives from outside is rebuilt from known fields (house standard 22) ----
const str = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const num = (v, d = 0) => Number.isFinite(v) ? v : d;
export const cleanGloss = g => Object.fromEntries(Object.entries(obj(g)).slice(0, 2000)
  .filter(([k, v]) => typeof v === 'string' && v.trim() && k.length <= 60).map(([k, v]) => [key(k), v.trim().slice(0, 200)]));
// corrections: what the learner wrote, the right form, the rule in a few words
export const cleanFixes = list => arr(list).slice(0, 8).map(c => ({ wrong: str(obj(c).wrong, 300).trim(), right: str(obj(c).right, 300).trim(), why: str(obj(c).why, 300).trim() }))
  .filter(c => c.wrong && c.right);

// A story, a dialogue ({ roles: [a, b], lines: [[0|1, text]] }) or a subtitled recording ({ cues }).
export function cleanStory(s, lang) {
  s = obj(s);
  const lines = arr(s.lines).slice(0, 60).map(l => [arr(l)[0] ? 1 : 0, str(arr(l)[1], 600).trim()]).filter(l => l[1]);
  const roles = arr(s.roles).slice(0, 2).map(r => str(r, 40).trim()).filter(Boolean);
  const dialogue = lines.length >= 2 && roles.length === 2;
  const cues = arr(s.cues).slice(0, 4000).map(c => [num(arr(c)[0]), num(arr(c)[1]), str(arr(c)[2], 600).trim()]).filter(c => c[2] && c[1] > c[0]);
  const text = dialogue ? lines.map(l => l[1]).join('\n') : cues.length ? cues.map(c => c[2]).join(' ') : str(s.text, 20000).trim();
  const title = str(s.title, 120).trim(), notice = str(s.notice, 600).trim();
  if (!text || !title) return null;
  const questions = arr(s.questions).slice(0, 5).map(q => ({ q: str(obj(q).q, 300).trim(),
    a: arr(obj(q).a).filter(x => typeof x === 'string' && x.trim()).slice(0, 6).map(x => x.trim().slice(0, 80)) })).filter(q => q.q && q.a.length);
  return { id: str(s.id, 80), lang: isLangCode(s.lang) ? s.lang : lang, title, level: LEVELS.includes(s.level) ? s.level : '', text,
    gloss: cleanGloss(s.gloss), source: str(s.source, 20), added: num(s.added), readAt: num(s.readAt),
    ...(dialogue ? { roles, lines } : {}), ...(!dialogue && cues.length ? { cues } : {}), ...(questions.length ? { questions } : {}), ...(notice ? { notice } : {}) };
}
export function cleanReview(r) {
  r = obj(r);
  const list = v => arr(v).filter(x => typeof x === 'string').slice(0, 6).map(x => x.slice(0, 400));
  const grade = str(r.grade, 2).toUpperCase(), corrections = cleanFixes(r.corrections);
  if (!str(r.sessionId, 80) || !/^[A-F][+-]?$/.test(grade)) return null;
  return { sessionId: r.sessionId, grade, summary: str(r.summary, 1200), strengths: list(r.strengths), fixes: list(r.fixes), next: str(r.next, 600),
    ...(corrections.length ? { corrections } : {}) };
}
// One pen-pal reply from the agent: the letter back, meanings for its harder words, corrections of the learner's letter.
export function cleanPalReply(r) {
  r = obj(r);
  const text = str(r.text, 4000).trim();
  return str(r.id, 80) && text ? { id: r.id, text, gloss: cleanGloss(r.gloss), corrections: cleanFixes(r.corrections) } : null;
}
const cleanSrs = s => s && typeof s === 'object'
  ? { reps: num(s.reps), lapses: num(s.lapses), ease: num(s.ease, 2.5), interval: num(s.interval), due: num(s.due), t: num(s.t) } : null;
const MODES = ['sitting', 'read', 'listen', 'talk', 'chat'];
function cleanSitting(s) {
  s = obj(s);
  if (!str(s.id, 80)) return null;
  const b = obj(s.breakdown), ai = s.ai ? cleanReview({ ...obj(s.ai), sessionId: s.id }) : null;
  const unit = v => v == null ? null : Math.min(1, Math.max(0, num(v)));
  return {
    id: s.id, lang: str(s.lang, 8), mode: MODES.includes(s.mode) ? s.mode : 'sitting', level: LEVELS.includes(s.level) ? s.level : '',
    day: /^\d{4}-\d\d-\d\d$/.test(s.day) ? s.day : dayStr(), at: num(s.at),
    storyId: str(s.storyId, 80), title: str(s.title, 120), listenSec: num(s.listenSec), minutes: num(s.minutes),
    wordsRead: num(s.wordsRead), uniqueWords: num(s.uniqueWords),
    tapped: arr(s.tapped).filter(x => typeof x === 'string').slice(0, 500).map(x => x.slice(0, 60)),
    questions: arr(s.questions).slice(0, 5).map(q => ({ q: str(obj(q).q, 300), answer: str(obj(q).answer, 300), ok: !!obj(q).ok })),
    dictation: arr(s.dictation).slice(0, 20).map(d => ({ target: str(obj(d).target, 600), typed: str(obj(d).typed, 600),
      score: unit(obj(d).score), replays: num(obj(d).replays) })),
    rebuild: arr(s.rebuild).slice(0, 10).map(d => ({ target: str(obj(d).target, 600), shown: str(obj(d).shown, 600), typed: str(obj(d).typed, 600), score: unit(obj(d).score) })),
    speaking: arr(s.speaking).slice(0, 60).map(d => ({ target: str(obj(d).target, 600), heard: str(obj(d).heard, 600),
      score: unit(obj(d).score), tries: num(obj(d).tries), ...(obj(d).memory ? { memory: true } : {}), ...(obj(d).typed ? { typed: true } : {}) })),
    writing: { text: str(obj(s.writing).text, 8000), spoken: !!obj(s.writing).spoken },
    score: s.score == null ? null : Math.round(100 * unit(num(s.score) / 100)),
    breakdown: { listening: unit(b.listening), comprehension: unit(b.comprehension), understood: unit(b.understood), speaking: unit(b.speaking), rebuilt: unit(b.rebuilt),
      replays: num(b.replays), wordsRead: num(b.wordsRead), wordsWritten: num(b.wordsWritten) },
    ...(ai ? { ai } : {}),
  };
}
function cleanMsg(m) {
  m = obj(m);
  const text = str(m.text, 4000).trim(), r = obj(m.reply), back = str(r.text, 4000).trim();
  if (!str(m.id, 80) || !text) return null;
  return { id: m.id, at: num(m.at), text, ...(back ? { reply: { text: back, at: num(r.at), storyId: str(r.storyId, 80) }, fixes: cleanFixes(m.fixes) } : {}) };
}
// The conversation in progress: who 1 is the learner, who 0 the AI partner; wait names the turn still unanswered ('open' before the first line).
function cleanChat(c) {
  c = obj(c);
  const scene = obj(c.scene), roles = arr(scene.roles).slice(0, 2).map(r => str(r, 40).trim()).filter(Boolean), title = str(scene.title, 120).trim();
  if (!str(c.id, 80)) return null;
  return { id: c.id, t0: num(c.t0), wait: str(c.wait, 80), scene: title && roles.length === 2 ? { title, roles } : null,
    turns: arr(c.turns).slice(-200).map(x => { const fixes = cleanFixes(obj(x).fixes);
      return { id: str(obj(x).id, 80), who: obj(x).who ? 1 : 0, text: str(obj(x).text, 2000).trim(), at: num(obj(x).at), ...(fixes.length ? { fixes } : {}) }; }).filter(x => x.id && x.text) };
}
// One line from the conversation partner (the on-device model or the cowork agent), with corrections of the learner's last message.
export function cleanChatReply(r) {
  r = obj(r);
  const reply = str(r.reply, 1500).trim();
  return reply ? { turnId: str(r.turnId, 80), reply, corrections: cleanFixes(r.corrections).slice(0, 3) } : null;
}
export const emptyLang = () => ({ known: {}, cards: {}, fixes: {}, level: 'A2', pal: { persona: '', msgs: [] }, chat: null });
// A whole saved state (an import file, the Drive copy). Throws when it is not one.
// Older saves (one level for every language, no corrections or letters) come through with the gaps filled.
export function cleanState(o) {
  o = obj(o);
  if (o.app !== 'languagelab' || o.v !== 1) throw new Error('Not a LanguageLab backup');
  const lang = isLangCode(o.lang) ? o.lang : 'fr', langs = {}, gone = {};
  for (const [code, raw] of Object.entries(obj(o.langs)).slice(0, 60)) {
    if (!isLangCode(code)) continue;
    const L = obj(raw), pal = obj(L.pal), out = emptyLang();
    for (const k of Object.keys(obj(L.known)).slice(0, 200000)) if (k.length <= 60) out.known[key(k)] = 1;
    for (const [k, c] of Object.entries(obj(L.cards)).slice(0, 50000)) if (k.length <= 60)
      out.cards[key(k)] = { gloss: str(obj(c).gloss, 200), ctx: str(obj(c).ctx, 600), storyId: str(obj(c).storyId, 80), added: num(obj(c).added), srs: cleanSrs(obj(c).srs),
        ...(num(obj(c).retired) ? { retired: obj(c).retired } : {}), ...(num(obj(c).edited) ? { edited: obj(c).edited } : {}) };
    for (const [id, f] of Object.entries(obj(L.fixes)).slice(0, 5000)) {
      const c = cleanFixes([f])[0];
      if (c && id.length <= 120) out.fixes[id] = { ...c, added: num(obj(f).added), srs: cleanSrs(obj(f).srs), ...(num(obj(f).retired) ? { retired: obj(f).retired } : {}) };
    }
    out.level = LEVELS.includes(L.level) ? L.level : LEVELS.includes(o.level) ? o.level : 'A2';
    out.pal = { persona: str(pal.persona, 400), msgs: arr(pal.msgs).slice(-500).map(cleanMsg).filter(Boolean) };
    out.chat = cleanChat(L.chat);
    langs[code] = out;
  }
  for (const [id, t] of Object.entries(obj(o.gone)).slice(0, 5000)) if (id.length <= 80) gone[id] = num(t);
  return {
    app: 'languagelab', v: 1, updatedAt: num(o.updatedAt), lang, langs, gone, welcomed: !!o.welcomed,
    stories: arr(o.stories).slice(0, 5000).map(s => cleanStory(s)).filter(s => s && s.id && s.lang && !gone[s.id]),
    sittings: arr(o.sittings).slice(0, 20000).map(cleanSitting).filter(Boolean),
  };
}

// Two copies of the state (this device, Drive) become one. Nothing either side recorded is lost:
// sittings, stories and letters are joined by id, word lists are joined, a card keeps its most recent
// change. A removed story stays removed (gone); a word marked "I know this" stays known (retired).
export function mergeState(a, b) {
  const [hi, lo] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
  const join = (x, y, fix) => [...new Map([...y, ...x].map(v => [v.id, v])).values()]
    .map(v => fix(v, y.find(o => o.id === v.id) || v));
  const stamp = c => Math.max(c.srs?.t || 0, c.retired || 0, c.edited || 0);
  const newest = (H, L) => { const out = { ...L, ...H }; for (const k in L) if (H[k] && stamp(L[k]) > stamp(H[k])) out[k] = L[k]; return out; };
  const langs = {}, gone = { ...lo.gone, ...hi.gone };
  const sittings = join(hi.sittings, lo.sittings, (v, o) => (v.ai || !o.ai ? v : { ...v, ai: o.ai })).sort((x, y) => x.at - y.at);
  // the longer copy of a conversation in progress; none once it has been finished (it is then a session) on either device
  const talk = (x, y) => { const c = !y || (x && x.turns.length >= y.turns.length) ? x : y; return c && !sittings.some(s => s.id === c.id) ? c : null; };
  for (const code of new Set([...Object.keys(hi.langs), ...Object.keys(lo.langs)])) {
    const H = hi.langs[code] || emptyLang(), L = lo.langs[code] || emptyLang();
    const cards = newest(H.cards, L.cards), known = { ...L.known, ...H.known };
    for (const k in cards) if (cards[k].retired) known[k] = 1; else delete known[k];
    langs[code] = { known, cards, fixes: newest(H.fixes, L.fixes), level: (hi.langs[code] || L).level,
      chat: talk(H.chat, L.chat),
      pal: { persona: H.pal.persona || L.pal.persona, msgs: join(H.pal.msgs, L.pal.msgs, (v, o) => (v.reply || !o.reply ? v : o)).sort((x, y) => x.at - y.at) } };
  }
  return {
    ...hi, langs, gone, welcomed: hi.welcomed || lo.welcomed,
    stories: join(hi.stories, lo.stories, (v, o) => ({ ...v, readAt: Math.max(v.readAt || 0, o.readAt || 0) })).filter(s => !gone[s.id]),
    sittings,
  };
}
