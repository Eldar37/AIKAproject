"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, CheckCircle2, FileText, Flame, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  xpReward: number;
};

type UserPayload = {
  user: {
    name: string;
    profile?: { xp: number; level: number } | null;
    business?: { stage: string; aiMode: string; name?: string | null } | null;
    progress?: { stageProgress: number; totalScore: number; tasksCompleted: number } | null;
    streaks?: { current: number; longest: number } | null;
  } | null;
};

type AnalyticsPayload = {
  stats?: {
    growthScore: number;
    tasksCompleted: number;
    contentGenerated: number;
    achievements: Array<{ id: string; title: string; icon?: string | null }>;
  };
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserPayload | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [userRes, tasksRes, recRes, analyticsRes] = await Promise.all([
      fetch("/api/user"),
      fetch("/api/tasks"),
      fetch("/api/recommendations"),
      fetch("/api/analytics")
    ]);

    if (userRes.ok) setUserData(await userRes.json());
    if (tasksRes.ok) setTasks((await tasksRes.json()).tasks ?? []);
    if (recRes.ok) setRecommendations((await recRes.json()).recommendations ?? []);
    if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function completeTask(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });
    await load();
  }

  const user = userData?.user;
  const growthScore = analytics?.stats?.growthScore ?? Math.round(user?.progress?.totalScore ?? 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">AIKA cockpit</p>
          <h1 className="mt-1 text-3xl font-bold">{loading ? "Загрузка..." : `Салам, ${user?.name ?? "предприниматель"}`}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/content">
              <FileText className="h-4 w-4" />
              Контент
            </Link>
          </Button>
          <Button asChild>
            <Link href="/chat">
              <Bot className="h-4 w-4" />
              Chat with AIKA
            </Link>
          </Button>
        </div>
      </header>

      {!user?.business ? (
        <GlassPanel className="mt-6">
          <h2 className="text-xl font-semibold">Нужен короткий онбординг</h2>
          <p className="mt-2 text-sm text-muted-foreground">AIKA настроит режим, задачи и контекст бизнеса.</p>
          <Button asChild className="mt-4">
            <Link href="/onboarding">Пройти онбординг</Link>
          </Button>
        </GlassPanel>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="border-primary/30 bg-primary/10 text-primary">{user?.business?.stage ?? "START"}</Badge>
              <h2 className="mt-4 text-2xl font-bold">{user?.business?.name ?? "Твой бизнес"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Режим: {user?.business?.aiMode ?? "START_MODE"}</p>
            </div>
            <ProgressRing value={growthScore} label="growth" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={CheckCircle2} label="Задач сделано" value={analytics?.stats?.tasksCompleted ?? user?.progress?.tasksCompleted ?? 0} />
            <Metric icon={Flame} label="Streak" value={user?.streaks?.current ?? 0} />
            <Metric icon={Sparkles} label="XP / Level" value={`${user?.profile?.xp ?? 0} / ${user?.profile?.level ?? 1}`} />
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">AI insight</h2>
            <Target className="h-5 w-5 text-secondary" />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{recommendations[0] ?? "Сегодня выбери одно действие, которое приведет к разговору с клиентом."}</p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/journey">
              View Journey <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </GlassPanel>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <GlassPanel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Сегодняшние задачи</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tasks">Все задачи</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex flex-col gap-3 rounded-md border border-border bg-background/45 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                </div>
                <Button size="sm" variant={task.status === "completed" ? "secondary" : "outline"} disabled={task.status === "completed"} onClick={() => completeTask(task.id)}>
                  {task.status === "completed" ? "Готово" : `+${task.xpReward} XP`}
                </Button>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel>
          <h2 className="text-xl font-bold">Activity feed</h2>
          <div className="mt-4 space-y-3">
            {(analytics?.stats?.achievements ?? []).slice(0, 4).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 rounded-md border border-border bg-background/45 p-3">
                <span className="text-lg">{achievement.icon ?? "✓"}</span>
                <span className="text-sm">{achievement.title}</span>
              </div>
            ))}
            {(analytics?.stats?.achievements ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Первые достижения появятся после выполненных задач.</p> : null}
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-background/45 p-4">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
