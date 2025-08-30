# Language Controller API Reference

## Overview

The Language Controller provides endpoints for managing language entities in the system. This documentation serves as both an API reference and an example of how controllers should be implemented in the Asala project architecture.

## Base URL
```
/api/languages
```

## Authentication
Currently, no authentication is required for these endpoints. When implementing authentication in your controllers, follow the established patterns.

---

## Endpoints

### 1. Get Paginated Languages

Retrieves a paginated list of languages with filtering options.

**Endpoint:** `GET /api/languages`

**Parameters:**

| Parameter    | Type    | Default | Required | Description                           |
|-------------|---------|---------|----------|---------------------------------------|
| `page`      | integer | 1       | No       | Page number (must be ≥ 1)            |
| `pageSize`  | integer | 10      | No       | Number of items per page (1-100)     |
| `activeOnly`| boolean | true    | No       | Filter to active languages only      |

**Example Request:**
```http
GET /api/languages?page=1&pageSize=20&activeOnly=true
```

**Response Format:**
```json
{
  "isSuccess": true,
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
      }
    ],
    "totalCount": 25,
    "page": 1,
    "pageSize": 20,
    "totalPages": 2,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

**Error Responses:**
- `PAGINATION_INVALID_PAGE`: Page number is less than 1
- `PAGINATION_INVALID_PAGE_SIZE`: Page size is less than 1 or greater than 100
- `DB_ERROR`: Database operation failed

---

### 2. Get Languages Dropdown

Retrieves a simple list of active languages for dropdown/select components.

**Endpoint:** `GET /api/languages/dropdown`

**Parameters:** None

**Example Request:**
```http
GET /api/languages/dropdown
```

**Response Format:**
```json
{
  "isSuccess": true,
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

Creates a new language in the system.

**Endpoint:** `POST /api/languages`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "French",
  "code": "fr"
}
```

**Request Body Schema:**

| Field  | Type   | Required | Constraints                    | Description                  |
|--------|--------|----------|-------------------------------|------------------------------|
| `name` | string | Yes      | Max length: 100 characters    | Display name of the language |
| `code` | string | Yes      | Max length: 10, Format: ^[a-z]{2,5}$ | ISO language code     |

**Example Request:**
```http
POST /api/languages
Content-Type: application/json

{
  "name": "Spanish",
  "code": "es"
}
```

**Success Response:**
```json
{
  "isSuccess": true,
  "messageCode": "",
  "data": {
    "id": 3,
    "name": "Spanish",
    "code": "es",
    "isActive": true,
    "createdAt": "2024-01-20T14:25:00Z",
    "updatedAt": "2024-01-20T14:25:00Z"
  }
}
```

**Error Responses:**
- `ENTITY_NULL`: Request body is null
- `LANGUAGE_NAME_REQUIRED`: Name is null or empty
- `LANGUAGE_NAME_TOO_LONG`: Name exceeds 100 characters
- `LANGUAGE_CODE_REQUIRED`: Code is null or empty
- `LANGUAGE_CODE_TOO_LONG`: Code exceeds 10 characters
- `LANGUAGE_CODE_INVALID_FORMAT`: Code doesn't match required format
- `LANGUAGE_CODE_ALREADY_EXISTS`: A language with this code already exists

---

### 4. Update Language

Updates an existing language.

**Endpoint:** `PUT /api/languages/{id}`

**Path Parameters:**

| Parameter | Type    | Required | Description                    |
|-----------|---------|----------|--------------------------------|
| `id`      | integer | Yes      | ID of the language to update   |

**Request Body:**
```json
{
  "name": "Updated French",
  "code": "fr",
  "isActive": true
}
```

**Request Body Schema:**

| Field      | Type    | Required | Constraints                    | Description                  |
|------------|---------|----------|-------------------------------|------------------------------|
| `name`     | string  | Yes      | Max length: 100 characters    | Display name of the language |
| `code`     | string  | Yes      | Max length: 10, Format: ^[a-z]{2,5}$ | ISO language code     |
| `isActive` | boolean | Yes      | -                             | Whether the language is active |

**Example Request:**
```http
PUT /api/languages/3
Content-Type: application/json

