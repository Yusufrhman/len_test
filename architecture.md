# Architecture

## Overview

This project uses a Clean Architecture-inspired layered architecture with three main application layers:

1. **Handler**
2. **Usecase**
3. **Repository**

The architecture separates HTTP handling, business logic, and database access while keeping data transfer objects separate from database entities.

```text
┌───────────────────────────────┐
│           Handler             │
│                               │
│ HTTP request/response         │
│ Request DTO / Response DTO    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           Usecase             │
│                               │
│ Business logic                │
│ Request DTO / Response DTO    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          Repository           │
│                               │
│ Database access               │
│ Entity (DB struct)            │
└───────────────┬───────────────┘
                │
                ▼
          PostgreSQL
```

## Layers

### 1. Handler

The handler is responsible for communication with the HTTP layer and HTTP route registration.

Responsibilities:

- Accept a `*gin.RouterGroup` during initialization.
- Register HTTP routes.
- Receive HTTP requests.
- Parse and bind request data.
- Perform HTTP-level input validation.
- Call the usecase through its interface.
- Convert usecase results into HTTP responses.
- Map application errors into appropriate HTTP status codes.

The handler defines the interface that the usecase implementation must satisfy.

Example:

```go
type EntityUsecase interface {
    Create(ctx context.Context, req dto.CreateEntityRequest) (*dto.EntityResponse, error)
    GetByID(ctx context.Context, id string) (*dto.EntityResponse, error)
    GetAll(ctx context.Context) ([]dto.EntityResponse, error)
    Update(ctx context.Context, id string, req dto.UpdateEntityRequest) (*dto.EntityResponse, error)
    Delete(ctx context.Context, id string) error
}
```

The handler depends on this interface rather than directly depending on the concrete usecase implementation.

```text
Handler
   │
   │ depends on
   ▼
EntityUsecase interface
   ▲
   │ implements
   │
Usecase implementation
```

The handler also owns HTTP route registration. `NewGinHandler` accepts a `*gin.RouterGroup`, initializes the handler, and registers its routes. It does not return a value.

Example:

```go
type GinHandler struct {
    usecase usecase.EntityUsecase
}

func NewGinHandler(
    router *gin.RouterGroup,
    entityUsecase usecase.EntityUsecase,
) {
    handler := &GinHandler{
        usecase: entityUsecase,
    }

    handler.registerRoutes(router)
}

func (h *GinHandler) registerRoutes(router *gin.RouterGroup) {
    router.GET("/entities", h.GetEntities)
    router.GET("/entities/:id", h.GetEntity)
    router.POST("/entities", h.CreateEntity)
    router.PUT("/entities/:id", h.UpdateEntity)
    router.DELETE("/entities/:id", h.DeleteEntity)
}
```

Therefore, route registration stays within the handler layer:

```text
Gin Router Group
       │
       ▼
 NewGinHandler(...)
       │
       ├── Initialize handler
       │
       └── Register routes
```

### 2. Usecase

The usecase contains the application's business logic.

Responsibilities:

- Execute application/business rules.
- Coordinate operations between the handler and repository.
- Receive and return DTOs.
- Validate business-level rules that belong to the application layer.
- Convert database entities into response DTOs.
- Convert request DTOs into data suitable for repository operations.
- Define the repository interface required by the usecase.

The usecase does **not** directly depend on a concrete repository implementation.

Instead, it defines the repository interface based on what it needs.

Example:

```go
type EntityRepository interface {
    Create(ctx context.Context, entity *entity.Entity) error
    GetByID(ctx context.Context, id string) (*entity.Entity, error)
    GetAll(ctx context.Context) ([]entity.Entity, error)
    Update(ctx context.Context, entity *entity.Entity) error
    Delete(ctx context.Context, id string) error
}
```

The concrete repository implements this interface.

```text
              Usecase
                 │
                 │ defines
                 ▼
       EntityRepository interface
                 ▲
                 │ implements
                 │
            Repository
```

---

### 3. Repository

The repository is responsible for database access.

Responsibilities:

- Execute SQL queries.
- Insert data into the database.
- Retrieve data from the database.
- Update database records.
- Delete database records.
- Map database rows to database entities.
- Map database entities into database operations.

The repository does **not define its own interface**.

Instead, the repository provides a concrete implementation of the interface defined by the usecase.

The repository connects directly to the database through the configured database client.

```text
Usecase
   │
   │ EntityRepository interface
   ▼
Repository implementation
   │
   │ SQL / DB client
   ▼
PostgreSQL
```

## Entity

