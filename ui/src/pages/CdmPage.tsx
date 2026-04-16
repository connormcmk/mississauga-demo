import { useEffect, useState, useRef, useCallback } from "react";
import { navigate } from "../App";
import { getMeeting, type MeetingQuestion } from "../data/mockData";
import FloatingChat from "../components/FloatingChat";

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// Click-to-activate iframe wrapper — prevents scroll hijacking
const ActivatableIframe = ({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) => {
  const [active, setActive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [active]);

  return (
    <div
      ref={wrapRef}
      className={`cdm-iframe-activatable ${active ? "cdm-iframe-active" : ""} ${className ?? ""}`}
    >
      <iframe src={src} title={title} allow="clipboard-write" />
      {!active && (
        <div className="cdm-iframe-overlay" onClick={() => setActive(true)}>
          <span className="cdm-iframe-overlay-hint">
            Click to interact with the deliberation map
          </span>
        </div>
      )}
      {active && (
        <div className="cdm-iframe-exit-bar" onClick={() => setActive(false)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Click here or anywhere outside to stop interacting
        </div>
      )}
    </div>
  );
};

// Minimal markdown renderer for inline answer content
const renderAnswerLine = (line: string, key: number) => {
  // Bold inline: **text**
  const renderInline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      return part;
    });

  if (line.startsWith("### ")) return <h3 key={key} className="cdm-ans-h3">{renderInline(line.slice(4))}</h3>;
  if (line.startsWith("## "))  return <h3 key={key} className="cdm-ans-h3">{renderInline(line.slice(3))}</h3>;
  if (line.startsWith("- "))   return <li key={key} className="cdm-ans-li">{renderInline(line.slice(2))}</li>;
  if (line.startsWith("> *"))  return <blockquote key={key} className="cdm-ans-quote">{line.slice(3, line.endsWith("*") ? -1 : undefined)}</blockquote>;
  if (line.startsWith("> "))   return <blockquote key={key} className="cdm-ans-quote">{renderInline(line.slice(2))}</blockquote>;
  if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**"))
    return <p key={key} className="cdm-ans-italic">{line.slice(1, -1)}</p>;
  if (line.trim() === "") return null;
  return <p key={key} className="cdm-ans-p">{renderInline(line)}</p>;
};

const renderAnswer = (text: string) => {
  const lines = text.split("\n");
  const elements: React.JSX.Element[] = [];
  let listItems: React.JSX.Element[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      elements.push(<ul key={key++} className="cdm-ans-ul">{listItems}</ul>);
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      listItems.push(renderAnswer_li(line, key++) as React.JSX.Element);
    } else {
      flushList();
      const el = renderAnswerLine(line, key++);
      if (el) elements.push(el);
    }
  }
  flushList();
  return elements;
};

// Helper: render a list item with inline bold
const renderAnswer_li = (line: string, key: number) => {
  const text = line.slice(2);
  const parts = text.split(/(\*\*[^*]+\*\*)/g).map((p, j) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
    return p;
  });
  return <li key={key} className="cdm-ans-li">{parts}</li>;
};

// Build the formatted answer string from question data
const buildAnswerText = (q: MeetingQuestion): string => {
  let text = q.summary;

  if (q.keyQuotes && q.keyQuotes.length > 0) {
    text += "\n\n";
    q.keyQuotes.forEach((kq) => {
      text += `> *"${kq.quote}"*\n\n— **${kq.speaker}${kq.role ? `, ${kq.role}` : ""}**\n\n`;
    });
  }

  if (q.decision) {
    text += `\n**Decision:** ${q.decision}`;
  }

  if (q.historicalNote) {
    text += `\n\n*${q.historicalNote}*`;
  }

  return text;
};

// Searching indicator
const SearchingIndicator = () => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="cdm-q-searching">
      <span className="cdm-q-searching-text">{phase === 0 ? "Searching transcripts" : "Structuring answer"}</span>
      <span className="cdm-q-searching-dots" />
    </div>
  );
};

