"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, Check, CircleDollarSign, Globe2, Target, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

const niches = ["beauty", "education", "food", "fashion", "services", "digital", "tourism", "marketplace", "craft", "fitness"];
const steps = [
  { title: "Бизнес", icon: Building2 },
  { title: "Ниша", icon: Target },
  { title: "Каналы", icon: Globe2 },
  { title: "Бюджет", icon: CircleDollarSign },
  { title: "Опыт", icon: UserRound }
];

type OnboardingState = {
  hasBusiness: boolean;
  businessName: string;
  niche: string;
  description: string;
  isOnline: boolean;
  budget: "low" | "medium" | "high";
  mainGoal: "first_sale" | "grow_audience" | "increase_revenue" | "build_brand";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  targetAudience: string;
  channels: string[];
  monthlyRevenue: number | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<OnboardingState>({
    hasBusiness: false,
    businessName: "",
    niche: "services",
    description: "",
    isOnline: true,
    budget: "low",
    mainGoal: "first_sale",
    experienceLevel: "beginner",
    targetAudience: "",
    channels: ["instagram", "whatsapp"],
    monthlyRevenue: null
  });

  const canContinue = useMemo(() => {
    if (step === 1) return state.niche.length > 1;
    if (step === 2) return state.channels.length > 0;
    return true;
  }, [step, state.channels.length, state.niche]);

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function toggleChannel(channel: string) {
    setState((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel]
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setLoading(true);
    setError("");
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });

    setLoading(false);
    if (!response.ok) {
      setError("Не удалось сохранить онбординг. Проверь поля и попробуй снова.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">AIKA onboarding</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Настроим твой бизнес-режим</h1>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-2">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "grid min-h-16 place-items-center rounded-md border border-border bg-card/70 p-2 text-xs text-muted-foreground",
                  index === step && "border-primary bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1 hidden sm:block">{item.title}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit}>
          <GlassPanel className="min-h-[420px]">
            {step === 0 ? (
              <section className="space-y-5">
                <h2 className="text-2xl font-bold">У тебя уже есть бизнес?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: false, title: "Есть идея", text: "Начинаем с проверки спроса." },
                    { value: true, title: "Есть бизнес", text: "Усиливаем продажи и систему." }
                  ].map((option) => (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => update("hasBusiness", option.value)}
                      className={cn("rounded-lg border border-border p-4 text-left", state.hasBusiness === option.value && "border-primary bg-primary/10")}
                    >
                      <p className="font-semibold">{option.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{option.text}</p>
                    </button>
                  ))}
                </div>
                <Input value={state.businessName} onChange={(event) => update("businessName", event.target.value)} placeholder="Название бизнеса или идеи" />
              </section>
            ) : null}

            {step === 1 ? (
              <section className="space-y-5">
                <h2 className="text-2xl font-bold">Ниша и аудитория</h2>
                <select
                  value={state.niche}
                  onChange={(event) => update("niche", event.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {niches.map((niche) => (
                    <option key={niche} value={niche}>
                      {niche}
                    </option>
                  ))}
                </select>
                <Input value={state.targetAudience} onChange={(event) => update("targetAudience", event.target.value)} placeholder="Целевая аудитория" />
                <Textarea value={state.description} onChange={(event) => update("description", event.target.value)} placeholder="Коротко опиши продукт, услугу или идею" />
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-5">
                <h2 className="text-2xl font-bold">Формат и каналы</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: true, title: "Онлайн" },
                    { value: false, title: "Офлайн" }
                  ].map((option) => (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => update("isOnline", option.value)}
                      className={cn("rounded-md border border-border p-4 text-left", state.isOnline === option.value && "border-primary bg-primary/10")}
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {["instagram", "tiktok", "whatsapp", "telegram"].map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={cn("flex items-center justify-between rounded-md border border-border p-3 text-sm", state.channels.includes(channel) && "border-secondary bg-secondary/10")}
                    >
                      {channel}
                      {state.channels.includes(channel) ? <Check className="h-4 w-4 text-secondary" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-5">
                <h2 className="text-2xl font-bold">Бюджет и цель</h2>
                <select value={state.budget} onChange={(event) => update("budget", event.target.value as OnboardingState["budget"])} className="h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm">
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
                <select value={state.mainGoal} onChange={(event) => update("mainGoal", event.target.value as OnboardingState["mainGoal"])} className="h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm">
                  <option value="first_sale">Первая продажа</option>
                  <option value="grow_audience">Рост аудитории</option>
                  <option value="increase_revenue">Увеличить выручку</option>
                  <option value="build_brand">Построить бренд</option>
                </select>
                <Input type="number" min={0} value={state.monthlyRevenue ?? ""} onChange={(event) => update("monthlyRevenue", event.target.value ? Number(event.target.value) : null)} placeholder="Выручка в месяц, если есть" />
              </section>
            ) : null}

            {step === 4 ? (
              <section className="space-y-5">
                <h2 className="text-2xl font-bold">Твой опыт</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "beginner", title: "Новичок" },
                    { value: "intermediate", title: "Уже пробовал" },
                    { value: "advanced", title: "Есть опыт" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("experienceLevel", option.value as OnboardingState["experienceLevel"])}
                      className={cn("rounded-md border border-border p-4 text-left", state.experienceLevel === option.value && "border-primary bg-primary/10")}
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">AIKA выберет режим, первые задачи и персональный фокус на ближайшие дни.</p>
              </section>
            ) : null}
          </GlassPanel>

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              Назад
            </Button>
            <Button disabled={!canContinue || loading} type="submit">
              {step === steps.length - 1 ? (loading ? "Генерация..." : "Создать план") : "Дальше"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
