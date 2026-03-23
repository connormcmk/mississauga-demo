import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { renderMarkdown } from "../utils/renderMarkdown";
import {
  askAssistant,
  type AssistantChart,
  type AssistantResponse,
  type AssistantSource,
} from "../api";

const suggestedPrompts = [
  "What was discussed in the Combat Discrimination Meeting",
  "How many Budget meetings took place this year",
  "What are the most relevant results from this year's budget meetings",
];

type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  chart?: AssistantChart;
  sources?: AssistantSource[];
};

export type { ChatEntry };

const ChatMessage = ({ role, text, chart, sources }: ChatEntry) => {
  const isUser = role === "user";
  const brandBlue = "#0057A8";
  const maxChart = useMemo(
    () => Math.max(1, ...(chart?.data?.map((d) => d.value) ?? [1])),
    [chart],
  );

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      justifyContent={isUser ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
          KB
        </Avatar>
      )}
      <Paper
        elevation={0}
        sx={(theme) => ({
          px: 2,
          py: 1.25,
          maxWidth: "90%",
          borderRadius: 2,
          bgcolor: isUser
            ? brandBlue
            : theme.palette.background.paper,
          color: isUser ? theme.palette.common.white : theme.palette.text.primary,
          border: isUser ? "none" : `1px solid ${theme.palette.divider}`,
          boxShadow: isUser
            ? "0 10px 30px rgba(0, 87, 168, 0.25)"
            : "none",
        })}
      >
        <Stack spacing={0.75} sx={{ lineHeight: 1.6 }}>
          {renderMarkdown(text)}
        </Stack>

        {!isUser && chart?.data?.length ? (
          <Box
            sx={{
              mt: 1.25,
              p: 1.25,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <BarChartRoundedIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary">
                Chart ({chart.type ?? "bar"})
              </Typography>
            </Stack>
            <Stack spacing={0.75} mt={1}>
              {chart.data.map((row, idx) => (
                <Stack
                  key={`${row.name}-${idx}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Typography variant="body2" sx={{ minWidth: 90 }}>
                    {row.name}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: "grey.200",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.min(100, Math.round((row.value / maxChart) * 100))}%`,
                        height: "100%",
                        bgcolor: "primary.main",
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : null}

        {!isUser && sources?.length ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" mt={1}>
            {sources.map((source, idx) => {
              const transcriptId = source.reportId;
              const href = transcriptId
                ? `#/workspace?transcript=${encodeURIComponent(transcriptId)}`
                : "#/workspace";
              return (
                <Chip
                  key={`${source.reportId ?? source.title ?? idx}`}
                  size="small"
                  icon={<InsightsRoundedIcon fontSize="small" />}
                  label={source.title ?? source.reportId ?? "Source"}
                  variant="outlined"
                  clickable
                  component="a"
                  href={href}
                  sx={{
                    padding: '4px'
                  }}
                />
              );
            })}
          </Stack>
        ) : null}
      </Paper>
      {isUser && (
        <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
          You
        </Avatar>
      )}
    </Stack>
  );
};

type ChatProps = {
  messages: ChatEntry[];
  setMessages: Dispatch<SetStateAction<ChatEntry[]>>;
  loadingExternal?: boolean;
  errorExternal?: string | null;
  onSend?: (text: string) => Promise<void>;
  classicShell?: boolean;
};

const Chat = ({
  messages,
  setMessages,
  loadingExternal,
  errorExternal,
  onSend,
  classicShell,
}: ChatProps) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const brandBlue = "#0057A8";

  const addMessage = (msg: Omit<ChatEntry, "id">) =>
    setMessages((prev) => [
      ...prev,
      { id: `${msg.role}-${Date.now()}-${prev.length}`, ...msg },
    ]);

  const handleSend = async (value?: string) => {
    const question = (value ?? prompt).trim();
    if (!question || loading || loadingExternal) return;

    setPrompt("");
    setError(null);
    setLoading(true);

    try {
      if (onSend) {
        await onSend(question);
      } else {
        addMessage({ role: "user", text: question });
        const response: AssistantResponse = await askAssistant(question);
        const answer =
          (response.answer ?? "").trim() ||
          (response.type === "chart"
            ? "Generated a chart based on the workspace knowledge."
            : "The assistant did not return an answer.");

        addMessage({
          role: "assistant",
          text: answer,
          chart: response.type === "chart" ? response.chart : undefined,
          sources: response.sources,
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not reach the assistant.";
      setError(message);
      if (!onSend) {
        addMessage({
          role: "assistant",
          text: "I hit an error while trying to answer that. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const conversations = ["Today", "Budget", "Road Safety", "Housing"];

  const chatPanel = (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        minHeight: 480,
        bgcolor: "#f7f8fa",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          width: 220,
          borderRight: "1px solid #e5ecf5",
          p: 2,
          bgcolor: "white",
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          Conversations
        </Typography>
        <Stack spacing={1}>
          {conversations.map((c, idx) => (
            <Box
              key={c}
              sx={{
                border: "1px solid #d6e2f0",
                borderRadius: 1.5,
                p: 1,
                bgcolor: idx === 0 ? "#e8f0fb" : "white",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {c}
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #e5ecf5",
            bgcolor: "white",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {suggestedPrompts.map((promptText) => (
              <Chip
                key={promptText}
                label={promptText}
                variant="outlined"
                sx={{ borderRadius: "12px" }}
                onClick={() => handleSend(promptText)}
              />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            bgcolor: "#f7f8fa",
          }}
        >
          {messages.map((msg) => (
            <ChatMessage
              id={msg.id}
              key={msg.id}
              role={msg.role}
              text={msg.text}
              chart={msg.chart}
              sources={msg.sources}
            />
          ))}
          {loading || loadingExternal ? (
            <Typography variant="body2" color="text.secondary" textAlign="left">
              Assistant is thinking…
            </Typography>
          ) : null}
          {error || errorExternal ? (
            <Alert severity="error" sx={{ maxWidth: 360 }}>
              {error || errorExternal}
            </Alert>
          ) : null}
        </Box>

        <Box
          sx={{
            borderTop: "1px solid #e5ecf5",
            bgcolor: "white",
            px: 2,
            py: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              placeholder="Ask about any video or transcript…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ChatBubbleOutlineRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: "#f7f8fb",
                },
              }}
            />
            <IconButton
              color={classicShell ? undefined : "primary"}
              size="large"
              disabled={loading || loadingExternal}
              onClick={() => handleSend()}
              sx={
                classicShell
                  ? {
                      bgcolor: brandBlue,
                      color: "white",
                      "&:hover": { bgcolor: "#0b5ebd" },
                    }
                  : undefined
              }
            >
              <SendRoundedIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  if (classicShell) {
    return (
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        <Box
          sx={{
            background: brandBlue,
            height: 52,
            display: "flex",
            alignItems: "center",
            px: 2,
          }}
        >
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
          {[
            "Services and programs",
            "Council",
            "Our organization",
            "Events and attractions",
            "Projects and strategies",
          ].map((label, idx) => (
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
          ))}
        </Box>

        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: brandBlue }}>
              Ask Anything
            </Typography>
            <Chip
              label="Classic view"
              size="small"
              sx={{ bgcolor: "#e9f2ff", color: brandBlue, borderColor: "transparent" }}
            />
          </Stack>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
              border: "1px solid #d7e3f5",
            }}
          >
            {chatPanel}
          </Box>
        </Box>
      </Box>
    );
  }

  return chatPanel;
};

export default Chat;
