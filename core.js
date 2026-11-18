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
  // small: a starter set half the usual size (8 stories and 4 dialogues, A1 to B1). seg: written without spaces, so words come from Intl.Segmenter.
  zh: { name: '中文', english: 'Mandarin Chinese (simplified characters)', bcp: 'zh-CN', keys: '', seg: true, small: true },
  ja: { name: '日本語', english: 'Japanese', bcp: 'ja-JP', keys: '', seg: true, small: true },
  ko: { name: '한국어', english: 'Korean', bcp: 'ko-KR', keys: '', small: true },
  sv: { name: 'Svenska', english: 'Swedish', bcp: 'sv-SE', keys: 'åäö', small: true },
  // The 32 below share one set of twelve texts (the same stories and dialogues in every one, built from shared gloss lists).
  // mini: a first handful (four stories and two dialogues) is how a new language may start; none is left at that size.
  ru: { name: 'Русский', english: 'Russian', bcp: 'ru-RU', keys: '', small: true },
  uk: { name: 'Українська', english: 'Ukrainian', bcp: 'uk-UA', keys: '', small: true },
  pl: { name: 'Polski', english: 'Polish', bcp: 'pl-PL', keys: 'ąćęłńóśźż', small: true },
  cs: { name: 'Čeština', english: 'Czech', bcp: 'cs-CZ', keys: 'áčďéěíňóřšťúůýž', small: true },
  sk: { name: 'Slovenčina', english: 'Slovak', bcp: 'sk-SK', keys: 'áäčďéíĺľňóôŕšťúýž', small: true },
  sl: { name: 'Slovenščina', english: 'Slovenian', bcp: 'sl-SI', keys: 'čšž', small: true },
  sr: { name: 'Srpski', english: 'Serbian', bcp: 'sr-RS', keys: 'čćšžđ', small: true },
  bg: { name: 'Български', english: 'Bulgarian', bcp: 'bg-BG', keys: '', small: true },
  mk: { name: 'Македонски', english: 'Macedonian', bcp: 'mk-MK', keys: '', small: true },
  be: { name: 'Беларуская', english: 'Belarusian', bcp: 'be-BY', keys: '', small: true },
  ro: { name: 'Română', english: 'Romanian', bcp: 'ro-RO', keys: 'ăâîșț', small: true },
  hu: { name: 'Magyar', english: 'Hungarian', bcp: 'hu-HU', keys: 'áéíóöőúüű', small: true },
  el: { name: 'Ελληνικά', english: 'Greek', bcp: 'el-GR', keys: '', small: true },
  tr: { name: 'Türkçe', english: 'Turkish', bcp: 'tr-TR', keys: 'çğıöşü', small: true },
  nb: { name: 'Norsk bokmål', english: 'Norwegian', bcp: 'nb-NO', keys: 'æøå', small: true },
  da: { name: 'Dansk', english: 'Danish', bcp: 'da-DK', keys: 'æøå', small: true },
  fi: { name: 'Suomi', english: 'Finnish', bcp: 'fi-FI', keys: 'äöå', small: true },
  ca: { name: 'Català', english: 'Catalan', bcp: 'ca-ES', keys: 'àçèéíïòóúü', elide: true, small: true },
  gl: { name: 'Galego', english: 'Galician', bcp: 'gl-ES', keys: 'áéíóúñ', small: true },
  af: { name: 'Afrikaans', english: 'Afrikaans', bcp: 'af-ZA', keys: 'êëéèôûïî', small: true },
  id: { name: 'Bahasa Indonesia', english: 'Indonesian', bcp: 'id-ID', keys: '', small: true },
  ms: { name: 'Bahasa Melayu', english: 'Malay', bcp: 'ms-MY', keys: '', small: true },
  vi: { name: 'Tiếng Việt', english: 'Vietnamese', bcp: 'vi-VN', keys: 'ăâđêôơư', small: true },
  fil: { name: 'Filipino', english: 'Filipino (Tagalog)', bcp: 'fil-PH', keys: 'ñ', small: true },
  sw: { name: 'Kiswahili', english: 'Swahili', bcp: 'sw-KE', keys: '', small: true },
  eo: { name: 'Esperanto', english: 'Esperanto', bcp: 'eo', keys: 'ĉĝĥĵŝŭ', small: true },
  ar: { name: 'العربية', english: 'Arabic', bcp: 'ar-SA', keys: '', small: true },
  fa: { name: 'فارسی', english: 'Persian', bcp: 'fa-IR', keys: '', small: true },
  hi: { name: 'हिन्दी', english: 'Hindi', bcp: 'hi-IN', keys: '', small: true },
  ur: { name: 'اردو', english: 'Urdu', bcp: 'ur-PK', keys: '', small: true },
  bn: { name: 'বাংলা', english: 'Bengali', bcp: 'bn-IN', keys: '', small: true },
  th: { name: 'ไทย', english: 'Thai', bcp: 'th-TH', keys: '', seg: true, small: true },
};
const SEG = /^(zh|ja|th|lo|km|my|yue)$/; // written without spaces: words come from Intl.Segmenter
export const isLangCode = c => typeof c === 'string' && /^[a-z]{2,3}$/.test(c);
export function langInfo(code) {
  if (LANGS[code]) return LANGS[code];
  const name = loc => { try { const n = new Intl.DisplayNames([loc], { type: 'language' }).of(code) || code; return n[0].toLocaleUpperCase(loc) + n.slice(1); } catch { return code; } };
  return { name: name(code), english: name('en'), bcp: code, keys: '', seg: SEG.test(code) };
}

