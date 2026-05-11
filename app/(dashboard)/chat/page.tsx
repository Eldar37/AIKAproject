"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, CheckSquare, Send, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { useAikaStore } from "@/store/useStore";

const modes = ["START_MODE", "GROWTH_MODE", "SCALE_MODE", "CONTENT_MODE", "FIRST_MONEY_MODE"];
const quickPrompts: Record<string, string[]> = {
  START_MODE: ["Проверь мою идею", "Сделай оффер", "Кому написать первым?"],
  GROWTH_MODE: ["Как увеличить заявки?", "План сторис", "Собери отзывы"],
  SCALE_MODE: ["Какие метрики важны?", "Что делегировать?", "Где партнерства?"],
  CONTENT_MODE: ["5 хуков для Reels", "Пост для Instagram", "Telegram продажа"],
  FIRST_MONEY_MODE: ["План на 7 дней", "Скрипт сообщения", "Как получить предоплату?"]
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { aiMode, setAiMode } = useAikaStore();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [userRes, historyRes] = await Promise.all([fetch("/api/user"), fetch("/api/chat/history")]);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user?.business?.aiMode) setAiMode(userData.user.business.aiMode);
      }
      if (historyRes.ok) {
        const data = await historyRes.json();
        const first = data.conversations?.[0];
        if (first) {
          setConversationId(first.id);
          setMessages(first.messages ?? []);
        }
      }
    }
    void load();
  }, [setAiMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(message = input) {
    if (!message.trim() || loading) return;
    setInput("");
    setNotice("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: message }]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, mode: aiMode, conversationId })
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessages((current) => [...current, { role: "assistant", content: data.error ?? "AIKA сейчас недоступна. Проверь HF_API_KEY." }]);
      return;
    }

    const data = await response.json();
    setConversationId(data.conversationId);
    setMessages((current) => [...current, { id: data.message.id, role: "assistant", content: data.message.content }]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await send();
  }

  async function createTask(content: string) {
    const title = content.split("\n").find(Boolean)?.replace(/^[-*\d.\s]+/, "").slice(0, 120) || "Совет от AIKA";
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: content.slice(0, 480), type: "daily", priority: "medium", xpReward: 15 })
    });
    setNotice(response.ok ? "Задача создана." : "Не удалось создать задачу.");
  }

  return (
    <div className="flex h-screen flex-col xl:h-screen">
      <header className="border-b border-border bg-background/85 px-5 py-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">AI mentor</p>
            <h1 className="text-2xl font-bold">AIKA Chat</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => setAiMode(mode)}
                className={cn(
                  "rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground",
                  aiMode === mode && "border-primary bg-primary/10 text-primary"
                )}
              >
                {mode.replace("_MODE", "")}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-5 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4">
          {(quickPrompts[aiMode] ?? quickPrompts.START_MODE).map((prompt) => (
            <Button key={prompt} variant="outline" size="sm" onClick={() => send(prompt)}>
              {prompt}
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-background/35 p-3">
          {messages.length === 0 ? (
            <GlassPanel className="mx-auto mt-12 max-w-xl text-center">
              <Bot className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold">Рядом умный наставник</h2>
              <p className="mt-2 text-sm text-muted-foreground">AIKA отвечает с учетом твоего бизнеса, этапа, задач и каналов продаж.</p>
            </GlassPanel>
          ) : null}

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={`${message.id ?? index}-${message.role}`} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                {message.role === "assistant" ? (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                ) : null}
                <div className={cn("max-w-[86%] rounded-lg border border-border p-4 text-sm leading-6", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card")}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" ? (
                    <Button variant="ghost" size="sm" className="mt-3" onClick={() => createTask(message.content)}>
                      <CheckSquare className="h-4 w-4" />
                      Create task from this advice
                    </Button>
                  ) : null}
                </div>
                {message.role === "user" ? (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
            ))}
            {loading ? <Badge className="border-primary/30 bg-primary/10 text-primary">AIKA думает...</Badge> : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {notice ? <p className="py-2 text-sm text-secondary">{notice}</p> : null}
        <form onSubmit={submit} className="flex gap-3 py-4">
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Напиши вопрос про бизнес, продажи или контент" className="min-h-14 flex-1 resize-none" />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </main>
    </div>
  );
}
