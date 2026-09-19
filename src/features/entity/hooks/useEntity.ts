import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entityService } from "../service/entity.service";
import type {
  CreateEntityRequest,
  EntityFilters,
  UpdateEntityRequest,
} from "../types";

export const entityKeys = {
  all: ["entities"] as const,
  lists: () => [...entityKeys.all, "list"] as const,
  list: (filters: EntityFilters) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, "detail"] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
};

export function useEntities(filters: EntityFilters = {}) {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => entityService.getEntities(filters),
  });
}

export function useEntity(id: string | undefined) {
  return useQuery({
    queryKey: entityKeys.detail(id ?? ""),
    queryFn: () => entityService.getEntity(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEntityRequest) =>
      entityService.createEntity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.all });
    },
  });
}

export function useUpdateEntity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEntityRequest) =>
      entityService.updateEntity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.all });
    },
  });
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entityService.deleteEntity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.all });
    },
  });
}
