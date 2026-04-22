import { useEffect, useState } from "react";
import { navigate } from "../App";

type Sub = "home" | "how" | "cities" | "public" | "why";

const subFromHash = (hash: string): Sub => {
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  const path = trimmed.split("?")[0];
  if (path === "/louie/how") return "how";
  if (path === "/louie/cities") return "cities";
  if (path === "/louie/public") return "public";
  if (path === "/louie/why") return "why";
  return "home";
};

const CAL_URL = "https://bit.ly/connorchat";
const CONTACT_EMAIL = "connor@networkgoods.institute";

const Header = ({ current }: { current: Sub }) => (
  <div className="louie-site-header">
    <div className="louie-site-header-top">
      <a href="#/louie" className="louie-logo">
        <span className="louie-logo-mark">L</span>
        <span>
          Louie
          <span className="louie-logo-sub">Civic Intelligence</span>
        </span>
      </a>
      <div className="louie-header-actions">
        <a href="#/" className="louie-demo-link">See the Mississauga demo →</a>
        <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="louie-header-cta">Talk to us</a>
      </div>
    </div>
    <nav className="louie-site-nav">
      <a href="#/louie" className={`louie-nav-item ${current === "home" ? "active" : ""}`}>Home</a>
      <a href="#/louie/how" className={`louie-nav-item ${current === "how" ? "active" : ""}`}>How it works</a>
      <a href="#/louie/cities" className={`louie-nav-item ${current === "cities" ? "active" : ""}`}>For cities</a>
      <a href="#/louie/public" className={`louie-nav-item ${current === "public" ? "active" : ""}`}>For residents &amp; press</a>
      <a href="#/louie/why" className={`louie-nav-item ${current === "why" ? "active" : ""}`}>Why now</a>
    </nav>
  </div>
);

const Footer = () => (
  <footer className="louie-footer">
    <div className="louie-container">
      <div className="louie-footer-grid">
        <div>
          <div className="louie-footer-title">Louie</div>
          <ul className="louie-footer-links">
            <li><a href="#/louie">What it is</a></li>
            <li><a href="#/louie/how">How it works</a></li>
            <li><a href="#/louie/why">Why now</a></li>
          </ul>
        </div>
        <div>
          <div className="louie-footer-title">Audiences</div>
          <ul className="louie-footer-links">
            <li><a href="#/louie/cities">Cities &amp; clerks</a></li>
            <li><a href="#/louie/public">Residents &amp; press</a></li>
            <li><a href="#/">Mississauga demo</a></li>
          </ul>
        </div>
        <div>
          <div className="louie-footer-title">On trust</div>
          <ul className="louie-footer-links">
            <li>Every answer cites a public source</li>
            <li>Architected for Bill 194 accountability</li>
            <li>We partner on your MFIPPA and procurement process</li>
          </ul>
        </div>
        <div>
          <div className="louie-footer-title">Contact</div>
          <ul className="louie-footer-links">
            <li><a href={CAL_URL} target="_blank" rel="noopener noreferrer">Book a call →</a></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className="louie-footer-bottom">
        Demo built on the City of Mississauga's public record.
        Not affiliated with or endorsed by the City. Louie is an
        independent proposal to the City; no commercial relationship exists.
      </div>
    </div>
  </footer>
);

// Small inline argument-graph illustration used on /how step 3.
const ArgumentGraph = () => (
  <svg
    className="louie-argument-graph"
    viewBox="0 0 300 240"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Diagram: a claim with one support, one negation, and one mitigation"
  >
    <defs>
      <pattern id="louie-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8eef2" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="300" height="240" fill="url(#louie-grid)" />

    {/* Edges */}
    <line x1="75" y1="118" x2="130" y2="62" stroke="#00b862" strokeWidth="2" />
    <line x1="225" y1="118" x2="170" y2="62" stroke="#b83232" strokeWidth="2" strokeDasharray="5 4" />
    <line x1="225" y1="195" x2="225" y2="140" stroke="#d68900" strokeWidth="2" />

    {/* Edge labels — positioned in open areas, tilted along line direction */}
    <text x="78" y="100" fill="#2d6a4f" fontSize="8.5" fontWeight="700" letterSpacing="0.08em" transform="rotate(-45 78 100)">SUPPORTS</text>
    <text x="200" y="76" fill="#8a2626" fontSize="8.5" fontWeight="700" letterSpacing="0.08em" transform="rotate(45 200 76)">NEGATES</text>
    <text x="232" y="170" fill="#9b6b00" fontSize="8.5" fontWeight="700" letterSpacing="0.08em">MITIGATES</text>

    {/* Nodes */}
    <circle cx="150" cy="44" r="28" fill="#003050" />
    <text x="150" y="48" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="0.06em">CLAIM</text>

    <circle cx="58" cy="135" r="22" fill="#00b862" />
    <text x="58" y="139" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700" letterSpacing="0.04em">SUPPORT</text>

    <circle cx="242" cy="135" r="22" fill="#b83232" />
    <text x="242" y="139" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700" letterSpacing="0.04em">NEGATION</text>

    <circle cx="225" cy="210" r="17" fill="#d68900" />
    <text x="225" y="214" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" letterSpacing="0.04em">MITIG.</text>
  </svg>
);

