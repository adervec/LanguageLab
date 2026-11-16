# LanguageLab (working name; rename freely)

Notes for the coding agent that works on this repo.

## House standards (shared across every app by this maker)

@../CoworkSyncHub/HOUSE-STANDARDS.md

For this app:
- Check the standards: `node ../CoworkSyncHub/standards.mjs languagelab -v`. Keep it all `ok` before pushing.
- Test: `node core.test.mjs`, then `npm i --no-save playwright-core && node .github/smoke.mjs && node .github/flow.mjs && node .github/offline.mjs`
  (the flow test walks a sitting, review, a pen-pal letter, cowork replies, a role-play, a first lesson, a cowork folder and more in
  headless Chrome; the offline test stops the server after one visit and opens the app again).
- Work on `main`; push your own work when it passes. Add user-visible changes to `whatsnew.json`.

## What is built (v0.4)

No build step: `index.html` (shell, CSS), `app.js` (screens, speech, sync, cowork), `core.js` (all the
logic, no DOM, tested), `content/<lang>.json` (starter stories and dialogues; rules in
`content/AUTHORING.md`), `app-data.json` (data inventory; bump `schema` when the saved shape changes).
Drive sync uses font.js's shared sign-in (`appFont.google`).

- **Languages.** Forty-four have starter content (`LANGS` in `core.js`): full sets for French, Spanish, German, Italian,
  Portuguese, Dutch, Croatian and English; half sets for Chinese, Japanese, Korean and Swedish (`small`); and a first handful
  (`mini`: four stories and two dialogues, the same six texts in each, built from one shared gloss list) for the other 32.
  Thai is `seg` too, glossed on the pieces `Intl.Segmenter` cuts, with a zero-width space where it would cut across a name.
  Arabic-script marking forgives vowel marks and letter shapes; a Persian word around a zero-width non-joiner is one token.
  Chinese and Japanese are `seg`: words for reading come from `Intl.Segmenter`, scoring is by character. Any other language code works with pasted texts and AI cowork stories:
  `langInfo()` fills in names from Intl, and languages written without spaces are split with
  `Intl.Segmenter`. Words, corrections, letters and the level are kept per language. Adding a bundled
  language is one `LANGS` entry plus `content/<code>.json` (the test requires 16 stories and 8 dialogues, 8 and 4 for `small`,
  4 and 2 for `mini`) and its file in the `sw.js` offline list (the test checks that too). After changing content run
  `node .github/spell.mjs` (see its first lines): a word no dictionary knows fails until it is read and accepted.
- **First steps** (from nothing): `content/first.json` holds 160 phrases in twenty lessons for 44 languages
  (`langs`: a phrase is a string, or `[phrase, its own meaning]` where the shared English `meanings` do not fit), a meaning with `{language}` in it names the language being learned and is always shown in English), a reading in
  Latin letters for each phrase in a script that is not Latin (`readings`), script charts (`scripts`: `"letter=reading"` pairs)
  and sounds to notice (`sounds`). `lessonStories()` turns a language's phrases into ten stories with `phrases: true`, no
  level (so they never count in `abilities()`) and `back` = every phrase with its meaning, shown in the interface language
  where the file has that language. A lesson is a session with `mode: 'first'`: study the phrases, type half from the ear,
  write the other half from their meaning and say them (the halves swap next time). Its phrases become review cards in the
  corrections deck under ids `first:<story id>:<n>`. `lessonKeys()` gives the letters to tap. The First steps screen
  (`vFirst`, `#first`) lists the lessons, the charts with a "type how it sounds" practice, and the sounds.
- **A sitting** is the graded session: one story through listen (text hidden), questions answered
  from the ear alone (typed, keyword-checked), read (tap unknown words), dictation at natural speed
  (the app's score), "write it back" (a sentence shown by its meaning, where the browser's Translator
  API is there), speaking (a story: three sentences read aloud; a dialogue: a role-play, your
  lines aloud and then from memory), and a retelling from memory. A session is saved only when
  finished. The retelling is graded only by the `sitting-review` cowork channel, stored beside the
  app's score; the channel's `corrections` become review cards.
- **Other sessions** reuse the same steps: free reading (`mode: 'read'`), a role-play alone
  (`'talk'`), and Just listen (`'listen'`, stories played one after another). All are rows in
  `S.sittings` with a `mode`, and each is logged once with `appFont.logSession`.
- **Review**: tapped words come back as a blank in the sentence they were met in; corrections come
  back as "type it again, corrected". Both use learning-pit's scheduler (cut down, in `core.js`).
  The Words screen edits meanings, retires a word ("I know this", kept as `retired` so a sync does not
  undo it) and puts a known word back.
