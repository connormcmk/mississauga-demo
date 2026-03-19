import { useCallback, useEffect, useRef, useState } from "react";
import { listTranscriptions, type TranscriptListItem } from "../api";

type UseTranscriptionsResult = {
  data: TranscriptListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTranscriptions(): UseTranscriptionsResult {
  const [data, setData] = useState<TranscriptListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listTranscriptions();
      console.log(items);
      if (!isMountedRef.current) return;
      setData(items);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error ? err.message : "Failed to load transcriptions.";
      setError(message);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