// ---- text ----
// Arabic script: the short-vowel marks, the lengthening stroke and a hamza sitting on a carrier are forgiven like accents, and the
// Arabic and Persian shapes of yeh and kaf count as one letter (ي ى ی, ك ک).
const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/ß/g, 'ss')
  .replace(/[\u064a\u0649]/g, '\u06cc').replace(/\u0643/g, '\u06a9');
export const key = w => w.normalize('NFC').toLowerCase().replace(/’/g, "'");

// Thai has no full stop: a space separates sentences and clauses, so there each run between spaces is one. Urdu ends a
// sentence with its own stop (۔); Greek asks with a semicolon.
export function sentences(text, lang) {
  if (lang === 'th') return String(text).split(/\s+/).filter(Boolean);
  const stops = lang === 'el' ? '.!?…;' : '.!?…।؟۔';
  return String(text).replace(/\s+/g, ' ')
    .split(new RegExp('(?<=[。！？][」』”]?)(?![」』”])\\s*|(?<=[' + stops + ']["»”“’)]?)\\s+(?=[\\p{Lu}\\p{Lo}\\p{N}«"“„¿¡—-])', 'u')).map(s => s.trim()).filter(Boolean);
}
// The sentences of a story: a first lesson's are its phrases, a dialogue's are its lines', a subtitled recording's are its cues.
export const storySentences = s => s.phrases ? s.back.map(b => b[0]) : s.cues ? s.cues.map(c => c[2]) : s.lines ? s.lines.flatMap(l => sentences(l[1], s.lang)) : sentences(s.text, s.lang);

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
    : /(?<=[\p{L}\p{M}])['’]s(?![\p{L}\p{M}])|\p{L}[\p{L}\p{M}\u200c\u200d]*(?:['’](?!s(?![\p{L}\p{M}]))\p{L}[\p{L}\p{M}\u200c\u200d]*)*/gu;
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
// forgiven (the test is the ear, not the keyboard); the correction shows them. Where the script has
// no spaces, every character counts on its own: a dictation there is marked character by character.
function spans(text, lang) {
  if (langInfo(lang).seg) return [...text].map(ch => ({ s: ch, word: /[\p{L}\p{N}]/u.test(ch) }));
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
// -> { score 0..1, hits per target word, parts: the target cut into [{ s, hit? }] for marking, subs: [[i, the word given in its place]] }
// spoken: the text came from a speech recogniser, which writes a number as digits ("five hours" comes back as "5 hours"), so a
// number in it stands for one word of the target, whichever. ponytail: it cannot tell "5" from "3": a wrong number said aloud passes.
export function dictationScore(target, typed, lang, spoken) {
  const parts = spans(String(target), lang), a = parts.filter(x => x.word).map(x => strip(x.s));
  // Persian writes one word in two halves around a zero-width non-joiner (می‌روم). Typed with it, or with a space, the halves match as they
  // are; typed joined up (میروم) the word is cut back in two here. ponytail: two halves only; a word in three still needs its joiners.
  const halves = new Map(parts.flatMap((p, k) => p.s === '\u200c' && parts[k - 1]?.word && parts[k + 1]?.word ? [[strip(parts[k - 1].s) + strip(parts[k + 1].s), [strip(parts[k - 1].s), strip(parts[k + 1].s)]]] : []));
  const given = spans(String(typed ?? ''), lang).filter(x => x.word).flatMap(x => (halves.get(strip(x.s)) || [strip(x.s)]).map(k => [k, x.s])), b = given.map(g => g[0]);
  const same = (x, y) => x === y || (!!spoken && /^\p{N}+$/u.test(y) && !/^\p{N}+$/u.test(x));
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    L[i][j] = same(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const hits = new Array(a.length).fill(false), subs = [];
  // Between two matches, as many words given as were wanted: each stands in the place of one ("poison" for "poisson").
  let ga = [], gb = [], i = 0, j = 0;
  const flush = () => { if (ga.length && ga.length === gb.length) ga.forEach((at, k) => subs.push([at, given[gb[k]][1]])); ga = []; gb = []; };
  while (i < a.length && j < b.length) {
    if (same(a[i], b[j])) { flush(); hits[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) ga.push(i++); else gb.push(j++);
  }
  while (i < a.length) ga.push(i++);
  while (j < b.length) gb.push(j++);
  flush();
  let n = 0;
  return { score: a.length ? L[0][0] / a.length : 0, hits, subs, parts: parts.map(x => x.word ? { s: x.s, hit: hits[n++] } : { s: x.s }) };
}

// What a speech recogniser made of a line. Its first guess is the score: how much was understood. A word it had only in a second
// or third guess is "near": said closely enough to be considered, not clearly enough to be chosen. heard: [first guess, others…].
// subs: [[the word wanted, what the first guess had in its place]]: the nearest a recogniser of whole words comes to a remark on a sound.
// ponytail: the recogniser guesses towards real words, so this is "was I understood, and how nearly", not a study of each sound.
export function speechMarks(target, heard, lang, spoken = true) {
  const [top, ...rest] = (heard?.length ? heard : ['']).map(h => dictationScore(target, h, lang, spoken));
  const near = top.hits.map((hit, i) => !hit && rest.some(r => r.hits[i]));
  const words = top.parts.filter(p => p.hit != null).map(p => p.s);
  let n = 0;
  return { score: top.score, hits: top.hits, near: near.filter(Boolean).length, subs: top.subs.map(([at, h]) => [words[at], h]), parts: top.parts.map(p => p.hit == null ? p : { ...p, near: near[n++] }) };
}

// Up to n sentences worth dictating (4 to 22 words, or up to 40 characters where there are no spaces), spread evenly.
// src: a text or a list of sentences.
export function pickDictation(src, n = 4, lang) {
  const max = langInfo(lang).seg ? 40 : 22, min = lang === 'ko' ? 3 : 4; // a Korean word carries a whole phrase
  const ok = (Array.isArray(src) ? src : sentences(src, lang)).filter(s => { const c = plainWords(s, lang).length; return c >= min && c <= max; });
  if (ok.length <= n) return ok;
  return Array.from({ length: n }, (_, i) => ok[Math.floor((i + 0.5) * ok.length / n)]);
}

// A typed answer to a question about the story passes when it holds every word of one accepted key.
// A key word of four letters or more also matches a longer word that starts with it (plurals, endings).
// ponytail: a keyword match, so a wrong sentence around the right word passes. The AI review reads the answers properly.
export function answerOk(answer, keys, lang) {
  if (langInfo(lang).seg) { const said = plainWords(answer, lang).join(''); return (keys || []).some(k => { const w = plainWords(k, lang).join(''); return w.length > 0 && said.includes(w); }); }
  // (Hangul is compared letter by letter, so even a one-syllable noun is found under its particle: 책 in 책을)
  // Arabic joins "the" (and a one-letter word before it) to its noun: الحليب، بالحليب and للحليب all hold حليب, so they come off both sides.
  const bare = w => lang === 'ar' ? w.replace(/^(?:[\u0648\u0641\u0628\u06a9]?\u0627\u0644|\u0648?\u0644\u0644)(?=\p{L}{3})/u, '') : w;
  const have = plainWords(answer, lang).map(bare), has = w => have.some(h => h === w || (w.length >= (/[\u1100-\u11ff]/.test(w) ? 2 : 4) && h.startsWith(w)));
  return (keys || []).some(k => { const w = plainWords(k, lang).map(bare); return w.length > 0 && w.every(has); });
}

// Which letters two words share, in order: what was heard against what was meant ("roue" for "rue" has an o too many).
// -> [runs of a, runs of b], a run being [letters, shared?]
export function letterDiff(a, b) {
  const A = [...String(a).normalize('NFC')], B = [...String(b).normalize('NFC')], x = A.map(ch => ch.toLowerCase()), y = B.map(ch => ch.toLowerCase());
  const L = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ma = x.map(() => false), mb = y.map(() => false);
  for (let i = 0, j = 0; i < x.length && j < y.length;) { if (x[i] === y[j]) ma[i++] = mb[j++] = true; else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  const runs = (chars, m) => chars.reduce((out, ch, i) => { const last = out[out.length - 1]; if (last && last[1] === m[i]) last[0] += ch; else out.push([ch, m[i]]); return out; }, []);
  return [runs(A, ma), runs(B, mb)];
}

// ---- the sound itself, beside the recogniser's words: when a voice was there, and how high ----
// The pitch of one frame of samples in Hz, by autocorrelation: 0 where there is none to speak of (silence, noise, a consonant).
// ponytail: the first clear peak of the autocorrelation, enough for one voice in a quiet room; a real pitch tracker if it is not.
export function pitchOf(x, rate, lo = 70, hi = 500) {
  const n = x.length, from = Math.max(2, Math.floor(rate / hi)), to = Math.min(n - 2, Math.ceil(rate / lo));
  let e = 0; for (let i = 0; i < n; i++) e += x[i] * x[i];
  if (!(e / n > 1e-6) || to <= from) return 0;
  const ac = new Float32Array(to + 2); let best = 0;
  for (let lag = from - 1; lag <= to + 1; lag++) { let s = 0; for (let i = 0; i + lag < n; i++) s += x[i] * x[i + lag];
    ac[lag] = s / (n - lag); if (lag >= from && lag <= to && ac[lag] > best) best = ac[lag]; }
  if (best < 0.5 * e / n) return 0;
  for (let lag = from; lag <= to; lag++) if (ac[lag] >= 0.9 * best && ac[lag] >= ac[lag - 1] && ac[lag] >= ac[lag + 1]) return rate / lag;
  return 0;
}
// How bright a vowel is: where, in Hz, the strongest stretch of a frame's spectrum lies between 600 and 3600 Hz (a window some 300 Hz
// wide, the highs lifted by 6 dB an octave): about where the second resonance of the mouth is. With the tongue far back (the ou of
// French "roue", the u of German "gut") that is near 800; with the tongue forward (the u of "rue", ü, and i too) it is 1700 or more.
// 0 where the frame is silent or has next to nothing in that band.
// (The centre of gravity of the band was tried first: it sank by 300 Hz when the first resonance tailed off slowly, and took a u for
// something halfway to ou. The strongest stretch does not care.)
// ponytail: one number for one contrast (tongue forward or back), by Goertzel over the band. It cannot hear whether the lips are
// round, so it does not tell u from i; a formant tracker if more vowels are ever to be told apart.
export function brightOf(x, rate, lo = 600, hi = 3600, half = 6) {
  const n = x.length, w = new Float64Array(n); let all = 0;
  for (let i = 0; i < n; i++) { w[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1))); all += w[i] * w[i]; }
  if (!(all / n > 1e-7)) return 0;
  const k0 = Math.ceil(lo * n / rate), k1 = Math.floor(hi * n / rate), p = [];
  for (let k = k0; k <= k1; k++) {
    const c = 2 * Math.cos(2 * Math.PI * k / n); let s1 = 0, s2 = 0;
    for (let i = 0; i < n; i++) { const s0 = w[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    p.push((s1 * s1 + s2 * s2 - c * s1 * s2) * k * k);                        // the power at that pitch, the highs lifted
  }
  let best = -1, at = 0, sum = 0;
  for (let i = 0; i < p.length; i++) { let s = 0, m = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(p.length - 1, i + half); j++) { s += p[j]; m += p[j] * (k0 + j); }
    sum += p[i]; if (s > best) { best = s; at = m / s; } }
  return sum > all * n * k0 * k0 * 1e-5 ? at * rate / n : 0;
}
// Where the tongue was for a held vowel, from its brightness: 'back', 'between' or 'front' ('' when there was none to go by).
// The limits come from synthetic vowels and two synthetic voices (a held "oo" at 740 to 970, the half-fronted vowel of English "food"
// at 1250 to 1570, front vowels from 1670 up), not from people.
export const tongueSpot = hz => !(hz > 0) ? '' : hz < 1150 ? 'back' : hz < 1600 ? 'between' : 'front';
// The brightness of a vowel held for a second or two, from frames of [seconds, loudness, pitch, brightness]: the middle value over the
// frames that are voiced and at least a third as loud as the loudest; 0 with less than a quarter of a second of them. (Not by way of
// voiceStats: a vowel held for the whole take leaves no quiet room to measure the voice against.)
export function heldVowel(frames) {
  const top = frames.reduce((m, f) => Math.max(m, f[1]), 0), br = frames.filter(f => f[1] > Math.max(0.003, top / 3) && f[2] > 0 && f[3] > 0).map(f => f[3]).sort((a, b) => a - b);
  return br.length >= 8 ? br[br.length >> 1] : 0;
}
// Frames of [seconds, loudness, pitch] -> how long the voice spoke, the long pauses inside, and its pitch as it went: [[seconds, Hz]].
// ponytail: "louder than the room" is speaking; a real voice detector if rooms get noisy.
export function voiceStats(frames, gap = 0.45) {
  const loud = frames.map(f => f[1]).sort((a, b) => a - b), room = loud[Math.floor(loud.length / 10)] || 0, top = loud[loud.length - 1] || 0;
  const on = frames.filter(f => f[1] > Math.max(room * 3, top * 0.15, 0.003));
  if (on.length < 4) return { sec: 0, pauses: 0, pitch: [] };
  return { sec: on[on.length - 1][0] - on[0][0], pauses: on.filter((f, i) => i && f[0] - on[i - 1][0] > gap).length, pitch: on.filter(f => f[2] > 0).map(f => [f[0] - on[0][0], f[2]]) };
}
// How a pitch contour moved: 'level', 'rising', 'falling' or 'dipping' (down, then up again); '' when there is too little of it.
// In semitones between its first, middle and last thirds, so that a high voice and a low one read alike.
export function pitchShape(pitch) {
  if (pitch.length < 6) return '';
  const st = pitch.map(p => 12 * Math.log2(p[1])), k = Math.floor(st.length / 3), mid = a => [...a].sort((x, y) => x - y)[a.length >> 1];
  const a = mid(st.slice(0, k)), b = mid(st.slice(k, st.length - k)), c = mid(st.slice(st.length - k));
  return b < a - 1.5 && c > b + 1.5 ? 'dipping' : c - a > 2 ? 'rising' : a - c > 2 ? 'falling' : 'level';
}

// ---- one sound at a time: a word practised on its own (a sound to notice, one word of a pair one sound apart) ----
// Its record: [times heard, picked rightly by ear, times said, understood, only a second guess, taken for the other word of its pair, when].
// how: 'ear' (with ok), or what the recogniser made of the word said: 'hit' | 'near' | 'other' | 'miss'.
// ponytail: a recogniser of words judges one word, so this is "was this sound understood in this word", not a measure of the sound.
export function aloneAdd(rec, how, ok, now = Date.now()) {
  const r = Array.from({ length: 7 }, (_, i) => rec?.[i] || 0), at = { hit: 3, near: 4, other: 5 }[how];
  if (how === 'ear') { r[0]++; if (ok) r[1]++; } else { r[2]++; if (at) r[at]++; }
  r[6] = now;
  return r;
}
// Where the sounds stand: every try by ear and aloud, and the words understood least (three tries or more, fewer than two in
// three understood), the worst first.
export function aloneStats(alone) {
  const rows = Object.entries(alone || {}).map(([word, r]) => ({ word, ear: r[0], earOk: r[1], said: r[2], hit: r[3], near: r[4], other: r[5] }));
  const sum = k => rows.reduce((n, r) => n + r[k], 0);
  return { ear: sum('ear'), earOk: sum('earOk'), said: sum('said'), hit: sum('hit'),
    weak: rows.filter(r => r.said >= 3 && r.hit / r.said < 2 / 3).sort((a, b) => a.hit / a.said - b.hit / b.said || b.said - a.said).slice(0, 6) };
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

// How long a conversation really took the learner: for each of their lines, the time since the line before it (three minutes at
// most). Waiting for the partner to answer is not practice and is not counted.
export function activeMinutes(turns, t0) {
  const sec = turns.reduce((n, x, i) => x.who ? n + Math.min(180, Math.max(5, (x.at - (turns[i - 1]?.at || t0)) / 1000)) : n, 0);
  return Math.max(1, Math.round(sec / 60));
}

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
      spoken: at.filter(s => s.breakdown.speaking != null).length,
      grade: at.filter(s => s.ai).slice(-1)[0]?.ai.grade || '',
    };
  }).filter(r => r.texts || r.sittings);
}
// The highest level the numbers support, climbing until one fails. Reading: 95% of the words known.
// Listening: two sittings at the level, 80% of the dictation caught and (where asked) two questions in three right.
// Speaking: two sessions with speaking at the level, 85% of your words understood by the recogniser at its first guess.
export function estimate(rows) {
  const climb = (has, pass) => { let at = ''; for (const r of rows) { if (!has(r)) continue; if (!pass(r)) break; at = r.level; } return at; };
  return {
    reading: climb(r => r.reading != null, r => r.reading >= 0.95),
    listening: climb(r => r.sittings >= 2 && r.listening != null, r => r.listening >= 0.8 && (r.comprehension == null || r.comprehension >= 0.66)),
    speaking: climb(r => r.spoken >= 2 && r.speaking != null, r => r.speaking >= 0.85),
  };
}