- **Pen pal** (`penpal` cowork channel): the learner writes, the agent answers at their level with
  meanings and corrections. A reply is also a story (source `penpal`) so it can be read with taps.
- **Progress** shows ability only: the level the numbers support for reading, listening and speaking (`abilities()` and
  `estimate()` in `core.js`), a table by level, totals of input. A spoken line is marked by `speechMarks()`: the recogniser's
  first guess is the score, a word only its second or third guess holds is `near`, and `sure` is its confidence. No streak, no points: do not add them.
- **Meanings**: bundled glosses are English. Where the browser has the Translator API (Chrome and Edge
  on desktop) a tapped word with no meaning is translated on the device into the interface language;
  otherwise the learner can type one, or AI cowork fills it in. Each bundled text carries a `notice`
  (one grammar point); the Words screen lists those of the texts already read.
- **Your own material**: pasted or opened text, and a recording with its subtitle file (`.srt`/`.vtt`,
  parsed by `parseSubs`): the audio is kept in IndexedDB under `audio:<story id>`, on this device only.
- Removing a story records its id in `S.gone` so neither a sync nor the starter set brings it back.
- **A text as a link** (`#text=`): Library copies a link that holds one of your own texts (`sharetext`); whoever opens it sees
  it first (`vGift`) and adds it on a tap. It is outside text: rebuilt by `cleanStory` from known fields, and the same text
  twice is one text (its id is a hash of title and text).
- **With a teacher**, no server: Progress makes a link (`#teach=`, the sitting's writing packed after the #) that opens the
  teacher's page (`vTeach`); their reply is another link (`#fix=`) that `vTaught` keeps beside the sitting (`teacher`) and
  turns into review cards (ids `t:…`). Both are outside text (`cleanTeach`, `cleanTeacher`). Progress also copies a sitting as
  plain text, and Words takes a correction typed in by hand (ids `own:…`).
- **Letters to tap**: a lesson shows its own letters; any text in an alphabet that is not Latin shows the letters it uses
  (`tapKeys`), for dictation and review without a keyboard for that script.
- **Record yourself** (speaking steps): MediaRecorder, kept in the page only, played after the model.
- **Offline**: `sw.js` claims the first page and `app.js` fetches again what that page had loaded, so one visit is enough.
- Speech uses the browser's own synthesis and recognition, as SpeechImprover does. Tachyread's
  reading engine is not used.
- Tests: `core.test.mjs` checks the logic and every bundled content file; `.github/flow.mjs` drives
  the whole app in headless Chrome, with the browser's private file system standing in for the cowork folder picker. Speech recognition, real voices and the on-device translator
  cannot run there (the flow test stubs `self.Translator`): check those by hand.
  Two ways that worked in the maker's own Chrome (157): the built-in model (`LanguageModel`) was already there, so the
  conversation can be driven for real from the console; and Chrome's recogniser takes an audio track
  (`recognition.start(track)`), so a recording played into a `MediaStreamAudioDestinationNode` (with a silent
  `ConstantSourceNode` kept connected, or it never hears the speaker stop) tests the speaking step with no microphone.
  Speech synthesis needs a real click first. The model stalls when it is given many requests at once: the app times out
  and gives its sessions back (`dropLm`). To try the real
  translator from Playwright, launch a visible Chrome with
  `ignoreDefaultArgs: ['--disable-component-update', '--disable-background-networking']`, or it can
  never fetch its language pack.

## Why this app exists

The maker kept a 1000-day Duolingo French streak (2022–25) and came away unable to use French. Treat
that as the design brief. The likely reasons it failed:
- **Recognition, not production.** Tapping word tiles and multiple choice never makes you build a
  sentence, say it out loud, or understand natural speed.
- **The streak is the goal.** Minimum daily effort keeps the streak alive, so the app rewards
  showing up, not getting better.
- **Too little input.** A few dozen sentences a day, nothing like the hours of understandable
  reading and listening that acquisition seems to need.
- **No honest measure.** XP and leagues go up whatever you do; nothing says "you can now follow a
  podcast at 80%".

So the app should be the opposite: lots of understandable input, real output (speaking and writing)
graded honestly, spaced review of what you actually met, and progress measured as ability. French
first (the maker already has a base), built so other languages can follow.

## Parts that already exist next door (reuse, don't rebuild; agree the approach with the maker first)

- `../SpeechImprover`: microphone capture, transcription, per-take scoring and an annotated
  transcript. The base for speaking and pronunciation practice.
- `../Tachyread`: the reading engine (imports, paced reading, typing sessions). The base for graded
  reading input.
- `../learning-pit`: spaced repetition.
- `../GymTracker`: the reference for Drive sync, cowork channels and session-level AI review
  (standard 18: a `<thing>-review` channel grading each sitting).

Start by talking the shape of the app through with the maker before writing code.
