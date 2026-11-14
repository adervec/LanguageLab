// core.js — LanguageLab's logic with no DOM in it, so `node core.test.mjs` can check it.

export const DAY = 86400000;

// House standard 10: a calendar day is the reader's LOCAL day.
export function dayStr(ms = Date.now()) {
  const d = new Date(ms), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ---- text ----
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const key = w => w.normalize('NFC').toLowerCase();

export function sentences(text) {
  return String(text).replace(/\s+/g, ' ').split(/(?<=[.!?…]["»”]?)\s+(?=[\p{Lu}«"“—-])/u).map(s => s.trim()).filter(Boolean);
}

// Split text into [{ s, word }] pieces that join back to the original. A letter run followed by
// an apostrophe is an elided clitic (l', j', qu') and is not a word of its own.
// ponytail: surface forms, not lemmas ("mange" and "mangé" count separately). Add a per-language
// lemma map if the word counts start to mislead.
export function tokens(text) {
  const out = [], re = /aujourd['’]hui|\p{L}+/giu;
  let at = 0, m;
  const push = (s, word) => {
    if (!s) return;
    const last = out[out.length - 1];
    if (!word && last && !last.word) last.s += s; else out.push({ s, word });
  };
  while ((m = re.exec(text))) {
    push(text.slice(at, m.index), false);
    push(m[0], !/['’]/.test(text[m.index + m[0].length] || '') || /['’]/.test(m[0]));
    at = m.index + m[0].length;
  }
  push(text.slice(at), false);
  return out;
}
export const wordKeys = text => tokens(text).filter(x => x.word).map(x => key(x.s));

// Share of a text's words the learner already knows (0..1).
export function coverage(text, known) {
  const ks = wordKeys(text);
  return ks.length ? ks.filter(k => known[k]).length / ks.length : 0;
}

// ---- dictation: how many of the target's words, in order, did you catch? ----
// Accents and case are forgiven (the test is the ear, not the keyboard); the correction shows them.
const plainWords = s => (strip(String(s)).match(/[\p{L}\p{N}]+/gu) || []);
export function dictationScore(target, typed) {
  const a = plainWords(target), b = plainWords(typed);
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const hits = new Array(a.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) { hits[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  return { score: a.length ? L[0][0] / a.length : 0, hits };
}

// Up to n sentences worth dictating (4 to 22 words), spread evenly through the text.
export function pickDictation(text, n = 4) {
  const ok = sentences(text).filter(s => { const c = plainWords(s).length; return c >= 4 && c <= 22; });
  if (ok.length <= n) return ok;
  return Array.from({ length: n }, (_, i) => ok[Math.floor((i + 0.5) * ok.length / n)]);
}

// ---- review cards ----
// Blank a word out of the sentence it was met in.
export function cloze(sentence, word) {
  let done = false;
  return tokens(sentence).map(x => (!done && x.word && key(x.s) === key(word)) ? (done = true, '____') : x.s).join('');
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
export const isDue = (card, now = Date.now()) => !card.srs || card.srs.due <= now;

// ---- a sitting's own score ----
// Only what an algorithm can grade honestly: the dictation. Writing is graded by the AI review.
export function scoreSitting(sit) {
  const d = (sit.dictation || []).filter(x => x.score != null);
  const listening = d.length ? d.reduce((n, x) => n + x.score, 0) / d.length : null;
  const understood = sit.uniqueWords ? 1 - (sit.tapped || []).length / sit.uniqueWords : null;
  return {
    score: listening == null ? null : Math.round(listening * 100),
    breakdown: {
      listening, understood,
      replays: d.reduce((n, x) => n + (x.replays || 0), 0),
      wordsRead: sit.wordsRead || 0,
      wordsWritten: plainWords(sit.writing?.text || '').length,
    },
  };
}

// ---- everything that arrives from outside is rebuilt from known fields (house standard 22) ----
const str = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const num = (v, d = 0) => Number.isFinite(v) ? v : d;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const cleanGloss = g => Object.fromEntries(Object.entries(obj(g)).slice(0, 2000)
  .filter(([k, v]) => typeof v === 'string' && v.trim() && k.length <= 60).map(([k, v]) => [key(k), v.trim().slice(0, 200)]));

export function cleanStory(s, lang) {
  s = obj(s);
  const text = str(s.text, 20000).trim(), title = str(s.title, 120).trim();
  if (!text || !title) return null;
  return { id: str(s.id, 80), lang: str(s.lang, 8) || lang, title, level: LEVELS.includes(s.level) ? s.level : '', text,
    gloss: cleanGloss(s.gloss), source: str(s.source, 20), added: num(s.added), readAt: num(s.readAt) };
}
export function cleanReview(r) {
  r = obj(r);
  const list = v => arr(v).filter(x => typeof x === 'string').slice(0, 6).map(x => x.slice(0, 400));
  const grade = str(r.grade, 2).toUpperCase();
  if (!str(r.sessionId, 80) || !/^[A-F][+-]?$/.test(grade)) return null;
  return { sessionId: r.sessionId, grade, summary: str(r.summary, 1200), strengths: list(r.strengths), fixes: list(r.fixes), next: str(r.next, 600) };
}
const cleanSrs = s => s && typeof s === 'object'
  ? { reps: num(s.reps), lapses: num(s.lapses), ease: num(s.ease, 2.5), interval: num(s.interval), due: num(s.due), t: num(s.t) } : null;
function cleanSitting(s) {
  s = obj(s);
  if (!str(s.id, 80)) return null;
  const b = obj(s.breakdown), ai = s.ai ? cleanReview({ ...obj(s.ai), sessionId: s.id }) : null;
  const unit = v => v == null ? null : Math.min(1, Math.max(0, num(v)));
  return {
    id: s.id, lang: str(s.lang, 8), day: /^\d{4}-\d\d-\d\d$/.test(s.day) ? s.day : dayStr(), at: num(s.at),
    storyId: str(s.storyId, 80), title: str(s.title, 120), listenSec: num(s.listenSec),
    wordsRead: num(s.wordsRead), uniqueWords: num(s.uniqueWords),
    tapped: arr(s.tapped).filter(x => typeof x === 'string').slice(0, 500).map(x => x.slice(0, 60)),
    dictation: arr(s.dictation).slice(0, 20).map(d => ({ target: str(obj(d).target, 600), typed: str(obj(d).typed, 600),
      score: unit(obj(d).score), replays: num(obj(d).replays) })),
    writing: { text: str(obj(s.writing).text, 8000), spoken: !!obj(s.writing).spoken },
    score: s.score == null ? null : Math.round(100 * unit(num(s.score) / 100)),
    breakdown: { listening: unit(b.listening), understood: unit(b.understood), replays: num(b.replays), wordsRead: num(b.wordsRead), wordsWritten: num(b.wordsWritten) },
    ...(ai ? { ai } : {}),
  };
}
// A whole saved state (an import file, the Drive copy). Throws when it is not one.
export function cleanState(o) {
  o = obj(o);
  if (o.app !== 'languagelab' || o.v !== 1) throw new Error('Not a LanguageLab backup');
  const langs = {};
  for (const [code, L] of Object.entries(obj(o.langs)).slice(0, 40)) {
    const known = {}, cards = {};
    for (const k of Object.keys(obj(obj(L).known)).slice(0, 200000)) if (k.length <= 60) known[key(k)] = 1;
    for (const [k, c] of Object.entries(obj(obj(L).cards)).slice(0, 50000)) if (k.length <= 60)
      cards[key(k)] = { gloss: str(obj(c).gloss, 200), ctx: str(obj(c).ctx, 600), storyId: str(obj(c).storyId, 80), added: num(obj(c).added), srs: cleanSrs(obj(c).srs) };
    langs[code.slice(0, 8)] = { known, cards };
  }
  return {
    app: 'languagelab', v: 1, updatedAt: num(o.updatedAt),
    lang: str(o.lang, 8) || 'fr', level: LEVELS.includes(o.level) ? o.level : 'A2', langs,
    stories: arr(o.stories).slice(0, 5000).map(s => cleanStory(s)).filter(s => s && s.id && s.lang),
    sittings: arr(o.sittings).slice(0, 20000).map(cleanSitting).filter(Boolean),
  };
}

// Two copies of the state (this device, Drive) become one. Nothing either side recorded is lost:
// sittings and stories are joined by id, word lists are joined, a card keeps its most recent review.
// ponytail: no tombstones, so something removed on one device comes back from the other. Add
// deleted-id lists if removing things becomes a feature.
export function mergeState(a, b) {
  const [hi, lo] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
  const join = (x, y, fix) => [...new Map([...y, ...x].map(v => [v.id, v])).values()]
    .map(v => fix(v, y.find(o => o.id === v.id) || v));
  const langs = {}, none = { known: {}, cards: {} };
  for (const code of new Set([...Object.keys(hi.langs), ...Object.keys(lo.langs)])) {
    const H = hi.langs[code] || none, L = lo.langs[code] || none;
    const cards = { ...L.cards, ...H.cards };
    for (const k in L.cards) if (H.cards[k] && (L.cards[k].srs?.t || 0) > (H.cards[k].srs?.t || 0)) cards[k] = L.cards[k];
    const known = { ...L.known, ...H.known };
    for (const k in cards) delete known[k];
    langs[code] = { known, cards };
  }
  return {
    ...hi, langs,
    stories: join(hi.stories, lo.stories, (v, o) => ({ ...v, readAt: Math.max(v.readAt || 0, o.readAt || 0) })),
    sittings: join(hi.sittings, lo.sittings, (v, o) => (v.ai || !o.ai ? v : { ...v, ai: o.ai })).sort((x, y) => x.at - y.at),
  };
}
