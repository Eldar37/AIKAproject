import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-white/90 px-3 text-base outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 dark:bg-card/80 sm:text-sm",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
