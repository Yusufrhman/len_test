# Len Backend

Geographical entity management API built with Go, Gin, sqlx, and PostgreSQL.

## Requirements

- Go 1.27+
- PostgreSQL 13+

## Setup

1. Copy the example environment file and adjust the values:

   ```bash
   cp .env.example .env
   ```

2. Apply the migrations and seed data:

   ```bash
   psql -U postgres -f migrations/schema.sql
   psql -U postgres -d len_db -f migrations/seeder.sql
   ```

3. Run the server:

   ```bash
   go run ./cmd/api
   ```

The server listens on `APP_PORT` (default `8080`).

## Environment Variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `APP_PORT` | No | `8080` | HTTP server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `GIN_MODE` | No | `release` | Gin mode (`debug`, `release`, `test`) |

## API

Base URL: `/api/v1`

| Method | Path | Description | Success |
|---|---|---|---|
| `GET` | `/entities` | List entities, optional `type` and `status` query filters | `200` |
| `GET` | `/entities/{id}` | Get entity detail | `200` |
| `POST` | `/entities` | Create entity | `201` |
| `PUT` | `/entities/{id}` | Update entity | `200` |
| `DELETE` | `/entities/{id}` | Delete entity | `204` |

See [api-contract.md](api-contract.md) for the full contract and [architecture.md](architecture.md) for the layered design.

### Examples

```bash
curl 'http://localhost:8080/api/v1/entities?type=vehicle&status=active'

curl http://localhost:8080/api/v1/entities/{id}

curl -X POST http://localhost:8080/api/v1/entities \
  -H 'Content-Type: application/json' \
  -d '{"name":"Vehicle 001","type":"vehicle","status":"active","latitude":-7.2575,"longitude":112.7521}'

curl -X PUT http://localhost:8080/api/v1/entities/{id} \
  -H 'Content-Type: application/json' \
  -d '{"name":"Vehicle 001 Updated","type":"vehicle","status":"inactive","latitude":-7.2580,"longitude":112.7530}'

curl -X DELETE http://localhost:8080/api/v1/entities/{id}
```

## Project Structure

```text
├── cmd/
│   └── api/
│       └── main.go              # entrypoint and dependency wiring
│
├── internal/
│   ├── handler/                 # HTTP layer, defines EntityUsecase interface
│   ├── usecase/                 # business logic, defines EntityRepository interface
│   ├── repository/              # PostgreSQL data access via sqlx + pgx
│   ├── entity/                  # database record structs
│   ├── dto/                     # request and response DTOs
│   ├── err/                     # application errors
│   ├── config/                  # environment configuration
│   └── database/                # database connection
│
└── migrations/
    ├── schema.sql
    └── seeder.sql
```

Dependency flow:

```text
Handler → EntityUsecase interface ← Usecase → EntityRepository interface ← Repository → PostgreSQL
```
