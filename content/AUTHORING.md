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

`pairs` holds, for the languages that have them, pairs of ordinary words exactly one sound apart (a vowel or a consonant, its length, a
tone, the stress), with what each means: not homophones, and not words that differ in a second sound in a standard pronunciation.

One file for every language: `meanings` (the English meanings), `lessons` (the titles, eight phrases each), and per
language code in `langs` the phrases in the same order. Lessons eleven to twenty are everyday situations (a market, home, travel, yesterday, plans, health, describing, work, the
phone, help): the past is told with "we", and a feeling without an adjective for "I" ("I do not feel well"), so they too work
for any speaker. Lessons 21 to 30 go on to shopping, a restaurant, free time, reasons ("because"), people, and can, must and may: they keep
"I" in the present, where few languages mark who is speaking, and tell the past about Anna or an old fisherman (lessons 27 and 30 are
each a story of eight sentences, so a habit in the past takes the form for a habit). Lessons 31 to 60 exist in 32 languages: the eight
with full sets, and Chinese, Japanese, Korean, Vietnamese, Indonesian, Malay, Russian, Ukrainian, Bulgarian, Polish, Czech, Slovak, Serbian, Romanian, Hungarian, Greek, Turkish, Catalan, Galician, Swedish, Norwegian, Danish, Afrikaans and Esperanto (a language's list in `langs` is 240 or 480 long; a language with readings has one for each phrase). Each is a scene of eight lines, a conversation in the polite form or a
story, and "I" stays out of the past and of adjectives, which in many of those languages depend on who is speaking (where such a form cannot be avoided, the woman's is given, since the speaker is Anna, and the phrase's own meaning names the man's). Lessons one to five are set phrases; six to ten are first
sentences, written so that they do not depend on who is speaking (no "I am tired", no past tense in the first person).
Where a language cannot avoid that, give the feminine with a note, as in Hindi. A meaning with `{language}` in it names
the language being learned. Keep each phrase short (80 characters at most), natural and
polite, with no digits. Where a language does not say it that way, give the pair `["phrase", "what it really means"]`.
A language in a script that is not Latin also needs a reading in Latin letters for every phrase (`readings`). `scripts` holds charts as
`[name, "letter=reading letter=reading/other"]`; `sounds` holds `[letters, example word, what to listen for]`.
`node core.test.mjs` checks all of it.

## Words with pictures (`first.json`)

`wordLessons` (twelve titles), `wordIcons` (96 emoji, one a word), `wordMeanings` (the English), `words.<code>` (96 words, in the same
order for every language) and `wordReadings.<code>` (where the language has `readings`). Rules the test checks: 96 words, each
markable, no digits, a reading in Latin letters where one is wanted, and **no word twice in a language**: the learner must be able to
tell two cards apart, so where one word stands for two of the pictures, say one of them another way, with a meaning of its own if it
no longer means quite the same (`["눈송이", "snowflake"]`). Give the article where that is how a learner sees the gender (le pain, das
Brot, het brood, το ψωμί; Swedish, Norwegian and Danish en/ett on what can be counted, bare for what cannot); elsewhere the bare
noun. Pick emoji from before 2018, or older devices show a box. `node .tmp/w1.cjs` is how the lists were checked and written.

## Reading lesson phrases a second time

Two questions find different things. "Is anything wrong here?" finds mistakes (plant a few in the copy to know what a clean
report is worth). "For each lesson, which phrase would a native speaker most object to, and is it wrong, unnatural or fine?" finds
what is correct but stiff or translated, and in the eight main languages that was twenty phrases in 480 on average. Give the second
question to a reader of another model, one language at a time, with a clean copy; judge each answer yourself; keep the meaning shown
to the learner true (a phrase that no longer matches the shared English meaning needs a meaning of its own, and then it is no
longer shown in the learner's own language). A corrected phrase reaches the cards a learner already has (`syncPhraseCards`).

## Corrections from a native speaker

Settings gives a link to a page (`#proof=<code>`) on which a native speaker reads everything bundled in their language and writes
what is wrong. What they send back is text like this:

```json
{ "languagelab": "proof", "lang": "fr", "day": "2026-11-18", "sections": 105, "read": ["first-1", "fr-marche"],
  "fixes": [{ "id": "first:3", "was": "Bonne nuit.", "about": "Good night.", "now": "…", "note": "…" }] }
```

It is outside text: read it first. Then `node .github/fix-lessons.mjs <the file>` applies the corrections to lesson phrases and to the
words with pictures that say how the line should read; it refuses one whose line is no longer what they saw, lists the readings to
rewrite, and lists what it leaves to you (remarks without a wording, and everything in the texts). `read` lists the sections they went through
(`first-<lesson>`, `sounds`, or a text's id), also where they found nothing. In a correction, `was` is the line as they saw it, so
that it can still be found if the file has changed since; `now` is how it should read and `note` is their remark (either may be
missing). The `id` says where the line lives:

- `first:<n>`: phrase n (counting from 1) of `langs.<code>` in `first.json`. Where the language has `readings`, rewrite the reading
  too. If the correction changes what the phrase means, give the phrase its own meaning (`[phrase, meaning]`).
- `sound:<n>` and `pair:<n>`: entry n of `sounds.<code>` and of `pairs.<code>`. `word:<n>`: word n of `words.<code>` (and its reading).
- `<text id>:t` the title; `:s<n>` sentence n of a story or line n of a dialogue; `:b<n>` entry n of `back` (a sentence and its
  English meaning); `:q<n>` question n; `:n` the `notice`; `:g:<word>` the meaning given for a word in `gloss`.

A changed sentence can leave other things behind: the same sentence in `back`, a question whose accepted answer must still occur
in the text, a gloss for a word that is gone or missing for a word that is new. `node core.test.mjs content/<code>.json` lists
them; then run `node .github/spell.mjs <code>`. Say in the README what was read and when (not who, unless they ask).

## Chinese, Japanese and Korean

- Chinese and Japanese have no spaces, so the app splits words with `Intl.Segmenter`. A gloss key must be a word exactly as that splits it:
  print the words of a text with `node -e "import('./core.js').then(c => console.log(c.wordKeys(process.argv[1], 'zh').join(' ')))" "<text>"`.
  Give the reading first in the gloss value: `"市场": "shìchǎng: market"`, `"学校": "がっこう: school"`.
- Lengths there are counted in characters (the same numbers as words elsewhere); a dialogue line may be 60 characters.
  An answer key passes when it appears anywhere in what was typed. Avoid quoted speech.
- Korean is split at its spaces, so a gloss key is the whole word with its particles (`"학교에": "to school (학교)"`). Its texts are
  0.6 times as long in words.
- A language marked `small` in `LANGS` needs 8 stories and 4 dialogues, not 16 and 8; one marked `mini` needs 4 and 2 (a
  new language may start there; none is at that size now).
- Thirty-two languages share one set of twelve texts, translated sentence for sentence from one English master, so their
  English glosses and write-back meanings are shared. A text there must work for any learner: the lines a learner speaks
  do not depend on the speaker's gender (or the notice says what the other form is), and a first-person story names its
  teller.
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

## The shared twelve (32 languages)

Russian to Thai (see `LANGS`) share twelve texts: a market, a day, a weekend by the sea, a new neighbour, a café and a
hotel (the first six, ids `<code>-market` ... `<code>-hotel`), and the six below. To add a language, translate these
sentence for sentence, keep the levels, and write the glosses for the same words. Names and places may be local;
numbers are written as words; nothing a learner says may depend on whether a man or a woman says it, unless the notice
gives the other form. In a language written without spaces (Thai) a sentence is one run, sentences are set apart by a
space, and a gloss sits on a piece the word-cutter really makes.

- **family** (A1, "My family", Anna tells it). My name is Anna. I live with my family in a small house near the river.
  My mother is a teacher and my father works in a shop. I have a brother and a sister. My brother is ten years old and
  he likes football. My sister is still small: she is three years old. We also have a dog, and his name is Max. Every
  morning my father goes for a walk with the dog. In the evening we eat together and talk about the day. After dinner
  my brother and I wash the dishes. On Sunday my grandmother comes and brings a cake. I love my family very much.
  Write back: sentences 3 and 11. Questions: where the father works, how old the brother is, who comes on Sunday.
- **town** (A1, "Our town"). Our town is small, but it is beautiful. In the centre there is an old square with a
  fountain. Next to the square there are a school, a pharmacy and two cafés. The station is behind the park. Every
  morning many people take the train to the city. In the afternoon children play in the park, and old men play chess.
  In summer tourists come and take photos of the bridge. In winter the town is quiet. On Saturday there is a market in
  the square. There you can buy vegetables, honey and flowers. In the evening I like to walk by the river. I do not
  want to live in a big city. Write back: sentences 4 and 8. Questions: what is in the centre, where the station is,
  when the tourists come.
- **birthday** (A2, "Grandmother's birthday"). Yesterday was my grandmother's birthday. She is eighty years old now.
  The whole family came to her house in the village. My aunt baked a big cake and my uncle brought flowers. We gave
  her a warm scarf and a book about gardens. Before lunch we sang a song, and Grandmother laughed. On the table there
  was soup, chicken with potatoes and a lot of salad. After lunch she showed us old photos. In one photo she was a
  young woman with a bicycle. She told us that she rode it to work every day. Then my cousin played the guitar and
  everybody danced. Even my little brother danced with Grandmother. In the evening she was tired but happy. She said
  that it was the best birthday of her life. We went home late, when the stars were already in the sky. Write back:
  sentences 4 and 8. Questions: how old she is, who brought flowers, what the cousin played.
- **wallet** (B1, "The lost wallet"). Last Friday Daniel wanted to pay at the supermarket, but his wallet was not in
  his pocket. He was very worried, because his bank card and his driving licence were in it. He left his shopping at
  the till and went back the same way. He looked everywhere, on the pavement and at the bus stop, but he found
  nothing. At home he called the bank and blocked the card. That night he could not sleep, because he was thinking
  about all his documents. Two days later a letter from the police arrived. A woman had found the wallet on the bus
  and had taken it to the police station. Daniel went there immediately. Nothing was missing, not even the money. The
  police officer gave him the woman's address, because he wanted to thank her. The next day he bought flowers and
  wrote her a card. She was surprised and invited him for a coffee. They talked for an hour, and now they are good
  friends. Since then Daniel always checks his pocket before he gets off the bus. Write back: sentences 4 and 8.
  Questions: what was not in his pocket, where the woman found it, what Daniel bought.
- **station** (A2 dialogue, the clerk and then the traveller, who is the learner; 12 lines). Good morning. How can I
  help you? / Good morning. I would like a ticket to X, please. / One way or return? / Return, please. When does the
  next train leave? / At quarter past ten, from platform three. / How long does the journey take? / About two hours.
  You have to change in Y. / How much time do I have there? / Twenty minutes. That is enough. / Good. How much does
  the ticket cost? / Thirty-four euros. Would you like to pay by card? / Yes, by card. Thank you very much!
  Questions: which platform, how the traveller pays.
- **doctor** (B1 dialogue, the doctor and then the patient, who is the learner; 14 lines). Good morning. What is the
  problem? / Good morning, doctor. I have had a sore throat and a cough for three days. / Do you also have a fever? /
  Yes, last night it was thirty-eight and a half. / Does your head hurt too? / A little, especially in the evening. I
  also sleep badly. / Open your mouth, please. Yes, your throat is very red. / Is it serious? I have to work this
  week. / No, but you need rest. Stay at home for three days and drink a lot of tea. / Do I need medicine? / I will
  give you a prescription for tablets. Take one after every meal. / Thank you. Should I come back if it does not get
  better? / Yes, come back next week if you still have a fever. / All right. Goodbye, doctor. Questions: for how many
  days the patient has been ill, what the prescription is for.

The words glossed in each (in English, the same list in every language) are those of any one of these languages'
files, for example `content/ru.json`.
