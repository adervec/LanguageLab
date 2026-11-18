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

## What is built (v0.5)

No build step: `index.html` (shell, CSS), `app.js` (screens, speech, sync, cowork), `core.js` (all the
logic, no DOM, tested), `content/<lang>.json` (starter stories and dialogues; rules in
`content/AUTHORING.md`), `app-data.json` (data inventory; bump `schema` when the saved shape changes).
Drive sync uses font.js's shared sign-in (`appFont.google`).

- **Languages.** Forty-four have starter content (`LANGS` in `core.js`): full sets for French, Spanish, German, Italian,
  Portuguese, Dutch, Croatian and English; half sets (`small`: 8 stories and 4 dialogues, A1 to B1) for the other 36. Chinese,
  Japanese, Korean and Swedish have sets of their own; the other 32 share one set of twelve texts, the same in each, translated
  sentence for sentence from one English master and built from shared gloss lists (`mini`, four stories and two dialogues, is
  how a new language may start; none is at that size now).
  Thai is `seg` too, glossed on the pieces `Intl.Segmenter` cuts, with a zero-width space where it would cut wrongly (`.tmp/thseg.mjs` lists
  glosses no tap would reach).
  No word may mix Latin letters with Cyrillic or Greek ones (a Latin e in a Cyrillic word looks right and is marked wrong): the test refuses it.
  Arabic-script marking forgives vowel marks and letter shapes; a Persian word around a zero-width non-joiner is one token.
  Chinese and Japanese are `seg`: words for reading come from `Intl.Segmenter`, scoring is by character. Any other language code works with pasted texts and AI cowork stories:
  `langInfo()` fills in names from Intl, and languages written without spaces are split with
  `Intl.Segmenter`. Words, corrections, letters and the level are kept per language. Adding a bundled
  language is one `LANGS` entry plus `content/<code>.json` (the test requires 16 stories and 8 dialogues, 8 and 4 for `small`,
  4 and 2 for `mini`) and its file in the `sw.js` offline list (the test checks that too). After changing content run
  `node .github/spell.mjs` (see its first lines): a word no dictionary knows fails until it is read and accepted.
- **Words with pictures** (`wordStories()`, listed apart on First steps by `wordLessons()`): `content/first.json` also holds twelve lessons of
  eight nouns for every language (`wordLessons` the titles, `wordIcons` 96 emoji, `wordMeanings` the English, `words.<code>` the 96 words,
  a word being a string or `[word, its own meaning]`, and `wordReadings.<code>` where the script is not Latin). A word comes with its
  article where that is how the gender shows (fr es de it pt nl ca gl el; sv nb da give en/ett on what can be counted). No word may
  stand for two pictures in a language: the test refuses it. Their stories have ids `<code>-words-NN` (`isWordLesson`), `source: 'first'`
  and `phrases: true`, so the lesson session, the review cards and `syncPhraseCards` treat them as lessons; `lessons()` leaves them out,
  so the count of phrase lessons and the request for AI-written lessons do not change. The meaning starts with the picture (`pic()`
  shows it large and hides it from a screen reader, which would read its name as well).
