import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function AikaLogo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-normal", className)} aria-label="AIKA">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-primary to-accent text-sm font-black text-white shadow-glow sm:h-10 sm:w-10">
        A
      </span>
      <span className="text-xl font-black leading-none text-foreground sm:text-2xl">AIKA</span>
      {!compact ? <span className="sr-only">AIKA</span> : null}
    </span>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}