const RoadWatchProof = () => (
  <div className="louie-proof">
    <div className="louie-proof-label">Live example · Road Watch thread</div>
    <div className="louie-proof-title">
      "How is the Road Safety Committee using the $2.2M provincial budget?"
    </div>
    <div className="louie-proof-timeline">
      <div className="louie-timeline-row">
        <span className="louie-timeline-year">2021</span>
        <div className="louie-timeline-bar">
          <div className="louie-dot" style={{ left: "6%" }} data-label="Raised · GC"></div>
          <div className="louie-dot" style={{ left: "22%" }} data-label="Raised · Budget"></div>
          <div className="louie-dot" style={{ left: "45%" }} data-label="Deferred · GC"></div>
          <div className="louie-dot louie-dot-current" style={{ left: "68%" }} data-label="Raised · Road Safety"></div>
          <div className="louie-dot louie-dot-open" style={{ left: "92%" }} data-label="Open · 2026"></div>
        </div>
        <span className="louie-timeline-year">2026</span>
      </div>
      <div className="louie-timeline-legend">
        <span><i className="louie-legend-dot"></i>Raised / deferred</span>
        <span><i className="louie-legend-dot louie-legend-current"></i>Current</span>
        <span><i className="louie-legend-dot louie-legend-open"></i>Open question</span>
      </div>
    </div>
    <div className="louie-proof-body">
      <strong>Fourth time since 2021</strong> this question has been raised across
      three committees — <em>General Committee</em>, <em>Budget</em>, and
      now <em>Road Safety</em>. Provincial funds total <strong>$2.2M</strong>,
      allocated <em>~$200k/ward</em> across 11 wards. Construction deadline:
      <strong> March 2028</strong>.
    </div>
    <div className="louie-proof-sources">
      Sources: Road Safety Committee, 27 Jan 2026 · General Committee,
      15 Oct 2025 · Budget Committee, 12 Jan 2024 · General Committee, 3 Feb 2021
    </div>
    <div className="louie-proof-honesty">
      This thread was assembled by our research team for the demo.
      AI-assisted assembly is a working prototype and will be the default
      at launch — every stitch still cites back to the transcript line that justifies it.
    </div>
  </div>
);

// Click-to-play YouTube hero — thumbnail until interaction, then iframe.
const HeroVideo = () => {
  const [playing, setPlaying] = useState(false);
  const videoId = "fdm8kIREpOI";
  return (
    <div className="louie-hero-video">
      {playing ? (
        <iframe
          className="louie-hero-video-frame"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Louie demo walkthrough"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="louie-hero-video-thumb"
          onClick={() => setPlaying(true)}
          aria-label="Play demo video"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt="Louie on Mississauga demo thumbnail"
            loading="lazy"
          />
          <span className="louie-hero-video-play" aria-hidden="true">▶</span>
          <span className="louie-hero-video-label">
            <span className="louie-hero-video-label-eyebrow">2-min demo</span>
            Louie on Mississauga
          </span>
        </button>
      )}
    </div>
  );
};

