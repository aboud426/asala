# Language API Documentation

## Base URL
All endpoints are prefixed with `/api/languages`

## Common Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "string",
  "messageCode": "string",
  "data": {} // Present for endpoints that return data
}
```

### Error Response
```json
{
  "success": false,
  "message": "string",
  "messageCode": "string"
}
```

---

## Endpoints

### 1. Get Languages (Paginated)

**GET** `/api/languages`

Retrieves a paginated list of languages.

#### Query Parameters
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `page` | integer | 1 | No | Page number (starts from 1) |
| `pageSize` | integer | 10 | No | Number of items per page |
| `activeOnly` | boolean | true | No | Filter to show only active languages |

#### Request Example
```http
GET /api/languages?page=1&pageSize=10&activeOnly=true
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "English",
        "code": "en",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Arabic",
        "code": "ar",
        "isActive": true,
        "createdAt": "2024-01-15T10:35:00Z",
        "updatedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "totalCount": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 2. Get Languages Dropdown

**GET** `/api/languages/dropdown`

Retrieves a simplified list of active languages for dropdown/select components.

#### Request Example
```http
GET /api/languages/dropdown
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": [
    {
      "id": 1,
      "name": "English",
      "code": "en"
    },
    {
      "id": 2,
      "name": "Arabic",
      "code": "ar"
    }
  ]
}
```

---

### 3. Create Language

**POST** `/api/languages`

Creates a new language.

#### Request Body
```json
{
  "name": "string", // Required: Language name
  "code": "string"  // Required: Language code (e.g., "en", "ar")
}
```

#### Request Example
```http
POST /api/languages
Content-Type: application/json

{
  "name": "French",
  "code": "fr"
}
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "id": 3,
    "name": "French",
    "code": "fr",
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 4. Update Language

**PUT** `/api/languages/{id}`

Updates an existing language.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Language ID |

#### Request Body
```json
{
  "name": "string",   // Required: Language name
  "code": "string",   // Required: Language code
  "isActive": boolean // Required: Active status
}
```

#### Request Example
```http
PUT /api/languages/1
Content-Type: application/json

{
  "name": "English (US)",
  "code": "en-US",
  "isActive": true
}
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "id": 1,
    "name": "English (US)",
    "code": "en-US",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:15:00Z"
  }
}
```

---

### 5. Toggle Language Activation

**PUT** `/api/languages/{id}/toggle-activation`

Toggles the active status of a language (active ↔ inactive).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Language ID |

#### Request Example
```http
PUT /api/languages/1/toggle-activation
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": ""
}
```

---

### 6. Delete Language (Soft Delete)

**DELETE** `/api/languages/{id}`

Soft deletes a language (marks as deleted without removing from database).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Language ID |

#### Request Example
```http
DELETE /api/languages/1
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": ""
}
```

---

## Data Models

### LanguageDto
```json
{
  "id": "integer",
  "name": "string",
  "code": "string",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### CreateLanguageDto
```json
{
  "name": "string",     // Required
  "code": "string"      // Required
}
```

### UpdateLanguageDto
```json
{
  "name": "string",     // Required
  "code": "string",     // Required
  "isActive": "boolean" // Required
}
```

### LanguageDropdownDto
```json
{
  "id": "integer",
  "name": "string",
  "code": "string"
}
```

### PaginatedResult<T>
```json
{
  "items": "T[]",           // Array of items
  "totalCount": "integer",  // Total number of items
  "page": "integer",        // Current page number
  "pageSize": "integer",    // Items per page
  "totalPages": "integer",  // Total number of pages
  "hasNextPage": "boolean", // Whether there's a next page
  "hasPreviousPage": "boolean" // Whether there's a previous page
}
```

---

## HTTP Status Codes

All endpoints return HTTP 200 OK for both success and error responses. The actual success/failure status is indicated in the response body's `success` field.

## Error Handling

When an operation fails, the response will have:
- `success`: `false`
- `message`: Human-readable error message
- `messageCode`: Error code for programmatic handling
- `data`: Not present in error responses

## Authentication

> **Note**: Authentication requirements are not specified in the current controller implementation. If authentication is required, it should be added to the controller or via middleware.

## Rate Limiting

> **Note**: Rate limiting is not implemented in the current controller. Consider adding rate limiting for production use.

## Validation

All input validation is handled by the service layer. Invalid requests will return error responses with appropriate message codes.
