"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const contentTypes = [
  { value: "instagram", label: "Instagram post" },
  { value: "story", label: "Story" },
  { value: "ad", label: "Ad copy" },
  { value: "product", label: "Product description" },
  { value: "plan", label: "Content plan" }
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
      setError(data.error ?? "Не удалось сгенерировать контент.");
      return;
    }
    setResult(data.content.result);
    setPrompt("");
    await loadHistory();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-primary">Content engine</p>
        <h1 className="mt-1 text-3xl font-bold">Генератор контента</h1>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold">Тип</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {contentTypes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${type === item.value ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Платформа</p>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlatform(item)}
                    className={`rounded-md border px-3 py-2 text-sm ${platform === item ? "border-secondary bg-secondary/10 text-secondary" : "border-border"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Продукт, тема, акция или идея" required />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button disabled={loading || !prompt.trim()} className="w-full">
              {loading ? "Генерация..." : "Сгенерировать"}
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Результат</h2>
            {result ? (
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result)}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            ) : null}
          </div>
          <div className="min-h-72 rounded-md border border-border bg-background/45 p-4">
            {result ? <p className="whitespace-pre-wrap text-sm leading-6">{result}</p> : <p className="text-sm text-muted-foreground">Готовый текст появится здесь.</p>}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-4">
        <h2 className="mb-3 text-xl font-bold">История</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {history.map((item) => (
            <GlassPanel key={item.id}>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>{item.type}</Badge>
                <Badge>{item.platform}</Badge>
              </div>
              <p className="text-sm font-semibold">{item.prompt}</p>
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{item.result}</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(item.result)}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </GlassPanel>
          ))}
          {history.length === 0 ? (
            <GlassPanel>
              <FileText className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">История появится после первой генерации.</p>
            </GlassPanel>
          ) : null}
        </div>
      </section>
    </div>
  );
}
