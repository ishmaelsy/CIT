import { Volume2, Square, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SUPPORTED_LANGUAGES,
  TTS_LANGUAGES,
  isTTSSupported,
  getDefaultLanguageForRegion,
  isKhayaConfigured,
  type KhayaLangCode,
} from "@/lib/khaya";
import { useTTS, type TTSState } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

interface ListenButtonProps {
  text: string;
  className?: string;
}

const stateIcon: Record<TTSState, typeof Volume2> = {
  idle: Volume2,
  loading: Loader2,
  playing: Square,
  paused: Play,
};

const stateLabel: Record<TTSState, string> = {
  idle: "Listen",
  loading: "Loading...",
  playing: "Stop",
  paused: "Resume",
};

const ListenButton = ({ text, className }: ListenButtonProps) => {
  const { profile } = useAuth();
  const { speak, stop, resume, state, configured } = useTTS();

  const defaultLang =
    (localStorage.getItem("cit_preferred_lang") as KhayaLangCode) ||
    (profile?.region ? getDefaultLanguageForRegion(profile.region) : null) ||
    "tw";

  const [lang, setLang] = useState<KhayaLangCode>(
    isTTSSupported(defaultLang) ? defaultLang : "tw"
  );

  // Re-evaluate available languages each render (blacklist may grow at runtime)
  const ttsLangs = useMemo(
    () => SUPPORTED_LANGUAGES.filter((l) => isTTSSupported(l.code)),
    [state]
  );

  if (!configured || !isKhayaConfigured() || ttsLangs.length === 0) return null;

  const Icon = stateIcon[state];

  const handleClick = () => {
    if (state === "playing") {
      stop();
    } else if (state === "paused") {
      resume();
    } else {
      speak(text, lang);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2.5 text-xs gap-1.5"
        onClick={handleClick}
        disabled={state === "loading"}
        aria-label={stateLabel[state]}
      >
        <Icon
          className={`w-3.5 h-3.5 ${state === "loading" ? "animate-spin" : ""}`}
        />
        {stateLabel[state]}
      </Button>
      {state === "idle" && (
        <Select
          value={lang}
          onValueChange={(v) => setLang(v as KhayaLangCode)}
        >
          <SelectTrigger className="h-7 w-24 text-xs border-dashed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ttsLangs.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default ListenButton;
