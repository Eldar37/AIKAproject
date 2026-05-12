"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bot, CheckSquare, Compass, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AikaLogo } from "@/components/ui/logo";
import { LanguageSwitcher, useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "nav.chat", icon: Bot },
  { href: "/journey", label: "nav.journey", icon: Compass },
  { href: "/content", label: "nav.content", icon: FileText },
  { href: "/tasks", label: "nav.tasks", icon: CheckSquare },
  { href: "/analytics", label: "nav.analytics", icon: BarChart3 }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/70 bg-background/85 p-5 backdrop-blur xl:block">
        <div className="mb-8 flex items-center justify-between gap-3">
          <AikaLogo href="/dashboard" compact />
        </div>
        <LanguageSwitcher className="mb-6 w-full justify-center" />

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" className="absolute bottom-5 left-5 right-5 justify-start" onClick={logout}>
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </Button>
      </aside>

      <main className="pb-24 xl:ml-64 xl:pb-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/92 px-5 py-3 backdrop-blur xl:hidden">
          <AikaLogo href="/dashboard" compact />
          <LanguageSwitcher />
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-background/92 px-2 py-2 backdrop-blur xl:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("grid place-items-center gap-1 rounded-md py-2 text-[11px] text-muted-foreground", active && "bg-muted text-foreground")}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