// ---- where to start: a placement by ear ----
// Two sentences worth dictating from one bundled story of each level that has one, the lowest level first. pick chooses the story.
export function placeCards(stories, lang, pick = list => list[0]) {
  return LEVELS.flatMap(level => {
    const fit = stories.filter(s => s.lang === lang && s.level === level && s.source === 'starter' && s.text && !s.lines && pickDictation(storySentences(s), 2, lang).length === 2);
    return fit.length ? pickDictation(storySentences(pick(fit)), 2, lang).map(target => ({ level, target: target.normalize('NFC') })) : [];
  });
}
// What the sentences say: the share of words caught at each level, in the order tried, and where to start: the first level where
// less than 80% was caught (that is where there is something to learn), or the highest level tried when none failed (all).
// ponytail: two sentences a level, heard cold, so it is rough and errs low; the sittings measure properly afterwards.
export function placeLevel(rows) {
  const by = [...new Set(rows.map(r => r.level))].map(level => { const v = rows.filter(r => r.level === level).map(r => r.score); return { level, score: v.reduce((a, b) => a + b, 0) / v.length }; });
  const fail = by.find(r => r.score < 0.8);
  return { by, level: (fail || by[by.length - 1])?.level || '', all: !fail };
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
// What an AI sent as corrections: one that changes nothing is not a correction (small models send those).
const aiFixes = list => cleanFixes(list).filter(c => key(c.wrong) !== key(c.right));

// A story, a dialogue ({ roles: [a, b], lines: [[0|1, text]] }) or a subtitled recording ({ cues }).
export function cleanStory(s, lang) {
  s = obj(s);
  const lines = arr(s.lines).slice(0, 60).map(l => [arr(l)[0] ? 1 : 0, str(arr(l)[1], 600).trim()]).filter(l => l[1]);
  const roles = arr(s.roles).slice(0, 2).map(r => str(r, 40).trim()).filter(Boolean);
  const dialogue = lines.length >= 2 && roles.length === 2;
  const cues = arr(s.cues).slice(0, 4000).map(c => [num(arr(c)[0]), num(arr(c)[1]), str(arr(c)[2], 600).trim()]).filter(c => c[2] && c[1] > c[0]);
  const title = str(s.title, 120).trim(), notice = str(s.notice, 600).trim();
  // back: sentences of the text with what they mean, for writing back from the meaning: [[sentence, meaning]].
  // A first lesson (phrases) is nothing but such pairs, up to twelve, each with an optional reading in Latin letters.
  const back = arr(s.back).slice(0, s.phrases ? 12 : 4).map(b => { const read = s.phrases ? str(arr(b)[2], 200).trim() : '';
    return [str(arr(b)[0], 600).trim(), str(arr(b)[1], 400).trim(), ...(read ? [read] : [])]; }).filter(b => b[0] && b[1]);
  const phrases = !!s.phrases && back.length > 0;
  const text = phrases ? back.map(b => b[0]).join('\n') : dialogue ? lines.map(l => l[1]).join('\n') : cues.length ? cues.map(c => c[2]).join(' ') : str(s.text, 20000).trim();
  if (!text || !title) return null;
  const questions = arr(s.questions).slice(0, 5).map(q => ({ q: str(obj(q).q, 300).trim(),
    a: arr(obj(q).a).filter(x => typeof x === 'string' && x.trim()).slice(0, 6).map(x => x.trim().slice(0, 80)) })).filter(q => q.q && q.a.length);
  return { id: str(s.id, 80), lang: isLangCode(s.lang) ? s.lang : lang, title, level: LEVELS.includes(s.level) ? s.level : '', text,
    gloss: cleanGloss(s.gloss), source: str(s.source, 20), added: num(s.added), readAt: num(s.readAt),
    ...(phrases ? { phrases } : dialogue ? { roles, lines } : cues.length ? { cues } : {}), ...(questions.length ? { questions } : {}), ...(notice ? { notice } : {}), ...(back.length ? { back } : {}) };
}

// ---- first steps: thirty lessons of eight everyday phrases, from content/first.json ----
// A phrase there is a string, or [phrase, its own meaning] where the shared English meaning does not fit that
// language. The meaning shown is the same phrase in the reader's own language where the file has it, else the English.
export function lessonStories(first, code, ui = 'en') {
  first = obj(first);
  const all = arr(obj(first.langs)[code]), mine = ui === code ? [] : arr(obj(first.langs)[ui]), read = arr(obj(first.readings)[code]), en = arr(first.meanings);
  // A meaning that names the language being learned ("I am learning {language}.") is given in English with that language's name:
  // the reader's own phrase there would name their own language.
  let name = code;
  try { name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code; } catch { /* an unknown code stands for itself */ }
  return arr(first.lessons).map((title, i) => ({ id: `${code}-first-${String(i + 1).padStart(2, '0')}`, lang: code, title, source: 'first', phrases: true,
    back: all.slice(i * 8, i * 8 + 8).map((p, j) => { const n = i * 8 + j, named = String(en[n]).includes('{language}');
      return Array.isArray(p) ? [p[0], p[1], read[n]] : [p, !named && typeof mine[n] === 'string' ? mine[n] : String(en[n]).replace('{language}', name), read[n]]; }) })).filter(s => s.back.length);
}
// A first lesson that an AI wrote (cowork): a title and four to twelve phrases [phrase, meaning, reading?], each short, with no digits,
// said once, and one the app can mark. It becomes a story with phrases, like the bundled lessons.
export function cleanLesson(o, lang) {
  o = obj(o);
  const seen = new Set(), back = arr(o.phrases).slice(0, 12).map(p => [str(arr(p)[0], 81).trim(), str(arr(p)[1], 200).trim(), str(arr(p)[2], 200).trim()])
    .filter(([p, m]) => p && m && p.length <= 80 && !/\d/.test(p) && !seen.has(p) && seen.add(p) && plainWords(p, lang).length && dictationScore(p, p, lang).score === 1);
  return back.length >= 4 ? cleanStory({ title: o.title, phrases: true, back }, lang) : null;
}
// The letters a lesson needs that a Latin keyboard lacks; with a space and a delete key when the script is not Latin at all.
export function lessonKeys(text, lang) {
  const ch = [...new Set([...String(text).normalize('NFC').toLocaleLowerCase(lang)].filter(c => /[\p{L}\p{M}]/u.test(c) && !/[a-z]/.test(c)))].sort();
  return ch.some(c => /\p{L}/u.test(c) && !/\p{Script=Latin}/u.test(c)) ? [...ch, ' ', '⌫'] : ch;
}
// A script chart "あ=a し=shi/si" -> [[letter, [accepted readings]]]. A typed reading passes when it is one of them (case and accents forgiven).
export const chartPairs = src => String(src ?? '').split(/\s+/).map(x => x.split('=')).filter(x => x.length === 2 && x[0] && x[1]).map(([ch, r]) => [ch, r.split('/')]);
// The digits someone typed, whichever digits their keyboard has (٤٧, ४७ and ４７ are all 47); anything else is dropped.
const ZEROS = [0x30, 0x660, 0x6f0, 0x966, 0x9e6, 0xe50, 0xff10];
export const digits = s => [...String(s ?? '')].map(ch => { const c = ch.codePointAt(0), z = ZEROS.find(z => c >= z && c < z + 10); return z == null ? '' : String(c - z); }).join('');
export const readingOk = (typed, readings) => arr(readings).some(r => strip(r) === strip(String(typed).trim()));
export function cleanReview(r) {
  r = obj(r);
  const list = v => arr(v).filter(x => typeof x === 'string').slice(0, 6).map(x => x.slice(0, 400));
  const grade = str(r.grade, 2).toUpperCase(), corrections = aiFixes(r.corrections);
  if (!str(r.sessionId, 80) || !/^[A-F][+-]?$/.test(grade)) return null;
  return { sessionId: r.sessionId, grade, summary: str(r.summary, 1200), strengths: list(r.strengths), fixes: list(r.fixes), next: str(r.next, 600),
    ...(corrections.length ? { corrections } : {}) };
}
// One pen-pal reply from the agent: the letter back, meanings for its harder words, corrections of the learner's letter.
export function cleanPalReply(r) {
  r = obj(r);
  const text = str(r.text, 4000).trim();
  return str(r.id, 80) && text ? { id: r.id, text, gloss: cleanGloss(r.gloss), corrections: aiFixes(r.corrections) } : null;
}
// ---- a human teacher, with no server ----
// The learner's writing goes to the teacher inside a link (after the #: JSON, UTF-8, base64url), and the teacher's
// corrections come back inside another. Both are outside text: decoded here, parsed by the caller, rebuilt from known fields.
export const packLink = o => btoa(Array.from(new TextEncoder().encode(JSON.stringify(o)), b => String.fromCharCode(b)).join(''))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export function linkText(s) {
  try { return String(s).length > 60000 ? '' : new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0))); } catch { return ''; }
}
export function cleanTeach(o) { // what the learner sends: one sitting's writing, and the text it was about
  o = obj(o);
  const text = str(o.text, 4000).trim();
  return str(o.id, 80) && text ? { id: o.id, lang: isLangCode(o.lang) ? o.lang : '', level: LEVELS.includes(o.level) ? o.level : '', title: str(o.title, 120).trim(), story: str(o.story, 4000).trim(), text } : null;
}
export function cleanTeacher(o) { // what the teacher sends back: corrections and a word for the learner
  o = obj(o);
  const corrections = cleanFixes(o.corrections), note = str(o.note, 1200).trim();
  return str(o.id, 80) && (corrections.length || note) ? { id: o.id, note, corrections } : null;
}
// ---- for a native speaker: everything bundled in one language, to be read and corrected (an AI wrote it; no person had read it) ----
// One section for each first lesson, one for the sounds and the pairs, one for each text. A row is { id, text, about, reading }, and
// its id says where the words live: first:<phrase number>, sound:<n>, pair:<n>, and for a text <its id>:t (the title), :s<n> (a sentence
// or a line), :b<n> (a sentence given with its meaning), :q<n> (a question), :n (the note on grammar), :g:<word> (a word's meaning).
export function proofSections(first, texts, code) {
  first = obj(first);
  const out = [], ph = arr(obj(first.langs)[code]), en = arr(first.meanings), rd = arr(obj(first.readings)[code]), s = v => str(v, 800), row = (id, text, about = '', reading = '') => ({ id, text, about, reading });
  arr(first.lessons).forEach((title, i) => {
    const rows = ph.slice(i * 8, i * 8 + 8).map((p, j) => row(`first:${i * 8 + j + 1}`, s(Array.isArray(p) ? p[0] : p), s(Array.isArray(p) ? p[1] : en[i * 8 + j]), s(rd[i * 8 + j])));
    if (rows.length) out.push({ id: `first-${i + 1}`, kind: 'lesson', n: i + 1, title: s(title), rows, words: [] });
  });
  const snd = [...arr(obj(first.sounds)[code]).map((x, n) => row(`sound:${n + 1}`, s(arr(x)[1]), [s(arr(x)[0]), s(arr(x)[2])].filter(Boolean).join(': '))),
    ...arr(obj(first.pairs)[code]).map((x, n) => row(`pair:${n + 1}`, [s(arr(x)[0]), s(arr(x)[1])].filter(Boolean).join(' / '), s(arr(x)[2])))].filter(r => r.text);
  if (snd.length) out.push({ id: 'sounds', kind: 'sounds', title: '', rows: snd, words: [] });
  for (const raw of arr(texts)) {
    const t = cleanStory(raw, code);
    if (!t || !t.id) continue;
    const said = t.lines ? t.lines.map(l => [l[1], t.roles[l[0]]]) : sentences(t.text, code).map(x => [x, '']);
    out.push({ id: t.id, kind: 'text', title: t.title, level: t.level, rows: [{ ...row(t.id + ':t', t.title), kind: 't' },
      ...said.map(([text, who], n) => row(`${t.id}:s${n + 1}`, text, who)),
      ...arr(t.back).map((b, n) => ({ ...row(`${t.id}:b${n + 1}`, b[0], b[1]), kind: 'b' })),
      ...arr(t.questions).map((q, n) => ({ ...row(`${t.id}:q${n + 1}`, q.q, q.a.join(', ')), kind: 'q' })),
      ...(t.notice ? [{ ...row(t.id + ':n', t.notice), kind: 'n' }] : [])],
      words: Object.entries(t.gloss).map(([w, m]) => row(`${t.id}:g:${w}`, w, m)) });
  }
  return out;
}
// What the reader marked, as it is kept on their device: { fix: { row id: [how it should read, a note] }, read: { section id: true } }.
// Rebuilt from known fields; the maps have no prototype, so an id can never be taken for something every object has.
export function cleanProof(m) {
  m = obj(m);
  const fix = Object.create(null), read = Object.create(null);
  for (const [k, v] of Object.entries(obj(m.fix)).slice(0, 5000)) { const a = [str(arr(v)[0], 600), str(arr(v)[1], 600)]; if (k.length <= 200 && (a[0].trim() || a[1].trim())) fix[k] = a; }
  for (const [k, v] of Object.entries(obj(m.read)).slice(0, 1000)) if (v === true && k.length <= 100) read[k] = true;
  return { fix, read };
}
// What the reader sends back, as text: the sections they read, and each correction with the words it is about (so that it can
// still be placed after the content has changed). A mark on a row the content no longer has is left out.
export function proofOut(code, sections, marks, day = '') {
  const fixes = [];
  for (const sec of sections) for (const r of [...sec.rows, ...sec.words]) { const m = marks.fix[r.id], now = m?.[0].trim(), note = m?.[1].trim();
    if (now || note) fixes.push({ id: r.id, was: r.text, ...(r.about ? { about: r.about } : {}), ...(now ? { now } : {}), ...(note ? { note } : {}) }); }
  return { languagelab: 'proof', lang: code, day, sections: sections.length, read: sections.filter(x => marks.read[x.id]).map(x => x.id), fixes };
}
const cleanSrs = s => s && typeof s === 'object'
  ? { reps: num(s.reps), lapses: num(s.lapses), ease: num(s.ease, 2.5), interval: num(s.interval), due: num(s.due), t: num(s.t) } : null;
