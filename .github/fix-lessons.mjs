// Corrections to the first lessons and the words with pictures in content/first.json, one language a line, the rest of the file
// untouched. Run by hand from the repo root, after reading the corrections (they are outside text):
//
//   node .github/fix-lessons.mjs corrections.json
//
// corrections.json is either what a native speaker sent back from their page (#proof=<language>):
//   { "languagelab": "proof", "lang": "fr", "fixes": [{ "id": "first:15", "was": "…", "now": "…", "note": "…" }] }
// or a plain list:
//   [[code, phrase number, "as it stands", "as it should read" | ["phrase", "its own meaning"], "its reading"]]
// (code "meanings" corrects the shared English meanings; "words:<code>" a word with a picture).
//
// It refuses a correction whose "as it stands" is not what the file has (the content moved on, or the number is wrong), and one that
// would say something twice in a language. From a native speaker's file it applies the corrections to lesson phrases (first:<n>) and
// to words (word:<n>) that say how the line should read, and lists everything else (remarks without a wording, texts, sounds) to be
// done by hand. Where the language has readings and none came with the correction, the old reading is left and the line is listed:
// rewrite it. Then: node core.test.mjs, and node .github/spell.mjs <code>.
// ponytail: the texts (content/<code>.json) are corrected by hand: a changed sentence drags its glosses, questions and the sentences
// given with a meaning after it, and core.test.mjs is what finds those.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../content/first.json', import.meta.url), lines = readFileSync(file, 'utf8').split('\n'), input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const byHand = [], readings = [], whole = JSON.parse(lines.join('\n'));
const edits = Array.isArray(input) ? input : (input.fixes || []).flatMap(x => { const m = /^(first|word):(\d+)$/.exec(x.id || '');
  if (!m || !x.now) { byHand.push(x); return []; }
  return [[m[1] === 'word' ? 'words:' + input.lang : input.lang, +m[2], x.was, x.now]]; });
const at = (block, code) => { const from = lines.findIndex(l => l.startsWith(`"${block}":{`)), i = lines.findIndex((l, k) => k > from && l.startsWith(`"${code}":[`));
  if (from < 0 || i < 0) throw new Error(`${block}.${code} not found`); return i; };
const read = i => JSON.parse(lines[i].replace(/^"[a-z]+":/, '').replace(/,$/, '').replace(/\}+$/, '')), tail = i => lines[i].match(/[,}]*$/)[0];
const write = (i, code, list) => { lines[i] = `"${code}":` + JSON.stringify(list) + tail(i); };
const text = p => Array.isArray(p) ? p[0] : p;
let n = 0;
for (const target of [...new Set(edits.map(e => e[0]))]) {
  const mine = edits.filter(e => e[0] === target);
  if (target === 'meanings') { // the first line: {"meanings":[…],
    if (!lines[0].startsWith('{"meanings":[') || !lines[0].endsWith(',')) throw new Error('meanings: not where expected');
    const list = JSON.parse(lines[0].slice('{"meanings":'.length, -1));
    for (const [, num, was, now] of mine) { if (list[num - 1] !== was) throw new Error(`meanings #${num}: the file has ${JSON.stringify(list[num - 1])}, not ${JSON.stringify(was)}`); list[num - 1] = now; n++; }
    lines[0] = '{"meanings":' + JSON.stringify(list) + ',';
    continue;
  }
  const words = target.startsWith('words:'), code = words ? target.slice(6) : target, [block, readBlock] = words ? ['words', 'wordReadings'] : ['langs', 'readings'];
  const li = at(block, code), list = read(li), hasReads = !!whole[readBlock]?.[code];
  let ri = -1, reads = null;
  for (const [, num, was, now, reading] of mine) {
    if (text(list[num - 1]) !== was) throw new Error(`${target} #${num}: the file has ${JSON.stringify(list[num - 1])}, not ${JSON.stringify(was)}`);
    list[num - 1] = now;
    if (reading !== undefined) { if (!reads) { ri = at(readBlock, code); reads = read(ri); } reads[num - 1] = reading; }
    else if (hasReads && text(now) !== was) readings.push(`${target} #${num}: ${text(now)}`);
    n++;
  }
  const seen = new Map();
  list.forEach((p, i) => { const k = text(p).toLowerCase(); if (seen.has(k)) throw new Error(`${target}: #${seen.get(k) + 1} and #${i + 1} say the same: ${text(p)}`); seen.set(k, i); });
  write(li, code, list); if (reads) write(ri, code, reads);
}
JSON.parse(lines.join('\n')); // still one valid file
writeFileSync(file, lines.join('\n'));
console.log('applied', n, 'correction(s)');
if (readings.length) console.log('\nthe reading in Latin letters is still the old one; rewrite it:\n  ' + readings.join('\n  '));
if (byHand.length) console.log('\nto do by hand:\n  ' + byHand.map(x => `${x.id}: ${JSON.stringify(x.was)}${x.now ? ' -> ' + JSON.stringify(x.now) : ''}${x.note ? ' (' + x.note + ')' : ''}`).join('\n  '));
