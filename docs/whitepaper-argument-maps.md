# The most obvious idea in deliberation, finally workable

*An essay on argument maps, epistemic infrastructure, and why civic
deliberation has been waiting for this technology for seventy years.*

— [Author TBD]
*Draft — for review by the Louie team. Citations checked against the
research brief; verbatim Herzog quote pending verification against
*Citizen Knowledge*.*

---

## I. A claim about democracies

Lisa Herzog, the political philosopher who holds the chair at Groningen, has
spent the last several years arguing that democracies under-invest in their
**epistemic infrastructure** — the institutions, organizations, and tools
that determine how knowledge is produced, circulated, validated, and acted
on in public life.[^1] In her telling, democracies are knowledge-processing
systems. They depend on libraries, public broadcasters, statistical
agencies, universities, and increasingly digital platforms in roughly the
way a city depends on its sewers and roads. When that infrastructure is
strong, democratic argument compounds. When it erodes, democratic argument
degenerates into noise.

Most of the contemporary work on this problem is defensive. It tries to
shore up the institutions we already have against platform incentives that
chew through them. Herzog's framing is more useful: it lets us notice that
some pieces of epistemic infrastructure haven't been built yet. And one of
those pieces — perhaps the most obvious one — has been waiting around for
about seventy years.

That piece is the **argument map**.

## II. The most obvious idea

If you sat down and tried to describe deliberation from first principles,
the picture you'd draw would look like an argument map. There are
**positions** — claims people are making about what should happen. There
are **reasons** — facts, values, and prior decisions cited to support those
claims. There are **objections** — counter-considerations that pull
against them. There are **mitigating moves** — refinements that try to
preserve a position while accommodating the objection.

The structure shows up the moment two thoughtful people disagree about
something they take seriously. It is the natural shape of a conversation
that's trying to get somewhere.

This is so obvious it has been independently rediscovered, in roughly the
same form, by a series of serious thinkers across more than a century.

- **John Henry Wigmore**, the legal scholar, drew dense diagrams of the
  evidence in criminal cases in 1913 and used them to teach generations of
  lawyers how to think about proof.[^2]
- **Stephen Toulmin**, in *The Uses of Argument* in 1958, proposed the
  claim/data/warrant/backing/qualifier/rebuttal scheme that almost every
  later argument-mapping notation descends from. He never imagined it as a
  software tool; he was trying to fix philosophy of science.[^3]
- **Monroe Beardsley**, around the same time, gave informal logic the
  vocabulary of convergent, divergent, serial, and linked structures
  that's still in use.[^4]
- **Jeff Conklin** built **gIBIS** in 1988 — the first serious computer-supported
  argument-mapping tool — to help organizations work through what Rittel
  and Webber had called "wicked problems": questions that resist
  resolution because the framing of the problem and the choice of
  solution co-evolve.[^5]
- **Tim van Gelder**, an Australian philosopher turned software founder,
  built first **Reason!Able** and then **Rationale**, demonstrating in
  controlled studies that a semester of argument mapping in an
  undergraduate philosophy class produced critical-thinking gains that
  most pedagogical interventions cannot match.[^6]
- **Douglas Walton**, with Chris Reed and Fabrizio Macagno, gave argument
  mapping its modern typology in *Argumentation Schemes* (2008) — formal
  patterns of presumptive reasoning, each with its own critical
  questions.[^7]
- **Chris Reed**'s group at the University of Dundee built **AIF** (the
  Argument Interchange Format) and the **Argument Web**, a vision of a
  web-of-arguments analogous to the semantic web.[^8]
- **Simon Buckingham Shum** and **Paul Kirschner** edited the canonical
  *Visualizing Argumentation* volume in 2003, surveying twenty years of
  computer-supported argument visualization tools.[^9]

That's a lot of independent invention for an idea that, by general
acknowledgement, never broke through to wider use.

## III. Why it never broke through

Buckingham Shum, in his contribution to that 2003 volume, named the
pattern that's recurred for as long as the field has existed: every
generation rediscovers argument mapping, builds a tool, finds it hard to
use, and the tool dies with the grant.[^10]

The diagnosis the field eventually settled on was the **expressiveness-vs-usability
tradeoff**. Scheuer, Loll, Pinkwart, and McLaren laid it out in their 2010
review of the field: the more powerful the notation — Walton's full
catalog of schemes, AIF, fine-grained IBIS — the lower the completion
rates and the lower the inter-annotator agreement.[^11] Make the notation
expressive enough to capture what's actually going on in a real argument,
and only trained specialists can produce or read it. Make it simple enough
for everyone, and it loses the structure that made it valuable in the
first place.

Conklin, retrospecting on gIBIS and Dialogue Mapping in 2003, was the most
honest about it: argument maps work, in his experience, but only when a
trained human facilitator absorbs the cognitive cost of producing them in
real time.[^12] Without the facilitator, participants will not maintain the
discipline of typing each contribution as a question, idea, or argument.
The typing collapses, and so does the map.

van Gelder, looking at his classroom data, said something similar in a
different register: the gains were real but they required sustained
instruction inside the tool's scaffolding. Outside that scaffolding,
students reverted to prose.[^13] The map did not propagate.

