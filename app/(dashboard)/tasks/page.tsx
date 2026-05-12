"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/i18n-provider";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  priority: string;
  xpReward: number;
};

export default function TasksPage() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/tasks");
    if (response.ok) setTasks((await response.json()).tasks ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(id: string, status: "completed" | "skipped") {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json().catch(() => ({}));
    setMessage(data.suggestion ? t(data.suggestion) : "");
    await load();
  }

  async function generate() {
    await fetch("/api/tasks/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: true })
    });
    await load();
  }

  async function createTask() {
    if (!title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type: "daily", priority: "medium", xpReward: 15 })
    });
    setTitle("");
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">{t("tasks.kicker")}</p>
          <h1 className="mt-1 text-3xl font-bold">{t("tasks.title")}</h1>
        </div>
        <Button onClick={generate}>
          <RotateCcw className="h-4 w-4" />
          {t("common.generate")}
        </Button>
      </header>

      <GlassPanel className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("tasks.quickPlaceholder")} />
          <Button onClick={createTask}>
            <Plus className="h-4 w-4" />
            {t("common.add")}
          </Button>
        </div>
      </GlassPanel>

      {message ? <GlassPanel className="mt-4 border-primary/40 bg-primary/10 text-sm">{message}</GlassPanel> : null}

      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <GlassPanel key={task.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{t(task.title)}</h2>
                <Badge>{t(`task.priority.${task.priority}`)}</Badge>
                <Badge>{t(`task.type.${task.type}`)}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{task.description ? t(task.description) : null}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={task.status === "skipped"} onClick={() => update(task.id, "skipped")}>
                <XCircle className="h-4 w-4" />
                {t("common.skip")}
              </Button>
              <Button size="sm" variant={task.status === "completed" ? "secondary" : "default"} disabled={task.status === "completed"} onClick={() => update(task.id, "completed")}>
                <CheckCircle2 className="h-4 w-4" />
                {task.status === "completed" ? t("common.done") : `+${task.xpReward} XP`}
              </Button>
            </div>
          </GlassPanel>
        ))}
        {tasks.length === 0 ? <p className="text-sm text-muted-foreground">{t("tasks.empty")}</p> : null}
      </div>
    </div>
  );
}
