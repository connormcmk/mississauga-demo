import { useCallback, useEffect, useRef, useState } from "react";
import { sliceAudioByTranscript } from "../api";

type Range = { start: number; end: number } | null;

type UseAudioSnippetsResult = {
  audioUrls: Record<string, string>;
  audioLoading: Record<string, boolean>;
  audioError: Record<string, string | undefined>;
  playSnippet: (key: string, range: Range) => Promise<void>;
  reset: () => void;
  dismiss: (key: string) => void;
};

export function useAudioSnippets(
  transcriptId: string | null | undefined,
): UseAudioSnippetsResult {
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [audioLoading, setAudioLoading] = useState<Record<string, boolean>>({});
  const [audioError, setAudioError] = useState<Record<string, string | undefined>>(
    {},
  );

  const isMountedRef = useRef(true);
  const audioUrlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    isMountedRef.current = true;
    audioUrlsRef.current = audioUrls;
  }, [audioUrls]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Object.values(audioUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const reset = useCallback(() => {
    Object.values(audioUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    setAudioUrls({});
    setAudioLoading({});
    setAudioError({});
  }, []);

  const dismiss = useCallback((key: string) => {
    const current = audioUrlsRef.current[key];
    if (current) {
      URL.revokeObjectURL(current);
    }
    setAudioUrls((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setAudioLoading((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setAudioError((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    reset();
  }, [reset, transcriptId]);

  const playSnippet = useCallback(
    async (key: string, range: Range) => {
      if (!range) {
        setAudioError((prev) => ({
          ...prev,
          [key]: "No timestamp available for this question.",
        }));
        return;
      }
      if (!transcriptId) {
        setAudioError((prev) => ({
          ...prev,
          [key]: "Select a transcript first.",
        }));
        return;
      }

      setAudioError((prev) => ({ ...prev, [key]: undefined }));
      setAudioLoading((prev) => ({ ...prev, [key]: true }));

      try {
        if (audioUrlsRef.current[key]) {
          URL.revokeObjectURL(audioUrlsRef.current[key]);
        }

        const { url } = await sliceAudioByTranscript({
          transcript_id: transcriptId,
          start: range.start,
          end: range.end,
          output_format: "mp3",
        });

        if (!isMountedRef.current) return;

        setAudioUrls((prev) => ({ ...prev, [key]: url }));
      } catch (err) {
        if (!isMountedRef.current) return;
        setAudioError((prev) => ({
          ...prev,
          [key]:
            err instanceof Error
              ? err.message
              : "Failed to load audio snippet.",
        }));
      } finally {
        if (isMountedRef.current) {
          setAudioLoading((prev) => ({ ...prev, [key]: false }));
        }
      }
    },
    [transcriptId],
  );

  return { audioUrls, audioLoading, audioError, playSnippet, reset, dismiss };
}
