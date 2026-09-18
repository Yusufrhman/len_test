# API Contract

## Overview

This document defines the proposed API contract for the geographical entity management application.

The API is designed around entities that have an identity, basic attributes, status, and geographic coordinates.

Base URL:

```text
/api/v1
```

## Entity

### Entity Object

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "status": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "createdAt": "2026-09-18T00:00:00Z",
  "updatedAt": "2026-09-18T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | string | Yes | Unique entity identifier |
| `name` | string | Yes | Entity name |
| `type` | string | Yes | Type of entity, for example `vehicle`, `iot_device`, or `facility` |
| `status` | string | Yes | Current entity status |
| `latitude` | number | Yes | Geographic latitude |
| `longitude` | number | Yes | Geographic longitude |
| `createdAt` | string | Response only | Entity creation timestamp |
| `updatedAt` | string | Response only | Last entity update timestamp |

## Errors

All errors follow a single envelope:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "fields": {
      "<field_name>": "<error_message>"
    }
  }
}
```

| Property | Type | Description |
|---|---|---|
| `code` | string | Machine-readable error code, for example `ENTITY_NOT_FOUND` |
| `message` | string | Human-readable summary of the error |
| `fields` | object | Optional. Present only for validation errors. Maps field names to error messages. |

### Common Error Responses

**404 Not Found** — returned by detail, update, and delete when the entity does not exist:

```json
{
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "Entity not found"
  }
}
```

**500 Internal Server Error** — returned for unexpected server errors:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

### Validation Error

**400 Bad Request** — returned when the request body fails validation:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "fields": {
      "name": "name is required",
      "type": "type must be one of: vehicle, iot_device, facility",
      "latitude": "must be between -90 and 90",
      "longitude": "must be between -180 and 180"
    }
  }
}
```

Field-level error rules:

- A field appears in `fields` only if it failed validation.
- Only the first validation failure per field is reported.
- Multiple fields may fail at the same time; all of them are included in `fields`.
- If there are no field errors, the `fields` key is omitted.
- Field names use the JSON field naming from the request body (for example `latitude`, not `Latitude`).
- For fields nested inside JSON objects or arrays, the key uses dot notation, for example `address.latitude`.
- Malformed JSON is reported as a generic `VALIDATION_ERROR` with no `fields` object.

Error messages per validation rule:

| Rule | Message format | Example |
|---|---|---|
| Required | `<field> is required` | `name is required` |
| Type mismatch | `<field> must be a <type>` | `latitude must be a number` |
| Range | `<field> must be between <min> and <max>` | `latitude must be between -90 and 90` |
| Allowed values | `<field> must be one of: <values>` | `type must be one of: vehicle, iot_device, facility` |

## Endpoints

### 1. Get Entities

Retrieve entities to display on the map.

```http
GET /api/v1/entities
```

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `type` | string | No | Filter entities by type |
| `status` | string | No | Filter entities by status |

#### Response

**200 OK**

```json
{
  "data": [
    {
      "id": "ent_001",
      "name": "Vehicle 001",
      "type": "vehicle",
      "status": "active",
      "latitude": -7.2575,
      "longitude": 112.7521,
      "createdAt": "2026-09-18T08:00:00Z",
      "updatedAt": "2026-09-18T08:00:00Z"
    }
  ]
}
```

---

### 2. Get Entity Detail

Retrieve the details of a specific entity.

```http
GET /api/v1/entities/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `id` | string | Yes | Entity identifier |

#### Response

**200 OK**

```json
{
  "data": {
    "id": "ent_001",
    "name": "Vehicle 001",
    "type": "vehicle",
    "status": "active",
    "latitude": -7.2575,
    "longitude": 112.7521,
    "createdAt": "2026-09-18T08:00:00Z",
    "updatedAt": "2026-09-18T08:00:00Z"
  }
}
```

#### Not Found

Returns the common `ENTITY_NOT_FOUND` error. See [Common Error Responses](#common-error-responses).

---

### 3. Create Entity

Create a new entity.

```http
POST /api/v1/entities
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "Vehicle 001",
  "type": "vehicle",
  "status": "active",
  "latitude": -7.2575,
  "longitude": 112.7521
}
```

#### Response

**201 Created**

```json
{
  "data": {
    "id": "ent_001",
    "name": "Vehicle 001",
    "type": "vehicle",
    "status": "active",
    "latitude": -7.2575,
    "longitude": 112.7521,
    "createdAt": "2026-09-18T08:00:00Z",
    "updatedAt": "2026-09-18T08:00:00Z"
  }
}
```

---

### 4. Update Entity

Update an existing entity.

```http
PUT /api/v1/entities/{id}
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "Vehicle 001 Updated",
  "type": "vehicle",
  "status": "inactive",
  "latitude": -7.2580,
  "longitude": 112.7530
}
```

#### Response

**200 OK**

```json
{
  "data": {
    "id": "ent_001",
    "name": "Vehicle 001 Updated",
    "type": "vehicle",
    "status": "inactive",
    "latitude": -7.2580,
    "longitude": 112.7530,
    "createdAt": "2026-09-18T08:00:00Z",
    "updatedAt": "2026-09-18T09:00:00Z"
  }
}
```

#### Not Found

Returns the common `ENTITY_NOT_FOUND` error. See [Common Error Responses](#common-error-responses).

---

### 5. Delete Entity

Delete an entity.

```http
DELETE /api/v1/entities/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `id` | string | Yes | Entity identifier |

#### Response

**204 No Content**

No response body.

#### Not Found

Returns the common `ENTITY_NOT_FOUND` error. See [Common Error Responses](#common-error-responses).

## Validation

Both frontend and backend are responsible for validating entity input.

### Required Fields

The following fields are required when creating or updating an entity:

- `name`
- `type`
- `status`
- `latitude`
- `longitude`

### Geographic Coordinates

`latitude` must be within:

```text
-90 <= latitude <= 90
```

`longitude` must be within:

```text
-180 <= longitude <= 180
```

Validation failures return `400 Bad Request` with code `VALIDATION_ERROR`. See [Validation Error](#validation-error).

## HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Entity successfully created |
| `204 No Content` | Entity successfully deleted |
| `400 Bad Request` | Invalid request or validation error |
| `404 Not Found` | Entity does not exist |
| `500 Internal Server Error` | Unexpected server error |

## API Design Notes

- The API uses REST-style endpoints.
- Entity identifiers are provided through the URL for detail, update, and delete operations.
- Geographic coordinates are represented using `latitude` and `longitude`.
- The backend is the source of truth for persisted entity data.
- The frontend can use `GET /entities` to populate entities on the map and `GET /entities/{id}` to display entity details.
- The API contract is intentionally independent of the database implementation.
