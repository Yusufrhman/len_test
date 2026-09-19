import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  backTo?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function AppHeader({
  backTo,
  title,
  subtitle,
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-4",
        className,
      )}
    >
      {backTo ? (
        <Link
          to={backTo}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Link>
      ) : null}

      <Link to="/" className="flex shrink-0 items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
          <MapPin className="size-4" />
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-slate-900">
            Atlas
          </span>
          <span className="block text-[10px] font-medium tracking-widest text-slate-400 uppercase">
            Entity Ops
          </span>
        </span>
      </Link>

      {title ? (
        <>
          <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-800">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-[11px] text-slate-400">{subtitle}</p>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </header>
  );
}