- **First steps** (from nothing): `content/first.json` holds 480 meanings in sixty lessons: each of the 44 languages has the first 240 phrases (thirty lessons), and 38 have all 480 (the eight with full sets
  of stories, and zh, ja, ko, vi, id, ms, ru, uk, bg, pl, cs, sk, sr, ro, hu, el, tr, ca, gl, sv, nb, da, af, eo, ar, hi, fa, ur, bn, sw; the six still at 240
  are th, fi, sl, mk, be, fil)
  (`langs`: a phrase is a string, or `[phrase, its own meaning]` where the shared English `meanings` do not fit; an own meaning that is the shared one with a note in brackets after it,
  "… (A man says X.)", is shown in the interface language with the note kept, so write notes that way), a meaning with `{language}` in it names the language being learned and is always shown in English), a reading in
  Latin letters for each phrase in a script that is not Latin (`readings`), script charts (`scripts`: `"letter=reading"` pairs)
  and sounds to notice (`sounds`, for every language: `[letters, a word, a hint]`; where the script is not Latin the hint starts with
  the word in Latin letters, and a Japanese example is a word written in kana, so that a recogniser writes it as the list does).
  Numbers by ear (`nums`) is the letter quiz with `ear: true`: the device's voice reads a bare number, `C.digits()` reads the answer in any
  script's digits, and it is offered only where the device has a voice for the language. Nothing of it is saved.
  Sounds apart (`pairs`: `[word, another one sound away, what each means]`, for 24 languages) is `vPairs`: each pair once by ear, then,
  where the browser recognises speech, once aloud (`guess3`, `heardAs`: was it the word wanted, the other, or neither). A Japanese pair
  is written in kana for the same reason as the sounds.
  Find a phrase (`findPhrases`, `#pq`) searches every lesson phrase, its meaning and its reading (accents and case aside) and shows up to twenty.
  Every try at a pair, by ear or aloud, and every try at a sound to notice is counted in `S.langs[code].alone[word]` =
  `[times heard, picked rightly, times said, understood, only a second guess, taken for the other word of its pair, when]`
  (`C.aloneAdd`). First steps shows the count beside the sound or the pair (`aloneNote`); Progress shows the totals and the words
  understood least (`C.aloneStats`: three tries or more, fewer than two in three understood). A merge keeps the longer record of a word.
  The `stories` request carries `hardWords` (the words of `aloneStats().weak`, with the word each was taken for), and its instructions ask
  for those sounds in the learner's lines of a dialogue and in a few phrases of a lesson.
  The `stories` cowork channel also brings first lessons: `wantLessons` in the request while the level is A1 and fewer than three are
  left to do (also for a language with none bundled), `lessons` in the reply, each checked by `cleanLesson` and added as a story with
  `phrases` and source `cowork`. They are listed after the bundled ones and are kept at start-up (only `source: 'first'` lessons are
  replaced from the file). `lessonStories()` turns a language's phrases into one story a lesson (thirty of them, or sixty) with `phrases: true`, no
  level (so they never count in `abilities()`) and `back` = every phrase with its meaning, shown in the interface language
  where the file has that language. A lesson is a session with `mode: 'first'`: study the phrases, type half from the ear,
  write the other half from their meaning and say them (the halves swap next time). Its phrases become review cards in the
  corrections deck under ids `first:<story id>:<n>` (`syncPhraseCards` gives a card the corrected wording when the file changes a phrase; the schedule stays). `lessonKeys()` gives the letters to tap. The First steps screen
  (`vFirst`, `#first`) lists the lessons ten at a time (`tenOpen`: the ten with the next lesson is open), the charts with a "type how it sounds" practice, and the sounds.
- **A sitting** is the graded session: one story through listen (text hidden), questions answered
  from the ear alone (typed, keyword-checked), read (tap unknown words), dictation at natural speed
  (the app's score), "write it back" (a sentence shown by its meaning, where the browser's Translator
  API is there), speaking (a story: three sentences read aloud; a dialogue: a role-play, your
  lines aloud and then from memory), and a retelling from memory. A session is saved only when
  finished. The retelling is graded only by the `sitting-review` cowork channel, stored beside the
  app's score; the channel's `corrections` become review cards. Where the browser's model is on the device already (`lmReady`: nothing nobody
  tapped for may start a download), `deviceHints` puts its suggestions beside the sitting (`hints`, three at most); one becomes a
  review card only when the learner keeps it (ids `h:…`).
- **Other sessions** reuse the same steps: free reading (`mode: 'read'`), a role-play alone, or up to eight
  sentences of a story read aloud (`'talk'`: the speaking step on its own; a text with nothing sayable is opened for reading), and Just listen (`'listen'`, the stories read and the first lessons done, played one after another). All are rows in
  `S.sittings` with a `mode`, and each is logged once with `appFont.logSession`.
- **Review**: tapped words come back as a blank in the sentence they were met in; corrections come
  back as "type it again, corrected". Both use learning-pit's scheduler (cut down, in `core.js`).
  The Words screen edits meanings, retires a word ("I know this", kept as `retired` so a sync does not
  undo it) and puts a known word back.
- **Pen pal** (`penpal` cowork channel): the learner writes, the agent answers at their level with
  meanings and corrections. A reply is also a story (source `penpal`) so it can be read with taps.
- **Where to start** (`vPlace`, "Find my level by ear" on the welcome card and in Settings, where the device has a voice and the
  language has bundled stories): `C.placeCards()` takes two sentences worth dictating from one bundled story of each level (the last
  one not read yet), the lowest level first; the learner types each from the ear; it stops after the first level where less than 80%
  of the words were caught, and `C.placeLevel()` names that level as the place to start (the highest tried when none failed).
  Nothing is saved but the level, and that only when the learner takes it. It lives in `quiz` (`place: true`, `back`: the screen to
  return to).
