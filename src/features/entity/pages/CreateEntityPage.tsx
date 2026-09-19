import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { useToast } from "@/components/ui/toast-context";
import { normalizeApiError } from "@/lib/api-error";
import { EntityForm } from "../components/EntityForm";
import { useCreateEntity } from "../hooks/useEntity";
import type { CreateEntityRequest } from "../types";

export function CreateEntityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateEntity();

  const handleSubmit = (values: CreateEntityRequest) => {
    createMutation.mutate(values, {
      onSuccess: (entity) => {
        toast({
          tone: "success",
          title: "Entity created",
          description: `${entity.name} has been added to the map.`,
        });
        navigate("/");
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader
        backTo="/"
        title="New entity"
        subtitle="Add a geographic entity to the map"
      />
      <main className="scrollbar-thin flex-1 overflow-y-auto bg-slate-100">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
          <EntityForm
            mode="create"
            isSubmitting={createMutation.isPending}
            serverError={
              createMutation.error
                ? normalizeApiError(createMutation.error)
                : null
            }
            onSubmit={handleSubmit}
            onCancel={() => navigate("/")}
          />
        </div>
      </main>
    </div>
  );
}
