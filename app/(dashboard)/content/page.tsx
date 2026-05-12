"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/i18n-provider";

const contentTypes = [
  { value: "instagram", label: "content.instagram" },
  { value: "story", label: "content.story" },
  { value: "ad", label: "content.ad" },
  { value: "product", label: "content.product" },
  { value: "plan", label: "content.plan" }
];
const platforms = ["Instagram", "TikTok", "Telegram", "WhatsApp"];

type HistoryItem = {
  id: string;
  type: string;
  prompt: string;
  result: string;
  platform?: string | null;
  createdAt: string;
};

export default function ContentPage() {
  const { t } = useI18n();
  const [type, setType] = useState("instagram");
  const [platform, setPlatform] = useState("Instagram");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    const response = await fetch("/api/content/history");
    if (response.ok) setHistory((await response.json()).history ?? []);
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    const response = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, platform, prompt })
    });

    setLoading(false);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? t("content.error"));
      return;
    }
    setResult(data.content.result);
    setPrompt("");
    await loadHistory();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-primary">{t("content.kicker")}</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{t("content.title")}</h1>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold">{t("common.type")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {contentTypes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={`min-w-0 rounded-md border px-3 py-2 text-left text-sm leading-5 ${type === item.value ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                  >
                    {t(item.label)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">{t("common.platform")}</p>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlatform(item)}
                    className={`min-w-0 rounded-md border px-3 py-2 text-sm ${platform === item ? "border-secondary bg-secondary/10 text-secondary" : "border-border"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={t("content.prompt")} required />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button disabled={loading || !prompt.trim()} className="w-full">
              {loading ? t("common.generating") : t("common.generate")}
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t("common.result")}</h2>
            {result ? (
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result)}>
                <Copy className="h-4 w-4" />
                {t("common.copy")}
              </Button>
            ) : null}
          </div>
          <div className="min-h-72 rounded-md border border-border bg-background/45 p-4">
            {result ? <p className="break-anywhere whitespace-pre-wrap text-sm leading-6">{result}</p> : <p className="text-sm text-muted-foreground">{t("content.ready")}</p>}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-4">
        <h2 className="mb-3 text-xl font-bold">{t("common.history")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {history.map((item) => (
            <GlassPanel key={item.id}>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>{t(`content.${item.type}`)}</Badge>
                <Badge>{item.platform}</Badge>
              </div>
              <p className="break-anywhere text-sm font-semibold">{item.prompt}</p>
              <p className="break-anywhere mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{item.result}</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(item.result)}>
                <Copy className="h-4 w-4" />
                {t("common.copy")}
              </Button>
            </GlassPanel>
          ))}
          {history.length === 0 ? (
            <GlassPanel>
              <FileText className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">{t("content.emptyHistory")}</p>
            </GlassPanel>
          ) : null}
        </div>
      </section>
    </div>
  );
}
