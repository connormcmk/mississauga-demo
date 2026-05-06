# Roadmap

Loose, intentionally not over-specified. This is the working list of what we
think we'll build next, in roughly the order we'd build it. Reorder freely.

## Near-term

- **Mississauga bid response.** Awaiting Jeff's follow-up email re: the
  unsolicited-bid path. Open question: how do we want to write the bid?
- **Self-serve speaker config.** Names and titles must be accurate; current
  pipeline pulls from public records but needs an internal-config override
  for edge cases (acting roles, mid-term replacements, deputy clerks).
- **Self-host video/audio path.** Currently relying on city-hosted video.
  Cost ballpark for hosting our own copy:
  - ~200 meetings/year, 1–6h each, 1080p → $12–$30/mo storage
  - Streaming egress at $0.005–$0.01/GB
  - Audio-only fallback if streaming costs become a constraint
- **Inference cost containment.** Largest unknown in our cost model. If
  demand outpaces budget, we celebrate first and figure it out second.

## Medium-term

- **Argument-maps whitepaper.** History of argument maps as an academic
  idea, why they didn't catch on (expressiveness vs. usability), why AI
  changes the calculus, and what we mean by **epistemic graphs** (our
  subset of argument maps). Frame: people keep coming back to this idea
  because there's something right about it; AI is what finally makes it
  workable.
- **Negation Game scale.** ~1,200 meeting recordings × ~16 key topics each
  ≈ ~20k Negation Games at full Mississauga coverage. Sizing question:
  what does that look like at five cities?

## Long-term / open questions

- **Multi-municipality search.** Upper-tier counties (Perth, Prescott and
  Russell) can ask "what did each member municipality say about this before
  it came to County?" — that's a unique angle the per-city product can't
  serve on its own.
- **Strong Mayor decision tracking.** As Ontario adds more municipalities to
  the Strong Mayor Powers list, mayoral directions must be in writing and
  publicly accessible. Louie should surface these as a first-class entity,
  not just buried text.
- **Bill 9 / Municipal Accountability Act compliance angle.** New IC process
  standardization across Ontario means more cities will need a defensible
  record. Worth a positioning piece.
