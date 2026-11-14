# LanguageLab (working name; rename freely)

Notes for the coding agent that works on this repo. New project: nothing is built yet.

## House standards (shared across every app by this maker)

@../CoworkSyncHub/HOUSE-STANDARDS.md

For this app:
- Check the standards: `node ../CoworkSyncHub/standards.mjs languagelab -v` (once it is added to the
  portal in `../CoworkSyncHub/portal.py` APPS). Keep it all `ok` before pushing.
- Work on `main`; push your own work when it passes.

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
