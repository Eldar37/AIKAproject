"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bot, CheckSquare, Compass, FileText, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Пульт", icon: LayoutDashboard },
  { href: "/chat", label: "AIKA", icon: Bot },
  { href: "/journey", label: "Путь", icon: Compass },
  { href: "/content", label: "Контент", icon: FileText },
  { href: "/tasks", label: "Задачи", icon: CheckSquare },
  { href: "/analytics", label: "Рост", icon: BarChart3 }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/70 bg-background/85 p-5 backdrop-blur xl:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold">AIKA</span>
            <span className="text-xs text-muted-foreground">business OS</span>
          </span>
        </Link>

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
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" className="absolute bottom-5 left-5 right-5 justify-start" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </aside>

      <main className="pb-24 xl:ml-64 xl:pb-0">{children}</main>

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
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
