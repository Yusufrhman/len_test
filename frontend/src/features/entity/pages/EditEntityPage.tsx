import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/toast-context";
import { normalizeApiError } from "@/lib/api-error";
import { EntityForm } from "../components/EntityForm";
import { useEntity, useUpdateEntity } from "../hooks/useEntity";
import type { CreateEntityRequest } from "../types";

export function EditEntityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const entityQuery = useEntity(id);
  const updateMutation = useUpdateEntity(id ?? "");

  const handleSubmit = (values: CreateEntityRequest) => {
    updateMutation.mutate(values, {
      onSuccess: (entity) => {
        toast({
          tone: "success",
          title: "Entity updated",
          description: `${entity.name} has been saved.`,
        });
        navigate("/");
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader
        backTo="/"
        title="Edit entity"
        subtitle={entityQuery.data?.name}
      />
      <main className="scrollbar-thin flex-1 overflow-y-auto bg-slate-100">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
          {entityQuery.isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : entityQuery.isError || !entityQuery.data ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="size-5" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-800">
                Could not load entity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {normalizeApiError(entityQuery.error).message}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => entityQuery.refetch()}
                >
                  Retry
                </Button>
                <Button size="sm" onClick={() => navigate("/")}>
                  Back to map
                </Button>
              </div>
            </div>
          ) : (
            <EntityForm
              key={entityQuery.data.id}
              mode="edit"
              initialEntity={entityQuery.data}
              isSubmitting={updateMutation.isPending}
              serverError={
                updateMutation.error
                  ? normalizeApiError(updateMutation.error)
                  : null
              }
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
