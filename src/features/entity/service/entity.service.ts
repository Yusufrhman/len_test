import { api } from "@/lib/axios";
import type {
  CreateEntityRequest,
  Entity,
  EntityFilters,
  UpdateEntityRequest,
} from "../types";

interface EntityListResponse {
  data: Entity[];
}

interface EntityResponse {
  data: Entity;
}

function toParams(filters: EntityFilters) {
  const params: Record<string, string> = {};

  if (filters.type) {
    params.type = filters.type;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  return params;
}

export const entityService = {
  async getEntities(filters: EntityFilters = {}): Promise<Entity[]> {
    const response = await api.get<EntityListResponse>("/entities", {
      params: toParams(filters),
    });

    return response.data.data;
  },

  async getEntity(id: string): Promise<Entity> {
    const response = await api.get<EntityResponse>(`/entities/${id}`);

    return response.data.data;
  },

  async createEntity(payload: CreateEntityRequest): Promise<Entity> {
    const response = await api.post<EntityResponse>("/entities", payload);

    return response.data.data;
  },

  async updateEntity(id: string, payload: UpdateEntityRequest): Promise<Entity> {
    const response = await api.put<EntityResponse>(`/entities/${id}`, payload);

    return response.data.data;
  },

  async deleteEntity(id: string): Promise<void> {
    await api.delete(`/entities/${id}`);
  },
};
