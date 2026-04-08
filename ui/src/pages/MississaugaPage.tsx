import { useState, useRef, useEffect, useCallback } from "react";
import { navigate } from "../App";
import { mostRecentMeeting, institutionalMemoryResponse } from "../data/mockData";

// Minimal typewriter for search chat
const useTypewriter = (text: string, speed = 3, onDone?: () => void) => {
  const [len, setLen] = useState(0);
  useEffect(() => { setLen(0); }, [text]);
  useEffect(() => {
    if (len >= text.length) { onDone?.(); return; }
    const t = setTimeout(() => setLen(l => Math.min(l + Math.floor(Math.random()*4)+2, text.length)), speed);
    return () => clearTimeout(t);
  }, [len, text, speed, onDone]);
  return text.slice(0, len);
};

const renderInlineBold = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2,-2)}</strong>
      : p
  );

const renderMd = (text: string) =>
  text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i}>{renderInlineBold(line.slice(4))}</h3>;
    if (line.startsWith("## "))  return <h3 key={i}>{renderInlineBold(line.slice(3))}</h3>;
    if (line.startsWith("> *"))  return <blockquote key={i}>{line.slice(3, line.endsWith("*") ? -1 : undefined)}</blockquote>;
    if (line.startsWith("> "))   return <blockquote key={i}>{renderInlineBold(line.slice(2))}</blockquote>;
    if (line.startsWith("---"))  return <hr key={i} />;
    if (line.startsWith("- "))   return <li key={i}>{renderInlineBold(line.slice(2))}</li>;
    if (line.trim() === "")      return null;
    return <p key={i}>{renderInlineBold(line)}</p>;
  });

type SearchMsg = { role: "user" | "assistant"; text: string; streaming?: boolean };

