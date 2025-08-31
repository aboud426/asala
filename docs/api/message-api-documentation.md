# Message API Documentation

## Base URL
All endpoints are prefixed with `/api/messages`

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

### 1. Get Messages (Paginated)

**GET** `/api/messages`

Retrieves a paginated list of messages with their localizations.

#### Query Parameters
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `page` | integer | 1 | No | Page number (starts from 1) |
| `pageSize` | integer | 10 | No | Number of items per page |
| `activeOnly` | boolean | true | No | Filter to show only active messages |

#### Request Example
```http
GET /api/messages?page=1&pageSize=10&activeOnly=true
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
        "key": "welcome_message",
        "defaultText": "Welcome to our application!",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "localizations": [
          {
            "id": 1,
            "key": "welcome_message",
            "text": "Welcome to our application!",
            "languageId": 1,
            "languageName": "English",
            "languageCode": "en",
            "isActive": true,
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z"
          },
          {
            "id": 2,
            "key": "welcome_message",
            "text": "مرحباً بك في تطبيقنا!",
            "languageId": 2,
            "languageName": "Arabic",
            "languageCode": "ar",
            "isActive": true,
            "createdAt": "2024-01-15T10:35:00Z",
            "updatedAt": "2024-01-15T10:35:00Z"
          }
        ]
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

### 2. Create Message

**POST** `/api/messages`

Creates a new message with optional localizations.

#### Request Body
```json
{
  "key": "string",        // Required: Unique message key/identifier
  "defaultText": "string", // Optional: Default text for the message
  "localizations": [       // Optional: Array of localized versions
    {
      "key": "string",     // Required: Same as parent message key
      "text": "string",    // Required: Localized text
      "languageId": "integer" // Required: ID of the language
    }
  ]
}
```

#### Request Example
```http
POST /api/messages
Content-Type: application/json

{
  "key": "error_invalid_input",
  "defaultText": "Invalid input provided",
  "localizations": [
    {
      "key": "error_invalid_input",
      "text": "Invalid input provided",
      "languageId": 1
    },
    {
      "key": "error_invalid_input",
      "text": "مدخل غير صالح",
      "languageId": 2
    }
  ]
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
    "key": "error_invalid_input",
    "defaultText": "Invalid input provided",
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "localizations": [
      {
        "id": 5,
        "key": "error_invalid_input",
        "text": "Invalid input provided",
        "languageId": 1,
        "languageName": "English",
        "languageCode": "en",
        "isActive": true,
        "createdAt": "2024-01-15T11:00:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
      },
      {
        "id": 6,
        "key": "error_invalid_input",
        "text": "مدخل غير صالح",
        "languageId": 2,
        "languageName": "Arabic",
        "languageCode": "ar",
        "isActive": true,
        "createdAt": "2024-01-15T11:00:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

---

### 3. Update Message

**PUT** `/api/messages/{id}`

Updates an existing message and its localizations.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Message ID |

#### Request Body
```json
{
  "key": "string",        // Required: Message key/identifier
  "defaultText": "string", // Required: Default text for the message
  "isActive": "boolean",   // Required: Active status
  "localizations": [       // Required: Array of localized versions
    {
      "id": "integer",     // Optional: ID for existing localization (null for new)
      "key": "string",     // Required: Same as parent message key
      "text": "string",    // Required: Localized text
      "languageId": "integer", // Required: ID of the language
      "isActive": "boolean" // Optional: Active status (defaults to true)
    }
  ]
}
```

#### Request Example
```http
PUT /api/messages/1
Content-Type: application/json

{
  "key": "welcome_message",
  "defaultText": "Welcome to our amazing application!",
  "isActive": true,
  "localizations": [
    {
      "id": 1,
      "key": "welcome_message",
      "text": "Welcome to our amazing application!",
      "languageId": 1,
      "isActive": true
    },
    {
      "id": 2,
      "key": "welcome_message",
      "text": "مرحباً بك في تطبيقنا الرائع!",
      "languageId": 2,
      "isActive": true
    }
  ]
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
    "key": "welcome_message",
    "defaultText": "Welcome to our amazing application!",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:15:00Z",
    "localizations": [
      {
        "id": 1,
        "key": "welcome_message",
        "text": "Welcome to our amazing application!",
        "languageId": 1,
        "languageName": "English",
        "languageCode": "en",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T11:15:00Z"
      },
      {
        "id": 2,
        "key": "welcome_message",
        "text": "مرحباً بك في تطبيقنا الرائع!",
        "languageId": 2,
        "languageName": "Arabic",
        "languageCode": "ar",
        "isActive": true,
        "createdAt": "2024-01-15T10:35:00Z",
        "updatedAt": "2024-01-15T11:15:00Z"
      }
    ]
  }
}
```

---

### 4. Toggle Message Activation

**PUT** `/api/messages/{id}/toggle-activation`

Toggles the active status of a message (active ↔ inactive).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Message ID |

#### Request Example
```http
PUT /api/messages/1/toggle-activation
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

### 5. Delete Message (Soft Delete)

**DELETE** `/api/messages/{id}`

Soft deletes a message (marks as deleted without removing from database).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Message ID |

#### Request Example
```http
DELETE /api/messages/1
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

### MessageDto
```json
{
  "id": "integer",
  "key": "string",
  "defaultText": "string",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "localizations": "MessageLocalizedDto[]"
}
```

### MessageLocalizedDto
```json
{
  "id": "integer",
  "key": "string",
  "text": "string",
  "languageId": "integer",
  "languageName": "string",
  "languageCode": "string",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### CreateMessageDto
```json
{
  "key": "string",                              // Required
  "defaultText": "string",                      // Optional
  "localizations": "CreateMessageLocalizedDto[]" // Optional
}
```

### CreateMessageLocalizedDto
```json
{
  "key": "string",      // Required
  "text": "string",     // Required
  "languageId": "integer" // Required
}
```

### UpdateMessageDto
```json
{
  "key": "string",                              // Required
  "defaultText": "string",                      // Required
  "isActive": "boolean",                        // Required
  "localizations": "UpdateMessageLocalizedDto[]" // Required
}
```

### UpdateMessageLocalizedDto
```json
{
  "id": "integer",      // Optional (null for new translations)
  "key": "string",      // Required
  "text": "string",     // Required
  "languageId": "integer", // Required
  "isActive": "boolean" // Optional (defaults to true)
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

## Localization Notes

- Messages support multiple language localizations
- Each message can have translations in different languages
- The `key` field should be consistent across all localizations of the same message
- When updating localizations, existing ones can be modified by including their `id`, or new ones can be added by omitting the `id`
- Both the main message and its localizations can be activated/deactivated independently
