import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildArgumentMap,
  fetchArgumentMap,
  openProgressSocket,
  type ArgumentMapPayload,
  type ArgumentMapResponse,
} from "../api";

type ProgressStatus = "idle" | "fetching" | "queued" | "running" | "finished" | "error";

type Progress = {
  status: ProgressStatus;
  message?: string;
};

type Options = {
  autoStart?: boolean;
};

type UseArgumentMapResult = {
  data: ArgumentMapResponse | null;
  payload: ArgumentMapPayload | null;
  progress: Progress;
  error: string | null;
  ensure: () => Promise<void>;
  reset: () => void;
};

export function useArgumentMap(
  transcriptId: string | null | undefined,
  options: Options = {},
): UseArgumentMapResult {
  const [data, setData] = useState<ArgumentMapResponse | null>(null);
  const [progress, setProgress] = useState<Progress>({ status: "idle" });
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const isMountedRef = useRef(true);
  const latestIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const closeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    closeSocket();
    setData(null);
    setError(null);
    setProgress({ status: "idle" });
  }, [closeSocket]);

  useEffect(() => {
    reset();
    latestIdRef.current = transcriptId ?? null;
  }, [reset, transcriptId]);

  const ensure = useCallback(async () => {
    if (!transcriptId) {
      setError("Load a transcript first.");
      return;
    }

    // Avoid duplicate work when already loaded.
    if (
      data &&
      progress.status === "finished" &&
      (data.transcript_id ?? transcriptId) === transcriptId
    ) {
      return;
    }

    const targetId = transcriptId;
    latestIdRef.current = targetId;

    const guard = () => isMountedRef.current && latestIdRef.current === targetId;

    try {
      setError(null);
      setProgress({ status: "fetching" });

      const existing = await fetchArgumentMap(targetId);
      if (!guard()) return;

      if (existing) {
        setData(existing);
        setProgress({ status: "finished" });
        return;
      }

      setProgress({ status: "queued" });
      const start = await buildArgumentMap({ transcript_id: targetId });
      if (!guard()) return;

      if (start.status === "already_exists") {
        const found = await fetchArgumentMap(targetId);
        if (found) {
          setData(found);
          setProgress({ status: "finished" });
          return;
        }
      }

      if (!start.room_id) {
        const message = "Unable to start key items job.";
        setError(message);
        setProgress({ status: "error", message });
        return;
      }

      closeSocket();
      const socket = openProgressSocket(start.room_id, (payload) => {
        if (!guard()) return;
        if (typeof payload === "string") return;

        const dataPayload = payload as Record<string, any>;
        if (dataPayload.job !== "argument_map") return;

        const stage = dataPayload.stage as string | undefined;
        if (!stage) return;

        if (stage === "queued" || stage === "running") {
          setProgress({ status: stage as ProgressStatus });
          return;
        }

        if (stage === "finished") {
          setProgress((prev) => ({ ...prev, status: "finished" }));
          return;
        }

        if (stage === "result") {
          const argument_map = (dataPayload.argument_map ?? {}) as ArgumentMapPayload;
          setData({
            transcript_id:
              (dataPayload.transcript_id ??
                start.transcript_id ??
                targetId) as string | undefined,
            argument_map_file: dataPayload.argument_map_file ?? start.argument_map_file ?? null,
            argument_map,
          });
          setProgress((prev) => ({ ...prev, status: "finished" }));
          closeSocket();
          return;
        }

        if (stage === "error") {
          const message = (dataPayload.message as string) || "Key items failed.";
          setError(message);
          setProgress({ status: "error", message });
          closeSocket();
        }
      });

      socketRef.current = socket;
    } catch (err) {
      if (!guard()) return;
      const message = err instanceof Error ? err.message : "Failed to load key items.";
      setError(message);
      setProgress({ status: "error", message });
    }
  }, [closeSocket, data, progress.status, transcriptId]);

  useEffect(() => {
    if (options.autoStart && transcriptId) {
      void ensure();
    }
  }, [ensure, options.autoStart, transcriptId]);

  const payload = useMemo<ArgumentMapPayload | null>(() => {
    if (!data) return null;
    return (data.argument_map as ArgumentMapPayload) ?? null;
  }, [data]);

  return {
    data,
    payload,
    progress,
    error,
    ensure,
    reset,
  };
}
