"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password")
      })
    });

    setLoading(false);
    if (!response.ok) {
      setError(response.status === 409 ? "Эта почта уже зарегистрирована." : "Не удалось создать аккаунт.");
      return;
    }

    router.push("/onboarding");
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <GlassPanel className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">AIKA</span>
        </Link>
        <h1 className="text-3xl font-bold">Создай аккаунт</h1>
        <p className="mt-2 text-sm text-muted-foreground">Первый план действий появится после короткого онбординга.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <Input name="name" placeholder="Имя" required minLength={2} />
          <Input name="email" type="email" placeholder="email@example.com" required />
          <Input name="password" type="password" placeholder="Пароль от 8 символов" required minLength={8} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? "Создание..." : "Начать"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Войти
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
