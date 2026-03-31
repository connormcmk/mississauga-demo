import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import { navigate } from "../App";
import { askAssistant, fetchSummary, type SummaryResponse } from "../api";
import { useTranscriptions } from "../hooks/useTranscriptions";
import { useTranscriptionData } from "../hooks/useTranscriptionData";
import { formatTranscriptTitle } from "../utils/formatTranscriptTitle";

// Simple markdown-ish renderer for chat messages
const renderChatMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={key++}>{line.slice(3)}</h3>);
    } else if (line.startsWith("> *")) {
      const content = line.slice(3, line.endsWith("*") ? -1 : undefined);
      elements.push(<blockquote key={key++}>{content}</blockquote>);
    } else if (line.startsWith("> ")) {
      elements.push(<blockquote key={key++}>{line.slice(2)}</blockquote>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={key++} />);
    } else if (line.startsWith("- **")) {
      const boldEnd = line.indexOf("**", 4);
      if (boldEnd > 0) {
        const boldText = line.slice(4, boldEnd);
        const rest = line.slice(boldEnd + 2);
        elements.push(
          <li key={key++}>
            <strong>{boldText}</strong>
            {rest}
          </li>,
        );
      } else {
        elements.push(<li key={key++}>{line.slice(2)}</li>);
      }
    } else if (line.startsWith("- ")) {
      elements.push(<li key={key++}>{line.slice(2)}</li>);
    } else if (line.trim() === "") {
      // skip
    } else {
      // Handle inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(<p key={key++}>{rendered}</p>);
    }
  }

  return elements;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const TopicDetailPage = ({ topicId }: { topicId: string }) => {
  const { data: transcripts, loading: loadingList, error: listError } = useTranscriptions();
  const transcriptMeta = useMemo(() => transcripts.find((t) => t.id === topicId) ?? null, [transcripts, topicId]);
  const { data: transcript, loading: loadingTranscript, error: transcriptError } = useTranscriptionData(topicId, { enabled: Boolean(topicId) });

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setSummaryError(null);
    if (!topicId) return;
    setSummaryLoading(true);
    fetchSummary(topicId)
      .then((res) => {
        if (cancelled) return;
        setSummary(res);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unable to load summary.";
        setSummaryError(message);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topicId]);

  useEffect(() => {
    if (chatMessages.length > 0) return;
    if (summary) {
      setChatMessages([
        {
          id: "summary",
          role: "assistant",
          text:
            summary.headline || summary.summary
              ? `**Summary**\n\n${summary.headline ? `${summary.headline}\n\n` : ""}${summary.summary || ""}`
              : "No summary available yet.",
        },
      ]);
      return;
    }
    if (summaryError) {
      setChatMessages([
        {
          id: "summary-error",
          role: "assistant",
          text: `Summary not available: ${summaryError}`,
        },
      ]);
    }
  }, [chatMessages.length, summary, summaryError]);

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);
    setChatLoading(true);

    try {
      const res = await askAssistant(text);
      const answer =
        res.type === "chart"
          ? "The assistant returned a chart response for this question. (Charts are not rendered here yet.)"
          : res.answer || "No answer returned.";
      setChatMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: answer }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to contact assistant.";
      setChatMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", text: `Sorry, I couldn't fetch an answer. ${message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const dateLabel = transcriptMeta ? formatTranscriptTitle(transcriptMeta.title) : "";

  if (!loadingList && !transcriptMeta && !listError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Transcript not found.</p>
        <a href="#/home" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>
          {"<- Back to feed"}
        </a>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "var(--msga-bg)" }}>
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
          href="#/home"
          className="msga-nav-item"
          onClick={(e) => {
            e.preventDefault();
            navigate("/home");
          }}
        >
          {"<- Home"}
        </a>
        {transcriptMeta && (
          <div className="msga-nav-item active" style={{ fontSize: "0.75rem" }}>
            {transcriptMeta.topic || "Council"}
          </div>
        )}
      </nav>

      {/* Main layout */}
      <div className="topic-detail-layout">
        {/* Left: Topic content */}
        <div className="topic-main">
          {listError && (
            <div className="msga-callout" style={{ color: "#b00020", borderColor: "#b00020" }}>
              {listError}
            </div>
          )}

          {transcriptMeta && (
            <div className="topic-meta">
              <span className="topic-committee-tag">{transcriptMeta.topic || "Council"}</span>
              <span className="topic-date">{dateLabel}</span>
            </div>
          )}

          <h1 className="topic-title">{transcriptMeta?.title || "Meeting transcript"}</h1>

          {summaryLoading && <p style={{ color: "#666" }}>Loading summary…</p>}
          {summaryError && (
            <div className="msga-callout" style={{ color: "#b00020", borderColor: "#b00020" }}>
              {summaryError}
            </div>
          )}

          {summary?.headline && <p className="topic-description">{summary.headline}</p>}
          {summary?.summary && (
            <p className="topic-description" style={{ lineHeight: 1.6 }}>
              {summary.summary}
            </p>
          )}

          {(summary?.bullet_points?.length || summary?.bullets?.length) && (
            <>
              <div className="topic-section-header">Key points</div>
              <ul className="topic-other-questions">
                {(summary.bullet_points || summary.bullets || []).slice(0, 6).map((bp, idx) => (
                  <li key={idx}>{bp}</li>
                ))}
              </ul>
            </>
          )}

          <div className="topic-section-header">Transcript</div>
          {loadingTranscript && <p style={{ color: "#666" }}>Loading transcript…</p>}
          {transcriptError && (
            <div className="msga-callout" style={{ color: "#b00020", borderColor: "#b00020" }}>
              {transcriptError}
            </div>
          )}
          {transcript && (
            <div className="topic-transcript">
              {transcript.lines.slice(0, 80).map((line) => (
                <div key={line.index} className="transcript-line">
                  <span className="transcript-speaker">{line.speaker}</span>
                  <span className="transcript-text">{line.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Chat panel */}
        <div className="topic-chat-panel">
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--msga-border)",
              background: "white",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: "var(--msga-font-heading)",
              color: "var(--msga-text)",
            }}
          >
            Ask about this topic
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                {msg.role === "assistant" ? renderChatMarkdown(msg.text) : msg.text}
              </div>
            ))}
            {chatLoading && <div className="chat-thinking">Working…</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask a question about this topic…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSend();
                }
              }}
            />
            <button className="chat-send-btn" onClick={handleChatSend} disabled={chatLoading}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailPage;