const TeamSection = () => (
  <section className="louie-section louie-section-tinted">
    <div className="louie-container">
      <div className="louie-section-head">
        <div className="louie-section-eyebrow">The team</div>
        <h2 className="louie-h2">Who's building this.</h2>
      </div>
      <div className="louie-team-grid">
        <div className="louie-team-card">
          <div className="louie-team-name">Luís Silvestre</div>
          <div className="louie-team-role">Founder</div>
          <p className="louie-team-bio">
            Builder of the Negation Game — the structured-argument substrate
            Louie uses for contested questions. Background in deliberative
            technology and argument mapping.
          </p>
        </div>
        <div className="louie-team-card">
          <div className="louie-team-name">Connor McCormick</div>
          <div className="louie-team-role">Head of Product</div>
          <p className="louie-team-bio">
            Ten years working on municipal intelligence and civic transparency.
            Leads product, design, and the Mississauga pilot.
          </p>
        </div>
      </div>
      <div className="louie-team-cta">
        <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="louie-cta louie-cta-secondary">
          Book a call →
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="louie-team-email">
          or email {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  </section>
);

const HomePage = () => (
  <>
    <section className="louie-hero">
      <div className="louie-container louie-hero-inner">
        <div>
          <div className="louie-eyebrow">For Canadian municipalities</div>
          <h1 className="louie-h1">
            Search and understand <span className="louie-h1-accent">how your council actually decides</span>.
          </h1>
          <p className="louie-lede">
            Louie is a civic intelligence platform that turns your city's council
            record — videos, minutes, debate, public input — into a searchable
            institutional memory. Every answer cites back to a timestamped
            video, transcript line, or minutes entry.
          </p>
          <div className="louie-cta-row">
            <a href="#/" className="louie-cta louie-cta-primary">See it on Mississauga</a>
            <a href="#live-example" className="louie-cta louie-cta-secondary">Read the Road Watch case ↓</a>
          </div>
          <div className="louie-microline">
            Built on the public record · Cited to the transcript line · Interoperates with your existing stack
          </div>
        </div>
        <HeroVideo />
      </div>
    </section>

    <section className="louie-section" id="live-example">
      <div className="louie-container">
        <div className="louie-section-head">
          <div className="louie-section-eyebrow">Live example · Road Watch</div>
          <h2 className="louie-h2">A question asked four times across five years.</h2>
        </div>
        <RoadWatchProof />
      </div>
    </section>

    <section className="louie-section">
      <div className="louie-container">
        <div className="louie-section-head">
          <div className="louie-section-eyebrow">What Louie does</div>
          <h2 className="louie-h2">Three ways to read the record.</h2>
        </div>
        <div className="louie-feature-grid">
          <a href="#/louie/how#search" className="louie-feature">
            <div className="louie-feature-num">01</div>
            <h3 className="louie-feature-title">Ask the record anything</h3>
            <p className="louie-feature-body">
              Plain-English search and chat over every meeting, motion, and
              decision. Every answer links back to a timestamped video,
              transcript line, or minutes entry — not a paraphrase.
            </p>
            <div className="louie-feature-tag">Search &amp; chat</div>
          </a>
          <a href="#/louie/how#threads" className="louie-feature">
            <div className="louie-feature-num">02</div>
            <h3 className="louie-feature-title">See the deliberation, not just the decision</h3>
            <p className="louie-feature-body">
              Topic pages stitch a question across committees and council
              terms: who raised it, what was debated, what got deferred, what
              was decided, and what is still open.
            </p>
            <div className="louie-feature-tag">Cross-committee threads</div>
          </a>
          <a href="#/louie/how#structure" className="louie-feature">
            <div className="louie-feature-num">03</div>
            <h3 className="louie-feature-title">Map contested claims</h3>
            <p className="louie-feature-body">
              For questions that are still open, Louie maps the supports,
              negations, and mitigations — a defensible record of the argument,
              not a comment thread. Built on the Negation Game substrate.
            </p>
            <div className="louie-feature-tag">Negation Game</div>
          </a>
        </div>
      </div>
    </section>

    <section className="louie-section louie-section-tinted">
      <div className="louie-container">
        <div className="louie-proof-bar">
          <div className="louie-proof-stat">
            <div className="louie-stat-num">Your full archive</div>
            <div className="louie-stat-label">ingested as far back as your council video goes</div>
          </div>
          <div className="louie-proof-stat">
            <div className="louie-stat-num">Every citation, verifiable</div>
            <div className="louie-stat-label">resolves to a specific transcript line before display</div>
          </div>
          <div className="louie-proof-stat">
            <div className="louie-stat-num">Zero rip-and-replace</div>
            <div className="louie-stat-label">sits on top of eScribe, iCompass, Granicus — no displacement of your system of record</div>
          </div>
        </div>
      </div>
    </section>

    <section className="louie-section">
      <div className="louie-container">
        <div className="louie-section-head">
          <div className="louie-section-eyebrow">Who uses Louie</div>
          <h2 className="louie-h2">One record. Three audiences.</h2>
        </div>
        <div className="louie-audience-grid">
          <div className="louie-audience">
            <h3 className="louie-audience-title">City staff &amp; clerks</h3>
            <p className="louie-audience-body">
              Briefing-note prep goes from hours of video scrubbing to minutes
              of cited search. New councillors arrive with the context the
              previous term left behind — not a blank slate.
            </p>
            <a href="#/louie/cities" className="louie-audience-link">For cities →</a>
          </div>
          <div className="louie-audience">
            <h3 className="louie-audience-title">Journalists &amp; researchers</h3>
            <p className="louie-audience-body">
              Every quote comes with a timestamp and a video link. Search
              across every committee, every meeting, by speaker. Free for
              independent municipal reporters.
            </p>
            <a href="#/louie/public" className="louie-audience-link">For press →</a>
          </div>
          <div className="louie-audience">
            <h3 className="louie-audience-title">Engaged residents</h3>
            <p className="louie-audience-body">
              Know what your council is actually deciding — in minutes, not
              hours. Follow a decision across every meeting it moved through,
              and see the argument, not just the outcome.
            </p>
            <a href="#/louie/public" className="louie-audience-link">For residents →</a>
          </div>
        </div>
      </div>
    </section>

    <TeamSection />

    <section className="louie-section louie-section-dark">
      <div className="louie-container">
        <h2 className="louie-h2 louie-h2-light">
          Government data is already public.<br />
          We make it usable.
        </h2>
        <p className="louie-lede louie-lede-light">
          Not another engagement portal. Not another AI chatbot. A
          source-linked, verifiable layer over public meetings — so anyone
          can understand not just <em>what</em> council decided, but
          <em> how</em> and <em>why</em>.
        </p>
        <div className="louie-cta-row">
          <a href="#/" className="louie-cta louie-cta-primary-light">Walk through the Mississauga demo →</a>
          <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="louie-cta louie-cta-secondary-light">Talk to us →</a>
        </div>
      </div>
    </section>
  </>
);

const HowPage = () => (
  <>
    <section className="louie-page-hero">
      <div className="louie-container">
        <div className="louie-breadcrumb"><a href="#/louie">Louie</a> › How it works</div>
        <h1 className="louie-h1">From a two-hour meeting to a defensible decision record.</h1>
        <p className="louie-lede">
          Every council and committee produces hours of video, a pile of
          PDFs, and a record that technically exists but practically doesn't.
          Louie is the pipeline that turns that output into something a
          clerk, a journalist, or a resident can actually use.
        </p>
      </div>
    </section>

    <section className="louie-section" id="search">
      <div className="louie-container"><div className="louie-prose-wrap">
        <div className="louie-step">
          <div className="louie-step-num">01</div>
          <h2 className="louie-h3">Ingest what's already public.</h2>
          <p>
            Council livestreams, committee video, agendas, minutes, staff
            reports, public deputations. Louie sits <strong>downstream</strong> of
            the tools you already use — eScribe, iCompass, Granicus, CivicPlus,
            YouTube — and treats their output as the source of truth.
          </p>
          <div className="louie-callout">
            <strong>We don't replace anything.</strong> If your clerk's office
            already runs an agenda management system, Louie reads its output.
            If your video lives on YouTube, Louie transcribes it. Procurement
            stays simple: a read-only layer on top of your system of record.
          </div>
        </div>

        <div className="louie-step" id="threads">
          <div className="louie-step-num">02</div>
          <h2 className="louie-h3">Stitch the cross-committee thread.</h2>
          <p>
            Every transcript line gets attributed to a speaker, linked to a
            timestamp, and indexed by topic. Then the threading layer connects
            the dots: a question raised in General Committee in 2021 and
            deferred in Budget in 2024 shows up as a single continuous
            thread, not four unrelated PDFs.
          </p>
          <p>
            This is the institutional-memory layer — the thing that makes the
            Road Watch example on the home page possible. For a new
            councillor in 2026, it's the difference between reading a
            five-sentence summary of a five-year debate and watching the
            debate itself, in order, with every source linked.
          </p>
        </div>

        <div className="louie-step" id="structure">
          <div className="louie-step-num">03</div>
          <h2 className="louie-h3">Map contested claims.</h2>
          <div className="louie-step-split">
            <div>
              <p>
                For questions that are still open — a $2.2M budget allocation,
                a zoning change, a policing model — Louie maps the arguments
                into a structured graph of <em>supports</em>, <em>negations</em>,
                and <em>mitigations</em>. This is the <strong>Negation Game</strong>:
                an argument-graph substrate purpose-built for disagreement
                that doesn't collapse into a comment thread.
              </p>
              <p>
                Summaries lose dissent. Argument maps preserve it. For a
                skeptical CAO, that's the difference between "another civic-tech
                pilot" and <em>"a defensible record of why we decided what we
                decided."</em>
              </p>
            </div>
            <ArgumentGraph />
          </div>
        </div>

        <div className="louie-step">
          <div className="louie-step-num">04</div>
          <h2 className="louie-h3">Surface it where people already look.</h2>
          <p>
            A feed of live civic topics. A search bar that answers in plain
            English. A per-topic page scoped to one committee's decision.
            The same record, three surfaces — source-linked, readable on a
            phone during a council break, ingestible by a journalist's
            deadline.
          </p>
        </div>

        <div className="louie-callout louie-callout-honest">
          <strong>What Louie doesn't do:</strong> We don't write policy. We
          don't replace clerks. We don't auto-decide anything. Every output
          is a citation back to a human who said a specific thing on a
          specific date.
        </div>
      </div></div>
    </section>
  </>
);

const CitiesPage = () => (
  <>
    <section className="louie-page-hero">
      <div className="louie-container">
        <div className="louie-breadcrumb"><a href="#/louie">Louie</a> › For cities</div>
        <h1 className="louie-h1">Continuity through every election.</h1>
        <p className="louie-lede">
          Every four years the council resets. Staff rewrite the same briefing
          notes. New members propose things already studied, already deferred,
          already decided. Louie is the institutional memory — the{" "}
          <em>corporate memory</em>, in Clerk's-office terms — that
          doesn't walk out the door on election night.
        </p>
      </div>
    </section>

    <section className="louie-section">
      <div className="louie-container"><div className="louie-prose-wrap">
        <h2 className="louie-h3">The hidden cost of an unsearchable record.</h2>
        <ul className="louie-bullet-list">
          <li>
            <strong>Staff hours.</strong> Clerks and policy staff scrub hours
            of video and PDF minutes to confirm what was said, by whom, in
            what motion.
          </li>
          <li>
            <strong>FOI volume.</strong> Residents file MFIPPA requests for
            things that are already public because the public version isn't
            findable.
          </li>
          <li>
            <strong>Relitigated decisions.</strong> Questions asked, debated,
            and deferred in 2019 come back in 2024 with no record of the
            reasoning — just the outcome.
          </li>
          <li>
            <strong>Onboarding drag.</strong> A new councillor's first six
            months are spent reconstructing context the previous term took
            for granted.
          </li>
        </ul>

        <h2 className="louie-h3">What changes with Louie.</h2>
        <div className="louie-outcome-grid">
          <div className="louie-outcome">
            <div className="louie-outcome-title">New councillors get a running start</div>
            <p>
              On day one, every new member has a searchable record of what
              the previous council considered, why, and what was left
              unresolved — scoped to their ward, their committee, or any
              topic they raise.
            </p>
          </div>
          <div className="louie-outcome">
            <div className="louie-outcome-title">Briefing notes in minutes, not hours</div>
            <p>
              Staff ask Louie a question and get a cited answer across every
              meeting on the topic. Drop the citations into the briefing
              note; the trail is already defensible.
            </p>
          </div>
          <div className="louie-outcome">
            <div className="louie-outcome-title">Defensible decisions</div>
            <p>
              Every debated claim, supporting source, and contested point is
              stitched across meetings into one record council can defend
              today and the next council can inherit.
            </p>
          </div>
        </div>

        <h2 className="louie-h3">How we work with your team.</h2>
        <p>
          We don't lead with compliance badges — Ontario's AI regulations
          don't offer a certification scheme yet, and any vendor claiming one
          is overselling. Instead, we're transparent about how Louie is
          architected and how we'd partner with your team on procurement.
        </p>
        <div className="louie-partnership-grid">
          <div className="louie-partnership-item">
            <div className="louie-partnership-label">Architected for trust</div>
            <p>
              Aligned with Ontario's Trustworthy AI principles: transparent
              use, human oversight, and source-linked outputs. Designed to
              support your Bill 194 accountability framework when you
              publish it.
            </p>
          </div>
          <div className="louie-partnership-item">
            <div className="louie-partnership-label">Partnered on privacy</div>
            <p>
              MFIPPA-aware records handling. Canadian hosting. We sign your
              vendor privacy questionnaire and partner with your FOI
              coordinator on data-residency, retention, and disclosure
              decisions.
            </p>
          </div>
          <div className="louie-partnership-item">
            <div className="louie-partnership-label">Interoperable, not disruptive</div>
            <p>
              Sits on top of eScribe, iCompass, Granicus, CivicPlus — or
              YouTube if that's where your video lives. Read-only to your
              system of record. AODA / WCAG 2.0 AA on every surface.
            </p>
          </div>
          <div className="louie-partnership-item">
            <div className="louie-partnership-label">Deployed for discovery</div>
            <p>
              We start with a proof-of-concept on 50–100 of your meetings, at
              a cost that fits under most Ontario direct-award thresholds.
              Free public-facing demo; paid institutional access for staff,
              archives, and integrations.
            </p>
          </div>
        </div>

        <div className="louie-callout louie-callout-cta">
          <div>
            <strong>Talk with us.</strong> If you're a clerk, CAO, or
            councillor in an Ontario municipality, the Mississauga demo is
            the place to start — built as an independent proposal, no
            commercial relationship with the City.
          </div>
          <div className="louie-callout-actions">
            <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="louie-cta louie-cta-primary">Book a call →</a>
            <a href="#/" className="louie-cta louie-cta-secondary">Walk the demo →</a>
          </div>
        </div>
      </div></div>
    </section>
  </>
);

const PublicPage = () => (
  <>
    <section className="louie-page-hero">
      <div className="louie-container">
        <div className="louie-breadcrumb"><a href="#/louie">Louie</a> › For residents &amp; press</div>
        <h1 className="louie-h1">Know what your council is actually deciding — in minutes, not hours.</h1>
        <p className="louie-lede">
          Every council meeting is livestreamed. Every agenda is published.
          Almost none of it is findable. Louie is the layer that makes the
          public record usable without needing to sit through the whole
          meeting.
        </p>
      </div>
    </section>

    <section className="louie-section">
      <div className="louie-container"><div className="louie-prose-wrap">
        <h2 className="louie-h3">Two things you can do today.</h2>

        <div className="louie-walkthrough">
          <div className="louie-walkthrough-num">A</div>
          <div>
            <h3 className="louie-h4">Trace the $2.2M Road Safety budget.</h3>
            <p>
              Open the Road Watch thread. See the four times since 2021 this
              question has been raised across three committees. Read the key
              quotes. Hear the clips. Then open the argument map — supports,
              negations, mitigations — and see the deliberation itself, not
              just the outcome.
            </p>
            <a href="#/" className="louie-inline-link">Start here →</a>
          </div>
        </div>

        <div className="louie-walkthrough">
          <div className="louie-walkthrough-num">B</div>
          <div>
            <h3 className="louie-h4">Ask a question across every meeting.</h3>
            <p>
              Type a natural-language question — "when has council debated
              institutional memory?" — into the search bar. Louie returns an
              answer with citations to the exact transcript moment and video
              timestamp.
            </p>
            <a href="#/" className="louie-inline-link">Try a search →</a>
          </div>
        </div>

        <h2 className="louie-h3">For journalists &amp; researchers.</h2>
        <p>
          Louie is <strong>free for independent municipal reporters and
          civic researchers</strong>. Every quote is timestamped, cited, and
          deep-linkable to the video. Search across every committee, every
          meeting, by speaker. Filed drafts, beat notes, and source archives
          have never been less painful.
        </p>

        <div className="louie-callout louie-callout-honest">
          <strong>What Louie isn't:</strong> We don't take sides. We don't
          generate opinions. We don't publish anything in your name. We
          surface what was said on the public record, link it to where it
          was said, and let you decide what it means.
        </div>
      </div></div>
    </section>
  </>
);

const WhyPage = () => (
  <>
    <section className="louie-page-hero">
      <div className="louie-container">
        <div className="louie-breadcrumb"><a href="#/louie">Louie</a> › Why now</div>
        <h1 className="louie-h1">We're publishing more government data than ever, and trusting it less.</h1>
        <p className="louie-lede">
          Every Canadian city now livestreams council. Most post transcripts.
          Almost all publish minutes. And yet trust in government keeps
          falling. The gap isn't access to documents — it's legibility,
          continuity, and the feeling of being actually heard.
        </p>
      </div>
    </section>

    <section className="louie-section">
      <div className="louie-container"><div className="louie-prose-wrap">
        <h2 className="louie-h3">Three forces make this the right moment.</h2>

        <div className="louie-force">
          <div className="louie-force-label">Force 1</div>
          <h3 className="louie-h4">A trust collapse that more publishing can't fix.</h3>
          <p>
            Mississauga already publishes everything. Every council meeting
            is live. Every agenda is online. Trust keeps falling anyway. The
            thing that moves the needle isn't more documents — it's a record
            that's actually legible, continuous, and responsive.
          </p>
        </div>

        <div className="louie-force">
          <div className="louie-force-label">Force 2</div>
          <h3 className="louie-h4">The AI moment — and Ontario Bill 194.</h3>
          <p>
            Ontario's Trustworthy AI Framework rewards <em>verifiable,
            source-linked</em> outputs and punishes black-box AI. Bill 194
            will require municipalities to publish accountability frameworks
            for the AI they use. "Every answer cites a public record" is the
            posture most municipal CIOs are trying to build — Louie's
            architecture lines up with it by design, and we partner with
            each municipality on the rest.
          </p>
        </div>

        <div className="louie-force">
          <div className="louie-force-label">Force 3</div>
          <h3 className="louie-h4">The 2026 Ontario election cycle.</h3>
          <p>
            Municipal elections in October 2026 will reshape councils across
            the province. The staff who stay will inherit new members with
            no institutional memory. The cities that invest now in a
            continuity layer will spend the next term governing, not
            rediscovering.
          </p>
        </div>

        <h2 className="louie-h3">Where Louie comes from.</h2>
        <p>
          Louie combines two things that don't usually come together: a
          production-grade transcription and structuring pipeline, and the{" "}
          <strong>Negation Game</strong> — an argument-graph substrate with
          roots in the vTaiwan / Pol.is / Collective Intelligence Project
          lineage of structured digital deliberation. The substrate tracks
          which premises survive cross-examination across meetings, in a way
          a plain transcript-plus-RAG stack cannot.
        </p>
        <p>
          We are not trying to replace council. We are trying to give it a
          memory.
        </p>

        <div className="louie-callout louie-callout-cta">
          <div>
            <strong>Talk to us.</strong> If you're a clerk, a CAO, or a
            councillor in an Ontario municipality, the Mississauga demo is
            the place to start.
          </div>
          <div className="louie-callout-actions">
            <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="louie-cta louie-cta-primary">Book a call →</a>
            <a href="#/" className="louie-cta louie-cta-secondary">See the demo →</a>
          </div>
        </div>
      </div></div>
    </section>
  </>
);

const LouiePage = () => {
  const [sub, setSub] = useState<Sub>(() => subFromHash(window.location.hash));

  useEffect(() => {
    const handler = () => {
      setSub(subFromHash(window.location.hash));
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Ensure we're on the page (belt & braces for direct hash navigation)
  useEffect(() => {
    if (!window.location.hash.startsWith("#/louie")) {
      navigate("#/louie");
    }
  }, []);

  return (
    <div className="louie-site">
      <Header current={sub} />
      {sub === "home" && <HomePage />}
      {sub === "how" && <HowPage />}
      {sub === "cities" && <CitiesPage />}
      {sub === "public" && <PublicPage />}
      {sub === "why" && <WhyPage />}
      <Footer />
    </div>
  );
};

export default LouiePage;
