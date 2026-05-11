import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
