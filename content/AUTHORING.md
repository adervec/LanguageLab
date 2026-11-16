# Writing starter content

One file per language: `content/<code>.json`, a JSON array of stories and dialogues. A language with a
file here and an entry in `LANGS` (`core.js`) has starter content; every other language works with
pasted texts and the AI cowork `stories` channel.

Check a file with `node core.test.mjs content/<code>.json` (from the repo root). It lists every
problem; keep fixing until it prints `ok`.

## A story

```json
{
  "id": "fr-marche",
  "title": "Le marché du samedi",
  "level": "A2",
  "text": "Chaque samedi matin, Claire va au marché avec son panier. …",
  "gloss": { "marché": "market", "panier": "basket", "arrête": "stops (s'arrêter: to stop)" },
  "questions": [
    { "q": "Où va Claire chaque samedi matin ?", "a": ["marché"] },
    { "q": "Que lui donne toujours le vieux monsieur ?", "a": ["pomme"] },
    { "q": "Que boit Claire avant de rentrer ?", "a": ["café"] }
  ],
  "notice": "Chez + a person means at that person's shop or home: \"chez un vieux monsieur\". Lui before the verb means to her or to him: \"qui lui donne\", \"il lui fait goûter\"."
}
```

- `id`: the language code, a hyphen, a short slug. Unique in the file. Dialogues use `<code>-d-<slug>`.
- `level`: A1, A2, B1, B2 or C1. Words in the text: A1 70–170, A2 90–210, B1 110–250, B2 130–290, C1 170–360.
  Aim for the middle of the range.
- `text`: an everyday situation with a small arc, something worth retelling: a problem solved, a
  surprise, a change of mind. Natural, idiomatic, correct. Set it where the language is spoken. Never a
  vocabulary list dressed up as a story. About 95% of the running words should be ones a learner at
  that level knows; the rest are what the gloss is for.
  - It is read aloud by a speech synthesiser and used for dictation: **no digits** (write numbers as
    words), no abbreviations, no lists, no unusual punctuation. Plain straight apostrophes (`'`).
  - Sentences of 4 to 22 words, mostly. At least three such sentences are needed.
  - No real living people, brands, politics or religion. Nothing a twelve-year-old should not read.
- `gloss`: 10 to 60 entries (about 15–30 is right): each word a learner at that level may not know.
  The key is the word **exactly as written in the text, in lower case, one word**; the value is a short
  English meaning in this context, with the dictionary form in brackets when it helps
  (`"arrête": "stops (s'arrêter: to stop)"`). For English content the value is a simple English definition.
  - Words split at spaces, hyphens and punctuation. In French and Italian an elided clitic is not a
    word: `l'école` is the word `école`, `dell'acqua` is `acqua` (but `aujourd'hui` is one word). In
    other languages an apostrophe inside a word stays in it (`don't`), except a final `'s`.
  - For an idiom, gloss its main word and name the idiom: `"plein": "full (en plein air: in the open air)"`.
- `questions`: exactly three, in the language being learned, asked after the learner has only HEARD the
  text. Each asks for a fact that is stated in the text and has a short answer. `a` lists the accepted
  key words (one to four alternatives). An answer passes when it contains every word of one key
  (accents and case forgiven; a key word of four letters or more also matches a longer word starting
  with it, so `marché` accepts `marchés`).
  - Every key must be in the text, and must not be in its own question. When the answer is a number,
    give the word and the digits (`["treinta", "30"]`): a learner may type either.
  - Prefer keys of one word. Spread the questions over the beginning, middle and end.
  - Not yes/no questions, and nothing answerable without having understood the text.
- `back`: exactly two entries `["a whole sentence of the text, copied exactly", "what it means in English"]`, of 5 to 13 words and
  without quoted speech. The learner is shown the meaning and writes the sentence. (Not for the English set.)
- `notice`: one grammar or usage point the text shows, in plain English, quoting two short examples
  from the text. 40 to 400 characters. It is shown after reading, as something to notice.

## First steps (`first.json`)

One file for every language: `meanings` (the English meanings), `lessons` (the titles, eight phrases each), and per
language code in `langs` the phrases in the same order. Lessons eleven to twenty are everyday situations (a market, home, travel, yesterday, plans, health, describing, work, the
phone, help): the past is told with "we", and a feeling without an adjective for "I" ("I do not feel well"), so they too work
for any speaker. Lessons one to five are set phrases; six to ten are first
sentences, written so that they do not depend on who is speaking (no "I am tired", no past tense in the first person).
Where a language cannot avoid that, give the feminine with a note, as in Hindi. A meaning with `{language}` in it names
the language being learned. Keep each phrase short (80 characters at most), natural and
polite, with no digits. Where a language does not say it that way, give the pair `["phrase", "what it really means"]`.
A language in a script that is not Latin also needs a reading in Latin letters for every phrase (`readings`). `scripts` holds charts as
`[name, "letter=reading letter=reading/other"]`; `sounds` holds `[letters, example word, what to listen for]`.
`node core.test.mjs` checks all of it.

## Chinese, Japanese and Korean

- Chinese and Japanese have no spaces, so the app splits words with `Intl.Segmenter`. A gloss key must be a word exactly as that splits it:
  print the words of a text with `node -e "import('./core.js').then(c => console.log(c.wordKeys(process.argv[1], 'zh').join(' ')))" "<text>"`.
  Give the reading first in the gloss value: `"市场": "shìchǎng: market"`, `"学校": "がっこう: school"`.
- Lengths there are counted in characters (the same numbers as words elsewhere); a dialogue line may be 60 characters.
  An answer key passes when it appears anywhere in what was typed. Avoid quoted speech.
- Korean is split at its spaces, so a gloss key is the whole word with its particles (`"학교에": "to school (학교)"`). Its texts are
  0.6 times as long in words.
- A language marked `small` in `LANGS` needs 8 stories and 4 dialogues, not 16 and 8; one marked `mini` needs 4 and 2.
- After writing or changing texts, run `node .github/spell.mjs <code>` (its first lines say how to install the
  dictionaries). Read every word it does not know before accepting it with `--write`.

## A dialogue

```json
{
  "id": "fr-d-boulangerie",
  "title": "À la boulangerie",
  "level": "A1",
  "roles": ["La boulangère", "Le client"],
  "lines": [
    [0, "Bonjour monsieur ! Vous désirez ?"],
    [1, "Bonjour madame. Je voudrais une baguette, s'il vous plaît."]
  ],
  "gloss": { "désirez": "would like" },
  "questions": [{ "q": "Qu'est-ce que le client achète ?", "a": ["baguette"] }, { "q": "…", "a": ["…"] }],
  "notice": "…"
}
```

- No `text`. `roles` names the two speakers; `lines` is 8 to 18 turns, each `[0 or 1, "what is said"]`.
- **Speaker 1 is the learner's part** (the customer, the traveller, the patient, the candidate). Their
  lines are spoken aloud and then said from memory, so make them useful sentences a learner would
  really need: at least three of them four words or longer, none longer than 28 words. Speaker 0
  (the baker, the receptionist) keeps the exchange moving.
- A real exchange with a small turn: something is out of stock, a misunderstanding, a choice to make.
- `gloss` 5 to 60 entries, exactly two `questions`, a `notice`: the same rules as for a story.
