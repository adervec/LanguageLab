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
| **Conversation** | Talk with an AI partner, by voice or typing. It answers at your level, speaks its reply, and corrects your last message as you go. |
| **Pen pal** | Write a letter. An AI pen pal answers at your level and corrects your mistakes. |
| **Review** | The words you tapped come back as a blank in the sentence you met them in, and you type them. Your corrected mistakes come back until you type them right. Spaced so they return just before you forget. |
| **More input** | Just listen (stories one after another) and free reading, with a tap for the meaning of any word. |
| **Progress** | Which level your numbers support for reading and for listening, a table level by level, and your totals of reading and listening. |

## How it compares

Checked in November 2026 against what Duolingo, Rosetta Stone and Mondly say about themselves and
what recent reviews report (sources below; prices and tiers change, so treat their columns as a
snapshot). LanguageLab is ahead in some rows and behind in others.

| | Duolingo | Rosetta Stone | Mondly | LanguageLab |
|---|---|---|---|---|
| Cost | Free with ads and an energy allowance that limits free practice; paid Super and Max tiers | Subscription | Free tier with ads; speech recognition, the chatbot and offline use are premium | Free. No ads, no allowance, no account |
| Talking with an AI | Video Call and Roleplay, in paid tiers, for a handful of languages | No AI partner; live human coaching in the premium plan | A chatbot with speech recognition (premium) | A live conversation that corrects you as you go, on your device where the browser has its own AI model or through your own AI agent; and an AI pen pal |
| What you produce | Varies by exercise: word banks, matching, short typed and spoken answers | Speaking and choosing, without translation | Short phrases and chatbot replies | Typed dictation, sentences written back from their meaning, role-play from memory, and a free retelling in every sitting |
| Your own material | No | No | No | Any text; any recording with its subtitles |
| Feedback on free writing | Explanations of an answer | No | No | An AI review with a grade, corrected forms and the rule; your mistakes come back as review cards |
| Measure of progress | XP, streak, leagues, a course score | Units completed | Points and a leaderboard | The level your own numbers support, for reading and for listening |
| Languages with ready lessons | 40 or more | 25 | 41 | 11, three of them small sets; any other language with your own texts or AI-written stories |
| Course for complete beginners | Yes, from the alphabet | Yes | Yes | No: the stories start at A1 and assume you can read the script |
| Speech scoring | Its own engine | TruAccent | Speech recognition | The browser's speech recognition: how much was understood, not how good the accent is |
| Human teachers | No | Live coaching (premium) | No | None |
| Content checked by people | Yes | Yes | Yes | No: written by an AI and unchecked by native speakers (the app says so) |
| Apps | iOS, Android, web | iOS, Android, web | iOS, Android, web, AR and VR | A web app that installs to the home screen |

Sources: Duolingo on [Duolingo Max](https://blog.duolingo.com/duolingo-max), a 2026 review of
[what Max adds](https://storylearning.com/duolingo-max-review) and reporting on
[its course expansion](https://www.thestar.com.my/tech/tech-news/2025/04/30/duolingo-more-than-doubles-courses-as-ai-firstpush-draws-heat);
Rosetta Stone reviews of [features and plans](https://learnenglish.life/reviews/rosetta-stone) and
[pricing](https://toolradar.com/tools/rosetta-stone/pricing); Mondly reviews of
[features](https://www.fluentu.com/blog/reviews/mondly/) and [pricing](https://www.learnenglish.life/guides/mondly-pricing/).

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
