# Len — Geographic Entity Management

A monorepo for managing geographic entities (vehicles, IoT devices and
facilities) on an interactive map. The project is split into two applications:

- **`backend/`** — Go REST API (Gin + sqlx + PostgreSQL)
- **`frontend/`** — React + TypeScript single-page app (Vite + Leaflet)

Each entity has an identity, name, type, status and geographic coordinates
(`latitude`, `longitude`). The frontend renders entities on a map and supports
full create, read, update and delete flows.

## Table of Contents

- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [API Overview](#api-overview)
- [Reasons for Choosing Libraries](#reasons-for-choosing-libraries)
- [Agentic AI Workflow](#agentic-ai-workflow)
- [Documentation](#documentation)

## Requirements

- **Go** 1.27+
- **Node.js** 20+ and **npm**
- **PostgreSQL** 13+

## Project Structure

```text
.
├── backend/                # Go REST API
│   ├── cmd/api/            # entrypoint & dependency wiring
│   ├── internal/           # handler, usecase, repository, dto, entity, ...
│   ├── migrations/         # schema.sql + seeder.sql
│   ├── architecture.md     # backend layered architecture
│   └── README.md
├── frontend/               # React + TypeScript app
│   ├── src/                # features, components, lib, routes
│   ├── frontend-architecture.md
│   └── README.md
├── api-contract.md         # REST contract (source of truth)
├── openapi.yaml            # OpenAPI 3 spec / Postman import
└── requirements.md         # original task requirements
```

## How to Run

Run the backend first, then the frontend.

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and make sure these values match your setup:

```dotenv
APP_PORT=8080
GIN_MODE=debug
DATABASE_URL=postgres://postgres:postgres@localhost:5432/len_db?sslmode=disable
CORS_ORIGINS=http://localhost:5173
```

> **Important:** `CORS_ORIGINS` must include the frontend origin. Vite serves on
> `http://localhost:5173` or set it to `*` to allow any origin during development.

Create the database, apply the schema and seed sample data:

```bash
psql -U postgres -f migrations/schema.sql
psql -U postgres -d len_db -f migrations/seeder.sql
```

> `schema.sql` creates the `len_db` database and connects to it before creating
> the `entities` table. The seeder adds sample entities across several
> Indonesian cities.

Install dependencies and start the server:

```bash
go mod download
go run ./cmd/api
```

The API is now available at `http://localhost:8080/api/v1`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs at `http://localhost:5173`. `frontend/.env` points at the backend:

```dotenv
VITE_API_URL=http://localhost:8080/api/v1
```

Open the URL in a browser. Entities from the seed data should appear on the map.

### Useful scripts

| Location   | Command           | Description                        |
| ---------- | ----------------- | ---------------------------------- |
| `backend/` | `go run ./cmd/api`| Run the API                        |
| `backend/` | `go build ./...`  | Compile the backend                |
| `frontend/`| `npm run dev`     | Start the Vite dev server          |
| `frontend/`| `npm run build`   | Type-check and build for production|
| `frontend/`| `npm run lint`    | Run ESLint                         |

## API Overview

Base URL: `/api/v1`

| Method   | Path              | Description                          | Success |
| -------- | ----------------- | ------------------------------------ | ------- |
| `GET`    | `/entities`       | List entities (optional `type`, `status` filters) | `200` |
| `GET`    | `/entities/{id}`  | Get entity detail                    | `200`   |
| `POST`   | `/entities`       | Create entity                        | `201`   |
| `PUT`    | `/entities/{id}`  | Update entity                        | `200`   |
| `DELETE` | `/entities/{id}`  | Delete entity                        | `204`   |

All responses use `{ "data": ... }`; errors use the envelope
`{ "error": { "code", "message", "fields? } }`. See
[`api-contract.md`](./api-contract.md) for the full specification and
[`openapi.yaml`](./openapi.yaml) for the machine-readable version (importable
into Postman or Swagger UI).

## Reasons for Choosing Libraries

### Backend (Go)

| Library | Why it was chosen |
| ------- | ----------------- |
| **Gin** | Lightweight, fast HTTP router with a middleware ecosystem and built-in request binding. Keeps the HTTP handler layer thin and lets routes stay colocated with the handler. |
| **go-playground/validator** (via Gin binding tags) | Declarative validation (`required`, `oneof`, `min`, `max`) directly on request DTOs. The resulting `ValidationErrors` are mapped into the API's per-field error envelope (`handler/validation.go`). |
| **sqlx** | A thin extension over `database/sql` that adds struct scanning and named queries. It avoids the "magic" and overhead of a full ORM while keeping SQL explicit and reviewable. |
| **pgx/v5** | High-performance PostgreSQL driver. Also exposes `pgconn` for translating SQLSTATE errors (e.g. invalid UUID `22P02` → `ENTITY_NOT_FOUND`). |
| **PostgreSQL** | Relational store with native `UUID` primary keys, `TIMESTAMPTZ` timestamps and `CHECK` constraints on latitude/longitude as a final validation layer. |
| **gin-contrib/cors** | Standard CORS middleware so the browser app can call the API from a different origin during development. |
| **godotenv** | Loads a local `.env` file so configuration stays out of source and matches 12-factor conventions. |

### Frontend (React + TypeScript)

| Library | Why it was chosen |
| ------- | ----------------- |
| **React + TypeScript** | Required by the task. TypeScript gives a typed contract with the API and catches integration mistakes at compile time. |
| **Vite** | Fast dev server with HMR, first-class TypeScript support and path aliasing (`@/`). Minimal config. |
| **React Router** | Declarative client-side routing for the map (`/`), create (`/entities/new`) and edit (`/entities/:id/edit`) screens. |
| **TanStack Query** | Handles server state: caching, loading/error states, mutations and query invalidation after create/update/delete. This removes the need for a separate global state library. |
| **Axios** | A single shared instance with a base URL and request timeout. Centralizes HTTP concerns and produces errors that are normalized into a predictable shape (`lib/api-error.ts`). |
| **Leaflet + React Leaflet** | Open-source mapping with OpenStreetMap tiles, custom SVG pins and a draggable marker — no API key required. Powers both the read-only entity map and the map-based location picker. |
| **Zod** | Runtime schema validation for the entity form, mirroring the backend rules (required fields, coordinate ranges) and surfacing field-level messages before the request is sent. |
| **Tailwind CSS v4** | Utility-first styling with no runtime CSS-in-JS, making the responsive two-pane/bottom-sheet layout straightforward. |
| **lucide-react** | Consistent, lightweight icon set used throughout the UI. |
| **ESLint + typescript-eslint** | Static analysis and linting for the frontend codebase. |

## Agentic AI Workflow

This project was developed with the help of an **agentic coding assistant
([opencode](https://opencode.ai))** as a productivity aid. It was used to draft
boilerplate and suggest implementations, while the developer remained
responsible for the architecture, reviewed every change, and approved what was
kept. Nothing was committed without human review.

**Where the assistant helped:**

1. **Requirements → design** — Turning `requirements.md` into a draft REST
   contract (`api-contract.md`) and OpenAPI spec (`openapi.yaml`), including
   the error envelope and validation rules.
2. **Scaffolding** — Drafting the backend layer structure (handler → usecase →
   repository with interfaces) and the frontend feature-based structure
   (feature hooks, service layer, routing).
3. **Implementation** — Drafting CRUD endpoints, DTOs, validation error
   mapping, SQL queries and migrations, plus the map, list, detail panel,
   form, location picker and query hooks on the frontend.
4. **Documentation** — Drafting the architecture docs and READMEs.
5. **Review & iteration** — The developer reviewed the diffs, test the API, requested corrections, and only then
   accepted the changes.

**Extent of usage:** the assistant accelerated repetitive and boilerplate work.
The developer decided the architecture and API design, validated each step, and
made all final calls. The workflow was conversational and iterative, with every
change visible in git history.

## Documentation

- [`requirements.md`](./requirements.md) — original task requirements
- [`api-contract.md`](./api-contract.md) — REST API contract
- [`openapi.yaml`](./openapi.yaml) — OpenAPI 3 specification
- [`backend/README.md`](./backend/README.md) and [`backend/architecture.md`](./backend/architecture.md)
- [`frontend/README.md`](./frontend/README.md) and [`frontend/frontend-architecture.md`](./frontend/frontend-architecture.md)
