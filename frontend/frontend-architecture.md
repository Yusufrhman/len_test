# Frontend Architecture

## Overview

The frontend uses a feature-based architecture with React and TypeScript.

### Technology Stack

- React
- TypeScript
- React Router
- TanStack Query
- Axios
- Tailwind CSS

## Project Structure

```text
src/
├── features/
│   └── entity/
│       ├── components/
│       ├── hooks/
│       │   └── useEntity.ts
│       ├── pages/
│       ├── service/
│       │   └── entity.service.ts
│       └── types/
│           └── index.ts
│
├── components/
├── lib/
│   ├── axios.ts
│   └── query-client.ts
├── routes/
│   └── index.tsx
├── App.tsx
└── main.tsx
```

## Feature-Based Architecture

Each feature owns its related components, hooks, services, types, and pages.

For this project:

```text
features/
└── entity/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── service/
    └── types/
```

This keeps feature-specific code together and makes the application easier to extend.

## Pages

Pages represent route-level screens.

Responsibilities:

- Compose feature components.
- Define the screen layout.
- Handle route parameters where necessary.
- Avoid direct API calls.

Example:

```tsx
export function EntityPage() {
    return (
        <div className="h-screen">
            <EntityMap />
            <EntityList />
        </div>
    );
}
```

## Components

Components contain feature-specific UI such as:

```text
EntityMap
EntityList
EntityDetail
EntityForm
```

Components handle UI interactions and consume feature hooks when data is required.

Components should not call Axios directly.

```tsx
const { data, isLoading } = useEntity();
```

instead of:

```tsx
axios.get("/entities");
```

## Hooks

Each feature has a single feature hook:

```text
features/entity/hooks/useEntity.ts
```

The hook is the integration point between components and TanStack Query.

Responsibilities:

- Define queries.
- Define mutations.
- Handle query invalidation.
- Expose loading, error, data, and mutation states.
- Call feature service functions.

Example:

```tsx
export function useEntity() {
    const entitiesQuery = useQuery({
        queryKey: ["entities"],
        queryFn: entityService.getEntities,
    });

    const createMutation = useMutation({
        mutationFn: entityService.createEntity,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["entities"],
            });
        },
    });

    return {
        entitiesQuery,
        createMutation,
    };
}
```

The intended flow is:

```text
Component
    ↓
useEntity()
    ↓
TanStack Query
    ↓
Service
```

## Service

The service layer is responsible for backend API communication.

Axios calls are made only inside the feature service.

Example:

```text
features/entity/service/
└── entity.service.ts
```

Example:

```tsx
import { api } from "@/lib/axios";

export const entityService = {
    async getEntities() {
        const response = await api.get("/entities");
        return response.data;
    },

    async getEntity(id: string) {
        const response = await api.get(`/entities/${id}`);
        return response.data;
    },

    async createEntity(data: CreateEntityRequest) {
        const response = await api.post("/entities", data);
        return response.data;
    },

    async updateEntity(id: string, data: UpdateEntityRequest) {
        const response = await api.put(`/entities/${id}`, data);
        return response.data;
    },

    async deleteEntity(id: string) {
        await api.delete(`/entities/${id}`);
    },
};
```

The intended flow is:

```text
Component
    ↓
useEntity
    ↓
entityService
    ↓
Axios
    ↓
Backend API
```

## Types

The `types` directory contains TypeScript types used by the feature.

Example:

```tsx
export interface Entity {
    id: string;
    name: string;
    type: string;
    status: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEntityRequest {
    name: string;
    type: string;
    status: string;
    latitude: number;
    longitude: number;
}

export interface UpdateEntityRequest {
    name: string;
    type: string;
    status: string;
    latitude: number;
    longitude: number;
}
```

Types describe the data contract between the frontend and backend.

They do not replace runtime validation.

## TanStack Query

TanStack Query is used for server-state management.

It handles:

- Fetching entities.
- Caching entities.
- Loading states.
- Error states.
- Mutations.
- Query invalidation.
- Refetching.

The application does not need to manually store API response data in global React state.

Example:

```tsx
useQuery({
    queryKey: ["entities"],
    queryFn: entityService.getEntities,
});
```

After creating, updating, or deleting an entity, the relevant query should be invalidated so the UI receives fresh data.

## Axios

Axios is used as the HTTP client.

A shared Axios instance is configured in:

```text
src/lib/axios.ts
```

Example:

```tsx
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
```

Feature services use this instance rather than creating separate Axios instances.

## React Router

React Router handles client-side routing.

Routes are defined in:

```text
src/routes/index.tsx
```

Example:

```tsx
const router = createBrowserRouter([
    {
        path: "/",
        element: <EntityPage />,
    },
    {
        path: "/entities/new",
        element: <CreateEntityPage />,
    },
    {
        path: "/entities/:id/edit",
        element: <EditEntityPage />,
    },
]);
```

The routing flow is:

```text
URL
 ↓
React Router
 ↓
Page
 ↓
Feature Components
```

## Tailwind CSS

Tailwind CSS is used for styling.

Styling is primarily colocated with the component through Tailwind utility classes.

Example:

```tsx
<div className="flex h-screen flex-col">
    ...
</div>
```

## Dependency Rules

The intended dependency flow is:

```text
Pages
  ↓
Components
  ↓
Hooks
  ↓
Service
  ↓
Axios
  ↓
Backend API
```

Rules:

- Pages must not call Axios directly.
- Components must not call Axios directly.
- Hooks must not contain raw Axios calls.
- Services are responsible for API communication.
- Hooks are responsible for TanStack Query integration.
- Components consume feature hooks.
- Types are shared within the feature.
- React Router maps URLs to pages.
- Tailwind CSS is used for UI styling.
- Server state is managed by TanStack Query rather than a separate global state library.

## Entity Data Flow

```text
┌────────────────┐
│ Entity Page    │
└───────┬────────┘
        ↓
┌────────────────┐
│ Components     │
│ Map / Form /   │
│ Detail / List  │
└───────┬────────┘
        ↓
┌────────────────┐
│ useEntity.ts   │
│ TanStack Query │
└───────┬────────┘
        ↓
┌────────────────┐
│ entity.service │
│ Axios          │
└───────┬────────┘
        ↓
┌────────────────┐
│ Go REST API    │
└────────────────┘
```

## Design Goals

This architecture provides:

- Feature-based code organization.
- Clear separation between UI and API communication.
- Centralized server-state management through TanStack Query.
- A dedicated Axios service layer.
- Strong TypeScript typing.
- Simple client-side routing.
- Minimal global state.
- Easy extension for additional features.
