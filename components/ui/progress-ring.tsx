import { cn } from "@/lib/utils/cn";

export function ProgressRing({ value, label, className }: { value: number; label?: string; className?: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className={cn("relative grid h-32 w-32 place-items-center", className)}>
      <svg className="-rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#aika-ring)"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="aika-ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2f7cff" />
            <stop offset="45%" stopColor="#6655ff" />
            <stop offset="100%" stopColor="#8f6bff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold">{normalized}</div>
        {label ? <div className="text-xs text-muted-foreground">{label}</div> : null}
      </div>
    </div>
  );
}
