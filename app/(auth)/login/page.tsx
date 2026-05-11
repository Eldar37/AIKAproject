"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });

    setLoading(false);
    if (!response.ok) {
      setError("Неверная почта или пароль.");
      return;
    }

    router.push(searchParams.get("next") || "/dashboard");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input name="email" type="email" placeholder="email@example.com" required />
      <Input name="password" type="password" placeholder="Пароль" required minLength={8} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" size="lg" disabled={loading}>
        {loading ? "Вход..." : "Войти"} <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <GlassPanel className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">AIKA</span>
        </Link>
        <h1 className="text-3xl font-bold">С возвращением</h1>
        <p className="mt-2 text-sm text-muted-foreground">Продолжи строить бизнес с того места, где остановился.</p>
        <div className="mt-7">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Зарегистрироваться
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
