# Positioning

How Louie talks about itself, and how to handle the recurring objections we've
seen in real conversations. This is the source of truth for landing page copy,
outreach emails, and pitch decks.

## What Louie is

Louie turns a municipality's full council record — video, minutes, agendas,
staff reports — into something residents and staff can actually search and
understand. Type a question, get an answer in seconds, cited back to the
exact line of the transcript.

## What Louie is NOT

- Not fine-tuned on the city's record. Louie's **attention** is constrained
  to the council record at query time (RAG-grounded), but the underlying
  model is general-purpose.
- Not a replacement for the clerk's office or eScribe.
- Not an AI that decides anything. It reads the record the city has already
  published and helps people find what's in it.
- Not a chatbot guessing at policy.

## Recurring objections

### "Would we just use ChatGPT for this?"

ChatGPT's attention has nothing to anchor to for a specific municipality's
record — the data isn't in its training set. Even if it were, that signal
would compete with the rest of the internet and blur out. Louie's attention
is constrained to **this** council's record at query time, so answers are
grounded and citable.

### "Why not just use eScribe's search?"

eScribe's search returns the meeting where the term appears. You still have
to watch the meeting to find the moment. Louie answers the question directly
and cites the exact transcript line.

> "The search bar takes you here, but then you have to watch the whole thing!"
> — Richard, Strategic Communications, City of Mississauga

### "Is this another AI vendor?"

Louie sits on top of the record the city already publishes. No new data
collection, no new privacy surface beyond what's already public. MFIPPA-aware,
AODA / WCAG 2.0 AA, Bill 194 posture, interoperable not disruptive.

## Audiences

- **Residents and press** — primary public-facing user. They get free,
  unmetered access. The product is judged on whether a resident can answer
  their own question without going through the clerk's office.
- **Clerks and CAOs** — institutional buyer. The pitch is reduced FOI/staff
  time on reconstruction, faster turnaround on councillor requests, and a
  searchable backstop for institutional memory.
- **Councillors** — secondary buyer. The pitch is being able to trace how
  decisions came together across years of committees without a clerk
  pulling the record by hand.

## The "attention not training" line

Worth repeating because it's the precise distinction:

> Louie isn't trained on the city's record in the machine-learning sense.
> Its attention is trained on the council. Same general-purpose model
> everyone else uses, but constrained at query time to what your city
> has published.

This is what makes answers grounded, current, and removable when records change.
