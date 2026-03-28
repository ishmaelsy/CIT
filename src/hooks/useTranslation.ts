import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  translateText,
  isKhayaConfigured,
  type KhayaLangCode,
} from "@/lib/khaya";
import { toast } from "sonner";

interface TranslationState {
  [fieldKey: string]: string;
}

export const useTranslation = () => {
  const [translations, setTranslations] = useState<TranslationState>({});
  const [activeLang, setActiveLang] = useState<KhayaLangCode | null>(null);
  const configured = isKhayaConfigured();

  const translateMutation = useMutation({
    mutationFn: async ({
      fields,
      lang,
    }: {
      fields: { key: string; text: string }[];
      lang: KhayaLangCode;
    }) => {
      const results: TranslationState = {};
      for (const field of fields) {
        if (!field.text.trim()) continue;
        results[field.key] = await translateText(field.text, lang);
      }
      return results;
    },
    onSuccess: (results, { lang }) => {
      setTranslations((prev) => ({ ...prev, ...results }));
      setActiveLang(lang);
    },
    onError: (e: Error) => {
      toast.error(`Translation failed: ${e.message}`);
    },
  });

  const translate = useCallback(
    (fields: { key: string; text: string }[], lang: KhayaLangCode) => {
      translateMutation.mutate({ fields, lang });
    },
    [translateMutation]
  );

  const clearTranslation = useCallback(() => {
    setTranslations({});
    setActiveLang(null);
  }, []);

  const getTranslated = useCallback(
    (key: string, original: string): string => {
      return translations[key] || original;
    },
    [translations]
  );

  return {
    translate,
    clearTranslation,
    getTranslated,
    isTranslating: translateMutation.isPending,
    isTranslated: activeLang !== null,
    activeLang,
    configured,
  };
};