{
  "name": "French (Canada)",
  "code": "fr",
  "isActive": true
}
```

**Success Response:**
```json
{
  "isSuccess": true,
  "messageCode": "",
  "data": {
    "id": 3,
    "name": "French (Canada)",
    "code": "fr",
    "isActive": true,
    "createdAt": "2024-01-20T14:25:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

**Error Responses:**
- `LANGUAGE_ID_INVALID`: ID is less than or equal to 0
- `ENTITY_NULL`: Request body is null
- `LANGUAGE_NAME_REQUIRED`: Name is null or empty
- `LANGUAGE_NAME_TOO_LONG`: Name exceeds 100 characters
- `LANGUAGE_CODE_REQUIRED`: Code is null or empty
- `LANGUAGE_CODE_TOO_LONG`: Code exceeds 10 characters
- `LANGUAGE_CODE_INVALID_FORMAT`: Code doesn't match required format
- `LANGUAGE_CODE_ALREADY_EXISTS`: Another language with this code already exists
- `LANGUAGE_NOT_FOUND`: Language with specified ID doesn't exist

---

### 5. Toggle Language Activation

Toggles the active status of a language (active ↔ inactive).

**Endpoint:** `PUT /api/languages/{id}/toggle-activation`

**Path Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| `id`      | integer | Yes      | ID of the language to toggle          |

**Example Request:**
```http
PUT /api/languages/3/toggle-activation
```

**Success Response:**
```json
{
  "isSuccess": true,
  "messageCode": "",
  "data": null
}
```

**Error Responses:**
- `LANGUAGE_ID_INVALID`: ID is less than or equal to 0
- `LANGUAGE_NOT_FOUND`: Language with specified ID doesn't exist
- `DB_ERROR`: Database operation failed

---

### 6. Soft Delete Language

Marks a language as deleted (soft delete - sets `IsDeleted = true`).

**Endpoint:** `DELETE /api/languages/{id}`

**Path Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| `id`      | integer | Yes      | ID of the language to delete          |

**Example Request:**
```http
DELETE /api/languages/3
```

**Success Response:**
```json
{
  "isSuccess": true,
  "messageCode": "",
  "data": null
}
```

**Error Responses:**
- `LANGUAGE_ID_INVALID`: ID is less than or equal to 0
- `LANGUAGE_NOT_FOUND`: Language with specified ID doesn't exist
- `DB_ERROR`: Database operation failed

---

## Implementation Details

### Controller Structure

```csharp
[ApiController]
[Route("api/languages")]
public class LanguageController : BaseController
{
    private readonly ILanguageService _languageService;

    public LanguageController(ILanguageService languageService)
        : base()
    {
        _languageService = languageService;
    }

    // ... endpoint methods
}
```

**Key Implementation Patterns:**

1. **Inheritance**: All controllers inherit from `BaseController`
2. **Dependency Injection**: Services are injected via constructor
3. **Route Attributes**: Use `[Route()]` for base route and `[HttpGet]`, `[HttpPost]`, etc. for methods
4. **Response Handling**: Use `CreateResponse()` method from `BaseController`
5. **Async Operations**: All database operations are asynchronous
6. **Cancellation Tokens**: Support cancellation for long-running operations

### Service Layer Integration

The controller delegates all business logic to the `ILanguageService`:

```csharp
[HttpGet]
public async Task<IActionResult> GetPaginated(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] bool activeOnly = true,
    CancellationToken cancellationToken = default
)
{
    var result = await _languageService.GetPaginatedAsync(
        page,
        pageSize,
        activeOnly,
        cancellationToken
    );
    return CreateResponse(result);
}
```

### Error Handling

- All errors are returned as HTTP 200 OK with error details in the response body
- The `BaseController.CreateResponse()` method handles the formatting
- Error codes are defined in `MessageCodes` class
- No exceptions are thrown for business logic errors

### Response Format

All responses follow a consistent format via `ApiResponseRepresenter`:

```json
{
  "isSuccess": boolean,
  "messageCode": "string",
  "data": object | null
}
```

## Usage Examples

### Frontend Integration

```javascript
// Fetch languages for dropdown
async function loadLanguages() {
    const response = await fetch('/api/languages/dropdown');
    const result = await response.json();
    
    if (result.isSuccess) {
        return result.data;
    } else {
        console.error('Error loading languages:', result.messageCode);
        return [];
    }
}

// Create new language
async function createLanguage(name, code) {
    const response = await fetch('/api/languages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, code })
    });
    
    const result = await response.json();
    return result;
}
```

### API Testing with curl

```bash
# Get paginated languages
curl "http://localhost:5000/api/languages?page=1&pageSize=10&activeOnly=true"

# Create new language
curl -X POST "http://localhost:5000/api/languages" \
     -H "Content-Type: application/json" \
     -d '{"name": "German", "code": "de"}'

# Update language
curl -X PUT "http://localhost:5000/api/languages/1" \
     -H "Content-Type: application/json" \
     -d '{"name": "English (US)", "code": "en", "isActive": true}'

# Toggle activation
curl -X PUT "http://localhost:5000/api/languages/1/toggle-activation"

# Soft delete
curl -X DELETE "http://localhost:5000/api/languages/1"
```

## Related Documentation

- [Architecture Overview](./architecture-overview.md) - Understanding the overall system architecture
- [API Development Guide](./api-development-guide.md) - How to create similar controllers
- [Best Practices](./best-practices.md) - Coding standards and guidelines
- [Code Examples](./code-examples.md) - Templates and sample implementations
