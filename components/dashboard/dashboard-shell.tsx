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
    <div className="min-h-screen bg-transparent text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-white/88 p-5 shadow-[18px_0_48px_rgba(82,74,180,0.08)] backdrop-blur xl:block dark:bg-card/88">
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
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary",
                  active && "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow hover:text-primary-foreground"
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

      <main className="pb-[calc(5.75rem+env(safe-area-inset-bottom))] xl:ml-64 xl:pb-0">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/92 px-4 py-3 shadow-sm backdrop-blur xl:hidden dark:bg-card/92">
          <AikaLogo href="/dashboard" compact />
          <LanguageSwitcher />
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-white/94 px-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_40px_rgba(82,74,180,0.1)] backdrop-blur xl:hidden dark:bg-card/94">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "grid min-w-0 place-items-center gap-1 rounded-md px-1 py-2 text-[10px] leading-none text-muted-foreground",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
