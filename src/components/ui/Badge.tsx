import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  dotClassName?: string;
  children: ReactNode;
}

export function Badge({ className, dotClassName, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-5 font-medium",
        className,
      )}
    >
      {dotClassName ? (
        <span className={cn("size-1.5 rounded-full", dotClassName)} />
      ) : null}
      {children}
    </span>
  );
}
