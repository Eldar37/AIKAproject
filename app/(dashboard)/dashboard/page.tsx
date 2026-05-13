"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Award, Bot, CheckCircle2, FileText, Flame, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useI18n } from "@/components/i18n-provider";

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
    achievements: Array<{ id: string; type?: string; title: string; description?: string | null }>;
  };
};

export default function DashboardPage() {
  const { t } = useI18n();
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
  const greetingName = user?.name ?? t("dashboard.entrepreneur");
  const insightKey = recommendations[0] ?? "dashboard.defaultInsight";

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{t("dashboard.kicker")}</p>
          <h1 className="break-anywhere mt-1 text-2xl font-bold leading-tight sm:text-3xl">
            {loading ? t("common.loading") : t("dashboard.greeting", { name: greetingName })}
          </h1>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/content">
              <FileText className="h-4 w-4" />
              {t("nav.content")}
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/chat">
              <Bot className="h-4 w-4" />
              {t("dashboard.chatCta")}
            </Link>
          </Button>
        </div>
      </header>

      {!user?.business ? (
        <GlassPanel className="mt-6">
          <h2 className="text-xl font-semibold">{t("dashboard.needOnboarding")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.needOnboardingText")}</p>
          <Button asChild className="mt-4">
            <Link href="/onboarding">{t("dashboard.startOnboarding")}</Link>
          </Button>
        </GlassPanel>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Badge className="border-primary/30 bg-primary/10 text-primary">{user?.business?.stage ?? "START"}</Badge>
              <h2 className="break-anywhere mt-4 text-xl font-bold sm:text-2xl">{user?.business?.name ?? t("dashboard.yourBusiness")}</h2>
              <p className="break-anywhere mt-2 text-sm text-muted-foreground">
                {t("dashboard.mode")}: {t(`mode.${user?.business?.aiMode ?? "START_MODE"}`)}
              </p>
            </div>
            <ProgressRing value={growthScore} label={t("common.growth")} className="mx-auto sm:mx-0" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric icon={CheckCircle2} label={t("dashboard.tasksDone")} value={analytics?.stats?.tasksCompleted ?? user?.progress?.tasksCompleted ?? 0} />
            <Metric icon={Flame} label={t("dashboard.streak")} value={user?.streaks?.current ?? 0} />
            <Metric icon={Sparkles} label={t("dashboard.xpLevel")} value={`${user?.profile?.xp ?? 0} / ${user?.profile?.level ?? 1}`} />
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t("landing.preview.insightTitle")}</h2>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t(insightKey)}</p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/journey">
              {t("dashboard.viewJourney")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </GlassPanel>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <GlassPanel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t("dashboard.todayTasks")}</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tasks">{t("common.allTasks")}</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex flex-col gap-3 rounded-md border border-border bg-white/76 p-4 shadow-sm dark:bg-card/70 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-semibold">{t(task.title)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{task.description ? t(task.description) : null}</p>
                </div>
                <Button className="w-full sm:w-auto" size="sm" variant={task.status === "completed" ? "secondary" : "outline"} disabled={task.status === "completed"} onClick={() => completeTask(task.id)}>
                  {task.status === "completed" ? t("common.done") : `+${task.xpReward} XP`}
                </Button>
              </div>
            ))}
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">{t("tasks.empty")}</p> : null}
          </div>
        </GlassPanel>

        <GlassPanel>
          <h2 className="text-xl font-bold">{t("dashboard.activity")}</h2>
          <div className="mt-4 space-y-3">
            {(analytics?.stats?.achievements ?? []).slice(0, 4).map((achievement) => (
              <div key={achievement.id} className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-white/76 p-3 shadow-sm dark:bg-card/70">
                <Award className="h-4 w-4 text-primary" />
                <span className="min-w-0 break-words text-sm">{t(`achievement.${achievement.type ?? "first_task"}.title`)}</span>
              </div>
            ))}
            {(analytics?.stats?.achievements ?? []).length === 0 ? <p className="text-sm text-muted-foreground">{t("dashboard.noAchievements")}</p> : null}
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-white/76 p-4 shadow-sm dark:bg-card/70">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
