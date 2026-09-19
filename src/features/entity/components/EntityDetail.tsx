import type { ReactNode } from "react";
import { CalendarClock, Copy, Hash, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast-context";
import { formatCoordinate, formatDateTime } from "@/lib/utils";
import {
  getEntityStatusMeta,
  getEntityTypeMeta,
  type Entity,
} from "../types";

interface EntityDetailProps {
  entity: Entity;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}

export function EntityDetail({
  entity,
  onClose,
  onEdit,
  onDelete,
}: EntityDetailProps) {
  const { toast } = useToast();
  const typeMeta = getEntityTypeMeta(entity.type);
  const statusMeta = getEntityStatusMeta(entity.status);
  const coordinateText = `${formatCoordinate(
    entity.latitude,
  )}, ${formatCoordinate(entity.longitude)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coordinateText);
      toast({
        tone: "success",
        title: "Coordinates copied",
        description: coordinateText,
      });
    } catch {
      toast({
        tone: "error",
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
      });
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-start gap-3 border-b border-slate-200 p-4">
        <img
          src={typeMeta.pin}
          alt=""
          className="mt-0.5 size-8 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900">
            {entity.name}
          </h2>
          <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
            {typeMeta.label}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={statusMeta.chip} dotClassName={statusMeta.dot}>
            {statusMeta.label}
          </Badge>
          <Badge className="border-slate-200 bg-slate-50 text-slate-600">
            {typeMeta.description}
          </Badge>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          <DetailRow
            icon={<Hash className="size-3.5" />}
            label="Entity ID"
          >
            <span className="font-mono text-xs break-all">{entity.id}</span>
          </DetailRow>

          <DetailRow
            icon={<CalendarClock className="size-3.5" />}
            label="Last updated"
          >
            {formatDateTime(entity.updatedAt)}
          </DetailRow>

          <DetailRow
            icon={<CalendarClock className="size-3.5" />}
            label="Created"
          >
            {formatDateTime(entity.createdAt)}
          </DetailRow>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Coordinates
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              aria-label="Copy coordinates"
            >
              <Copy className="size-3.5" />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Latitude</p>
              <p className="font-mono text-sm text-slate-700">
                {formatCoordinate(entity.latitude)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Longitude</p>
              <p className="font-mono text-sm text-slate-700">
                {formatCoordinate(entity.longitude)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-200 p-4">
        <Button className="flex-1" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit entity
        </Button>
        <Button
          variant="outline"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
