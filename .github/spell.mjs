// Every word of the bundled texts (stories, dialogues, questions, first lessons) against that language's open spell-checking
// dictionary. It is not a language model and knows no grammar, but a misspelt or invented word is not in its list.
// A word it does not know fails the check unless spell-ok.json lists it (names, loanwords and correct forms a dictionary lacks,
// each one read by a person or an agent before it went in).
//
//   npm i --no-save $(node .github/spell.mjs --packages)     the checker and 31 dictionaries, about 130 MB
//                                                            (npm then drops what else was installed that way: name
//                                                            playwright-core on the same line if the browser tests are to keep running)
//   node .github/spell.mjs [code …]                          check (all languages that have a dictionary, or the ones named)
//   node .github/spell.mjs --write                           after reading what it flags: accept all of it into spell-ok.json
//
// ponytail: run by hand when content changes, not in CI (130 MB of dictionaries on every push). No dictionary for Chinese,
// Japanese, Finnish, Afrikaans, Indonesian, Malay, Filipino, Swahili, Arabic, Hindi, Urdu, Bengali or Thai.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import * as c from '../core.js';

const PACKAGES = 'hunspell-asm@4.0.2 dictionary-fr@3.0.0 dictionary-es@4.0.0 dictionary-de@3.0.0 dictionary-it@2.0.0 dictionary-pt@4.0.0 dictionary-nl@2.0.0 dictionary-hr@2.0.0 dictionary-en@4.0.0 dictionary-ko@2.0.0 dictionary-sv@4.0.0 dictionary-ru@3.0.0 dictionary-uk@4.0.0 dictionary-pl@2.0.0 dictionary-cs@4.0.0 dictionary-sk@2.0.0 dictionary-sl@3.0.0 dictionary-sr-latn@4.0.0 dictionary-bg@2.0.0 dictionary-mk@2.0.0 dictionary-ro@3.0.0 dictionary-hu@3.0.0 dictionary-el@4.0.0 dictionary-tr@2.0.0 dictionary-nb@3.0.0 dictionary-da@6.0.0 dictionary-ca@3.0.0 dictionary-gl@3.0.0 dictionary-vi@3.0.0 dictionary-eo@2.0.0 dictionary-fa@2.0.0 dictionary-be@1.0.0';
const args = process.argv.slice(2), write = args.includes('--write');
if (args.includes('--packages')) { console.log(PACKAGES); process.exit(0); }

const root = new URL('../', import.meta.url), okFile = new URL('./spell-ok.json', import.meta.url);
const dict = code => new URL(`node_modules/dictionary-${{ sr: 'sr-latn' }[code] || code}/`, root); // the Serbian texts are in Latin letters
const named = args.filter(a => !a.startsWith('--'));
const codes = (named.length ? named : Object.keys(c.LANGS)).filter(code => existsSync(new URL('index.dic', dict(code))));
if (!codes.length) { console.log('No dictionaries here. Install them with: npm i --no-save $(node .github/spell.mjs --packages)'); process.exit(1); }
const { loadModule } = await import('hunspell-asm');
const factory = await loadModule(), first = JSON.parse(readFileSync(new URL('content/first.json', root), 'utf8'));
const accepted = existsSync(okFile) ? JSON.parse(readFileSync(okFile, 'utf8')) : {};
let total = 0, news = 0;
for (const code of codes) {
  const hs = factory.create(factory.mountBuffer(readFileSync(new URL('index.aff', dict(code))), code + '.aff'), factory.mountBuffer(readFileSync(new URL('index.dic', dict(code))), code + '.dic'));
  const known = w => hs.spell(w) || hs.spell(w.toLowerCase()) || hs.spell(w[0].toUpperCase() + w.slice(1));
  const seen = new Map(); // word -> where it was first met
  const take = (text, where) => { for (const x of c.tokens(text, code)) if (x.word && !seen.has(x.s)) seen.set(x.s, where); };
  for (const s of JSON.parse(readFileSync(new URL(`content/${code}.json`, root), 'utf8'))) {
    take(s.title, s.id); take(s.text || s.lines.map(l => l[1]).join(' '), s.id);
    for (const q of s.questions || []) take(q.q, s.id + ' question');
    for (const b of s.back || []) take(b[0], s.id + ' back');
  }
  (first.langs[code] || []).forEach((p, i) => take(Array.isArray(p) ? p[0] : p, 'first lesson phrase ' + (i + 1)));
  // (a word joined by an apostrophe, a hyphen or a zero-width non-joiner may be known only in its parts)
  const flagged = [...seen].filter(([w]) => !known(w) && !w.split(/['’‌-]/).every(p => p && known(p)));
  const fresh = flagged.filter(([w]) => !(accepted[code] || []).includes(w));
  total += seen.size; news += fresh.length;
  if (write) { if (flagged.length) accepted[code] = flagged.map(([w]) => w).sort(); else delete accepted[code]; }
  console.log(`${code}: ${seen.size} words, ${flagged.length} not in the dictionary` + (fresh.length ? `, ${fresh.length} of them not accepted: ` + fresh.map(([w, where]) => `${w} (${where})`).join(', ') : ''));
  hs.dispose();
}
if (write) writeFileSync(okFile, JSON.stringify(accepted, null, 1) + '\n');
console.log(`${codes.length} languages, ${total} different words` + (write ? ': spell-ok.json written' : news ? `: ${news} to look at` : ': nothing new'));
process.exit(news && !write ? 1 : 0);
