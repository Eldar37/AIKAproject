"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AikaLogo } from "@/components/ui/logo";
import { LanguageSwitcher, useI18n } from "@/components/i18n-provider";
import { resolveAuthError } from "@/lib/utils/api-errors";

export default function RegisterPage() {
  const router = useRouter();
  const { language, t } = useI18n();
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
        password: form.get("password"),
        language
      })
    });

    setLoading(false);
    if (!response.ok) {
      setError(await resolveAuthError(response, language, t("auth.register.error"), t("auth.register.duplicate")));
      return;
    }

    router.push("/onboarding");
  }

  return (
    <main className="grid min-h-[100svh] place-items-center px-4 py-6 sm:px-5 sm:py-12">
      <GlassPanel className="w-full max-w-[25rem]">
        <div className="mb-7 flex items-center justify-between gap-3">
          <AikaLogo />
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{t("auth.register.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("auth.register.subtitle")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input name="name" placeholder={t("common.name")} required minLength={2} />
          <Input name="email" type="email" placeholder={t("common.email")} required />
          <Input name="password" type="password" placeholder={t("auth.register.passwordPlaceholder")} required minLength={8} />
          {error ? <p className="break-anywhere text-sm leading-6 text-destructive">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? t("auth.register.loading") : t("auth.register.submit")} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary">
            {t("common.login")}
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
