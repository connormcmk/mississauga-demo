import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import {
  type Meeting,
  mockChatResponses,
  institutionalMemoryResponse,
} from "../data/mockData";

// Process inline bold (**text**), links [text](#anchor), and source refs {{src:N:title}}
const renderInline = (text: string) => {
  const parts = text.split(/(\{\{src:\d+:[^}]+\}\}|\*\*[^*]+\*\*|\[[^\]]+\]\(#[^)]+\))/g);
  return parts.map((part, j) => {
    // Source annotation badge
    const srcMatch = part.match(/^\{\{src:(\d+):([^}]+)\}\}$/);
    if (srcMatch) {
      const [, num, title] = srcMatch;
      return (
        <span key={j} className="source-ref" data-source={title}>
          {num}
        </span>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(#([^)]+)\)$/);
    if (linkMatch) {
      const [, label, anchor] = linkMatch;
      return (
        <a
          key={j}
          href={`#${anchor}`}
          className="fc-map-link"
          onClick={(e) => {
            e.preventDefault();
            // Close the chat overlay first, then scroll
            const closeBtn = document.querySelector(".fc-close-btn") as HTMLButtonElement;
            if (closeBtn) closeBtn.click();
            setTimeout(() => {
              const section = document.getElementById(anchor);
              if (section) {
                const headerOffset = 60;
                const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top, behavior: "smooth" });
                section.classList.add("cdm-section-highlight");
                setTimeout(() => section.classList.remove("cdm-section-highlight"), 1800);
              }
            }, 350);
          }}
        >
          {label}
        </a>
      );
    }
    return part;
  });
};

// Simple markdown-ish renderer for chat messages
const renderChatMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: React.JSX.Element[] = [];
  let key = 0;
  let listItems: React.JSX.Element[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={key++}>{listItems}</ul>);
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("- ")) {
      listItems.push(<li key={key++}>{renderInline(line.slice(2))}</li>);
    } else {
      flushList();
      if (line.startsWith("### ")) {
        elements.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
      } else if (line.startsWith("## ")) {
        elements.push(<h3 key={key++}>{renderInline(line.slice(3))}</h3>);
      } else if (line.startsWith("> *")) {
        const content = line.slice(3, line.endsWith("*") ? -1 : undefined);
        elements.push(<blockquote key={key++}>{content}</blockquote>);
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={key++}>{renderInline(line.slice(2))}</blockquote>,
        );
      } else if (line.startsWith("---")) {
        elements.push(<hr key={key++} />);
      } else if (line.trim() === "") {
        // skip
      } else {
        elements.push(<p key={key++}>{renderInline(line)}</p>);
      }
    }
  }
  flushList();

  return elements;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean; // currently being typed out
  proposeCitizen?: boolean; // show "Propose as citizen point" button
};

const mockSessions = [
  { id: "current", label: "Current session" },
  { id: "road-safety", label: "Road safety budget" },
  { id: "institutional", label: "Institutional memory" },
  { id: "transit", label: "Transit fare policy" },
];

// Trailing questions appended to AI responses
const trailingQuestions = [
  "\n\nDo you have any questions about this meeting?",
  "\n\nWould you like to explore any of these points further?",
  "\n\nIs there anything else you'd like to know?",
];

type Props = {
  meeting: Meeting;
};

