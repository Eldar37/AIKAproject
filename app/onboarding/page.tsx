"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, Check, CircleDollarSign, Globe2, Target, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AikaLogo } from "@/components/ui/logo";
import { LanguageSwitcher, useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils/cn";

const niches = ["beauty", "education", "food", "fashion", "services", "digital", "tourism", "marketplace", "craft", "fitness"];
const stepKeys = [
  { title: "onboarding.step.business", icon: Building2 },
  { title: "onboarding.step.niche", icon: Target },
  { title: "onboarding.step.channels", icon: Globe2 },
  { title: "onboarding.step.budget", icon: CircleDollarSign },
  { title: "onboarding.step.experience", icon: UserRound }
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
  const { t } = useI18n();
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
    if (step < stepKeys.length - 1) {
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
      setError(t("onboarding.saveError"));
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-[100svh] px-4 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <AikaLogo className="mb-5" />
            <p className="text-sm font-semibold text-primary">{t("onboarding.kicker")}</p>
            <h1 className="break-words mt-2 text-2xl font-bold leading-tight sm:text-4xl">{t("onboarding.title")}</h1>
          </div>
          <LanguageSwitcher className="w-fit" />
        </div>

        <div className="mb-5 grid grid-cols-5 gap-1.5 sm:mb-6 sm:gap-2">
          {stepKeys.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "grid min-h-12 place-items-center rounded-md border border-border bg-white/76 p-2 text-xs text-muted-foreground shadow-sm dark:bg-card/70 sm:min-h-16",
                  index === step && "border-primary bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1 hidden sm:block">{t(item.title)}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit}>
          <GlassPanel className="min-h-[360px] sm:min-h-[420px]">
            {step === 0 ? (
              <section className="space-y-5">
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{t("onboarding.hasBusiness")}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: false, title: "onboarding.idea", text: "onboarding.ideaText" },
                    { value: true, title: "onboarding.existingBusiness", text: "onboarding.existingBusinessText" }
                  ].map((option) => (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => update("hasBusiness", option.value)}
                      className={cn("rounded-lg border border-border p-4 text-left", state.hasBusiness === option.value && "border-primary bg-primary/10")}
                    >
                      <p className="font-semibold">{t(option.title)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t(option.text)}</p>
                    </button>
                  ))}
                </div>
                <Input value={state.businessName} onChange={(event) => update("businessName", event.target.value)} placeholder={t("onboarding.businessName")} />
              </section>
            ) : null}

            {step === 1 ? (
              <section className="space-y-5">
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{t("onboarding.nicheAudience")}</h2>
                <select
                  value={state.niche}
                  onChange={(event) => update("niche", event.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {niches.map((niche) => (
                    <option key={niche} value={niche}>
                      {t(`niche.${niche}`)}
                    </option>
                  ))}
                </select>
                <Input value={state.targetAudience} onChange={(event) => update("targetAudience", event.target.value)} placeholder={t("onboarding.targetAudience")} />
                <Textarea value={state.description} onChange={(event) => update("description", event.target.value)} placeholder={t("onboarding.description")} />
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-5">
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{t("onboarding.formatChannels")}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: true, title: "common.online" },
                    { value: false, title: "common.offline" }
                  ].map((option) => (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => update("isOnline", option.value)}
                      className={cn("rounded-md border border-border p-4 text-left", state.isOnline === option.value && "border-primary bg-primary/10")}
                    >
                      {t(option.title)}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {["instagram", "tiktok", "whatsapp", "telegram"].map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={cn("flex items-center justify-between rounded-md border border-border p-3 text-sm", state.channels.includes(channel) && "border-primary bg-primary/10 text-primary")}
                    >
                      {channel}
                      {state.channels.includes(channel) ? <Check className="h-4 w-4 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-5">
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{t("onboarding.budgetGoal")}</h2>
                <select value={state.budget} onChange={(event) => update("budget", event.target.value as OnboardingState["budget"])} className="h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm">
                  <option value="low">{t("common.low")}</option>
                  <option value="medium">{t("common.medium")}</option>
                  <option value="high">{t("common.high")}</option>
                </select>
                <select value={state.mainGoal} onChange={(event) => update("mainGoal", event.target.value as OnboardingState["mainGoal"])} className="h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm">
                  <option value="first_sale">{t("onboarding.goal.firstSale")}</option>
                  <option value="grow_audience">{t("onboarding.goal.growAudience")}</option>
                  <option value="increase_revenue">{t("onboarding.goal.increaseRevenue")}</option>
                  <option value="build_brand">{t("onboarding.goal.buildBrand")}</option>
                </select>
                <Input type="number" min={0} value={state.monthlyRevenue ?? ""} onChange={(event) => update("monthlyRevenue", event.target.value ? Number(event.target.value) : null)} placeholder={t("onboarding.monthlyRevenue")} />
              </section>
            ) : null}

            {step === 4 ? (
              <section className="space-y-5">
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{t("onboarding.yourExperience")}</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "beginner", title: "onboarding.exp.beginner" },
                    { value: "intermediate", title: "onboarding.exp.intermediate" },
                    { value: "advanced", title: "onboarding.exp.advanced" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("experienceLevel", option.value as OnboardingState["experienceLevel"])}
                      className={cn("rounded-md border border-border p-4 text-left", state.experienceLevel === option.value && "border-primary bg-primary/10")}
                    >
                      {t(option.title)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{t("onboarding.finalNote")}</p>
              </section>
            ) : null}
          </GlassPanel>

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              {t("common.back")}
            </Button>
            <Button disabled={!canContinue || loading} type="submit" className="w-full sm:w-auto">
              {step === stepKeys.length - 1 ? (loading ? t("common.generating") : t("common.createPlan")) : t("common.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
