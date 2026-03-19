import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTranscript, type TranscriptFull } from "../api";

type Options = {
  enabled?: boolean;
};

type UseTranscriptionDataResult = {
  data: TranscriptFull | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTranscriptionData(
  transcriptId: string | null | undefined,
  options: Options = {},
): UseTranscriptionDataResult {
  const [data, setData] = useState<TranscriptFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const latestRequestRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!transcriptId) {
      setData(null);
      setError(null);
      setLoading(false);
      latestRequestRef.current = null;
      return;
    }

    const targetId = transcriptId;
    latestRequestRef.current = targetId;
    setLoading(true);
    setError(null);

    try {
      const transcript = await fetchTranscript(targetId);
      if (!isMountedRef.current) return;
      if (latestRequestRef.current !== targetId) return;
      setData(transcript);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (latestRequestRef.current !== targetId) return;
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load transcript content.";
      setError(message);
    } finally {
      if (isMountedRef.current && latestRequestRef.current === targetId) {
        setLoading(false);
      }
    }
  }, [transcriptId]);

  useEffect(() => {
    if (options.enabled === false) return;
    void refetch();
  }, [refetch, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
