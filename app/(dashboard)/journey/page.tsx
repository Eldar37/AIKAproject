"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleDollarSign, Lightbulb, Megaphone, Rocket, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const roadmap = [
  { key: "idea_validation", title: "Idea Validation", stage: "START", icon: Lightbulb, text: "Проверить боль, сегмент и оффер." },
  { key: "first_income", title: "First Income", stage: "START", icon: CircleDollarSign, text: "Получить первый платеж или бронь." },
  { key: "online_presence", title: "Online Presence", stage: "GROWTH", icon: Megaphone, text: "Стабильный Instagram, TikTok, Telegram или WhatsApp-контур." },
  { key: "sales_system", title: "Sales System", stage: "GROWTH", icon: ShoppingCart, text: "Повторяемые заявки, follow-up и отзывы." },
  { key: "scale", title: "Scale", stage: "SCALE", icon: Rocket, text: "Метрики, делегирование, партнерства и регионы." }
];

export default function JourneyPage() {
  const [stage, setStage] = useState("START");
  const [milestones, setMilestones] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/user");
      if (!response.ok) return;
      const data = await response.json();
      setStage(data.user?.business?.stage ?? data.user?.progress?.currentStage ?? "START");
      setMilestones(data.user?.progress?.milestones ?? []);
    }
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">Roadmap</p>
          <h1 className="mt-1 text-3xl font-bold">Journey Map</h1>
        </div>
        <Badge className="border-primary/30 bg-primary/10 text-primary">{stage}</Badge>
      </header>

      <div className="mt-8 grid gap-4">
        {roadmap.map((item, index) => {
          const Icon = item.icon;
          const completed = milestones.includes(item.key) || stageOrder(stage) > stageOrder(item.stage);
          const current = stage === item.stage && !completed;
          return (
            <GlassPanel key={item.key} className={cn("relative overflow-hidden", current && "border-primary/60 bg-primary/10")}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className={cn("grid h-14 w-14 place-items-center rounded-md border border-border bg-background/60", completed && "border-secondary bg-secondary/15 text-secondary", current && "border-primary text-primary")}>
                  {completed ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">0{index + 1}</span>
                    <h2 className="text-xl font-bold">{item.title}</h2>
                    {current ? <Badge className="border-primary/30 bg-primary/10 text-primary">current</Badge> : null}
                    {completed ? <Badge className="border-secondary/30 bg-secondary/10 text-secondary">completed</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                </div>
                <Button asChild variant={current ? "default" : "outline"}>
                  <Link href={current ? "/tasks" : "/analytics"}>{current ? "Next steps" : "Progress"}</Link>
                </Button>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}

function stageOrder(stage: string) {
  return stage === "SCALE" ? 3 : stage === "GROWTH" ? 2 : 1;
}
