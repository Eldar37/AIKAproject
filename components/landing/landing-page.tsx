"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowRight, Bot, CheckCircle2, Moon, Sun, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";

const features = [
  { title: "AI-наставник", text: "Контекст бизнеса, режимы роста и ответы без шаблонной воды.", icon: Bot },
  { title: "Ежедневные действия", text: "3 задачи в день: оффер, клиенты, контент, продажи.", icon: CheckCircle2 },
  { title: "Рост как система", text: "XP, этапы, streak, score и карта пути от идеи до масштаба.", icon: TrendingUp }
];

const testimonials = [
  { name: "Айжан", role: "Instagram store", text: "AIKA помогла быстро выбрать оффер и написать первым клиентам." },
  { name: "Бек", role: "Telegram services", text: "Самое ценное - каждый день понятно, что делать дальше." },
  { name: "Мээрим", role: "Local brand", text: "Контент стал не просто постами, а частью продаж." }
];

export function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
          AIKA
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild>
            <Link href="/register">Начать бесплатно</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl items-center gap-10 px-5 pb-12 pt-6 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <Badge className="mb-5 border-primary/30 bg-primary/10 text-primary">AI business operating system</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl text-balance text-5xl font-bold leading-tight sm:text-6xl"
          >
            AIKA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="mt-4 max-w-2xl text-xl text-muted-foreground sm:text-2xl"
          >
            От идеи до первого дохода. From idea to first income.
          </motion.p>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Умный наставник, который помогает строить бизнес шаг за шагом: задачи, контент, продажи, прогресс и решения для рынка Центральной Азии.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Начать бесплатно <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Войти</Link>
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18, duration: 0.55 }}>
          <GlassPanel className="p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Growth score</p>
                <p className="text-2xl font-bold">AIKA Dashboard</p>
              </div>
              <Badge className="border-secondary/30 bg-secondary/10 text-secondary">START</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
              <ProgressRing value={42} label="score" />
              <div className="space-y-3">
                {["Оффер для Instagram", "20 теплых контактов", "Сторис с CTA"].map((task, index) => (
                  <div key={task} className="flex items-center gap-3 rounded-md border border-border/70 bg-background/45 p-3">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-sm font-bold text-primary">{index + 1}</span>
                    <span className="text-sm">{task}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-md border border-border/70 bg-background/45 p-4">
              <p className="text-sm font-semibold">AI insight</p>
              <p className="mt-2 text-sm text-muted-foreground">Сегодня важнее один диалог с клиентом, чем идеальная упаковка.</p>
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-10 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <GlassPanel key={feature.title}>
              <Icon className="mb-4 h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
            </GlassPanel>
          );
        })}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
        {testimonials.map((item) => (
          <GlassPanel key={item.name}>
            <p className="text-sm text-muted-foreground">{item.text}</p>
            <div className="mt-4">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </div>
          </GlassPanel>
        ))}
      </section>
    </main>
  );
}