The pattern is clean. Every generation, smart people see the obvious
shape of deliberation, build software that exposes that shape, and then
discover that the cognitive cost of producing the map is higher than the
benefit of having one — *unless* a trained specialist absorbs the cost on
behalf of everyone else. That specialist is too expensive to deploy at
scale, and so each tool dies with its grant or its founder, and the next
generation rediscovers the obvious idea fresh.

## IV. What changed

The expressiveness-vs-usability tradeoff was always a tradeoff between two
human activities: thinking and notating. The map is the artifact of a
person doing two things at once. They are reasoning, and they are
reasoning *about how to write down* what they are reasoning. The cognitive
overhead of the second task swamps the first. That's the failure pattern
in one sentence.

The thing that changes the calculus is that the second task is now
absorbable by software. A modern language model, given a transcript of a
conversation or a debate, can produce a first-pass argument map in a few
seconds — typed at the level of expressiveness the field once required a
specialist for, with the schemes correctly identified, the mitigations
nested under the right objections, and the supporting evidence linked
back to the source span.

This is what's been missing for seventy years. Not the idea. The idea was
there. What was missing was a way to get expressiveness *and* usability at
the same time. The map can now be expressive — because the model handles
the notation work — and usable, because the human only ever has to read,
correct, and interact with the artifact.

This is not a claim that AI produces *good* argument maps unaided. It
produces serviceable first drafts that a human can improve quickly. That
is enough. The historical bottleneck was never the quality of the
finished map. It was that nobody had time to make one.

## V. Why this matters for civic deliberation specifically

Some of the strongest contemporary work in democratic theory points
directly at this technology before it existed.

Hélène Landemore, in *Open Democracy*, argues that democratic epistemic
competence depends on institutional design that aggregates dispersed
reasoning across the citizenry — that the case for democracy rests on
its capacity to integrate distributed cognition.[^14] Elizabeth Anderson,
in "The Epistemology of Democracy," frames democracy itself as a
distributed problem-solving institution, with epistemic warrant flowing
from the diversity and inclusion of the perspectives it integrates.[^15]
Hugo Mercier and Dan Sperber's argumentative theory of reasoning argues
something stronger still: human reasoning is adapted for *exchange*, not
solo cognition. Tools that structure exchange should outperform tools
that structure individual thought.[^16]

These are not throat-clearing citations. They each describe a feature of
democratic life that argument maps would, if usable, directly support:
the integration of dispersed reasoning, the structured visibility of
disagreement, and the capacity to argue *productively* rather than
explosively. Cass Sunstein's work on group polarization names the
characteristic failure mode of unstructured deliberation; argument
mapping is a candidate counter-measure that doesn't depend on suppressing
disagreement, only on making its structure legible.[^17]

For civic deliberation in particular — municipal councils, public
consultations, planning hearings — argument maps would do something
specific and valuable: they'd make the deliberative record **legible
across time**.

Right now, the record of how a city decides things is buried inside
several years of meeting recordings. Anyone wanting to trace how a
decision came together has to watch hours of video, read the agenda
packages, and reconstruct the structure of the argument by hand. The
information is all public. It's just not usable.

An argument-map layer over that record changes its character. The
question "when did we first take up this issue, and what was the
counter-argument?" becomes answerable in seconds, with citations to the
exact transcript line. The record becomes searchable not just by keyword
but by argumentative role: what positions were taken, what reasons were
offered, what objections were raised, what mitigations were proposed.
That is *epistemic infrastructure* in Herzog's sense — a public good that
makes democratic argument compound.

## VI. The Negation Game and what it actually does

Louie's deliberation layer is called the **Negation Game**. It's an
implementation of a particular subset of argument maps that we call
**epistemic graphs**: questions, options, supporting arguments, negating
arguments, and mitigating arguments, organized into a structure that the
participants can extend, contest, and refine.

The Negation Game is not a research prototype. It is an attempt to take
the obvious idea — argument maps — and ship it as something a city can
actually use. It draws on the lineage above and treats the seventy-year
record of failed attempts as a curriculum, not a discouragement. The
specific design choices — limiting the scheme catalog rather than
adopting Walton wholesale, structuring around questions rather than
free-form claims, using AI to absorb the notation cost rather than asking
participants to do it themselves — are responses to known failure modes.

It is not the first argument-mapping tool. It is the first one that
could plausibly survive contact with non-specialist users at municipal
scale, because the bottleneck the field couldn't get past for seventy
years is now absorbable by something else.

## VII. What we are arguing for

Three claims, in order of confidence.

1. **Argument maps are obvious.** They are the natural shape of a
   conversation that is trying to get somewhere. The fact that they have
   been independently rediscovered, in essentially the same form, by
   serious thinkers across more than a century is not a coincidence. It is
   evidence that this is the structure of the thing.

2. **They have not broken through because they couldn't be expressive
   and usable at the same time.** The historical record is unambiguous on
   this. Every generation tried; every generation hit the same wall. The
   wall was not the quality of any specific notation. It was the cognitive
   cost of producing a map by hand at the level of expressiveness the
   activity demanded.

