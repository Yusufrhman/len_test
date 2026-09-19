import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, Plus, TriangleAlert } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/toast-context";
import { normalizeApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { EntityDetail } from "../components/EntityDetail";
import { EntityList } from "../components/EntityList";
import { EntityMap } from "../components/EntityMap";
import {
  useDeleteEntity,
  useEntities,
} from "../hooks/useEntity";
import type { Entity, EntityFilters, EntityType } from "../types";

export function EntityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteMutation = useDeleteEntity();

  const [typeFilter, setTypeFilter] = useState<EntityType | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Entity | null>(null);

  const filters = useMemo<EntityFilters>(
    () => ({
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [typeFilter, statusFilter],
  );

  const entitiesQuery = useEntities(filters);
  const allEntities = useMemo(
    () => entitiesQuery.data ?? [],
    [entitiesQuery.data],
  );

  const visibleEntities = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return allEntities;
    }

    return allEntities.filter((entity) =>
      entity.name.toLowerCase().includes(term),
    );
  }, [allEntities, search]);

  const selectedEntity = useMemo(
    () => allEntities.find((entity) => entity.id === selectedId) ?? null,
    [allEntities, selectedId],
  );

  const error = entitiesQuery.error
    ? normalizeApiError(entitiesQuery.error)
    : null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    const target = pendingDelete;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toast({
          tone: "success",
          title: "Entity deleted",
          description: `${target.name} has been removed.`,
        });
        setPendingDelete(null);
        if (selectedId === target.id) {
          setSelectedId(null);
        }
      },
      onError: (mutationError) => {
        toast({
          tone: "error",
          title: "Delete failed",
          description: normalizeApiError(mutationError).message,
        });
      },
    });
  };

  const listProps = {
    entities: visibleEntities,
    totalCount: allEntities.length,
    isLoading: entitiesQuery.isLoading,
    isRefetching: entitiesQuery.isFetching,
    error,
    selectedId,
    search,
    typeFilter,
    statusFilter,
    onSelect: handleSelect,
    onSearchChange: setSearch,
    onTypeFilterChange: setTypeFilter,
    onStatusFilterChange: setStatusFilter,
    onRefresh: () => entitiesQuery.refetch(),
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open entity list"
            >
              <List className="size-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/entities/new")}
            >
              <Plus className="size-4" />
              New entity
            </Button>
          </>
        }
      />

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[380px] shrink-0 overflow-hidden border-r border-slate-200 bg-white lg:block">
          <EntityList {...listProps} />
        </aside>

        <main className="relative min-w-0 flex-1">
          <EntityMap
            entities={visibleEntities}
            selectedId={selectedId}
            onSelect={handleSelect}
          />

          {entitiesQuery.isLoading ? (
            <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-slate-100/60 backdrop-blur-[1px]">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                <Spinner className="size-4" />
                Loading entities…
              </span>
            </div>
          ) : error ? (
            <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center p-6">
              <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                <EmptyState
                  icon={TriangleAlert}
                  title="Could not load entities"
                  description={error.message}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => entitiesQuery.refetch()}
                    >
                      Try again
                    </Button>
                  }
                />
              </div>
            </div>
          ) : !entitiesQuery.isLoading && visibleEntities.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[1000] flex justify-center px-4">
              <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 py-1.5 pr-1.5 pl-4 shadow-lg backdrop-blur">
                <span className="text-xs font-medium text-slate-500">
                  {allEntities.length === 0
                    ? "No entities yet"
                    : "No matching entities"}
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate("/entities/new")}
                >
                  <Plus className="size-3.5" />
                  Add entity
                </Button>
              </div>
            </div>
          ) : null}

          {selectedEntity ? (
            <div className="absolute top-4 right-4 bottom-4 z-[1000] hidden w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:block">
              <EntityDetail
                entity={selectedEntity}
                onClose={() => setSelectedId(null)}
                onEdit={() => navigate(`/entities/${selectedEntity.id}/edit`)}
                onDelete={() => setPendingDelete(selectedEntity)}
              />
            </div>
          ) : null}
        </main>
      </div>

      {/* Mobile detail sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[1500] transition-transform duration-300 ease-out lg:hidden",
          selectedEntity ? "translate-y-0" : "translate-y-full",
        )}
      >
        {selectedEntity ? (
          <div className="relative h-[72vh] overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-10px_40px_-15px_rgba(15,23,42,0.4)]">
            <EntityDetail
              entity={selectedEntity}
              onClose={() => setSelectedId(null)}
              onEdit={() => navigate(`/entities/${selectedEntity.id}/edit`)}
              onDelete={() => setPendingDelete(selectedEntity)}
            />
          </div>
        ) : null}
      </div>

      {/* Mobile list drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[1600] lg:hidden",
          drawerOpen ? "" : "pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/40 transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[86%] max-w-[360px] bg-white shadow-2xl transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-sm font-semibold text-slate-800">
              Entities
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </Button>
          </div>
          <div className="h-[calc(100%-3.5rem)]">
            <EntityList {...listProps} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete entity"
        description={
          pendingDelete
            ? `This will permanently remove "${pendingDelete.name}". This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