const SearchChat = ({ initialQuery, onClose }: { initialQuery: string; onClose: () => void }) => {
  const [messages, setMessages] = useState<SearchMsg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streamingIdx, setStreamingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didInitRef = useRef(false);

  const sendQuery = useCallback((q: string) => {
    if (!q.trim() || thinking) return;
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages(prev => {
        const next = [...prev, { role: "assistant" as const, text: institutionalMemoryResponse, streaming: true }];
        setStreamingIdx(next.length - 1);
        return next;
      });
    }, 1800);
  }, [thinking]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    sendQuery(initialQuery);
  }, []); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div className="msga-search-chat-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="msga-search-chat-panel" onMouseDown={e => e.stopPropagation()}>
        <div className="msga-search-chat-header">
          <span className="msga-search-chat-title">Civic Memory Search</span>
          <button className="msga-search-chat-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="msga-search-chat-messages">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user"
                ? <div className="chat-msg user">{msg.text}</div>
                : msg.streaming && streamingIdx === i
                  ? <StreamingMsg text={msg.text} onDone={() => {
                      setStreamingIdx(null);
                      setMessages(prev => prev.map((m, j) => j === i ? { ...m, streaming: false } : m));
                    }} />
                  : <div className="chat-msg assistant">{renderMd(msg.text)}</div>
              }
            </div>
          ))}
          {thinking && <div className="chat-thinking"><span/><span/><span/></div>}
          <div ref={bottomRef} />
        </div>
        <div className="fc-input-area" style={{ borderTop: "1px solid var(--msga-border)" }}>
          <input
            className="fc-input"
            type="text"
            placeholder="Ask about council records..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { sendQuery(input); setInput(""); } }}
          />
          <button className="fc-send-btn" onClick={() => { sendQuery(input); setInput(""); }} disabled={thinking || !input.trim()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const StreamingMsg = ({ text, onDone }: { text: string; onDone: () => void }) => {
  const partial = useTypewriter(text, 3, onDone);
  return <div className="chat-msg assistant fc-streaming">{renderMd(partial)}<span className="fc-cursor"/></div>;
};

const navItems = [
  "Services and programs",
  "Council",
  "Our organization",
  "Events and attractions",
  "Projects and strategies",
];

interface Meeting {
  committee: string;
  date: string;
  time: string;
  location: string;
  agenda?: { html: string; pdf: string };
  addendum?: { html: string; pdf: string };
  revisedAgenda?: { html: string; pdf: string };
  video?: boolean;
  cdmMeetingId?: string; // links to a CDM meeting if available
}

interface Committee {
  name: string;
  meetings: Meeting[];
}

const committees: Committee[] = [
  {
    name: "Mississauga Cycling Advisory Committee",
    meetings: [
      {
        committee: "Mississauga Cycling Advisory Committee",
        date: "Tuesday, 10 February 2026",
        time: "6:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
    ],
  },
  {
    name: "Mississauga School Traffic Safety Action Committee",
    meetings: [
      {
        committee: "Mississauga School Traffic Safety Action Committee",
        date: "Tuesday, 10 March 2026",
        time: "9:30 AM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
      {
        committee: "Mississauga School Traffic Safety Action Committee",
        date: "Tuesday, 13 January 2026",
        time: "9:30 AM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
    ],
  },
  {
    name: "Planning and Development Committee",
    meetings: [
      {
        committee: "Planning and Development Committee",
        date: "Monday, 23 March 2026",
        time: "7:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
      {
        committee: "Planning and Development Committee",
        date: "Monday, 9 March 2026",
        time: "7:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
      {
        committee: "Planning and Development Committee",
        date: "Monday, 23 February 2026",
        time: "7:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
      {
        committee: "Planning and Development Committee",
        date: "Monday, 26 January 2026",
        time: "7:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
    ],
  },
  {
    name: "Promotional Awareness Subcommittee of AAC",
    meetings: [
      {
        committee: "Promotional Awareness Subcommittee of AAC",
        date: "Wednesday, 11 March 2026",
        time: "1:00 PM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
      },
      {
        committee: "Promotional Awareness Subcommittee of AAC",
        date: "Wednesday, 14 January 2026",
        time: "1:00 PM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
      },
    ],
  },
  {
    name: "Road Safety Committee",
    meetings: [
      {
        committee: "Road Safety Committee",
        date: "Tuesday, 24 March 2026",
        time: "8:30 AM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
        addendum: { html: "#", pdf: "#" },
        revisedAgenda: { html: "#", pdf: "#" },
        video: true,
        cdmMeetingId: "road-safety-2026-03-24",
      },
      {
        committee: "Road Safety Committee",
        date: "Tuesday, 27 January 2026",
        time: "9:30 AM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
        video: true,
        cdmMeetingId: "road-safety-2026-01-27",
      },
    ],
  },
  {
    name: "Stormwater Advisory Committee",
    meetings: [
      {
        committee: "Stormwater Advisory Committee",
        date: "Thursday, 19 March 2026",
        time: "2:00 PM",
        location: "Online Video Conference",
        agenda: { html: "#", pdf: "#" },
      },
    ],
  },
  {
    name: "Transit Advisory Committee",
    meetings: [
      {
        committee: "Transit Advisory Committee",
        date: "Wednesday, 18 March 2026",
        time: "4:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
      {
        committee: "Transit Advisory Committee",
        date: "Wednesday, 21 January 2026",
        time: "4:00 PM",
        location: "Council Chambers, Civic Centre, 2nd Floor",
        agenda: { html: "#", pdf: "#" },
        video: true,
      },
    ],
  },
];

const MississaugaPage = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Road Safety Committee": true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setSearchOpen(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--msga-bg)" }}>
      {/* Header */}
      <header className="msga-header">
        <a href="https://www.mississauga.ca" className="msga-header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2" />
            <path d="M6 8h12M6 12h12M6 16h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          MISSISSAUGA
        </a>
        <div className="msga-header-search">
          <input type="text" placeholder="Search mississauga.ca" />
          <button>Search</button>
        </div>
      </header>

      {/* Main Nav */}
      <nav className="msga-nav">
        {navItems.map((item) => (
          <div
            key={item}
            className={`msga-nav-item ${item === "Council" ? "active" : ""}`}
          >
            {item}
          </div>
        ))}
      </nav>

      {/* Main content */}
      <div className="msga-container" style={{ paddingTop: "0.5rem" }}>
        {/* Breadcrumb */}
        <div className="msga-breadcrumb">
          <a href="#">Home</a>
          <span>/</span>
          <a href="#">Council</a>
          <span>/</span>
          <a href="#">Council activities</a>
          <span>/</span>
          Council and committees calendar
        </div>

        <div className="msga-main-grid">
          {/* Main content area */}
          <main>
            <h1 className="msga-page-title" style={{ color: "#1a1a1a" }}>
              Council and Committees calendar
            </h1>

            <div className="msga-content">
              <p>
                You can use the search and filter functions to find meetings and
                related documents, videos, agendas and minutes. Preset filters
                include:
              </p>

              <ul className="msga-content-list">
                <li>
                  <strong>Calendar</strong>, which provides a calendar view of
                  all meetings
                </li>
                <li>
                  <strong>List</strong>, which lists all meetings, starting with
                  upcoming meetings
                </li>
                <li>
                  <strong>Past</strong>, which lists only past meetings
                </li>
                <li>
                  <strong>Conflicts Registry</strong>, which lists all reported
                  conflicts of interest
                </li>
              </ul>

              <div className="msga-callout">
                All meeting records prior to May 2020 can be found on{" "}
                <a href="#">individual committee pages</a>. To obtain a copy of
                a meeting video recorded before May 2020, contact the committee
                coordinator for more information. The contact information can be
                found on the individual committee pages.
              </div>

              {/* Committee accordions */}
              <div className="msga-accordion-list">
                {committees.map((committee) => {
                  const isOpen = !!expanded[committee.name];
                  return (
                    <div key={committee.name} className="msga-accordion">
                      <button
                        className="msga-accordion-header"
                        onClick={() => toggle(committee.name)}
                        aria-expanded={isOpen}
                      >
                        <span className="msga-accordion-title">
                          {committee.name} ({committee.meetings.length})
                        </span>
                        <span className="msga-accordion-chevron">
                          {isOpen ? "\u203A" : "\u02C7"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="msga-accordion-body">
                          {committee.meetings.map((meeting, idx) => (
                            <div key={idx} className="msga-meeting-row">
                              <div className="msga-meeting-left">
                                <div className="msga-meeting-share">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#999"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <polyline points="16 6 12 2 8 6" />
                                    <line x1="12" y1="2" x2="12" y2="15" />
                                  </svg>
                                </div>
                                <div>
                                  <a href="#" className="msga-meeting-name">
                                    {meeting.committee}
                                  </a>
                                  <div className="msga-meeting-datetime">
                                    {meeting.date} @ {meeting.time}
                                  </div>
                                  <div className="msga-meeting-location">
                                    {meeting.location}
                                  </div>
                                </div>
                              </div>
                              <div className="msga-meeting-right">
                                {meeting.agenda && (
                                  <div className="msga-meeting-doc-group">
                                    <span className="msga-meeting-doc-label">
                                      Agenda
                                    </span>
                                    <a href={meeting.agenda.html}>HTML</a>
                                    <span className="msga-meeting-doc-sep">
                                      |
                                    </span>
                                    <a href={meeting.agenda.pdf}>PDF</a>
                                  </div>
                                )}
                                {meeting.addendum && (
                                  <div className="msga-meeting-doc-group">
                                    <span className="msga-meeting-doc-label">
                                      Addendum
                                    </span>
                                    <a href={meeting.addendum.html}>HTML</a>
                                    <span className="msga-meeting-doc-sep">
                                      |
                                    </span>
                                    <a href={meeting.addendum.pdf}>PDF</a>
                                  </div>
                                )}
                                {meeting.revisedAgenda && (
                                  <div className="msga-meeting-doc-group">
                                    <span className="msga-meeting-doc-label">
                                      Revised Agenda
                                    </span>
                                    <a href={meeting.revisedAgenda.html}>
                                      HTML
                                    </a>
                                    <span className="msga-meeting-doc-sep">
                                      |
                                    </span>
                                    <a href={meeting.revisedAgenda.pdf}>PDF</a>
                                  </div>
                                )}
                                {meeting.video && (
                                  <div className="msga-meeting-doc-group">
                                    <a href="#" className="msga-meeting-video">
                                      Video
                                    </a>
                                  </div>
                                )}
                                {meeting.cdmMeetingId && (
                                  <div className="msga-meeting-doc-group">
                                    <a
                                      href={`#/cdm/${meeting.cdmMeetingId}`}
                                      className="msga-meeting-memory-link"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/cdm/${meeting.cdmMeetingId}`);
                                      }}
                                    >
                                      Memory
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside>
            <div className="msga-sidebar-section">
              <h2>Related</h2>

              <a href="#" className="msga-sidebar-link">
                Live Council and Committee videos
              </a>
              <a href="#" className="msga-sidebar-link">
                Live press conferences and events
              </a>
              <a href="#" className="msga-sidebar-link">
                Archived videos
              </a>
              <a href="#" className="msga-sidebar-link">
                Subscribe to agendas and minutes
              </a>

              <div
                style={{
                  borderBottom: "1px solid var(--msga-border)",
                  margin: "0.5rem 0",
                }}
              />

              {/* Louie entry point - highlighted block */}
              <div className="msga-sidebar-cdm-block">
                <div
                  className="msga-sidebar-cdm-top"
                  onClick={() => navigate(`/cdm/${mostRecentMeeting.id}`)}
                >
                  <div className="msga-sidebar-cdm-label">Civic Deliberative Memory</div>
                  <div className="msga-sidebar-cdm-meeting">
                    {mostRecentMeeting.committee}
                  </div>
                  <div className="msga-sidebar-cdm-date">
                    {mostRecentMeeting.date}
                  </div>
                </div>
                <div className="msga-sidebar-cdm-search" onClick={(e) => e.stopPropagation()}>
                  <div className="msga-sidebar-cdm-search-label">Search across meetings</div>
                  <div className="msga-sidebar-cdm-search-input-wrap">
                    <input
                      type="text"
                      className="msga-sidebar-cdm-search-input"
                      placeholder="e.g. institutional memory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                    />
                    <button
                      className="msga-sidebar-cdm-search-btn"
                      onClick={handleSearchSubmit}
                      disabled={!searchQuery.trim()}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Cross-meeting search chat */}
      {searchOpen && (
        <SearchChat
          initialQuery={searchQuery}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="msga-footer">
        <div className="msga-container">
          <div className="msga-footer-grid">
            <div>
              <div className="msga-footer-section-title">Find</div>
              <ul className="msga-footer-links">
                <li>
                  <a href="#">Publications</a>
                </li>
                <li>
                  <a href="#">Pay, apply and report</a>
                </li>
                <li>
                  <a href="#">Services A to Z</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="msga-footer-section-title">Get in touch</div>
              <ul className="msga-footer-links">
                <li>
                  <a href="#">Contact us</a>
                </li>
                <li>
                  <a href="#">Get email updates</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="msga-footer-section-title">Social</div>
              <ul className="msga-footer-links">
                <li>
                  <a href="#">X (Twitter)</a>
                </li>
                <li>
                  <a href="#">Facebook</a>
                </li>
                <li>
                  <a href="#">LinkedIn</a>
                </li>
                <li>
                  <a href="#">YouTube</a>
                </li>
                <li>
                  <a href="#">Instagram</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="msga-footer-divider" />
          <div className="msga-footer-bottom">
            <div>&copy; City of Mississauga 2019–2026</div>
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

export default MississaugaPage;
