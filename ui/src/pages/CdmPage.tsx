import { useEffect, useState, useRef } from "react";
import { navigate } from "../App";
import { getMeeting, roadSafetyArgumentMap } from "../data/mockData";
import FloatingChat from "../components/FloatingChat";
import ArgumentMap from "../components/ArgumentMap";

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const AudioSegmentLink = ({ start, end, videoUrl }: { start: number; end: number; videoUrl?: string }) => {
  return (
    <span className="cdm-audio-btn cdm-audio-btn-static">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      In meeting recording at {fmt(start)} – {fmt(end)}
      {videoUrl && videoUrl !== "#" && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cdm-audio-video-link"
          onClick={(e) => e.stopPropagation()}
        >
          View recording
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M4 1.5h6.5V8M2 10L10.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      )}
    </span>
  );
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

  // Deactivate when clicking outside
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
        <div
          className="cdm-iframe-overlay"
          onClick={() => setActive(true)}
        >
          <span className="cdm-iframe-overlay-hint">
            Click to interact with the deliberation map
          </span>
        </div>
      )}
      {active && (
        <div className="cdm-iframe-exit-bar" onClick={() => setActive(false)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Click here or anywhere outside to stop interacting
        </div>
      )}
    </div>
  );
};

const CdmPage = ({ meetingId }: { meetingId: string }) => {
  const meeting = getMeeting(meetingId);
  const [expandedMaps, setExpandedMaps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [meetingId]);

  if (!meeting) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>Meeting not found.</p>
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          style={{ color: "var(--msga-link-blue)" }}
        >
          ← Back to Council Calendar
        </a>
      </div>
    );
  }

  const hasQuestions = meeting.questions.length > 0;
  const negationGameQuestions = meeting.questions
    .filter((q) => q.negationGameUrl)
    .sort((a, b) => {
      const numA = parseInt(a.negationGameUrl!.match(/[/-]Q(\d+)[/-]/i)?.[1] ?? "0");
      const numB = parseInt(b.negationGameUrl!.match(/[/-]Q(\d+)[/-]/i)?.[1] ?? "0");
      return numA - numB;
    });

  // Collect all key quotes from all questions
  const allQuotes = meeting.questions.flatMap(
    (q) =>
      q.keyQuotes?.map((kq) => ({
        ...kq,
        topic: q.label,
      })) ?? [],
  );

  return (
    <div className="cdm-page">
      {/* Compact header */}
      <header className="cdm-header">
        <div className="cdm-header-left">
          <a
            href="#/"
            className="cdm-back-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#/"
            className="cdm-header-title"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <span className="cdm-header-committee">{meeting.committee}</span>
            <span className="cdm-header-date">{meeting.date}</span>
          </a>
        </div>
        <div className="cdm-header-right">
        </div>
      </header>

      {/* Scrollable content */}
      <div className="cdm-scroll">
        {hasQuestions ? (
          <>
            {negationGameQuestions.map((q, idx) => {
              return (
              <section key={q.id} id={`ng-${q.id}`} className="cdm-hero-section">
                <div className="cdm-section-inner">
                  <h2 className="cdm-hero-question">
                    {idx + 1}. {q.deliberativeQuestion}
                  </h2>
                  {q.audioSegment && (
                    <AudioSegmentLink start={q.audioSegment.start} end={q.audioSegment.end} videoUrl={meeting.videoUrl} />
                  )}
                </div>
                <div className="cdm-hero-iframe-wrap">
                  <ActivatableIframe
                    src={q.negationGameUrl!}
                    title={q.deliberativeQuestion}
                  />
                </div>
                {(() => {
                  const matchedMap = roadSafetyArgumentMap.find(
                    (am) => am.question === q.deliberativeQuestion
                  );
                  if (!matchedMap) return null;
                  const isExpanded = !!expandedMaps[q.id];
                  return (
                    <div className="cdm-section-inner">
                      <button
                        className="cdm-argmap-toggle"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedMaps((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        View threaded argument summary
                      </button>
                      {isExpanded && (
                        <div className="cdm-argmap-collapsible">
                          <ArgumentMap questions={[matchedMap]} />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </section>
            );
            })}

          </>
        ) : (
          <div className="cdm-empty-state">
            <div className="cdm-empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="#ccc"
                  strokeWidth="2"
                />
                <path
                  d="M16 24h16M24 16v16"
                  stroke="#ccc"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
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
        <div style={{ height: "5rem" }} />
      </div>

      {/* Floating chat */}
      <FloatingChat meeting={meeting} />
    </div>
  );
};

export default CdmPage;
