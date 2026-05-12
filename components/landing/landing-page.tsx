"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowRight, Bot, CheckCircle2, Moon, Sun, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AikaLogo } from "@/components/ui/logo";
import { LanguageSwitcher, useI18n } from "@/components/i18n-provider";

const features = [
  { title: "landing.feature1.title", text: "landing.feature1.text", icon: Bot },
  { title: "landing.feature2.title", text: "landing.feature2.text", icon: CheckCircle2 },
  { title: "landing.feature3.title", text: "landing.feature3.text", icon: TrendingUp }
];

const testimonials = [
  { name: "landing.testimonial1.name", role: "landing.testimonial1.role", text: "landing.testimonial1.text" },
  { name: "landing.testimonial2.name", role: "landing.testimonial2.role", text: "landing.testimonial2.text" },
  { name: "landing.testimonial3.name", role: "landing.testimonial3.role", text: "landing.testimonial3.text" }
];

const previewTasks = ["landing.preview.task1", "landing.preview.task2", "landing.preview.task3"];

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <AikaLogo />
        <div className="flex min-w-0 items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Button variant="ghost" size="icon" aria-label={t("common.toggleTheme")} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild className="hidden min-[420px]:inline-flex">
            <Link href="/register">{t("common.startFree")}</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-6xl items-center gap-8 px-4 pb-10 pt-4 sm:px-5 sm:pb-12 sm:pt-6 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <Badge className="mb-5 border-primary/30 bg-primary/10 text-primary">{t("landing.badge")}</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl text-balance text-4xl font-bold leading-tight sm:text-6xl"
          >
            AIKA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground sm:text-2xl"
          >
            {t("landing.tagline")}
          </motion.p>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{t("landing.subtitle")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                {t("common.startFree")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t("common.login")}</Link>
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18, duration: 0.55 }}>
          <GlassPanel className="p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{t("landing.preview.score")}</p>
                <p className="break-anywhere text-xl font-bold sm:text-2xl">{t("landing.preview.title")}</p>
              </div>
              <Badge className="shrink-0 border-secondary/30 bg-secondary/10 text-secondary">START</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
              <ProgressRing value={42} label={t("common.score")} className="mx-auto sm:mx-0" />
              <div className="space-y-3">
                {previewTasks.map((task, index) => (
                  <div key={task} className="flex items-center gap-3 rounded-md border border-border/70 bg-background/45 p-3">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-sm font-bold text-primary">{index + 1}</span>
                    <span className="min-w-0 break-words text-sm">{t(task)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-md border border-border/70 bg-background/45 p-4">
              <p className="text-sm font-semibold">{t("landing.preview.insightTitle")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("landing.preview.insight")}</p>
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:px-5 sm:py-10 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <GlassPanel key={feature.title}>
              <Icon className="mb-4 h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{t(feature.title)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t(feature.text)}</p>
            </GlassPanel>
          );
        })}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-14 sm:px-5 sm:pb-16 md:grid-cols-3">
        {testimonials.map((item) => (
          <GlassPanel key={item.name}>
            <p className="text-sm text-muted-foreground">{t(item.text)}</p>
            <div className="mt-4">
              <p className="font-semibold">{t(item.name)}</p>
              <p className="text-xs text-muted-foreground">{t(item.role)}</p>
            </div>
          </GlassPanel>
        ))}
      </section>
    </main>
  );
}
