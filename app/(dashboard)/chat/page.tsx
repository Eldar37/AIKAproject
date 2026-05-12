"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, CheckSquare, Send, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils/cn";
import { useAikaStore } from "@/store/useStore";

const modes = ["START_MODE", "GROWTH_MODE", "SCALE_MODE", "CONTENT_MODE", "FIRST_MONEY_MODE"];
const quickPromptKeys: Record<string, string[]> = {
  START_MODE: ["chat.quick.start1", "chat.quick.start2", "chat.quick.start3"],
  GROWTH_MODE: ["chat.quick.growth1", "chat.quick.growth2", "chat.quick.growth3"],
  SCALE_MODE: ["chat.quick.scale1", "chat.quick.scale2", "chat.quick.scale3"],
  CONTENT_MODE: ["chat.quick.content1", "chat.quick.content2", "chat.quick.content3"],
  FIRST_MONEY_MODE: ["chat.quick.money1", "chat.quick.money2", "chat.quick.money3"]
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { t } = useI18n();
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
      setMessages((current) => [...current, { role: "assistant", content: data.error ?? t("chat.aiUnavailable") }]);
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
    const title = content.split("\n").find(Boolean)?.replace(/^[-*\d.\s]+/, "").slice(0, 120) || t("chat.fallbackTitle");
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: content.slice(0, 480), type: "daily", priority: "medium", xpReward: 15 })
    });
    setNotice(response.ok ? t("chat.taskCreated") : t("chat.taskFailed"));
  }

  return (
    <div className="flex min-h-[calc(100svh-9.5rem)] flex-col xl:h-screen xl:min-h-0">
      <header className="border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-5 sm:py-4 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">{t("chat.kicker")}</p>
            <h1 className="break-words text-2xl font-bold leading-tight">{t("chat.title")}</h1>
          </div>
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => setAiMode(mode)}
                className={cn(
                  "shrink-0 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground",
                  aiMode === mode && "border-primary bg-primary/10 text-primary"
                )}
              >
                {t(`mode.${mode}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 sm:px-5 lg:px-8">
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-0 sm:py-4">
          {(quickPromptKeys[aiMode] ?? quickPromptKeys.START_MODE).map((promptKey) => (
            <Button key={promptKey} className="h-auto max-w-[78vw] shrink-0 whitespace-normal text-left" variant="outline" size="sm" onClick={() => send(t(promptKey))}>
              {t(promptKey)}
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-background/35 p-2 sm:p-3">
          {messages.length === 0 ? (
            <GlassPanel className="mx-auto mt-8 max-w-xl text-center sm:mt-12">
              <Bot className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold">{t("chat.emptyTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("chat.emptyText")}</p>
            </GlassPanel>
          ) : null}

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={`${message.id ?? index}-${message.role}`} className={cn("flex gap-2 sm:gap-3", message.role === "user" && "justify-end")}>
                {message.role === "assistant" ? (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                ) : null}
                <div className={cn("max-w-[88%] rounded-lg border border-border p-3 text-sm leading-6 sm:max-w-[86%] sm:p-4", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card")}>
                  <p className="break-anywhere whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" ? (
                    <Button variant="ghost" size="sm" className="mt-3 whitespace-normal text-left" onClick={() => createTask(message.content)}>
                      <CheckSquare className="h-4 w-4" />
                      {t("chat.createTask")}
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
            {loading ? <Badge className="border-primary/30 bg-primary/10 text-primary">{t("chat.loading")}</Badge> : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {notice ? <p className="py-2 text-sm text-secondary">{notice}</p> : null}
        <form onSubmit={submit} className="flex gap-2 py-3 sm:gap-3 sm:py-4">
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={t("chat.placeholder")} className="min-h-12 flex-1 resize-none sm:min-h-14" />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </main>
    </div>
  );
}
