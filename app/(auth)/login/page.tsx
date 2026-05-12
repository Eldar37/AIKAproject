"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AikaLogo } from "@/components/ui/logo";
import { LanguageSwitcher, useI18n } from "@/components/i18n-provider";
import { resolveAuthError } from "@/lib/utils/api-errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useI18n();
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
      setError(await resolveAuthError(response, language, t("auth.login.error")));
      return;
    }

    router.push(searchParams.get("next") || "/dashboard");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input name="email" type="email" placeholder={t("common.email")} required />
      <Input name="password" type="password" placeholder={t("common.password")} required minLength={8} />
      {error ? <p className="break-anywhere text-sm leading-6 text-destructive">{error}</p> : null}
      <Button className="w-full" size="lg" disabled={loading}>
        {loading ? t("auth.login.loading") : t("auth.login.submit")} <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-[100svh] place-items-center px-4 py-6 sm:px-5 sm:py-12">
      <GlassPanel className="w-full max-w-[25rem]">
        <div className="mb-7 flex items-center justify-between gap-3">
          <AikaLogo />
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{t("auth.login.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("auth.login.subtitle")}</p>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link href="/register" className="font-semibold text-primary">
            {t("common.register")}
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
