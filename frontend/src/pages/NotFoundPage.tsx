import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Compass className="size-6" />
          </span>
          <p className="mt-4 font-mono text-xs tracking-widest text-slate-400">
            404
          </p>
          <h1 className="mt-1 text-base font-semibold text-slate-900">
            Page not found
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            The page you are looking for does not exist or has moved.
          </p>
          <Link to="/" className="mt-5 inline-block">
            <Button size="sm">Back to map</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
