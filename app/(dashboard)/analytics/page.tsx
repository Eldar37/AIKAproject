"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Flame, Gauge, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useI18n } from "@/components/i18n-provider";

type Analytics = {
  stats: {
    tasksCompleted: number;
    todayCompleted: number;
    contentGenerated: number;
    xp: number;
    level: number;
    growthScore: number;
    stage: string;
    streak?: { current: number; longest: number } | null;
    achievements: Array<{ id: string; type?: string; title: string; description?: string | null }>;
  };
  activity: Array<{ date: string; tasks: number; completed: number; content: number }>;
};

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Analytics | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function load() {
      const response = await fetch("/api/analytics");
      if (response.ok) setData(await response.json());
    }
    void load();
  }, []);

  const stats = data?.stats;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">{t("analytics.kicker")}</p>
          <h1 className="mt-1 text-3xl font-bold">{t("analytics.title")}</h1>
        </div>
        <Badge className="border-primary/30 bg-primary/10 text-primary">{stats?.stage ?? "START"}</Badge>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr]">
        <GlassPanel className="grid place-items-center">
          <ProgressRing value={stats?.growthScore ?? 0} label={t("common.score")} />
        </GlassPanel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Gauge} label={t("analytics.tasksCompleted")} value={stats?.tasksCompleted ?? 0} />
          <Metric icon={Flame} label={t("analytics.currentStreak")} value={stats?.streak?.current ?? 0} />
          <Metric icon={Sparkles} label={t("analytics.xpLevel")} value={`${stats?.xp ?? 0} / ${stats?.level ?? 1}`} />
          <Metric icon={Award} label={t("analytics.contentGenerated")} value={stats?.contentGenerated ?? 0} />
        </div>
      </section>

      <GlassPanel className="mt-4">
        <h2 className="mb-4 text-xl font-bold">{t("analytics.tasksCompleted")}</h2>
        <div className="h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.activity ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => String(value).slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                <Bar dataKey="completed" fill="#2f8cff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="content" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </GlassPanel>

      <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(stats?.achievements ?? []).map((achievement) => {
          const type = achievement.type ?? "first_task";
          return (
            <GlassPanel key={achievement.id}>
              <Award className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-semibold">{t(`achievement.${type}.title`)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t(`achievement.${type}.description`)}</p>
            </GlassPanel>
          );
        })}
        {(stats?.achievements ?? []).length === 0 ? (
          <GlassPanel>
            <Award className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">{t("analytics.noBadges")}</p>
          </GlassPanel>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string | number }) {
  return (
    <GlassPanel>
      <Icon className="mb-4 h-5 w-5 text-primary" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </GlassPanel>
  );
}
