# Louie — Product Specification (Draft for Team Review)

> **Status: DRAFT.** This is the well-specced product description we'd hand to
> a procurement office. It's not a delivery-ready scope of work; it's the
> document we'd point to when saying *"this is the product we're describing
> in the unsolicited bid."* Comments/objections welcome before it goes to
> the team for sign-off.

---

## 1. What the city is buying

A grounded, citation-backed search and explanation layer over the city's full
public council record — video, minutes, agendas, staff reports, and committee
materials. Residents and staff can ask natural-language questions and get
answers that link directly to the exact transcript line, document section,
or video timestamp the answer came from.

Louie does not modify or re-publish the city's record. It indexes what the
city already publishes and makes it queryable. The city remains the
authoritative source.

---

## 2. Scope of v1

### Included

- **Full ingestion** of the prior 12 months of council, committee, and
  sub-committee meetings (video + audio + minutes + agendas + staff reports).
  For a city Mississauga's size, ~200 meetings/year.
- **Ongoing ingestion** of all new meetings, automatically, within 48 hours
  of the city publishing them.
- **Public-facing search interface** at a city-branded URL (e.g.
  `louie.mississauga.ca` or hosted at `mississauga.ca/civic-memory`).
  No login required for residents.
- **Citation-backed answers** — every response links to the source line,
  document section, or video timestamp. Answers without a citable source
  are surfaced as "I don't have that on the record" rather than fabricated.
- **Speaker name and title accuracy** — names and roles resolved against
  public records and an internal configuration layer for edge cases (acting
  appointments, mid-term replacements, deputy roles).
- **Staff-facing version** with the same retrieval surface plus saved
  searches, exportable answer-with-citations bundles, and a clerk dashboard
  for tracking what residents are asking about most often.
- **Embedded Negation Game boards** for high-stakes deliberative questions
  (typically 5–20 boards/year per city, picked collaboratively with the
  clerk's office).
- **Accessibility**: AODA / WCAG 2.0 AA compliance.
- **Privacy posture**: MFIPPA-aware. Only ingests records the city has
  already made public. No collection of resident query-level PII beyond
  what's required to operate the service.
- **Bill 194 alignment** for AI deployments by Ontario public-sector
  entities.

### Explicitly out of scope for v1

- Re-hosting or re-publishing the city's video/audio archive on Louie
  infrastructure (we may offer this as an option in v2; see roadmap).
- White-label or major theming work beyond standard logo + colour fitting.
- Custom integrations beyond the city's published record (e.g. internal
  staff-only document repositories, FOI workflow tools, agenda-management
  software).
- Real-time live transcription during meetings (we ingest after the city
  publishes the recording).
- Multi-municipality comparative search (planned for v2 for upper-tier
  counties).
- Decision automation. Louie is a retrieval and explanation layer. It does
  not advise, recommend, or take action.

---

## 3. System architecture

### 3.1 Ingestion pipeline

```
City publishes meeting → [ingestion] → canonical record store →
  [indexing] → retrieval indices → [serving] → public + staff UIs
```

- **Sources monitored**: the city's eScribe / Granicus / equivalent feed,
  plus published agenda and staff-report URLs.
- **Transcription**: full audio → diarized transcript with speaker labels.
  Diarization is matched against a roster of councillors and staff
  maintained per-city.
- **Document parsing**: agendas, minutes, and staff reports are parsed into
  structured sections. Tables and figures are preserved with captions.
- **Cross-linking**: transcript moments are linked to their corresponding
  agenda items and staff reports where the structure permits.

### 3.2 Canonical record store

- A versioned, append-only record store. If the city corrects a transcript
  or replaces a video, the prior version is retained but the active version
  is what the retrieval layer serves.
- Storage of the city's video is **not required** for v1 — Louie links back
  to the city's hosted copy. (See roadmap for self-host option.)

### 3.3 Retrieval and attention layer

- Louie is **RAG-grounded**, not fine-tuned. The underlying model is a
  general-purpose LLM. At query time, retrieval is constrained to the
  indexed council record. The model's attention is directed at the
  retrieved spans, with explicit instruction to cite or refuse.
- Refusal is a first-class behaviour. If the answer isn't in the record,
  the response says so plainly and offers what *is* in the record on the
  closest related question.
- All citations are verified at response time — Louie checks that the
  cited span exists and matches the claim before returning.

### 3.4 User-facing surfaces

| Surface | Audience | Primary use |
|---|---|---|
| Public search | Residents, press | "When did council last discuss X?" with cited answer |
| Per-topic chat | Residents | Ask follow-ups within the context of a specific deliberation |
| Negation Game boards | Engaged residents, councillors | Structured deliberation on selected high-stakes questions |
| Staff dashboard | Clerk's office, councillors | Saved searches, exportable answer bundles, "what are residents asking?" |

### 3.5 Negation Game integration

Negation Games are deliberative argument-mapping boards (see
`docs/whitepaper-argument-maps.md`). Not every topic needs one. The clerk's
office and the Louie team jointly pick 5–20 high-stakes questions per year
where structured deliberation adds value. These are embedded into the topic
pages as iframe URLs from the existing Negation Game platform.

