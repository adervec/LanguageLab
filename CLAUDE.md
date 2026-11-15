# LanguageLab (working name; rename freely)

Notes for the coding agent that works on this repo.

## House standards (shared across every app by this maker)

@../CoworkSyncHub/HOUSE-STANDARDS.md

For this app:
- Check the standards: `node ../CoworkSyncHub/standards.mjs languagelab -v`. Keep it all `ok` before pushing.
- Test: `node core.test.mjs`, then `npm i --no-save playwright-core && node .github/smoke.mjs && node .github/flow.mjs`
  (the flow test walks one whole sitting, a review and the cowork reply handling in headless Chrome).
- Work on `main`; push your own work when it passes. Add user-visible changes to `whatsnew.json`.

## What is built (v0.2)

No build step: `index.html` (shell, CSS), `app.js` (screens, speech, sync, cowork), `core.js` (all the
logic, no DOM, tested), `content/<lang>.json` (starter stories), `app-data.json` (data inventory; bump
`schema` when the saved shape changes). Drive sync uses font.js's shared sign-in (`appFont.google`).

- **A sitting** is the graded session: one story through listen (speech synthesis, text hidden),
  read (tap unknown words), dictation at natural speed (the app's score), "Say it" (three sentences
  read aloud, scored by how much speech recognition understood; only where the browser has it), and
  a retelling from memory, typed or spoken. A sitting is saved only when finished. The retelling is graded only by the `sitting-review`
  cowork channel, stored beside the app's score.
- **Review**: tapped words come back as a blank in the sentence they were met in, typed, on
  learning-pit's scheduler (cut down, in `core.js`).
- **Progress** shows ability numbers only. No streak, no points: do not add them.
- **Stories** come from `content/`, pasted text, or the `stories` cowork channel (written at the
  learner's level, with glosses in the interface language).
- Another language is one entry in `LANGS` (`app.js`) plus `content/<code>.json`; word lists are
  already kept per language.
- Speech uses the browser's own synthesis and recognition, as SpeechImprover does. Tachyread's
  reading engine is not used yet.

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
