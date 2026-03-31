import { useState, useRef, useEffect, useMemo } from "react";
import { navigate } from "../App";
import { fetchSummary, type SummaryResponse } from "../api";
import { useTranscriptions } from "../hooks/useTranscriptions";
import { formatTranscriptTitle } from "../utils/formatTranscriptTitle";

// Parse a timestamp embedded in transcript titles like _2024_12_08_18_30
const parseTranscriptDate = (title?: string | null) => {
  if (!title) return 0;
  const match = title.match(/_(\d{4})_(\d{2})_(\d{2})_(\d{2})_(\d{1,2})$/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  }
  const parsed = Date.parse(title);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const trimText = (text: string, max = 260) =>
  text.length > max ? `${text.slice(0, max).trim()}…` : text;

const SUGGESTIONS = [
  "When have councillors mentioned institutional memory or forgetting things?",
  "What has council said about transit funding?",
  "How has the stormwater issue evolved over time?",
  "What are the main arguments for and against school bus cameras?",
];

const HomePage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const { data: transcripts, loading: loadingTranscripts, error: listError } = useTranscriptions();
  const [summaries, setSummaries] = useState<Record<string, SummaryResponse | null>>({});
  const [summaryErrors, setSummaryErrors] = useState<Record<string, string>>({});

  // Prefetch summaries for the first few transcripts so the feed has real content
  useEffect(() => {
    let cancelled = false;
    const targets = transcripts.slice(0, 6);

    targets.forEach(async (item) => {
      if (summaries[item.id] !== undefined || summaryErrors[item.id]) return;
      try {
        const summary = await fetchSummary(item.id);
        if (cancelled) return;
        setSummaries((prev) => ({ ...prev, [item.id]: summary }));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Summary unavailable.";
        setSummaryErrors((prev) => ({ ...prev, [item.id]: message }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [summaries, summaryErrors, transcripts]);

  const sortedTranscripts = useMemo(
    () => [...transcripts].sort((a, b) => parseTranscriptDate(b.title) - parseTranscriptDate(a.title)),
    [transcripts],
  );

  // When overlay opens, focus the overlay input and sync value
  useEffect(() => {
    if (searchExpanded && overlayInputRef.current) {
      overlayInputRef.current.focus();
    }
  }, [searchExpanded]);

  const handleSearch = (query?: string) => {
    const q = query || searchValue.trim();
    if (!q) return;
    setSearchExpanded(false);
    navigate(`/chat?q=${encodeURIComponent(q)}`);
  };

  const handleEscape = () => {
    setSearchExpanded(false);
    setSearchValue("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--msga-bg)" }}>
      {/* Header */}
      <header className="msga-header">
        <a
          href="#/"
          className="msga-header-logo"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2" />
            <path d="M6 8h12M6 12h12M6 16h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          MISSISSAUGA
        </a>
        <div className="msga-header-subtitle" style={{ color: "white", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.3px" }}>
          Civic Deliberative Memory
        </div>
      </header>

      {/* Nav */}
      <nav className="msga-nav">
        <a
          href="#/"
          className="msga-nav-item"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          &larr; mississauga.ca
        </a>
        <div className="msga-nav-item active">Home</div>
      </nav>

      {/* Search area — resting state */}
      <div className="home-search-wrapper">
        <p className="home-search-description">
          Civic Deliberative Memory surfaces the issues your council is working
          on, tracks how they evolve over time, and invites structured public
          input.
        </p>
        <input
          ref={searchInputRef}
          className="home-search-input"
          type="text"
          placeholder="Ask any question about council meetings..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <div
          style={{
            fontSize: "0.75rem",
            color: "#999",
            marginTop: "0.5rem",
          }}
        >
          Press Enter to search across all council transcripts
        </div>
      </div>

      {/* Search overlay — expanded state (fills viewport) */}
      {searchExpanded && (
        <div
          className="search-overlay"
          onClick={(e) => {
            // Close if clicking the backdrop (not the input/suggestions)
            if (e.target === e.currentTarget) handleEscape();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleEscape();
          }}
        >
          <input
            ref={overlayInputRef}
            className="search-overlay-input"
            type="text"
            placeholder="Ask any question about council meetings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
              if (e.key === "Escape") handleEscape();
            }}
          />
          <div className="search-overlay-hint">
            Press Enter to search &middot; Escape to close
          </div>

          {/* Suggestions */}
          <div className="search-overlay-suggestions">
            <h4>Try asking</h4>
            {SUGGESTIONS.map((s) => (
              <div
                key={s}
                className="search-overlay-suggestion"
                onClick={() => {
                  setSearchValue(s);
                  handleSearch(s);
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="feed-container">
        {loadingTranscripts && (
          <div className="msga-callout" style={{ marginBottom: "1rem" }}>
            Loading the latest meetings…
          </div>
        )}

        {listError && (
          <div
            className="msga-callout"
            style={{ marginBottom: "1rem", color: "#b00020", borderColor: "#b00020" }}
          >
            {listError}
          </div>
        )}

        {!loadingTranscripts && !listError && sortedTranscripts.length === 0 && (
          <div className="msga-callout" style={{ marginBottom: "1rem" }}>
            No transcripts available yet. Try uploading one or refresh.
          </div>
        )}

        {sortedTranscripts.map((item) => {
          const summary = summaries[item.id];
          const summaryError = summaryErrors[item.id];
          const headline = formatTranscriptTitle(item.title) || item.title;
          const dateLabel = (() => {
            const ts = parseTranscriptDate(item.title);
            if (!ts) return "";
            return new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(ts));
          })();
          const bullets = summary?.bullet_points ?? summary?.bullets ?? [];
          const brief = summaryError
            ? `Summary unavailable: ${summaryError}`
            : summary?.headline || summary?.summary || "Summary will appear once generated.";

          return (
            <article key={item.id} className="feed-item">
              {/* Committee + date */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="feed-item-committee">
                  {item.topic || "Council"}
                </span>
                <span className="feed-item-date">{dateLabel}</span>
              </div>

              {/* Headline */}
              <h2
                className="feed-item-headline"
                onClick={() => navigate(`/topic/${item.id}`)}
              >
                {headline}
              </h2>

              {/* Brief */}
              <p className="feed-item-brief">{trimText(brief)}</p>

              {/* Bullet points if available */}
              {bullets.length > 0 && (
                <ul className="feed-item-bullets">
                  {bullets.slice(0, 3).map((bp, idx) => (
                    <li key={idx}>{bp}</li>
                  ))}
                </ul>
              )}

              <button
                className="feed-item-audio-btn"
                style={{ marginTop: "0.5rem" }}
                onClick={() => navigate(`/topic/${item.id}`)}
              >
                View details
              </button>
            </article>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="msga-footer">
        <div className="msga-container">
          <div className="msga-footer-divider" style={{ marginTop: 0 }} />
          <div className="msga-footer-bottom">
            <div>&copy; City of Mississauga 2019–2026 &middot; Powered by Louie</div>
            <div>
              <a href="#">Privacy and terms</a>
              <a href="#">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
