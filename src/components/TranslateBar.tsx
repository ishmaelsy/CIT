import { Languages, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SUPPORTED_LANGUAGES,
  getDefaultLanguageForRegion,
  isKhayaConfigured,
  type KhayaLangCode,
} from "@/lib/khaya";
import { useAuth } from "@/contexts/AuthContext";

interface TranslateBarProps {
  onTranslate: (lang: KhayaLangCode) => void;
  onClear: () => void;
  isTranslating: boolean;
  isTranslated: boolean;
  activeLang: KhayaLangCode | null;
}

const TranslateBar = ({
  onTranslate,
  onClear,
  isTranslating,
  isTranslated,
  activeLang,
}: TranslateBarProps) => {
  const { profile } = useAuth();

  if (!isKhayaConfigured()) return null;

  const suggested = profile?.region
    ? getDefaultLanguageForRegion(profile.region)
    : null;

  const activeName = activeLang
    ? SUPPORTED_LANGUAGES.find((l) => l.code === activeLang)?.name
    : null;

  if (isTranslated && activeName) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-sm text-xs">
        <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-foreground font-medium">
          Translated to {activeName}
        </span>
        <span className="text-muted-foreground">
          via Khaya AI
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-6 px-2 text-xs gap-1"
          onClick={onClear}
        >
          <X className="w-3 h-3" /> Original
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Languages className="w-3.5 h-3.5" />
        Read in:
      </span>
      {suggested && (
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs font-medium"
          onClick={() => onTranslate(suggested)}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : null}
          {SUPPORTED_LANGUAGES.find((l) => l.code === suggested)?.name}
        </Button>
      )}
      {SUPPORTED_LANGUAGES.filter((l) => l.code !== suggested).map((lang) => (
        <Button
          key={lang.code}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onTranslate(lang.code)}
          disabled={isTranslating}
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
};

export default TranslateBar;
