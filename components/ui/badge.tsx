import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full items-center rounded-full border border-border bg-muted px-2.5 py-1 text-left text-xs font-medium leading-tight text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
