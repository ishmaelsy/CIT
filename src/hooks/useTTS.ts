import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  synthesizeSpeech,
  translateText,
  isKhayaConfigured,
  isTTSSupported,
  type KhayaLangCode,
} from "@/lib/khaya";
import { toast } from "sonner";

export type TTSState = "idle" | "loading" | "playing" | "paused";

export const useTTS = () => {
  const [state, setState] = useState<TTSState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const configured = isKhayaConfigured();

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
    setState("idle");
  }, []);

  const synthMutation = useMutation({
    mutationFn: async ({
      text,
      lang,
    }: {
      text: string;
      lang: KhayaLangCode;
    }) => {
      let translated: string;
      try {
        translated = await translateText(text, lang, "en-to-local");
      } catch (e: any) {
        throw new Error(`Translation step failed: ${e.message}`);
      }

      if (!translated.trim()) {
        throw new Error("Translation returned empty text");
      }

      try {
        return await synthesizeSpeech(translated, lang);
      } catch (e: any) {
        throw new Error(`Speech synthesis failed: ${e.message}`);
      }
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setState("idle");
    },
  });

  const speak = useCallback(
    async (text: string, lang: KhayaLangCode) => {
      if (!configured) return;
      if (!isTTSSupported(lang)) {
        toast.error(
          `Text-to-speech not available for this language yet`
        );
        return;
      }

      // If already playing, stop
      if (state === "playing" || state === "paused") {
        cleanup();
        return;
      }

      setState("loading");

      try {
        const url = await synthMutation.mutateAsync({ text, lang });
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener("ended", () => setState("idle"));
        audio.addEventListener("error", () => {
          toast.error("Audio playback failed");
          setState("idle");
        });

        await audio.play();
        setState("playing");
      } catch {
        setState("idle");
      }
    },
    [configured, state, cleanup, synthMutation]
  );

  const pause = useCallback(() => {
    if (audioRef.current && state === "playing") {
      audioRef.current.pause();
      setState("paused");
    }
  }, [state]);

  const resume = useCallback(() => {
    if (audioRef.current && state === "paused") {
      audioRef.current.play();
      setState("playing");
    }
  }, [state]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    speak,
    pause,
    resume,
    stop,
    state,
    configured,
    isTTSSupported,
  };
};