const MODES = ['sitting', 'read', 'listen', 'talk', 'chat', 'first'];
function cleanSitting(s) {
  s = obj(s);
  if (!str(s.id, 80)) return null;
  const b = obj(s.breakdown), ai = s.ai ? cleanReview({ ...obj(s.ai), sessionId: s.id }) : null;
  const teacher = s.teacher ? cleanTeacher({ ...obj(s.teacher), id: s.id }) : null;
  const hints = aiFixes(s.hints).slice(0, 3); // what the browser's own model would change in the retelling: suggestions, kept one by one
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
      score: unit(obj(d).score), tries: num(obj(d).tries), ...(obj(d).memory ? { memory: true } : {}), ...(obj(d).typed ? { typed: true } : {}),
      // near: words the recogniser had only as a second guess. sure: how sure it was of its first guess, 0 to 1 (where the browser says)
      ...(obj(d).near > 0 ? { near: num(obj(d).near) } : {}), ...(obj(d).sure > 0 ? { sure: unit(obj(d).sure) } : {}) })),
    writing: { text: str(obj(s.writing).text, 8000), spoken: !!obj(s.writing).spoken },
    score: s.score == null ? null : Math.round(100 * unit(num(s.score) / 100)),
    breakdown: { listening: unit(b.listening), comprehension: unit(b.comprehension), understood: unit(b.understood), speaking: unit(b.speaking), rebuilt: unit(b.rebuilt),
      replays: num(b.replays), wordsRead: num(b.wordsRead), wordsWritten: num(b.wordsWritten) },
    ...(ai ? { ai } : {}),
    ...(teacher ? { teacher: { note: teacher.note, corrections: teacher.corrections, at: num(obj(s.teacher).at) } } : {}),
    ...(hints.length ? { hints } : {}),
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
  return reply ? { turnId: str(r.turnId, 80), reply, corrections: aiFixes(r.corrections).slice(0, 3) } : null;
}
export const emptyLang = () => ({ known: {}, cards: {}, fixes: {}, level: 'A2', pal: { persona: '', msgs: [] }, chat: null, alone: {} });
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
    for (const [w, rec] of Object.entries(obj(L.alone)).slice(0, 3000)) { // counts that cannot contradict each other
      const r = Array.from({ length: 7 }, (_, i) => Math.max(0, Math.floor(num(arr(rec)[i]))));
      r[1] = Math.min(r[1], r[0]); r[3] = Math.min(r[3], r[2]); r[4] = Math.min(r[4], r[2] - r[3]); r[5] = Math.min(r[5], r[2] - r[3] - r[4]);
      if (w && w.length <= 60 && r[0] + r[2]) out.alone[w] = r;
    }
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
// change, a word practised on its own keeps the longer record. A removed story stays removed (gone); a word marked "I know this" stays known (retired).
export function mergeState(a, b) {
  const [hi, lo] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
  const join = (x, y, fix) => [...new Map([...y, ...x].map(v => [v.id, v])).values()]
    .map(v => fix(v, y.find(o => o.id === v.id) || v));
  const stamp = c => Math.max(c.srs?.t || 0, c.retired || 0, c.edited || 0);
  const newest = (H, L) => { const out = { ...L, ...H }; for (const k in L) if (H[k] && stamp(L[k]) > stamp(H[k])) out[k] = L[k]; return out; };
  const langs = {}, gone = { ...lo.gone, ...hi.gone };
  const sittings = join(hi.sittings, lo.sittings, (v, o) => ({ ...v, ...(!v.ai && o.ai ? { ai: o.ai } : {}), ...(!v.teacher && o.teacher ? { teacher: o.teacher } : {}) }))
    .sort((x, y) => x.at - y.at);
  // the longer copy of a conversation in progress; none once it has been finished (it is then a session) on either device
  const talk = (x, y) => { const c = !y || (x && x.turns.length >= y.turns.length) ? x : y; return c && !sittings.some(s => s.id === c.id) ? c : null; };
  for (const code of new Set([...Object.keys(hi.langs), ...Object.keys(lo.langs)])) {
    const H = hi.langs[code] || emptyLang(), L = lo.langs[code] || emptyLang();
    const cards = newest(H.cards, L.cards), known = { ...L.known, ...H.known };
    for (const k in cards) if (cards[k].retired) known[k] = 1; else delete known[k];
    // a word practised on its own: the copy with more tries. ponytail: tries made on two devices between two syncs are not added up.
    const alone = { ...L.alone, ...H.alone };
    for (const k in L.alone) if (H.alone?.[k] && L.alone[k][0] + L.alone[k][2] > H.alone[k][0] + H.alone[k][2]) alone[k] = L.alone[k];
    langs[code] = { known, cards, fixes: newest(H.fixes, L.fixes), level: (hi.langs[code] || L).level, alone,
      chat: talk(H.chat, L.chat),
      pal: { persona: H.pal.persona || L.pal.persona, msgs: join(H.pal.msgs, L.pal.msgs, (v, o) => (v.reply || !o.reply ? v : o)).sort((x, y) => x.at - y.at) } };
  }
  return {
    ...hi, langs, gone, welcomed: hi.welcomed || lo.welcomed,
    stories: join(hi.stories, lo.stories, (v, o) => ({ ...v, readAt: Math.max(v.readAt || 0, o.readAt || 0) })).filter(s => !gone[s.id]),
    sittings,
  };
}
