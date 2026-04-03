import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  type Meeting,
  mockChatResponses,
  institutionalMemoryResponse,
} from "../data/mockData";

// Process inline bold (**text**) within a string
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Simple markdown-ish renderer for chat messages
const renderChatMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: React.JSX.Element[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={key++}>{renderInline(line.slice(3))}</h3>);
    } else if (line.startsWith("> *")) {
      const content = line.slice(3, line.endsWith("*") ? -1 : undefined);
      elements.push(<blockquote key={key++}>{content}</blockquote>);
    } else if (line.startsWith("> ")) {
      elements.push(<blockquote key={key++}>{renderInline(line.slice(2))}</blockquote>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={key++} />);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={key++}>{renderInline(line.slice(2))}</li>);
    } else if (line.trim() === "") {
      // skip
    } else {
      elements.push(<p key={key++}>{renderInline(line)}</p>);
    }
  }

  return elements;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const mockSessions = [
  { id: "current", label: "Current session" },
  { id: "road-safety", label: "Road safety budget" },
  { id: "institutional", label: "Institutional memory" },
  { id: "transit", label: "Transit fare policy" },
];

type Props = {
  meeting: Meeting;
};

const findMockResponse = (text: string, meeting: Meeting): string => {
  const lower = text.toLowerCase();

  // Check for institutional memory
  if (
    lower.includes("institutional memory") ||
    lower.includes("forgetting") ||
    lower.includes("lost knowledge")
  ) {
    return institutionalMemoryResponse;
  }

  // Check for $2.2M / funding questions
  if (
    lower.includes("2.2") ||
    lower.includes("funding") ||
    lower.includes("million") ||
    lower.includes("budget") ||
    lower.includes("provincial")
  ) {
    return mockChatResponses["2.2m"];
  }

  // Check for school bus questions
  if (
    lower.includes("school bus") ||
    lower.includes("stop arm") ||
    lower.includes("camera")
  ) {
    return mockChatResponses["school bus"];
  }

  // Check for unresolved / what's pending
  if (
    lower.includes("unresolved") ||
    lower.includes("pending") ||
    lower.includes("deferred") ||
    lower.includes("never been resolved")
  ) {
    return mockChatResponses["unresolved"];
  }

  // Default response
  return `Based on the ${meeting.committee} meeting transcript from ${meeting.date}:\n\nThis is a mock response for the demo. In production, this would search the meeting transcript and deliberation records to answer: "${text}"\n\nThe AI would draw from:\n- **Full meeting transcript** with speaker attribution\n- **Structured argument maps** for each agenda item\n- **Historical records** showing how this issue has evolved across meetings`;
};

const FloatingChat = ({ meeting }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftInput, setDraftInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with meeting summary
  useEffect(() => {
    setMessages([
      {
        id: "summary",
        role: "assistant",
        text: meeting.summary,
      },
    ]);
  }, [meeting.id]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    const container = messagesEndRef.current?.closest(".fc-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, thinking]);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && !closing) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [expanded, closing]);

  const handleClose = () => {
    setClosing(true);
    setSidebarOpen(false);
    setTimeout(() => {
      setExpanded(false);
      setClosing(false);
    }, 200);
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

    const response = findMockResponse(text, meeting);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: response,
        },
      ]);
      setThinking(false);
    }, 1200);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBarClick = () => {
    setExpanded(true);
  };

  return (
    <>
      {/* Collapsed bar */}
      {!expanded && (
        <div className="fc-bar" onClick={handleBarClick}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="fc-bar-icon"
          >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M7.5 4.5v4l2.5 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Search this meeting's records...</span>
        </div>
      )}

      {/* Expanded overlay */}
      {expanded && (
        <div
          className={`fc-overlay ${closing ? "fc-closing" : ""}`}
          onMouseDown={handleOverlayClick}
        >
          {/* Sidebar */}
          {sidebarOpen && (
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

          {/* Chat column */}
          <div
            className={`fc-column ${closing ? "fc-column-closing" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Chat header */}
            <div className="fc-chat-header">
              <button
                className="fc-history-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Conversation history"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <span className="fc-chat-title">
                {meeting.committee} — {meeting.date}
              </span>
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
                <div key={msg.id} className={`chat-msg ${msg.role}`}>
                  {msg.role === "assistant"
                    ? renderChatMarkdown(msg.text)
                    : msg.text}
                </div>
              ))}
              {thinking && (
                <div className="chat-thinking">Searching transcripts…</div>
              )}
              <div ref={messagesEndRef} />
            </div>

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
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
