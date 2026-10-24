import type * as React from "react";
import { cn } from "./cn";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-6 w-fit min-w-6 items-center justify-center gap-1 rounded-[6px] border border-border bg-card px-1.5 font-sans text-[12px] font-medium text-body shadow-[inset_0_-1px_0_var(--border)] select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1 align-middle", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