const findMockResponse = (
  text: string,
  _meeting: Meeting,
  messageCount: number,
): { response: string; proposeCitizen: boolean } | null => {
  const lower = text.toLowerCase();

  // Third interaction: citizen disagrees with allocation
  if (
    lower.includes("proportional") ||
    lower.includes("don't think") ||
    lower.includes("disagree") ||
    lower.includes("collision data") ||
    lower.includes("not the best") ||
    lower.includes("better allocation")
  ) {
    return {
      response: mockChatResponses["citizen-disagree"],
      proposeCitizen: true,
    };
  }

  // Check for institutional memory
  if (
    lower.includes("institutional memory") ||
    lower.includes("forgetting") ||
    lower.includes("lost knowledge")
  ) {
    return {
      response:
        institutionalMemoryResponse +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // Check for $2.2M / funding questions
  if (
    lower.includes("2.2") ||
    lower.includes("funding") ||
    lower.includes("million") ||
    lower.includes("budget") ||
    lower.includes("provincial")
  ) {
    return {
      response:
        mockChatResponses["2.2m"] +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // Check for school bus questions
  if (
    lower.includes("school bus") ||
    lower.includes("stop arm") ||
    lower.includes("camera")
  ) {
    return {
      response:
        mockChatResponses["school bus"] +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // Check for unresolved / what's pending
  if (
    lower.includes("unresolved") ||
    lower.includes("pending") ||
    lower.includes("deferred") ||
    lower.includes("never been resolved")
  ) {
    return {
      response:
        mockChatResponses["unresolved"] +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // Check for headlight questions
  if (
    lower.includes("headlight") ||
    lower.includes("misalignment") ||
    lower.includes("mot")
  ) {
    return {
      response:
        mockChatResponses["headlight"] +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // Check for Road Watch awareness questions (must come before event participation)
  if (
    lower.includes("road watch awareness") ||
    lower.includes("worth improving") ||
    (lower.includes("road watch") && lower.includes("awareness")) ||
    (lower.includes("road watch") && lower.includes("reporting")) ||
    lower.includes("3,590") ||
    lower.includes("reporting form")
  ) {
    return {
      response:
        mockChatResponses["road watch awareness"] +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // Check for event participation questions
  if (
    lower.includes("event participation") ||
    lower.includes("attendance") ||
    lower.includes("volunteer") ||
    (lower.includes("event") && lower.includes("participation"))
  ) {
    return {
      response:
        mockChatResponses["event participation"] +
        (trailingQuestions[messageCount % trailingQuestions.length] || ""),
      proposeCitizen: false,
    };
  }

  // No hardcoded match — will fall through to live backend
  return null;
};

async function queryBackend(question: string): Promise<string> {
  try {
    const form = new FormData();
    form.append("question", question);
    const res = await fetch("https://mississauga-demo.azule.xyz/api/assistant", {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    let answer = data.answer || "I wasn't able to find relevant information for that question.";
    // Embed source titles into [SOURCE N] markers for inline rendering
    if (data.sources?.length) {
      const sourceMap: Record<string, string> = {};
      for (const s of data.sources) {
        const m = s.reportId?.match?.(/^SOURCE (\d+)$/);
        if (m) sourceMap[m[1]] = s.title;
      }
      answer = answer.replace(/\[SOURCE (\d+)\]/g, (_: string, n: string) => {
        const title = sourceMap[n] || `Source ${n}`;
        return `{{src:${n}:${title}}}`;
      });
    }
    return answer;
  } catch {
    return "I'm having trouble searching the records right now. Please try again.";
  }
}

// Animated thinking indicator: "Thinking..." → "Searching..."
const ThinkingIndicator = () => {
  const [phase, setPhase] = useState(0); // 0 = Thinking, 1 = Searching
  useEffect(() => {
    const timer = setTimeout(() => setPhase(1), 1000);
    return () => clearTimeout(timer);
  }, []);
  const label = phase === 0 ? "Thinking" : "Searching transcripts";
  return (
    <div className="fc-thinking-indicator">
      <span>{label}</span>
      <span className="fc-thinking-dots" />
    </div>
  );
};

// Typewriter component — streams text character by character then renders markdown
const TypewriterMessage = ({
  text,
  speed = 3,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayedLength(0);
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (displayedLength >= text.length) {
      setDone(true);
      onComplete?.();
      return;
    }
    // Fast chunked streaming
    const chunkSize = Math.max(2, Math.floor(Math.random() * 5) + 2);
    const timer = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(prev + chunkSize, text.length));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayedLength, text, speed, onComplete]);

  // Scroll parent container as text grows
  useEffect(() => {
    const container = containerRef.current?.closest(".fc-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [displayedLength]);

  if (done) {
    return (
      <div ref={containerRef} className="chat-msg assistant">
        {renderChatMarkdown(text)}
      </div>
    );
  }

  // While streaming, show partial text as plain (avoids broken markdown)
  const partial = text.slice(0, displayedLength);
  return (
    <div ref={containerRef} className="chat-msg assistant fc-streaming">
      {renderChatMarkdown(partial)}
      <span className="fc-cursor" />
    </div>
  );
};

const FloatingChat = ({ meeting }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const [closing, setClosing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftInput, setDraftInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  // Chat column shows once messages exist; welcome screen shows when no messages
  const [proposeDraft, setProposeDraft] = useState("");
  const [proposingMsgId, setProposingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantMsgCount = useRef(0);

  // Reset messages when meeting changes
  useEffect(() => {
    setMessages([]);
    assistantMsgCount.current = 0;
  }, [meeting.id]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    const container = messagesEndRef.current?.closest(".fc-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, thinking]);

  // Focus input when expanded + lock body scroll
  useEffect(() => {
    if (expanded && !closing) {
      setTimeout(() => inputRef.current?.focus(), 200);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded, closing]);

  const handleStreamComplete = useCallback((msgId: string) => {
    setStreamingId(null);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, streaming: false } : m)),
    );
  }, []);

  const handleClose = () => {
    setClosing(true);
    setSidebarOpen(false);
    setTimeout(() => {
      setExpanded(false);
      setClosing(false);
    }, 250);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSend = () => {
    const text = draftInput.trim();
    if (!text || thinking) return;
    setDraftInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text },
    ]);
    setThinking(true);

    assistantMsgCount.current++;
    const mockResult = findMockResponse(
      text,
      meeting,
      assistantMsgCount.current,
    );

    const msgId = `a-${Date.now()}`;

    if (mockResult) {
      // Hardcoded response — use existing 2-second delay
      setTimeout(() => {
        setThinking(false);
        setMessages((prev) => [
          ...prev,
          {
            id: msgId,
            role: "assistant",
            text: mockResult.response,
            streaming: true,
            proposeCitizen: mockResult.proposeCitizen,
          },
        ]);
        setStreamingId(msgId);
      }, 2000);
    } else {
      // Live backend query
      queryBackend(text).then((answer) => {
        setThinking(false);
        setMessages((prev) => [
          ...prev,
          {
            id: msgId,
            role: "assistant",
            text: answer,
            streaming: true,
            proposeCitizen: false,
          },
        ]);
        setStreamingId(msgId);
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const handleSuggestedQuestion = (questionText: string, questionId: string) => {
    if (thinking) return; // guard against double-fire
    // Send as a chat message so the user gets an AI response
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: questionText },
    ]);
    setThinking(true);

    assistantMsgCount.current++;
    const { response, proposeCitizen } = findMockResponse(
      questionText,
      meeting,
      assistantMsgCount.current,
    )!;

    // Append a link to scroll to the deliberation map section
    const viewLink = `\n\n[View on deliberation map ↓](#ng-${questionId})`;
    const msgId = `a-${Date.now()}`;
    setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: "assistant",
          text: response + viewLink,
          streaming: true,
          proposeCitizen,
        },
      ]);
      setStreamingId(msgId);
    }, 2000);
  };

  const allSuggestedQuestions = meeting.questions
    .filter((q) => q.negationGameUrl)
    .sort((a, b) => {
      const n = (url: string) => parseInt(url.match(/[/-]Q(\d+)[/-]/i)?.[1] ?? "0");
      return n(a.negationGameUrl!) - n(b.negationGameUrl!);
    })
    .map((q, idx) => {
      return { label: `${idx + 1}. ${q.deliberativeQuestion}`, question: q.deliberativeQuestion, id: q.id };
    });
  const suggestedQuestions = allSuggestedQuestions;

  const handleProposeCitizen = (msgId: string) => {
    // Pre-fill with a substantive, graph-quality phrasing of the citizen's argument
    setProposeDraft(
      "Proportional allocation weighted by collision frequency would yield greater safety returns per dollar — Wards 5, 7, and 1 account for disproportionate collision rates near schools, and the provincial funding letter does not require equal distribution"
    );
    setProposingMsgId(msgId);
  };

  const handleSubmitCitizenPoint = () => {
    if (!proposingMsgId) return;
    const ts = Date.now();
    setMessages((prev) => [
      ...prev.map((m) =>
        m.id === proposingMsgId ? { ...m, proposeCitizen: false } : m,
      ),
      {
        id: `citizen-${ts}`,
        role: "assistant",
        text: `Your point has been submitted to the **Citizen Engagement Coordinator** for review. If approved, it will be added to the deliberation map as a citizen-contributed argument.\n\nThis is a premium feature of the Civic Deliberative Memory platform. Citizen contributions are reviewed by the municipality's designated coordinator before being surfaced to councillors.\n\nThank you for participating in Mississauga's civic deliberation process.`,
        streaming: true,
      },
    ]);
    setStreamingId(`citizen-${ts}`);
    setProposeDraft("");
    setProposingMsgId(null);
  };

  const handleCancelCitizenPoint = () => {
    setProposeDraft("");
    setProposingMsgId(null);
  };

  return (
    <>
      {/* Collapsed bar with hover tray */}
      {!expanded && (
        <div className="fc-bar-wrap">
          <div className="fc-bar-tray">
            {allSuggestedQuestions.map((s) => (
              <button
                key={s.id}
                className="fc-chip"
                onClick={() => {
                  setExpanded(true);
                  if (!hasOpened) setHasOpened(true);
                  setTimeout(() => handleSuggestedQuestion(s.question, s.id), 100);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className={`fc-bar ${hasOpened ? "fc-bar-returning" : "fc-bar-initial"}`} onClick={() => { setExpanded(true); if (!hasOpened) setHasOpened(true); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="fc-bar-icon">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7.5 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="fc-bar-input">Search this meeting's records...</span>
          </div>
        </div>
      )}

      {/* Expanded overlay */}
      {expanded && (
        <div
          className={`fc-overlay ${closing ? "fc-closing" : ""} ${messages.length === 0 ? "fc-overlay-welcome" : ""}`}
          onMouseDown={handleOverlayClick}
        >
          {/* Minimize hint above content */}
          <div className="fc-minimize-hint">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Click to minimize
          </div>
          {/* Welcome screen — shown when no messages yet */}
          {messages.length === 0 && (
            <div className="fc-welcome">
              <h1 className="fc-welcome-title">Welcome to years of Mississauga meeting records.</h1>
              <p className="fc-welcome-subtitle">How can I help you today?</p>
              <div className="fc-welcome-input-wrap" onMouseDown={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  className="fc-welcome-input"
                  type="text"
                  placeholder="Ask about this meeting..."
                  value={draftInput}
                  onChange={(e) => setDraftInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="fc-send-btn"
                  onClick={handleSend}
                  disabled={thinking || !draftInput.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="fc-welcome-chips" onMouseDown={(e) => e.stopPropagation()}>
                {suggestedQuestions.map((s) => (
                  <button
                    key={s.question}
                    className="fc-chip"
                    onClick={() => handleSuggestedQuestion(s.question, s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar */}
          {messages.length > 0 && sidebarOpen && (
            <div
              className="fc-sidebar"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="fc-sidebar-header">
                <span>Conversations</span>
                <button
                  className="fc-sidebar-close"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              {mockSessions.map((s, idx) => (
                <div
                  key={s.id}
                  className={`fc-sidebar-item ${idx === 0 ? "active" : ""}`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}

          {/* Chat column — shown once welcomed or conversation started */}
          {messages.length > 0 && <div
            className={`fc-column ${closing ? "fc-column-closing" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Chat header */}
            <div className="fc-chat-header">
              <span className="fc-chat-title"></span>
              <button
                className="fc-close-btn"
                onClick={handleClose}
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="fc-messages">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "assistant" && msg.streaming ? (
                    <TypewriterMessage
                      text={msg.text}
                      speed={streamingId === "summary" ? 2 : 3}
                      onComplete={() => handleStreamComplete(msg.id)}
                    />
                  ) : (
                    <div className={`chat-msg ${msg.role}`}>
                      {msg.role === "assistant"
                        ? renderChatMarkdown(msg.text)
                        : msg.text}
                    </div>
                  )}
                  {/* Propose citizen point button */}
                  {msg.proposeCitizen && !msg.streaming && (
                    <button
                      className="fc-propose-btn"
                      onClick={() => handleProposeCitizen(msg.id)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M7 1v12M1 7h12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Propose as citizen point
                    </button>
                  )}
                </div>
              ))}
              {thinking && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>


            {/* Suggested questions */}
            {messages.length === 0 && (
              <div className="fc-chips-row">
                {suggestedQuestions.map((s) => (
                  <button
                    key={s.question}
                    className="fc-chip fc-chip-inline"
                    onClick={() => handleSuggestedQuestion(s.question, s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Citizen point editing overlay */}
            {proposingMsgId && (
              <div className="fc-propose-overlay">
                <label className="fc-propose-overlay-label">Edit your citizen point</label>
                <textarea
                  className="fc-propose-textarea"
                  value={proposeDraft}
                  onChange={(e) => setProposeDraft(e.target.value)}
                  rows={4}
                />
                <div className="fc-propose-preview-card">
                  <span className="fc-propose-preview-badge">Citizen Point</span>
                  <span className="fc-propose-preview-text">{proposeDraft || "(empty)"}</span>
                </div>
                <div className="fc-propose-actions">
                  <button className="fc-propose-submit" onClick={handleSubmitCitizenPoint} disabled={!proposeDraft.trim()}>Submit point</button>
                  <button className="fc-propose-cancel" onClick={handleCancelCitizenPoint}>Cancel</button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="fc-input-area">
              <input
                ref={inputRef}
                className="fc-input"
                type="text"
                placeholder="Ask about this meeting..."
                value={draftInput}
                onChange={(e) => setDraftInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="fc-send-btn"
                onClick={handleSend}
                disabled={thinking || !draftInput.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>}
        </div>
      )}
    </>
  );
};

export default FloatingChat;
