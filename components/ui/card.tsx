import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}

export function GlassPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-lg p-5 shadow-sm", className)} {...props} />;
}
