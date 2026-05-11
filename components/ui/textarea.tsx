import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-md border border-input bg-background/70 px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
