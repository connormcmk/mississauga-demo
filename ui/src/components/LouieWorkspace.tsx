import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { formatDuration } from "../utils/formatDuration";
import { formatTranscriptTitle } from "../utils/formatTranscriptTitle";
import { useTranscriptions } from "../hooks/useTranscriptions";
import { useTranscriptionData } from "../hooks/useTranscriptionData";
import { useArgumentMap } from "../hooks/useArgumentMap";
import { useAudioSnippets } from "../hooks/useAudioSnippets";
import { motion, AnimatePresence } from "motion/react";

const brandBlue = "#0057A8";

const suggestedPrompts = [
  "What was discussed in the Combat Discrimination Meeting",
  "How many Budget meetings took place this year",
  "What are the most relevant results from this year's budget meetings",
];


const louieIcon = (
  <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden>
    <rect x="1" y="1" width="14" height="10" rx="2.5" fill="currentColor" />
    <circle cx="5" cy="6" r="1.3" fill="white" />
    <circle cx="8" cy="6" r="1.3" fill="white" />
    <circle cx="11" cy="6" r="1.3" fill="white" />
    <path
      d="M4 13 L6.5 11h3"
      stroke="white"
      strokeWidth={1.4}
      fill="none"
      strokeLinejoin="round"
    />
  </svg>
);

