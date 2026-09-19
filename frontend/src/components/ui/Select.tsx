import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border bg-white pr-9 pl-3 text-sm text-slate-900 shadow-xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
          invalid
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
