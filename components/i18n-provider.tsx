"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  LANGUAGES,
  type Language,
  isLanguage,
  translate
} from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils/cn";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem("aika_language");
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("aika_language="))
      ?.split("=")[1];
    const browser = navigator.language.slice(0, 2);
    const next = isLanguage(stored) ? stored : isLanguage(cookie) ? cookie : isLanguage(browser) ? browser : DEFAULT_LANGUAGE;
    setLanguageState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem("aika_language", nextLanguage);
        document.cookie = `aika_language=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
        void fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: nextLanguage })
        }).catch(() => undefined);
      },
      t: (key, values) => translate(language, key, values)
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-md border border-border bg-background/50 p-1", className)}
      aria-label={t("common.language")}
    >
      {LANGUAGES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={cn(
            "h-8 rounded px-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
            language === item && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          )}
        >
          {LANGUAGE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
