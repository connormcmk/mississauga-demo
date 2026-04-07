import { useEffect, useState, useRef } from "react";
import { navigate } from "../App";
import { getMeeting } from "../data/mockData";
import FloatingChat from "../components/FloatingChat";

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const AudioPlayer = ({ start, end }: { start: number; end: number }) => {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duration = end - start;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 1) { setPlaying(false); return 0; }
          return p + 1 / duration;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, duration]);

  const current = start + Math.round(progress * duration);

  return (
    <div className="cdm-audio-wrap">
      <button className="cdm-audio-btn" onClick={() => setOpen((o) => !o)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 4.5h2l3-3v11l-3-3H2V4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M10 4a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M11.5 2.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Audio segment
      </button>

      {open && (
        <div className="cdm-audio-player">
          <div className="cdm-audio-player-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Scraped from negation game timestamps · {fmt(start)} – {fmt(end)}
          </div>
          <div className="cdm-audio-controls">
            <button
              className="cdm-audio-play"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                  <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
                </svg>
              )}
            </button>
            <span className="cdm-audio-time">{fmt(current)}</span>
            <div
              className="cdm-audio-bar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress((e.clientX - rect.left) / rect.width);
              }}
            >
              <div className="cdm-audio-bar-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="cdm-audio-time">{fmt(end)}</span>
          </div>
        </div>
      )}
    </div>
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
    </div>
  );
};

const CdmPage = ({ meetingId }: { meetingId: string }) => {
  const meeting = getMeeting(meetingId);

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
          <div className="cdm-header-title">
            <span className="cdm-header-committee">{meeting.committee}</span>
            <span className="cdm-header-date">{meeting.date}</span>
          </div>
        </div>
        <div className="cdm-header-right">
        </div>
      </header>

      {/* Scrollable content */}
      <div className="cdm-scroll">
        {hasQuestions ? (
          <>
            {negationGameQuestions.map((q) => {
              const qNumMatch = q.negationGameUrl!.match(/[/-]Q(\d+)[/-]/i);
              const qNum = qNumMatch ? qNumMatch[1] : null;
              return (
              <section key={q.id} id={`ng-${q.id}`} className="cdm-hero-section">
                <div className="cdm-section-inner">
                  <h2 className="cdm-hero-question">
                    {qNum ? `${qNum}.` : ""} {q.deliberativeQuestion}
                  </h2>
                  {q.audioSegment && (
                    <AudioPlayer start={q.audioSegment.start} end={q.audioSegment.end} />
                  )}
                </div>
                <div className="cdm-hero-iframe-wrap">
                  <ActivatableIframe
                    src={q.negationGameUrl!}
                    title={q.deliberativeQuestion}
                  />
                </div>
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
