import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function AikaLogo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  const content = (
    <span className={cn("inline-flex items-center font-bold tracking-normal", className)} aria-label="AIKA">
      <span className="grid h-10 min-w-20 place-items-center rounded-md border border-primary/50 bg-background px-4 text-lg font-black text-primary shadow-glow">
        AIKA
      </span>
      {!compact ? <span className="sr-only">AIKA</span> : null}
    </span>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}