---

## 4. Data and trust posture

### 4.1 What Louie ingests

- Public council/committee meeting video and audio
- Public agendas, minutes, staff reports, and supporting documents
- Public councillor and staff rosters

### 4.2 What Louie does not ingest

- Closed-session content
- FOI request contents or staff-only correspondence
- Resident-submitted personal data beyond what's necessary to operate the
  service (a query is logged for service health, not associated with an
  identified user unless a staff account is in use)

### 4.3 Compliance touchpoints

- **MFIPPA**: only public records are indexed; no FOI surface created or
  bypassed.
- **AODA / WCAG 2.0 AA**: enforced at the UI layer.
- **Bill 194 (Ontario public-sector AI)**: Louie's use of LLMs is grounded
  in a published city record. We commit to clear disclosure of AI
  involvement, citations on every answer, and refusal behaviour over
  fabrication.
- **Bill 9 / Municipal Accountability Act 2025**: Louie helps cities
  demonstrate the searchability of their accountability record without
  adding new disclosure obligations.

---

## 5. Speaker name and title accuracy

This is a hard requirement, not a nice-to-have. Misattributing a quote to
the wrong councillor is the kind of error that destroys trust in the
product instantly.

- **Source 1**: city-published councillor and staff rosters, ingested with
  start/end dates per role.
- **Source 2**: an internal configuration file maintained per-city,
  supplied to the city for review and edit. Captures acting roles,
  mid-term replacements, deputy clerks, committee chairs/vice-chairs, and
  any non-standard speaker labels.
- **Resolution rule**: where Source 1 and Source 2 conflict, Source 2
  wins (the city's own corrections override our defaults).
- **Diarization confidence**: each transcript segment carries a confidence
  score on its speaker label. Low-confidence segments are surfaced as
  "speaker uncertain" rather than guessed.

---

## 6. Performance and SLA expectations

| Dimension | Target |
|---|---|
| Public search response time | p50 < 3s, p95 < 8s |
| Index freshness | New meeting indexed and searchable within 48 hours of city publication |
| Uptime | 99.5% during the city's business hours, 99% overall |
| Citation accuracy | 100% — every citation must verify against the source span |
| Hallucination rate | < 1% of responses contain unsupported claims (measured on a sampled audit) |

---

## 7. Pricing

See [`docs/PRICING.md`](./PRICING.md) for the canonical pricing.

- $30 per meeting one-time backfill
- $9,500/year ongoing
- For Mississauga's scale (~200 historical meetings/year), this is a
  one-time backfill of approximately $6,000 plus $9,500/year ongoing.

The pricing assumes Louie hosts and operates the service. Self-host
options are available on request and are scoped separately.

---

## 8. Implementation timeline

| Phase | Duration | Outcome |
|---|---|---|
| Kickoff + roster build | 2 weeks | Speaker roster, internal config reviewed by city, MFIPPA scope confirmed |
| Backfill ingestion | 4–6 weeks | Prior 12 months of meetings indexed and citation-verified |
| Staff pilot | 2 weeks | Clerk's office uses staff dashboard against real questions |
| Public launch | 1 week | City-branded public URL goes live |
| **Total** | **9–11 weeks** | Live for residents |

Negation Game board selection runs in parallel with the staff pilot.

---

## 9. Procurement path

Louie is offered as an unsolicited bid where the city's procurement framework
permits. Two paths the city may consider:

- **Direct award** under a sole-source justification (the AI-grounded
  council search category does not have an established Ontario vendor base
  at the time of this bid).
- **Open RFP** built around this specification, where Louie responds as
  one of multiple vendors. We're comfortable with either.

The bid does not propose a delivery-ready product to be procured off the
shelf. It proposes this specification as the basis for procurement,
delivered by Louie under the timeline and pricing above.

---

## 10. Out-of-scope items, captured for v2

These are items we believe will become first-class but are intentionally
not in v1:

- Self-hosted video/audio archive (cost ballpark in `docs/ROADMAP.md`)
- Multi-municipality comparative search for upper-tier counties
- Strong Mayor decision tracking as a first-class entity
- French-language full support (English-first for Mississauga; UCPR and
  bilingual municipalities scoped separately)
- Inbound resident question routing ("Bo" — Paul's concept for routing
  citizen submissions into the agenda-setting process)

---

## 11. Open questions for the city

These are the questions we'd want answered during procurement, not assumed:

1. Which existing systems (eScribe, Granicus, etc.) does Louie need to
   read from, and what's the access mechanism?
2. Is the city comfortable with Louie linking to the city's hosted video,
   or does the city prefer Louie to mirror the archive?
3. Who in the city owns the speaker roster / internal config? (Typically
   the clerk's office, but worth confirming.)
4. Which questions does the clerk's office want to see resolved with
   Negation Game boards in year one?
5. What's the city's preferred public URL pattern?
6. Is there an existing accessibility audit framework Louie should slot
   into (third-party AODA audit, internal review process, etc.)?

---

## 12. Document status

- **Draft**: this version
- **Review**: pending Connor, Paul, Louis
- **Bid-ready**: requires team sign-off before being attached to a procurement
  response
