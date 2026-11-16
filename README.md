# LanguageLab

Learn a language by using it. A free, private web app with no account, no ads, no streak and no points.

Live at <https://adervec.github.io/LanguageLab/> once the repository is public.

## Why

The maker kept a 1000-day streak on a tile-tapping app and still could not use the language. The
likely reasons: the exercises were recognition and not production, the streak became the goal,
there was far too little to read and hear, and nothing measured what they could actually do.
LanguageLab is built to be the opposite on each count.

## What you do in it

| | |
|---|---|
| **A sitting** (about twenty minutes) | Hear a story with the text hidden. Answer three questions from what you heard. Read it and tap every word you do not know. Take dictation at natural speed. Write a sentence back from its meaning. Say sentences aloud. Retell it in your own words. |
| **Speak** | Dialogues you play a part in: your lines read aloud, then said from memory, scored by how much a speech recogniser understood. |
| **Pen pal** | Write a letter. An AI pen pal answers at your level and corrects your mistakes. |
| **Review** | The words you tapped come back as a blank in the sentence you met them in, and you type them. Your corrected mistakes come back until you type them right. Spaced so they return just before you forget. |
| **More input** | Just listen (stories one after another) and free reading, with a tap for the meaning of any word. |
| **Progress** | Which level your numbers support for reading and for listening, a table level by level, and your totals of reading and listening. |

## What is different from the streak apps

| | Typical streak app | LanguageLab |
|---|---|---|
| Exercises | Tap tiles, pick from choices | Type and say whole sentences; retell from memory |
| Listening | Short clips, slowed down | Whole stories at natural speed, questions before you see the text, dictation |
| Your own material | No | Paste any text; add a podcast or video sound file with its subtitles and take dictation from the real voices |
| Meanings | Fixed word bank | Tap any word in any text; translated on your device where the browser can |
| Feedback on your writing | Right or wrong against one answer | An AI review with a grade, the corrected forms and the rule; your mistakes return as review cards |
| Conversation | Scripted, tap a reply | Role-play aloud and from memory; an AI pen pal that writes back |
| Languages | A fixed list | Eleven with starter stories, Croatian among them; any other language with your own texts or AI-written stories |
| Progress | Points, leagues, a streak | The level your numbers support, measured |
| Cost and data | Subscription or ads; an account | Free; your data stays on your device (optionally your own Google Drive) |

## Languages

French, Spanish, German, Italian, Portuguese, Dutch, Croatian and English come with 16 stories and
8 dialogues each (French has more), from A1 to B2. Mandarin Chinese, Japanese and Korean come with a
smaller set (8 stories and 4 dialogues, A1 to B1); there a tapped word shows its reading first, and
dictation is marked character by character. Every other language works with your own texts and with stories
written to your level by an AI agent through the cowork folder.

The starter stories and dialogues were written by an AI and have not been checked by native speakers;
the app says so in Settings. The interface is in English and 16 other languages (machine translated,
as the app also says).

## The AI parts

LanguageLab has no server and calls no AI service. The AI features (new stories, the review of each
sitting, the pen pal) work through a folder you choose: the app writes a request there, any AI agent
you run reads it and writes a reply, and the app shows you the reply to approve. See "AI cowork" in
Settings. Everything else works without it.

## Running it

It is a static site with no build step.

```
python -m http.server
```

then open <http://localhost:8000/> in Chrome or Edge. Speech needs a browser with speech synthesis;
speaking practice needs speech recognition (Chrome, Edge, Safari).

## Checks

```
node core.test.mjs
npm i --no-save playwright-core && node .github/smoke.mjs && node .github/flow.mjs
```

`core.test.mjs` also checks every bundled story and dialogue; `content/AUTHORING.md` says how to
write more.

## Licence

MIT. See `LICENSE`.
