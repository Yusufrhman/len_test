import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  ToastContext,
  type ToastInput,
  type ToastTone,
} from "@/components/ui/toast-context";
import { cn } from "@/lib/utils";

interface ToastItem extends ToastInput {
  id: number;
}

const TONES: Record<
  ToastTone,
  { icon: typeof Info; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    barClass: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-600",
    barClass: "bg-red-500",
  },
  info: {
    icon: Info,
    iconClass: "text-teal-700",
    barClass: "bg-teal-600",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current, { ...input, id }]);

      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[2000] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map((item) => {
          const tone = TONES[item.tone];
          const Icon = tone.icon;

          return (
            <div
              key={item.id}
              className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 pr-2 shadow-lg"
            >
              <span className={cn("mt-0.5", tone.iconClass)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" />
              </button>
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-full",
                  tone.barClass,
                )}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
