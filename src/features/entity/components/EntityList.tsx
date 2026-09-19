import { RefreshCw, Search, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { NormalizedApiError } from "@/lib/api-error";
import { cn, formatCoordinates, formatDateTime } from "@/lib/utils";
import {
  ENTITY_STATUSES,
  ENTITY_TYPE_META,
  ENTITY_TYPES,
  getEntityStatusMeta,
  getEntityTypeMeta,
  type Entity,
  type EntityType,
} from "../types";

interface EntityListProps {
  entities: Entity[];
  totalCount: number;
  isLoading: boolean;
  isRefetching: boolean;
  error: NormalizedApiError | null;
  selectedId: string | null;
  search: string;
  typeFilter: EntityType | "all";
  statusFilter: string;
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: EntityType | "all") => void;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
}

function EntityCard({
  entity,
  selected,
  onSelect,
}: {
  entity: Entity;
  selected: boolean;
  onSelect: () => void;
}) {
  const typeMeta = getEntityTypeMeta(entity.type);
  const statusMeta = getEntityStatusMeta(entity.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full rounded-xl border p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:outline-none",
        selected
          ? "border-teal-500 bg-teal-50/70 ring-1 ring-teal-500/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <img
            src={typeMeta.pin}
            alt=""
            className="mt-0.5 size-6 shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {entity.name}
            </p>
            <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              {typeMeta.label}
            </p>
          </div>
        </div>
        <Badge className={statusMeta.chip} dotClassName={statusMeta.dot}>
          {statusMeta.label}
        </Badge>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <span className="truncate font-mono text-[10px] text-slate-400">
          {formatCoordinates(entity.latitude, entity.longitude)}
        </span>
        <span className="shrink-0 text-[10px] text-slate-400">
          {formatDateTime(entity.updatedAt)}
        </span>
      </div>
    </button>
  );
}

function EntityListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export function EntityList({
  entities,
  totalCount,
  isLoading,
  isRefetching,
  error,
  selectedId,
  search,
  typeFilter,
  statusFilter,
  onSelect,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onRefresh,
}: EntityListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name…"
            className="pl-9"
            aria-label="Search entities by name"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={typeFilter}
            onChange={(event) =>
              onTypeFilterChange(event.target.value as EntityType | "all")
            }
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {ENTITY_TYPE_META[type].label}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {ENTITY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getEntityStatusMeta(status).label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
          {isLoading
            ? "Loading…"
            : `${entities.length} of ${totalCount} ${
                totalCount === 1 ? "entity" : "entities"
              }`}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRefresh}
          aria-label="Refresh entities"
        >
          <RefreshCw className={cn("size-4", isRefetching && "animate-spin")} />
        </Button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <EntityListSkeleton />
        ) : error ? (
          <EmptyState
            icon={TriangleAlert}
            title="Could not load entities"
            description={error.message}
            action={
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="size-3.5" />
                Try again
              </Button>
            }
          />
        ) : entities.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No entities found"
            description="Try adjusting your search or filters, or add a new entity."
          />
        ) : (
          <div className="space-y-2">
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                selected={selectedId === entity.id}
                onSelect={() => onSelect(entity.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
