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
| **First steps** | From nothing, in 43 languages: short lessons of everyday phrases. You hear each phrase with its meaning (and a reading in Latin letters where the script is new), type it from the ear with the lesson's letters there to tap, write it back from its meaning, and say it. The phrases then join your review. For 14 scripts there is a chart of the letters to hear and practise; for eight languages a list of the sounds that surprise. |
| **A sitting** (about twenty minutes) | Hear a story with the text hidden. Answer three questions from what you heard. Read it and tap every word you do not know. Take dictation at natural speed. Write a sentence back from its meaning. Say sentences aloud. Retell it in your own words. |
| **Speak** | Dialogues you play a part in: your lines read aloud, then said from memory, scored by how much a speech recogniser understood. You can also record yourself and hear your take after the model's. |
| **Conversation** | Talk with an AI partner, by voice or typing. It answers at your level, speaks its reply, and corrects your last message as you go. With the browser's own small model the corrections are offered for you to keep or not, because it is sometimes wrong; an AI agent of your own corrects properly. |
| **Pen pal** | Write a letter. An AI pen pal answers at your level and corrects your mistakes. |
| **Review** | The words you tapped come back as a blank in the sentence you met them in, and you type them. Your corrected mistakes come back until you type them right. Spaced so they return just before you forget. |
| **More input** | Just listen (stories one after another) and free reading, with a tap for the meaning of any word. |
| **Progress** | Which level your numbers support for reading and for listening, a table level by level, and your totals of reading and listening. |
| **With a teacher** | Copy a sitting as plain text to send to a teacher or a tutor, and type their corrections in: they come back in your review like the AI's. |

## How it compares

Checked in November 2026 against what Duolingo, Rosetta Stone and Mondly say about themselves and
what recent reviews report (sources below; prices and tiers change, so treat their columns as a
snapshot). LanguageLab is ahead in some rows and behind in others.

| | Duolingo | Rosetta Stone | Mondly | LanguageLab |
|---|---|---|---|---|
| Cost | Free with ads and an energy allowance that limits free practice; paid Super and Max tiers | Subscription | Free tier with ads; speech recognition, the chatbot and offline use are premium | Free. No ads, no allowance, no account |
| Talking with an AI | Video Call and Roleplay, in paid tiers, for a handful of languages | No AI partner; live human coaching in the premium plan | A chatbot with speech recognition (premium) | A live conversation, free: on your device where the browser has its own AI model (it answers in a second or two; its corrections are a small model's suggestions, to keep or not), or through your own AI agent, which corrects properly; and an AI pen pal |
| What you produce | Varies by exercise: word banks, matching, short typed and spoken answers | Speaking and choosing, without translation | Short phrases and chatbot replies | Typed dictation, sentences written back from their meaning, role-play from memory, and a free retelling in every sitting |
| Your own material | No | No | No | Any text; any recording with its subtitles |
| Feedback on free writing | Explanations of an answer | No | No | An AI review with a grade, corrected forms and the rule; your mistakes come back as review cards |
| Measure of progress | XP, streak, leagues, a course score | Units completed | Points and a leaderboard | The level your own numbers support, for reading and for listening |
| Languages with ready lessons | 40 or more | 25 | 41 | 43 with first lessons; 11 of those also with graded stories and dialogues (three of them small sets); any other language with your own texts or AI-written stories |
| Course for complete beginners | Yes, from the alphabet | Yes | Yes | A short one: five lessons of eight everyday phrases in each of 43 languages, charts of the letters for 14 scripts, then graded stories from A1 in 11 languages. Much shorter than their courses |
| Speech scoring | Its own engine | TruAccent | Speech recognition | The browser's speech recognition (how much was understood, not how good the accent is; it listens through your pauses), and a recording of yourself to compare by ear |
| Human teachers | No | Live coaching (premium) | No | None of its own. A sitting can be copied as text for a teacher, and a teacher's corrections typed in to come back in review |
| Content checked by people | Yes | Yes | Yes | No: written by an AI and unchecked by native speakers (the app says so) |
| Apps | iOS, Android, web | iOS, Android, web | iOS, Android, web, AR and VR | A web app that installs to the home screen and opens without a connection after one visit; no app-store apps |

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
dictation is marked character by character.

Those eleven and 32 more have first lessons for complete beginners (five lessons, forty everyday
phrases): Russian, Ukrainian, Polish, Czech, Slovak, Slovenian, Serbian, Bulgarian, Macedonian,
Belarusian, Romanian, Hungarian, Greek, Turkish, Swedish, Norwegian, Danish, Finnish, Catalan,
Galician, Arabic, Persian, Hindi, Urdu, Bengali, Indonesian, Malay, Vietnamese, Thai, Filipino,
Swahili, Esperanto and Afrikaans. Where the script is not Latin each phrase has a reading in Latin
letters, the lesson's own letters are on screen to tap, and there is a chart of the letters to hear
and practise. The meaning of a phrase is shown in the language of the interface where that is one of
the seventeen, else in English.

Every other language works with your own texts and with stories written to your level by an AI agent
through the cowork folder.

The starter stories, the dialogues and the first lessons were written by an AI and have not been
checked by native speakers; the app says so in Settings. The interface is in English and 16 other
languages (machine translated, as the app also says).

## The AI parts

LanguageLab has no server and calls no AI service. The AI features (new stories, the review of each
sitting, the pen pal, and the conversation where the browser has no model of its own) work through a
folder you choose: the app writes a request there, any AI agent you run reads it and writes a reply,
and the app shows you the reply to approve (a conversation reply is shown as it comes). See "AI
cowork" in Settings. Everything else works without it.

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
npm i --no-save playwright-core && node .github/smoke.mjs && node .github/flow.mjs && node .github/offline.mjs
```

`core.test.mjs` also checks every bundled story, dialogue and first lesson; `content/AUTHORING.md`
says how to write more. `flow.mjs` drives the whole app in headless Chrome, including a cowork folder
with replies written as files; `offline.mjs` stops the server after one visit and opens the app again.

## What has been checked, and what has not

- **On every push** (CI): the logic and every bundled text (`core.test.mjs`); the whole app in headless Chrome
  (`flow.mjs`), with stand-ins for the things a test cannot have (a microphone, the on-device translator and model, the
  folder picker); opening without a connection (`offline.mjs`).
- **By hand in a real Chrome (version 157, November 2026)**: a conversation with Chrome's own on-device model, in French
  (replies in one to three seconds; its corrections caught about one mistake a message and were sometimes wrong, which is
  why they are only offered); the French voice reading a story sentence; the speaking step scored by Chrome's real
  recogniser from a recording fed in place of the microphone (the exact sentence: 100%; two words changed: 88%, those two
  marked); the on-device translator for French.
- **With a real AI agent** (Claude, November 2026), answering from the instruction files in the folder and nothing else: a
  sitting graded and corrected, a pen-pal letter answered, a two-turn conversation, and five stories and two dialogues in
  Swedish (a language with no bundled stories), which then passed the same checker as the bundled texts. The replies waited
  for approval across a browser restart and were applied once.
- **Not checked**: a physical microphone, how the voices sound to a native ear, Google sign-in, and phones. The texts and phrases were written by an AI and no native speaker
  has read them.

## Licence

MIT. See `LICENSE`.