3. **AI changes the calculus.** A capable language model can absorb the
   notation cost. The map becomes a first-class artifact in the
   conversation rather than a specialist's output. This is the first
   moment in seventy years when expressiveness and usability are not in
   tension. We should expect a quiet, productive return of an idea that's
   been waiting.

The question for democracies — Herzog's question, framed slightly
differently — is whether we will recognize this technology as
infrastructure and build it that way, or whether we will let it become
another product category that ships features against attention metrics.
Civic deliberation deserves the first option. That is what we are
building.

---

## Notes

[^1]: Lisa Herzog, *Citizen Knowledge: Markets, Experts, and the
    Infrastructure of Democracy* (Oxford University Press, 2024). The
    framing of democracies as knowledge-processing systems whose
    infrastructure has been chronically under-invested in is the central
    argument of the book. Herzog's earlier development of the idea
    appears in her work with the Centre for Philosophy, Politics and
    Economics at the University of Groningen.

[^2]: John Henry Wigmore, *The Principles of Judicial Proof* (Little,
    Brown, 1913). Anderson, Schum, and Twining revived the Wigmorean
    method in *Analysis of Evidence* (Cambridge University Press, 2005).

[^3]: Stephen Toulmin, *The Uses of Argument* (Cambridge University
    Press, 1958).

[^4]: Monroe C. Beardsley, *Practical Logic* (Prentice-Hall, 1950).

[^5]: Jeff Conklin and Michael L. Begeman, "gIBIS: A Hypertext Tool for
    Exploratory Policy Discussion," *ACM Transactions on Office
    Information Systems* 6(4), 1988. The "wicked problems" framing comes
    from Horst Rittel and Melvin Webber, "Dilemmas in a General Theory of
    Planning," *Policy Sciences* 4, 1973.

[^6]: Tim van Gelder, "Teaching Critical Thinking: Some Lessons from
    Cognitive Science," *College Teaching* 53(1), 2005; "The Rationale
    for Rationale," *Law, Probability and Risk* 6, 2007. Effect sizes are
    consistently positive across multiple replications; cite the
    original papers rather than secondary summaries.

[^7]: Douglas Walton, Chris Reed, and Fabrizio Macagno, *Argumentation
    Schemes* (Cambridge University Press, 2008).

[^8]: Carlos Chesñevar et al., "Towards an Argument Interchange Format,"
    *Knowledge Engineering Review* 21(4), 2006; Floris Bex, John Lawrence,
    Mark Snaith, and Chris Reed, "Implementing the Argument Web,"
    *Communications of the ACM* 56(10), 2013.

[^9]: Paul A. Kirschner, Simon J. Buckingham Shum, and Chad S. Carr,
    eds., *Visualizing Argumentation: Software Tools for Collaborative
    and Educational Sense-Making* (Springer, 2003).

[^10]: Simon Buckingham Shum, "The Roots of Computer-Supported Argument
    Visualization," in Kirschner, Buckingham Shum, and Carr (eds.),
    *Visualizing Argumentation* (2003).

[^11]: Oliver Scheuer, Frank Loll, Niels Pinkwart, and Bruce M. McLaren,
    "Computer-Supported Argumentation: A Review of the State of the Art,"
    *International Journal of Computer-Supported Collaborative Learning*
    5(1), 2010.

[^12]: Jeff Conklin, "Wicked Problems and Social Complexity" (CogNexus
    Institute, 2003); *Dialogue Mapping: Building Shared Understanding of
    Wicked Problems* (Wiley, 2005).

[^13]: van Gelder (2005), op. cit.; see also Maralee Harrell, "Using
    Argument Diagramming Software in the Classroom," *Teaching
    Philosophy* 28(2), 2005, on the requirement for sustained
    scaffolded instruction.

[^14]: Hélène Landemore, *Open Democracy: Reinventing Popular Rule for
    the Twenty-First Century* (Princeton University Press, 2020).

[^15]: Elizabeth Anderson, "The Epistemology of Democracy," *Episteme*
    3(1–2), 2006.

[^16]: Hugo Mercier and Dan Sperber, *The Enigma of Reason* (Harvard
    University Press, 2017).

[^17]: Cass R. Sunstein, *Going to Extremes: How Like Minds Unite and
    Divide* (Oxford University Press, 2009); *#Republic: Divided
    Democracy in the Age of Social Media* (Princeton University Press,
    2017).

---

## Acknowledgements and editorial notes

Research bibliography assembled with the support of an AI research agent;
all citations were spot-checked but readers should verify any specific
quote against the cited source before reuse. The Herzog framing leans
on her published interviews and her earlier papers as well as the 2024
book; verbatim quotation of *Citizen Knowledge* is intentionally
avoided pending direct verification of the printed text.

The contemporary AI × argumentation literature (Castagna et al. at
ARG-tech, Freedman and Toni 2024, Betz and Richardson 2022, the COMMA
2024 LLM tracks, the *Argument & Computation* journal under Reed) is
where the field's reawakening to this technology is most visible. A
follow-up piece focused specifically on that literature is planned.