- **Progress** shows ability only: the level the numbers support for reading, listening and speaking (`abilities()` and
  `estimate()` in `core.js`), a table by level, totals of input. A spoken line is marked by `speechMarks()`: the recogniser's
  first guess is the score, a word only its second or third guess holds is `near`, and `sure` is its confidence; `subs` pairs a word
  with what the first guess had in its place, shown letter against letter (`letterDiff()`, "rue → roue"). In First steps each
  sound to notice can be said on its own (`sndsay`: understood, nearly, or what was heard instead; counted in `alone`).
  In Chromium on a computer (`canProbe`) a second listener on the microphone runs beside the recogniser (`probe`, frames every 30 ms): `voiceStats()`
  gives the time a spoken line took and its long pauses (`d.sec`, `d.pauses`, shown beside the voice's own time `d.voiceSec`; in the page
  only, never saved), and in zh, th and vi `pitchShape()` names how the pitch moved on a word said alone (`spark` draws it), also when
  no word was recognised. The listener also keeps each frame's brightness (`brightOf()`: where the strongest stretch of its spectrum lies
  between 600 and 3600 Hz, about the second resonance of the mouth). On First steps, in the eight languages of `TONGUE` (a front round
  vowel against a back one: French u and ou, German ü and u), `vowel` runs the listener alone for two seconds on a held vowel and
  `heldVowel()` with `tongueSpot()` say whether the tongue was back, in between or forward (`vowelTry`, in the page only). It cannot
  hear lip rounding. `.tmp/vowel-real.mjs` shows how it was tried: synthetic vowels and recordings of the machine's own voices played
  in place of the microphone. Checked only with sounds played in place of the microphone. No streak, no points: do not add them.
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
- **For a native speaker** (`#proof=<code>`, `vProof`; Settings opens the page and copies its link): `proofSections()` lists
  everything bundled in a language, a section for each first lesson, one for the sounds and pairs, one for each text. A row's id says
  where it lives: `first:<phrase number>`, `sound:<n>`, `pair:<n>`, and for a text `<its id>:t` (title), `:s<n>` (sentence or line),
  `:b<n>` (a sentence with its meaning), `:q<n>` (question), `:n` (the note), `:g:<word>` (a word's meaning). A line shows its two
  fields (how it should read, a note) once its pencil is tapped. What the reader marks is kept in `localStorage` under
  `ll-proof-<code>` (`cleanProof`); nothing of `S` is touched, and the link stays in the address so that a reload comes back.
  `proofOut()` is what they copy or save: `{ languagelab: 'proof', lang, day, sections, read, fixes: [{ id, was, about, now, note }] }`.
  Nothing in the app reads that text back: `node .github/fix-lessons.mjs <file>` applies the corrections to lesson phrases and words (the same
  tool takes a plain list `[[code, n, was, now, reading]]`, used for the corrections after a second read); the texts are done by hand (`content/AUTHORING.md`, "Corrections from a
  native speaker"). No language has been read by a person yet; when one has, say in the README what was read and when.
- **Letters to tap**: a lesson shows its own letters; any text in an alphabet that is not Latin shows the letters it uses
  (`tapKeys`), for dictation and review without a keyboard for that script.
- **A text written on the device** (`deviceStory`, "Write me a story" in the Library and on Today when everything is read): where
  the browser's model offers the language (`lmOk`; Chrome 157: fr, es, de, en, ja) it writes a short first-person text at the
  learner's level, with the four most overdue review words "where they fit". It is outside text (`A.parseJSON`, `cleanStory`),
  source `device`, no level (never counts in `abilities()`), no questions. The wording of the request was settled against the
  real model: asked for "a story" it writes French in the passé simple whatever it is told, asked for a message to a friend it
  does not. Read the comment above `STORY_HOW` before changing it.
  It writes no first lessons, and should not be made to: a lesson's phrases are drilled until they stick, and a small model's slip
  would be drilled with them (a text is read once, and says it was written on the device).
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
  `ConstantSourceNode` kept connected, or it never hears the speaker stop) tests the speaking step with no microphone. The second listener (`probe`) is tried the same way:
  replace `navigator.mediaDevices.getUserMedia` in the page with a function that returns such a node's stream, fed by a recording (for
  the time and the pauses) or by an oscillator whose frequency glides (for the movement of the pitch).
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