The `entity` package contains structs that represent database records.

These structs are intended for database persistence and repository operations.

Example:

```go
type Entity struct {
    ID        string
    Name      string
    Type      string
    Status    string
    Latitude  float64
    Longitude float64
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

The entity is different from the DTO.

```text
Entity
  ↓
Database representation

DTO
  ↓
Application data transfer
```

The database entity should not be exposed directly as an HTTP response.

## DTO

The `dto` package contains data transfer objects used between the handler and usecase layers.

DTOs are divided into request and response objects.

```text
dto/
├── request.go
└── response.go
```

### Request DTO

Request DTOs represent data received from the client.

Example:

```go
type CreateEntityRequest struct {
    Name      string  `json:"name"`
    Type      string  `json:"type"`
    Status    string  `json:"status"`
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
}
```

The flow is:

```text
HTTP Request
     ↓
Handler
     ↓
Request DTO
     ↓
Usecase
```

### Response DTO

Response DTOs represent data returned by the application to the handler.

Example:

```go
type EntityResponse struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Type      string    `json:"type"`
    Status    string    `json:"status"`
    Latitude  float64   `json:"latitude"`
    Longitude float64   `json:"longitude"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}
```

The flow is:

```text
Database Entity
     ↓
Usecase
     ↓
Response DTO
     ↓
Handler
     ↓
HTTP Response
```

DTOs are used only through the handler and usecase layers and are not used as database models.

## Error Package

The `err` package contains application-specific errors.

It provides consistent errors that can be handled by different layers without coupling the handler directly to database-specific errors.

Example:

```go
var (
    ErrEntityNotFound = errors.New("entity not found")
    ErrInvalidInput   = errors.New("invalid input")
)
```

The repository can translate database-specific errors into application errors where appropriate.

The handler can then map application errors to HTTP responses.

Example:

```text
Repository
    │
    │ database error
    ▼
Application error
    │
    ▼
Handler
    │
    │ ErrEntityNotFound
    ▼
404 Not Found
```

No HTTP status on here

## Dependency Flow

The intended runtime dependency flow is:

```text
HTTP
 │
 ▼
Handler
 │
 │ calls
 ▼
Usecase
 │
 │ calls interface
 ▼
Repository
 │
 │ queries
 ▼
Database
```

At the interface level:

```text
Handler
  │
  ▼
Usecase Interface
  ▲
  │
Usecase Implementation
  │
  ▼
Repository Interface
  ▲
  │
Repository Implementation
  │
  ▼
Database
```

The important dependency rules are:

- Handler does not access the database directly.
- Handler does not access the repository directly.
- Usecase does not access the database directly.
- Usecase depends on a repository interface.
- Repository accesses the database directly.
- Repository implements the interface required by the usecase.
- DTOs are used between handler and usecase.
- Database entities are used by the repository.
- Database entities should not be returned directly from handlers.
- HTTP-specific concerns stay in the handler.

## Suggested Project Structure

```text
.
├── cmd/
│   └── api/
│       └── main.go
│
├── internal/
│   ├── handler/
│   │   └── entity_handler.go
│   │
│   ├── usecase/
│   │   └── entity_usecase.go
│   │
│   ├── repository/
│   │   └── entity_repository.go
│   │
│   ├── entity/
│   │   └── entity.go
│   │
│   ├── dto/
│   │   ├── request.go
│   │   └── response.go
│   │
│   └── err/
│       └── errors.go
│
├── migrations/
│   └── ...
│
├── go.mod
└── README.md
```

## Example Request Flow

For `POST /api/v1/entities`:

```text
1. Client sends HTTP request
        │
        ▼
2. Handler binds JSON into CreateEntityRequest
        │
        ▼
3. Handler validates HTTP input
        │
        ▼
4. Handler calls EntityUsecase.Create(...)
        │
        ▼
5. Usecase applies business rules
        │
        ▼
6. Usecase creates an Entity
        │
        ▼
7. Usecase calls EntityRepository.Create(...)
        │
        ▼
8. Repository executes INSERT query
        │
        ▼
9. PostgreSQL stores the entity
        │
        ▼
10. Repository returns the Entity
        │
        ▼
11. Usecase converts Entity → EntityResponse
        │
        ▼
12. Handler returns HTTP 201 Created
```

## Design Goals

This architecture is intended to provide:

- Separation of concerns.
- Testable business logic.
- Clear boundaries between HTTP, business logic, and database access.
- No direct database access from handlers or usecases.
- No exposure of database entities through the HTTP API.
- Easy replacement of the concrete repository implementation when needed.
