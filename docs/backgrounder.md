# Louie

*A search and explanation layer for municipal council records.*

A backgrounder. Draft v1.

---

## What Louie is

Louie is a citation-backed search and explanation layer for a city's full
council record. It lets residents, councillors, and staff ask
natural-language questions about what their city has decided, debated,
or said about a topic — and returns answers cited back to the exact
transcript line, document section, or video timestamp the answer came
from.

Louie does not replace the city as the authoritative source for any
record, and it does not change what the city publishes. It makes what
the city has already published usable.

The first city to deploy Louie is Mississauga, under an unsolicited bid
currently with the City for consideration.

---

## Why it exists

Mississauga publishes every council and committee meeting. Video,
minutes, agendas, staff reports, supporting documents — all of it is
technically open to the public.

In practice, that record is illegible. Hours of video, no real search,
no way to trace a topic across years or committees. Anyone who wants to
know how a decision actually came together has to find the right
meeting, scrub through hours of footage, cross-reference the minutes,
and reconstruct the argument by hand.

The cost shows up in three places at once. Residents disengage from what
they can't follow. Councillors decide without the full context they need
to make the best calls. And trust in how the city decides things
gradually erodes.

The city has done the work of opening the record. The layer that makes
it usable hasn't existed.

---

## How it works

Louie ingests what the city publishes. It transcribes the video with
speaker labels, parses the agendas and staff reports, and indexes
everything together so the entire record can be queried as one body of
material.

A resident or staff member can then ask questions like:

- *When did council last discuss stormwater fees?*
- *What concerns were raised about the transit budget?*
- *Which meetings discussed the downtown parking strategy?*

Louie returns a written answer that cites the exact transcript line, the
document section, or the video timestamp it came from. The reader can
click through to verify any claim against the source.

If the answer isn't in the record, Louie says so plainly rather than
guessing. The point is to make a citable record more usable, not to
manufacture answers the record doesn't support.

---

## Why now

Searching municipal records used to mean reading them, or paying a clerk
to read them. The technology to do this well — at the scale and the
detail a multi-year council record demands — hasn't existed.

That has changed in the last two years. Language models can now read and
structure long-form deliberative material at speed. More importantly,
they can be **grounded** in a specific city's record rather than in
general internet content. That means answers are about *this* city,
citable to *this* record, and removable if *this* record changes.

The technical phrasing is that Louie isn't *trained* on Mississauga's
record in the machine-learning sense. The underlying model is general-purpose.
What's specific to Mississauga is the record Louie's attention is
anchored to at query time. Same model everyone else uses, constrained to
what the city has published.

For higher-stakes questions where a single answer isn't enough — a major
budget decision, a contested rezoning, a multi-year policy debate —
Louie also includes a structured deliberation tool called the
**Negation Game**, which presents the supporting arguments,
counter-arguments, and mitigations as a navigable map. The Negation Game
is built on a decades-deep academic tradition of argument mapping, which
the same advances in AI have finally made workable at municipal scale. A
companion whitepaper explains that history in more depth.

---

## What Louie is not

Three clarifications, since they're the questions that come up most.

**It is not ChatGPT.** ChatGPT doesn't have Mississauga's record, and
even if it did, the answer would be diluted by everything else on the
internet. Louie's attention is anchored to this city's record only.

**It is not a replacement for eScribe.** eScribe handles agenda packaging
and meeting management. Louie sits on top of what eScribe publishes and
makes it searchable in a way the publishing system itself isn't designed
to do.

**It does not decide anything.** Louie reads, retrieves, and cites. The
city remains the authoritative source for every decision and every
record. Louie's job is to make the record findable.

---

## Trust and accountability

Louie is built to sit alongside the systems the city already runs, not
to replace or disrupt them.

- **Only public records.** Louie ingests only material the city has
  already made public. No closed-session content, no internal
  correspondence, no FOI surface created or bypassed.
- **MFIPPA-aware.** The platform is designed to operate in a manner
  consistent with MFIPPA, including minimizing collection of resident
  personal information and avoiding identification requirements for
  public access.
- **AODA / WCAG 2.0 AA.** Accessibility compliance is enforced at the
  user-interface layer.
- **Bill 194 posture.** Every response is AI-assisted and explicitly
  disclosed as such; every claim is citation-backed; the platform
  refuses rather than fabricates when the record doesn't support an
  answer.

The city retains ownership of its records and its configuration data at
all times.

---

## What it costs

- **Historical backfill:** approximately $30 per meeting, one-time. For
  Mississauga, roughly 200 meetings of prior-year material — about
  **$6,000**.
- **Ongoing service:** **$9,500 per year**, including hosting, ongoing
  indexing, maintenance, and operational support.

The full pricing detail and commercial model are in the accompanying
proposal.

---

## How to learn more

A live demo of Louie running on the Mississauga record is available at
[**louie.networkgoods.institute**](https://louie.networkgoods.institute).

A 20-minute conversation can be booked at
[calendar.app.google/PeKe9ifG5jquHUia9](https://calendar.app.google/PeKe9ifG5jquHUia9).

Louie is currently under review with the City of Mississauga. Inquiries
from other Ontario municipalities are welcome.

---

*Louie is a joint project of the Network Goods Institute and FairAI.*
