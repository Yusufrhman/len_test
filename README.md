# Atlas · Entity Management

A map-based dashboard for managing geographic entities (vehicles, IoT devices
and facilities). The app is built with React + TypeScript and follows the
feature-based architecture described in [`frontend-architecture.md`](./frontend-architecture.md),
against the REST contract in [`api-contract.md`](./api-contract.md).

## Tech Stack

- React 19 + TypeScript + Vite
- React Router (client-side routing)
- TanStack Query (server state)
- Axios (HTTP client)
- Tailwind CSS v4
- Leaflet.js + React Leaflet (maps, custom pins, location picker)

## Getting Started

```bash
npm install
npm run dev
```

The backend is expected on port `8080`. This is configured in `.env`:

```text
VITE_API_URL=http://localhost:8080/api/v1
```

Copy `.env.example` to `.env` if you need to point at a different backend.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Features

- **Map-first dashboard** — entities are rendered on a Leaflet map with
  type-specific custom pins, selection highlighting and auto fit-to-bounds.
- **Search & filters** — filter by entity type and status (sent to the API),
  plus instant client-side name search.
- **Entity details** — status/type badges, IDs, timestamps and copyable
  coordinates; shown as a side panel on desktop and a bottom sheet on mobile.
- **Create / edit / delete** — full CRUD with optimistic feedback via toasts
  and a confirmation dialog for destructive actions.
- **Map-based location picking** — create and edit forms never ask for manual
  latitude/longitude. Users click the map, drag the pin, or use "Locate" to
  drop a point; coordinates stay read-only in the UI.
- **Responsive layout** — collapsible list drawer and bottom-sheet detail on
  small screens, a two-pane layout on large screens.

## Project Structure

```text
src/
├── features/
│   └── entity/
│       ├── components/      # EntityMap, EntityList, EntityDetail, EntityForm, LocationPicker
│       ├── hooks/useEntity.ts
│       ├── pages/           # EntityPage, CreateEntityPage, EditEntityPage
│       ├── service/entity.service.ts
│       └── types/index.ts
├── components/
│   ├── layout/              # AppHeader
│   └── ui/                  # Button, Input, Select, Field, Badge, dialogs, toast
├── lib/
│   ├── axios.ts
│   ├── api-error.ts
│   ├── query-client.ts
│   └── utils.ts
├── routes/index.tsx
├── App.tsx
└── main.tsx
```

## Data Flow

```text
Pages → Components → useEntity (TanStack Query) → entity.service (Axios) → Go REST API
```