const CdmPage = ({ meetingId }: { meetingId: string }) => {
  const meeting = getMeeting(meetingId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [visibleMapId, setVisibleMapId] = useState<string | null>(null);
  const answerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [meetingId]);

  const handleQuestionClick = useCallback((questionId: string) => {
    if (loadingId) return; // block while loading
    if (selectedId === questionId) {
      // Collapse
      setSelectedId(null);
      setVisibleMapId(null);
      return;
    }
    setSelectedId(null);
    setVisibleMapId(null);
    setLoadingId(questionId);
    setTimeout(() => {
      setLoadingId(null);
      setSelectedId(questionId);
      // Scroll the answer into view after it renders
      setTimeout(() => {
        const el = answerRefs.current[questionId];
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 50);
    }, 1200);
  }, [loadingId, selectedId]);

  const handleViewMap = useCallback((questionId: string) => {
    setVisibleMapId(questionId);
    setTimeout(() => {
      const el = document.getElementById(`ng-map-${questionId}`);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 80);
  }, []);

  if (!meeting) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>Meeting not found.</p>
        <a
          href="#/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          style={{ color: "var(--msga-link-blue)" }}
        >
          ← Back to Council Calendar
        </a>
      </div>
    );
  }

  const hasQuestions = meeting.questions.length > 0;

  return (
    <div className="cdm-page">
      {/* Sticky header */}
      <header className="cdm-header">
        <div className="cdm-header-left">
          <a
            href="#/"
            className="cdm-back-link"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#/"
            className="cdm-header-title"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
          >
            <span className="cdm-header-committee">{meeting.committee}</span>
            <span className="cdm-header-date">{meeting.date}</span>
          </a>
        </div>
        <div className="cdm-header-right">
          {meeting.agendaHtmlUrl && meeting.agendaHtmlUrl !== "#" && (
            <a href={meeting.agendaHtmlUrl} target="_blank" rel="noopener noreferrer" className="cdm-header-link">
              Agenda
            </a>
          )}
          {meeting.videoUrl && meeting.videoUrl !== "#" && (
            <a href={meeting.videoUrl} target="_blank" rel="noopener noreferrer" className="cdm-header-link">
              Recording
            </a>
          )}
        </div>
      </header>

      {/* Scrollable content */}
      <div className="cdm-scroll">
        {hasQuestions ? (
          <div className="cdm-qlist-wrap">
            <div className="cdm-qlist-intro">
              <p className="cdm-qlist-intro-text">
                Louie searched this meeting's transcript and structured the discussion into {meeting.questions.length} questions.
                Click any question to see what was discussed, decided, and debated.
              </p>
            </div>

            <div className="cdm-qlist">
              {meeting.questions.map((q, idx) => {
                const isLoading = loadingId === q.id;
                const isSelected = selectedId === q.id;
                const mapVisible = visibleMapId === q.id;
                const isActive = isLoading || isSelected;

                return (
                  <div
                    key={q.id}
                    id={`ng-${q.id}`}
                    className={`cdm-qitem ${isActive ? "cdm-qitem-active" : ""}`}
                  >
                    {/* Clickable header row */}
                    <button
                      className="cdm-qitem-header"
                      onClick={() => handleQuestionClick(q.id)}
                      aria-expanded={isSelected}
                    >
                      <span className="cdm-qitem-num">{idx + 1}.</span>
                      <span className="cdm-qitem-text">{q.deliberativeQuestion}</span>
                      {q.theme && (
                        <span className={`cdm-qitem-theme cdm-qitem-theme-${q.theme}`}>{q.label}</span>
                      )}
                      <svg
                        className={`cdm-qitem-chevron ${isSelected ? "cdm-qitem-chevron-open" : ""}`}
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                      >
                        <path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Loading state */}
                    {isLoading && <SearchingIndicator />}

                    {/* Expanded answer */}
                    {isSelected && (
                      <div
                        className="cdm-qitem-answer"
                        ref={(el) => { answerRefs.current[q.id] = el; }}
                      >
                        {/* Answer content */}
                        <div className="cdm-ans-body">
                          {renderAnswer(buildAnswerText(q))}
                        </div>

                        {/* Audio segment link */}
                        {q.audioSegment && meeting.videoUrl && meeting.videoUrl !== "#" && (
                          <div className="cdm-ans-recording">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            Discussed at {fmt(q.audioSegment.start)}–{fmt(q.audioSegment.end)} in the meeting recording
                            <a href={meeting.videoUrl} target="_blank" rel="noopener noreferrer" className="cdm-ans-recording-link">
                              View recording
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M4 1.5h6.5V8M2 10L10.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          </div>
                        )}

                        {/* View deliberation map button */}
                        {q.negationGameUrl && !mapVisible && (
                          <button
                            className="cdm-view-map-btn"
                            onClick={() => handleViewMap(q.id)}
                          >
                            View on deliberation map
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 3v8M3.5 7.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}

                        {/* Inline deliberation map */}
                        {mapVisible && q.negationGameUrl && (
                          <div id={`ng-map-${q.id}`} className="cdm-qitem-map">
                            <div className="cdm-qitem-map-header">
                              <span className="cdm-qitem-map-label">Deliberation map</span>
                              <button
                                className="cdm-qitem-map-close"
                                onClick={() => setVisibleMapId(null)}
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Collapse
                              </button>
                            </div>
                            <ActivatableIframe
                              src={q.negationGameUrl}
                              title={q.deliberativeQuestion}
                              className="cdm-qitem-iframe"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="cdm-empty-state">
            <div className="cdm-empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#ccc" strokeWidth="2" />
                <path d="M16 24h16M24 16v16" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Deliberation map not yet available</h2>
            <p>
              This meeting's transcript is being processed. The structured
              argument map will appear here once it's ready.
            </p>
          </div>
        )}

        {/* Spacer for floating chat bar */}
        <div style={{ height: "6rem" }} />
      </div>

      {/* Floating chat */}
      <FloatingChat meeting={meeting} />
    </div>
  );
};

export default CdmPage;
