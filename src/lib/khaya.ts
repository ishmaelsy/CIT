const KHAYA_TRANSLATE_BASE = "https://translation-api.ghananlp.org/v1";
const KHAYA_TTS_BASE = "https://translation-api.ghananlp.org/tts/v1";

export type KhayaLangCode = "tw" | "ee" | "gaa" | "dag" | "fat" | "gur" | "nzi" | "ki";

export interface KhayaLanguage {
  code: KhayaLangCode;
  name: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: KhayaLanguage[] = [
  { code: "tw", name: "Twi", nativeName: "Twi", region: "Ashanti, Eastern, Western" },
  { code: "ee", name: "Ewe", nativeName: "Eʋegbe", region: "Volta, Oti" },
  { code: "gaa", name: "Ga", nativeName: "Gã", region: "Greater Accra" },
  { code: "dag", name: "Dagbani", nativeName: "Dagbanli", region: "Northern, North East" },
  { code: "fat", name: "Fante", nativeName: "Mfantse", region: "Central, Western" },
  { code: "gur", name: "Gurene", nativeName: "Gurɛnɛ", region: "Upper East" },
  { code: "nzi", name: "Nzema", nativeName: "Nzema", region: "Western" },
];

function getApiKey(): string | null {
  return import.meta.env.VITE_KHAYA_API_KEY || null;
}

const translationCache = new Map<string, string>();

function cacheKey(text: string, langPair: string): string {
  return `${langPair}::${text.slice(0, 200)}`;
}

export async function translateText(
  text: string,
  targetLang: KhayaLangCode,
  direction: "en-to-local" | "local-to-en" = "en-to-local"
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Translation API key not configured");

  const langPair =
    direction === "en-to-local" ? `en-${targetLang}` : `${targetLang}-en`;
  const key = cacheKey(text, langPair);
  const cached = translationCache.get(key);
  if (cached) return cached;

  const res = await fetch(`${KHAYA_TRANSLATE_BASE}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify({ in: text, lang: langPair }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Translation failed");
    throw new Error(`Translation error (${res.status}): ${msg}`);
  }

  const result = await res.json();
  const translated = typeof result === "string" ? result : result?.translatedText ?? result;
  const output = String(translated);

  translationCache.set(key, output);
  return output;
}

export async function translateBatch(
  texts: string[],
  targetLang: KhayaLangCode
): Promise<string[]> {
  return Promise.all(texts.map((t) => translateText(t, targetLang)));
}

export function isKhayaConfigured(): boolean {
  return !!getApiKey();
}

// TTS voices confirmed working — others return ParametersError from the API
export const TTS_LANGUAGES: KhayaLangCode[] = ["tw", "ee"];

const ttsBlacklist = new Set<KhayaLangCode>();

export function isTTSSupported(lang: KhayaLangCode): boolean {
  return TTS_LANGUAGES.includes(lang) && !ttsBlacklist.has(lang);
}

const ttsCache = new Map<string, string>();

function ttsCacheKey(text: string, lang: string): string {
  return `tts::${lang}::${text.slice(0, 100)}`;
}

export async function synthesizeSpeech(
  text: string,
  language: KhayaLangCode
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("TTS API key not configured");

  const key = ttsCacheKey(text, language);
  const cached = ttsCache.get(key);
  if (cached) return cached;

  const res = await fetch(`${KHAYA_TTS_BASE}/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "TTS failed");
    throw new Error(`TTS error (${res.status}): ${msg}`);
  }

  const contentType = res.headers.get("content-type") || "";

  // API sometimes returns JSON error body with 200 status
  if (contentType.includes("application/json") || contentType.includes("text/")) {
    const body = await res.text();
    // Permanently mark this language as unsupported so we stop showing it
    if (body.includes("ParametersError") || body.includes("cannot be used")) {
      ttsBlacklist.add(language);
    }
    const langName = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name ?? language;
    throw new Error(`Voice not available for ${langName} yet`);
  }

  const arrayBuffer = await res.arrayBuffer();
  if (arrayBuffer.byteLength < 100) {
    throw new Error(`TTS returned empty or invalid audio for ${language}`);
  }

  // Force correct MIME type so the browser can decode it
  const mimeType = contentType.includes("audio/") ? contentType : "audio/mpeg";
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  ttsCache.set(key, url);
  return url;
}

export function getDefaultLanguageForRegion(region: string): KhayaLangCode | null {
  const map: Record<string, KhayaLangCode> = {
    Ashanti: "tw",
    Eastern: "tw",
    "Bono East": "tw",
    Bono: "tw",
    Ahafo: "tw",
    Volta: "ee",
    Oti: "ee",
    "Greater Accra": "gaa",
    Northern: "dag",
    "North East": "dag",
    Savannah: "dag",
    Central: "fat",
    Western: "fat",
    "Western North": "fat",
    "Upper East": "gur",
    "Upper West": "gur",
  };
  return map[region] ?? null;
}