const LouieWorkspace = ({
  initialTranscriptId,
  soloView = false,
  onAsk,
}: {
  initialTranscriptId?: string | null;
  soloView?: boolean;
  onAsk?: (text: string) => void;
}) => {
  const tab: "graph" = "graph";
  const { data: transcripts, loading: loadingTranscripts, error: listError } = useTranscriptions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    loading: loadingTranscript,
    error: transcriptError,
  } = useTranscriptionData(selectedId, { enabled: Boolean(selectedId) });

  const {
    payload: argumentPayload,
    progress: argumentProgress,
    error: argumentError,
    ensure: ensureArgumentMap,
  } = useArgumentMap(selectedId);

  const { audioUrls, audioLoading, audioError, playSnippet, dismiss } = useAudioSnippets(selectedId);

  const [prompt, setPrompt] = useState("");
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const askInputRef = useRef<HTMLInputElement | null>(null);
  const [askMode, setAskMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestionKey, setActiveQuestionKey] = useState<string | null>(null);

  useEffect(() => {
    if (!transcripts.length) return;
    if (initialTranscriptId) {
      setSelectedId((prev) => {
        if (prev && transcripts.some((t) => t.id === prev)) return prev;
        const preferred =
          initialTranscriptId &&
          transcripts.find((t) => t.id === initialTranscriptId)?.id;
        return preferred ?? transcripts[0].id;
      });
    }
  }, [initialTranscriptId, transcripts]);

  useEffect(() => {
    if (tab === "graph" && selectedId) {
      void ensureArgumentMap();
    }
  }, [tab, selectedId, ensureArgumentMap]);

  useEffect(() => {
    setActiveQuestionKey(null);
    setOpenQuestions({});
  }, [selectedId]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof transcripts> = {};
    transcripts.forEach((t) => {
      const topic = t.topic || "Council";
      if (!groups[topic]) groups[topic] = [];
      groups[topic].push(t);
    });
    return groups;
  }, [transcripts]);

  const topics = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const selectedMeta = useMemo(
    () => transcripts.find((t) => t.id === selectedId) ?? null,
    [transcripts, selectedId],
  );

  const currentMeetingLabel = useMemo(() => {
    if (!selectedMeta) return "Select a meeting";
    return `${formatTranscriptTitle(selectedMeta.title)}`;
  }, [selectedMeta]);

  const dateFromTitle = (title?: string | null) => {
    if (!title) return "";
    const match = title.match(/\b(\w{3,9}\s+\d{1,2},\s*\d{4})/i);
    return match ? match[1] : title;
  };

  const argumentBusy = ["fetching", "queued", "running"].includes(argumentProgress.status);

  const parseTimestampRange = (input?: string | null): { start: number; end: number } | null => {
    if (!input) return null;
    const cleaned = input.replace(/[\[\]\s]/g, "");
    const parts = cleaned.split(/[-–]/);
    if (parts.length !== 2) return null;
    const toSeconds = (raw: string) =>
      raw.includes(":")
        ? raw.split(":").reduce((acc, cur) => acc * 60 + Number(cur), 0)
        : Number(raw);
    const start = toSeconds(parts[0]);
    const end = toSeconds(parts[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return { start, end };
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAskMode(false);
        setSearchFocused(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openTranscriptSolo = (id: string) => {
    if (soloView) {
      setSelectedId(id);
      return;
    }
    window.location.hash = `#/workspace?transcript=${encodeURIComponent(id)}&solo=1`;
  };

  const exitSoloView = () => {
    window.location.hash = "#/workspace";
    setSelectedId(null);
  };

  const handleSend = (value?: string) => {
    const text = (value ?? prompt).trim();
    if (!text) return;
    setPrompt("");
    setSearchFocused(false);
    setAskMode(false);
    if (onAsk) {
      onAsk(text);
    } else {
      window.location.hash = "/chat";
    }
  };

  const handleSelectQuestion = (key: string) => {
    setActiveQuestionKey(key);
    setOpenQuestions((prev) => ({ ...prev, [key]: true }));
  };

  const coreQuestions = argumentPayload?.argument_map?.core_questions ?? [];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* City header + nav */}
      <Box sx={{ background: brandBlue, height: 52, display: "flex", alignItems: "center", px: 2 }}>
        <Typography sx={{ color: "white", fontSize: 15, fontWeight: 700, letterSpacing: 1.5 }}>
          ⊠ MISSISSAUGA
        </Typography>
      </Box>
      <Box
        sx={{
          background: "#1a6fc4",
          display: "flex",
          px: 2,
          overflowX: "auto",
          gap: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {["Services and programs", "Council", "Our organization", "Events and attractions", "Projects and strategies"].map(
          (label, idx) => (
            <Box
              key={label}
              sx={{
                fontSize: 12,
                color: idx === 1 ? "white" : "rgba(255,255,255,0.85)",
                px: 1.75,
                py: 1.2,
                borderBottom: idx === 1 ? "3px solid white" : "3px solid transparent",
                whiteSpace: "nowrap",
                fontWeight: idx === 1 ? 600 : 400,
              }}
            >
              {label}
            </Box>
          ),
        )}
      </Box>

      <Box sx={{ px: 2.5, py: 2, width: "100%" }}>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography sx={{ fontSize: 12, color: "#555", mb: 1.4 }}>
            <Box component="span" sx={{ color: brandBlue, cursor: "pointer" }}>
              Home
            </Box>
            <Box component="span" sx={{ mx: 0.6, color: "#aaa" }}>
              /
            </Box>
            <Box component="span" sx={{ color: brandBlue, cursor: "pointer" }}>
              Council
            </Box>
            <Box component="span" sx={{ mx: 0.6, color: "#aaa" }}>
              /
            </Box>
             <Box component="span" sx={{ mx: 0.6, color: brandBlue }}>
              Council activities
            </Box>
           {soloView && <><Box component="span" sx={{ mx: 0.6, color: "#aaa" }}>
              /
            </Box>
            {selectedId}</>}
          </Typography>
          {soloView && selectedId && (
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={exitSoloView}
              sx={{ mb: 1.5, color: brandBlue }}
            >
              Back
            </Button>
          )}
        </Box>

        {!soloView && (
          <>
            {!searchFocused && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 1,
                  mb: 2,
                }}
              >
                <motion.div
                  layout
                  animate={{
                    width: "min(520px, 90vw)",
                    scale: 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  style={{ width: "100%" }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search meetings…"
                    size="small"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            color="primary"
                            onClick={() => void handleSend(searchQuery)}
                          >
                            <SendRoundedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        background: "white",
                        borderRadius: 2,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        py: 0.6,
                      },
                    }}
                  />
                </motion.div>
              </Box>
            )}

            <AnimatePresence initial={false}>
              {searchFocused && (
                <motion.div
                  key="search-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1400,
                    background: "rgba(0,0,0,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                  }}
                  onClick={() => setSearchFocused(false)}
                >
                  <motion.div
                    layout
                    onClick={(e) => e.stopPropagation()}
                    animate={{ width: "min(860px, 90vw)", scale: 1.03 }}
                    initial={{ width: "min(520px, 90vw)", scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ width: "100%" }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search meetings…"
                      size="medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            color="primary"
                            onClick={() => void handleSend(searchQuery)}
                          >
                            <SendRoundedIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        background: "white",
                        borderRadius: 3,
                        boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
                        py: 1.2,
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                      {suggestedPrompts.map((chip) => (
                        <Chip
                          key={chip}
                          label={chip}
                          onClick={() => setSearchQuery(chip)}
                          sx={{ bgcolor: "white" }}
                        />
                      ))}
                    </Stack>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {!searchFocused && (
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", mb: 1.5, mt: 2 }}>
            Council and Committees calendar
          </Typography>
        )}

        {/* Search + list */}
        {!soloView && (
        <Stack spacing={1.25} sx={{ opacity: searchFocused ? 0 : 1, pointerEvents: searchFocused ? "none" : "auto" }}>
          {loadingTranscripts && <LinearProgress sx={{ borderRadius: 1 }} />}
          {listError ? <Alert severity="error">{listError}</Alert> : null}

          {topics.map((topic) => {
            const items = grouped[topic] ?? [];
            const collapsed = collapsedTopics[topic] ?? false;
            return (
              <Box
                key={topic}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  overflow: "hidden",
                  bgcolor: "white",
                }}
              >
                <Box
                  sx={{
                    bgcolor: brandBlue,
                    color: "white",
                    px: 2,
                    py: 1.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setCollapsedTopics((prev) => ({ ...prev, [topic]: !collapsed }))
                  }
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {collapsed ? (
                      <KeyboardArrowRightRoundedIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownRoundedIcon fontSize="small" />
                    )}
                    <span>{`${topic} (${items.length})`}</span>
                  </Stack>
                  <span>{collapsed ? "+" : "–"}</span>
                </Box>
                {!collapsed &&
                  items.map((item) => {
                    const isSelected = item.id === selectedId;
                    const label = dateFromTitle(item.title);
                    return (
                      <Box
                        key={item.id}
                      sx={{
                        borderTop: "1px solid #eee",
                        px: 2,
                        py: 1.4,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        alignItems: "flex-start",
                        bgcolor: isSelected ? "#f7fbff" : "white",
                        cursor: "pointer",
                      }}
                      onClick={() => openTranscriptSolo(item.id)}
                    >
                      <Stack spacing={0.4} sx={{ minWidth: 200, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: brandBlue,
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          {formatTranscriptTitle(item.title)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                          {label || "Meeting"} • {formatDuration(item.duration)} • {item.line_count} lines
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography sx={{ fontSize: 12, color: "#555" }}>☐ Transcript</Typography>
                                <Divider flexItem orientation="vertical" />
                                <Typography sx={{ fontSize: 12, color: "#555" }}>Agenda</Typography>
                                <Divider flexItem orientation="vertical" />
                                <Typography sx={{ fontSize: 12, color: "#555" }}>Minutes</Typography>
                                <Divider flexItem orientation="vertical" />
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: 12,
                            color: brandBlue,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTranscriptSolo(item.id);
                            void ensureArgumentMap();
                          }}
                        >
                          <StarBorderRoundedIcon fontSize="inherit" sx={{ mt: "-2px" }} />
                          Arg. Map
                        </Box>
                      </Stack>
                    </Box>
                  );
                  })}
              </Box>
            );
          })}
        </Stack>
        )}

        {/* Louie panel */}
        {selectedId && (
          <Box
            sx={{
              mt: 2,
              border: "1px solid #d6e2f0",
              borderRadius: "4px",
              overflow: "hidden",
              background: "white",
            }}
          >
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: "1px solid #e0e8f0" }}>
              <Stack direction="row" alignItems="center" spacing={1.25} mb={1}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "6px",
                    bgcolor: brandBlue,
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {louieIcon}
                </Box>
                <Stack spacing={0.2}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#222" }}>
                    {currentMeetingLabel}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#888" }}>
                    Argument graph + transcript chat
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1 }} />
                <Chip
                  label="Close"
                  size="small"
                  onClick={() => (soloView ? exitSoloView() : setSelectedId(null))}
                  sx={{ fontSize: 11, bgcolor: "#f5f5f5" }}
                />
              </Stack>

              <Typography sx={{ fontSize: 11, color: "#888", mb: 1 }}>
                {dateFromTitle(selectedMeta?.title)}
              </Typography>

              <Stack direction="row" spacing={3} sx={{ borderBottom: "1px solid #e0e8f0" }}>
                <Typography
                  component="button"
                  sx={{
                    border: "none",
                    background: "none",
                    fontSize: 13,
                    px: 1.8,
                    py: 0.8,
                    cursor: "pointer",
                    color: brandBlue ,
                    borderBottom: `2px solid ${brandBlue}`,
                    fontWeight: 600,
                  }}
                >
                  {"Key Items"}
                </Typography>
              </Stack>
              {loadingTranscript && <LinearProgress sx={{ borderRadius: 0, height: 3 }} />}
              {transcriptError ? <Alert severity="error" sx={{ mt: 1 }}>{transcriptError}</Alert> : null}
            </Box>

            <Box sx={{ bgcolor: "white", minHeight: 360 }}>
              {argumentError && <Alert severity="error">{argumentError}</Alert>}
              {argumentBusy && (
                <Stack spacing={0.5} p={2}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary">
                    {argumentProgress.status === "fetching"
                      ? "Loading key items…"
                      : argumentProgress.status === "queued"
                        ? "Key items queued"
                        : "Building key items…"}
                  </Typography>
                </Stack>
              )}
              {!argumentBusy && coreQuestions.length === 0 && (
                <Typography sx={{ p: 2, fontSize: 13, color: "#666" }}>
                  Open this tab to fetch key items. If none exist yet, we will start generating them.
                </Typography>
              )}

              {coreQuestions.length > 0 && (
                <Stack spacing={1.5} p={2}>
                  {activeQuestionKey && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography sx={{ fontSize: 13, color: "#0f172a" }}>
                        Showing 1 of {coreQuestions.length} key questions
                      </Typography>
                      <Button size="small" onClick={() => setActiveQuestionKey(null)}>
                        Back to all
                      </Button>
                    </Stack>
                  )}
                  {coreQuestions.map((cq, idx) => {
                    const key = `${selectedId ?? "q"}-${idx}`;
                    if (activeQuestionKey && activeQuestionKey !== key) return null;
                    const range = parseTimestampRange(cq.evidence?.[0]?.timestamp as string);
                    const speakers = Array.from(
                      new Set(
                        (cq.evidence ?? [])
                          .map((ev) => ev.speaker?.trim())
                          .filter((s): s is string => Boolean(s)),
                      ),
                    );
                    const isActive = activeQuestionKey === key;
                    const isOpen = isActive ? true : openQuestions[key] ?? false;
                    const showIframe = isActive && Boolean(cq.negation_url);
                    return (
                      <Box
                        key={`${cq.question}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectQuestion(key)}
                        sx={{
                          border: "1px solid #e0e8f0",
                          borderRadius: 2,
                          p: 1.25,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.75,
                          background: "#fafcff",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenQuestions((prev) => ({ ...prev, [key]: !isOpen }));
                                setActiveQuestionKey(key);
                              }}
                            >
                              {isOpen ? (
                                <KeyboardArrowDownRoundedIcon fontSize="small" />
                              ) : (
                                <KeyboardArrowRightRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                            <Chip size="small" label={cq.type || "question"} color="primary" variant="outlined" />
                            {cq.unresolved && <Chip size="small" label="Unresolved" color="warning" variant="outlined" />}
                            {range && (
                              <Chip
                                size="small"
                                label={`[${formatDuration(range.start)} - ${formatDuration(range.end)}]`}
                                variant="outlined"
                              />
                            )}
                            {speakers.length > 0 &&
                              speakers.map((name) => (
                                <Chip
                                  key={`${key}-${name}`}
                                  size="small"
                                  label={name}
                                  sx={{ bgcolor: "#eef4ff", color: "#234" }}
                                />
                              ))}
                          </Stack>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              void playSnippet(`${key}-question`, range);
                              handleSelectQuestion(key);
                            }}
                            disabled={!range}
                          >
                            {audioLoading[`${key}-question`] ? (
                              <CircularProgress size={18} thickness={6} />
                            ) : (
                              <PlayArrowRoundedIcon />
                            )}
                          </IconButton>
                        </Stack>

                        <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>
                          {cq.question || "Question"}
                        </Typography>

                        {range && (
                          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                            Timestamp: {formatDuration(range.start)} - {formatDuration(range.end)}
                          </Typography>
                        )}

                        {audioUrls[`${key}-question`] && (
                          <Box
                            sx={{
                              mt: 0.75,
                              border: "1px solid #d6e2f0",
                              borderRadius: 1.5,
                              p: 0.75,
                              bgcolor: "#f8fbff",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <audio
                              controls
                              autoPlay
                              src={audioUrls[`${key}-question`]}
                              style={{ flex: 1 }}
                              onEnded={() => dismiss(`${key}-question`)}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismiss(`${key}-question`);
                              }}
                            >
                              Close
                            </Button>
                          </Box>
                        )}

                        {showIframe && (
                          <Box
                            sx={{
                              mt: 1,
                              border: "1px solid #d6e2f0",
                              borderRadius: 1.5,
                              overflow: "hidden",
                              bgcolor: "#f5f8ff",
                            }}
                          >
                            <Typography sx={{ px: 1.25, pt: 1, pb: 0.75, fontSize: 12, fontWeight: 700, color: brandBlue }}>
                              Negation view
                            </Typography>
                            <Box
                              component="iframe"
                              src={cq.negation_url as string}
                              title={`negation-${key}`}
                              sx={{ width: "100%", minHeight: 420, border: "none", bgcolor: "white" }}
                              allow="autoplay; encrypted-media; clipboard-write"
                            />
                          </Box>
                        )}

                        {isOpen && (
                          <>
                            {Array.isArray(cq.options_or_claims) && cq.options_or_claims.length > 0 && (
                              <Stack spacing={0.4}>
                                {cq.options_or_claims.map((opt, i) => (
                                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                                    <Chip size="small" label={opt.label || `Option ${i + 1}`} color="secondary" variant="outlined" />
                                    <Typography sx={{ fontSize: 13 }}>{opt.claim}</Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            )}
                            {Array.isArray(cq.evidence) && cq.evidence.length > 0 && (
                              <Stack spacing={0.5} mt={0.5}>
                                <Typography sx={{ fontSize: 12, color: "#777" }}>Evidence</Typography>
                                {cq.evidence.map((ev, evIdx) => {
                                  const evKey = `${key}-ev-${evIdx}`;
                                  const evRange = parseTimestampRange(ev.timestamp as string);
                                  return (
                                    <Box key={evKey}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void playSnippet(evKey, evRange);
                                          }}
                                          disabled={!evRange}
                                          hidden={!!audioUrls[evKey]}
                                        >
                                          {audioLoading[evKey] ? (
                                            <CircularProgress size={18} thickness={6} />
                                          ) : (
                                            <PlayArrowRoundedIcon />
                                          )}
                                        </IconButton>
                                        <Typography sx={{ fontSize: 13, color: "#444" }}>
                                      {ev.timestamp ? `[${formatDuration(evRange?.start)} - ${formatDuration(evRange?.end)}] ` : ""}
                                      {ev.speaker ? `${ev.speaker}: ` : ""}
                                      “{ev.quote}”
                                    </Typography>
                                  </Stack>
                                  {audioUrls[evKey] && (
                                    <Box
                                      sx={{
                                        mt: 0.75,
                                        border: "1px solid #d6e2f0",
                                        borderRadius: 1.5,
                                        p: 0.75,
                                        bgcolor: "#f8fbff",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <audio
                                        controls
                                        autoPlay
                                        src={audioUrls[evKey]}
                                        style={{ flex: 1 }}
                                        onEnded={() => dismiss(evKey)}
                                      />
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dismiss(evKey);
                                        }}
                                      >
                                        Close
                                      </Button>
                                    </Box>
                                  )}
                                      {audioError[evKey] && (
                                        <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.25 }}>
                                          {audioError[evKey]}
                                        </Typography>
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
                          </>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {askMode && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            bgcolor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: 3,
          }}
          onClick={() => setAskMode(false)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: "min(860px, 100%)",
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
              Ask anything about the transcripts
            </Typography>
            <TextField
              fullWidth
              value={prompt}
              placeholder="Type your question…"
              inputRef={askInputRef}
              autoFocus
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                  setAskMode(false);
                }
              }}
              InputProps={{
                sx: {
                  borderRadius: "14px",
                  fontSize: 16,
                  py: 1.2,
                },
              }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {[
                "What was discussed in this meeting?",
                "Summarize the key decisions and owners.",
                "List quotes from the mayor about budget.",
                "Give me action items with deadlines.",
              ].map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  onClick={() => {
                    setPrompt(chip);
                    askInputRef.current?.focus();
                    askInputRef.current?.select();
                  }}
                  sx={{
                    borderRadius: "18px",
                    borderColor: "#d0d8e8",
                    color: "#0f172a",
                    "&:hover": { borderColor: brandBlue, color: brandBlue },
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setAskMode(false)}>Cancel</Button>
              <Button variant="contained" onClick={() => { void handleSend(); setAskMode(false); }}>
                Ask
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LouieWorkspace;
